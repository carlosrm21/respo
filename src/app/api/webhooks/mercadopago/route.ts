import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { hashPin, generateStrongPin } from '@/lib/pinSecurity';
import crypto from 'crypto';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

/**
 * Verifica la firma HMAC-SHA256 de MercadoPago en el webhook.
 * Documentación: https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifyMercadoPagoSignature(request: Request, ts: string | null, requestId: string | null): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET;

  // En desarrollo sin secret configurado, se permite pasar (para testing local)
  if (!webhookSecret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Webhook MP] MP_WEBHOOK_SECRET no configurado — omitiendo verificación en desarrollo.');
      return true;
    }
    console.error('[Webhook MP] MP_WEBHOOK_SECRET no configurado en producción. Rechazando solicitud.');
    return false;
  }

  const xSignature = request.headers.get('x-signature');
  if (!xSignature || !ts || !requestId) {
    console.error('[Webhook MP] Faltan headers de firma: x-signature, ts o x-request-id.');
    return false;
  }

  // Extraer v1=<hash> del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => {
      const [key, value] = part.trim().split('=');
      return [key, value];
    })
  );

  const receivedHash = parts['v1'];
  if (!receivedHash) {
    console.error('[Webhook MP] No se encontró v1 en x-signature.');
    return false;
  }

  // Construir el manifest según la doc de MercadoPago
  const manifest = `id:${ts};request-id:${requestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
    }

    const url = new URL(request.url);
    const ts = url.searchParams.get('ts');
    const requestId = request.headers.get('x-request-id');

    // ✅ VERIFICACIÓN DE FIRMA HMAC-SHA256
    if (!verifyMercadoPagoSignature(request, ts, requestId)) {
      console.error('[Webhook MP] Firma inválida — solicitud rechazada.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let id = url.searchParams.get('data.id') || url.searchParams.get('id');
    let type = url.searchParams.get('type') || url.searchParams.get('topic');

    if (!id) {
      try {
        const body = await request.json();
        if (body?.data?.id) id = body.data.id;
        if (body?.type) type = body.type;
        if (body?.topic) type = body.topic;
      } catch {
        // Body puede estar vacío si los datos vienen por query params
      }
    }

    if ((type === 'payment' || type === 'payment.created' || type === 'payment.updated') && id) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        console.log(`[Webhook MP] Pago ${id} aprobado. Procesando provisioning Multi-Tenant SaaS...`);

        try {
          const metadata = paymentData.metadata;
          if (metadata && metadata.nit) {
            const supabase = getSupabaseAdmin();
            const nit = String(metadata.nit).trim();
            const name = String(metadata.restaurant_name || `Restaurante ${nit}`);
            const email = String(metadata.contact_email || '');
            const phone = String(metadata.contact_phone || '');

            // 1. Upsert Tenant / Restaurante
            const { data: tenant } = await supabase
              .from('restaurantes')
              .select('id')
              .eq('nit', nit)
              .maybeSingle();

            let tenantId = tenant?.id;

            if (!tenantId) {
              const { data: newTenant, error: insertError } = await supabase
                .from('restaurantes')
                .insert({
                  nombre: name,
                  nit: nit,
                  email: email,
                  telefono: phone,
                  activo: 1
                })
                .select('id')
                .single();

              if (insertError) throw new Error(`Fallo crear tenant: ${insertError.message}`);
              tenantId = newTenant.id;

              // ✅ SEGURO: Generar PINs fuertes únicos con bcrypt
              const usedPins = new Set<string>();
              const adminPin = generateStrongPin(usedPins);
              const waiterPin = generateStrongPin(usedPins);
              const kitchenPin = generateStrongPin(usedPins);

              const [adminHash, waiterHash, kitchenHash] = await Promise.all([
                hashPin(adminPin),
                hashPin(waiterPin),
                hashPin(kitchenPin),
              ]);

              await supabase.from('meseros').insert([
                { restaurante_id: tenantId, nombre: 'Admin Master', rol: 'admin', pin: adminHash, activo: 1 },
                { restaurante_id: tenantId, nombre: 'Mesero Caja', rol: 'waiter', pin: waiterHash, activo: 1 },
                { restaurante_id: tenantId, nombre: 'Equipo Cocina', rol: 'kitchen', pin: kitchenHash, activo: 1 }
              ]);

              // Guardar PINs en texto plano en configuración para que el admin los vea UNA VEZ
              // (el admin debe cambiarlos inmediatamente después del primer login)
              await supabase.from('configuracion_restaurante').upsert([
                { restaurante_id: tenantId, clave: 'initial_admin_pin', valor: adminPin },
                { restaurante_id: tenantId, clave: 'initial_waiter_pin', valor: waiterPin },
                { restaurante_id: tenantId, clave: 'initial_kitchen_pin', valor: kitchenPin },
              ], { onConflict: 'restaurante_id, clave' });

              console.log(`[Webhook MP] PINs seguros generados y hasheados para tenant: ${nit}`);
            }

            // 2. Guardar Configuraciones del Tenant
            await supabase.from('configuracion_restaurante').upsert([
              { restaurante_id: tenantId, clave: 'restaurant_name', valor: name },
              { restaurante_id: tenantId, clave: 'contact_email', valor: email },
              { restaurante_id: tenantId, clave: 'contact_phone', valor: phone }
            ], { onConflict: 'restaurante_id, clave' });

            // 3. Activar Licencia Paid (Suscripción Mensual + Trial)
            const now = new Date();
            const expirationDate = new Date(now);
            expirationDate.setDate(expirationDate.getDate() + 37); // 30 días de mes + 7 de trial

            await supabase.from('licencia_estado').insert({
              restaurante_id: tenantId,
              estado: 'paid',
              plan: String(metadata.plan_id || 'Pro-plus'),
              started_at: now.toISOString(),
              expires_at: expirationDate.toISOString(),
              trial_days: 7,
              payment_id: String(id)
            });

            console.log(`[Webhook MP] Provisioning completado para el Tenant: ${nit} (${tenantId})`);
          }
        } catch (dbError) {
          console.error('[Webhook MP] Error procesando provisioning Multi-Tenant:', dbError);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook MP] Error procesando webhook de MercadoPago:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
