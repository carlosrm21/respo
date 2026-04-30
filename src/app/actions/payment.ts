'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { hashPin, generateStrongPin } from '@/lib/pinSecurity';
// Inicializa MercadoPago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function createPaymentPreference(
  planId: 'Pro' | 'Pro-plus' | 'Enterprise' = 'Pro-plus',
  formData?: { restaurantName: string; nit: string; email: string; phone: string }
) {
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('El token de MercadoPago no está configurado en las variables de entorno.');
    return {
      success: false,
      error: 'El token de MercadoPago no está configurado en las variables de entorno.',
    };
  }

  // Configuración de precios según el plan
  const plans = {
    'Pro': { price: 49900, title: 'Suscripción Plan Pro RestoPOS' },
    'Pro-plus': { price: 89900, title: 'Suscripción Plan Pro-plus RestoPOS' },
    'Enterprise': { price: 149900, title: 'Suscripción Plan Enterprise RestoPOS' },
  };

  const selectedPlan = plans[planId] || plans['Pro-plus'];

  try {
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const result = await preference.create({
      body: {
        items: [
          {
            id: planId.toLowerCase(),
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: 'COP',
            description: `Acceso mensual al ${selectedPlan.title}`,
          },
        ],
        back_urls: {
          success: `${baseUrl}/pos?payment=success`,
          failure: `${baseUrl}/#pricing?payment=failure`,
          pending: `${baseUrl}/#pricing?payment=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'RESTOPOS',
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        metadata: {
          plan_id: planId,
          ...(formData ? {
            restaurant_name: formData.restaurantName,
            nit: formData.nit,
            contact_email: formData.email,
            contact_phone: formData.phone
          } : {})
        },
      },
    });

    return {
      success: true,
      initPoint: result.init_point,
    };
  } catch (error) {
    console.error('Error al crear preferencia de MercadoPago:', error);
    return {
      success: false,
      error: 'Hubo un error al generar el enlace de pago',
    };
  }
}

export async function createTrialTenant(
  planId: 'Pro' | 'Pro-plus' | 'Enterprise' = 'Pro-plus',
  formData: { restaurantName: string; nit: string; email: string; phone: string }
) {
  try {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase no configurado.' };
    }

    const supabase = getSupabaseAdmin();
    const nit = String(formData.nit).trim();
    const name = String(formData.restaurantName || `Restaurante ${nit}`);
    const email = String(formData.email || '');
    const phone = String(formData.phone || '');

    // 1. Verificar si ya existe el Tenant
    const { data: tenant } = await supabase
      .from('restaurantes')
      .select('id')
      .eq('nit', nit)
      .maybeSingle();

    if (tenant?.id) {
       return { success: false, error: 'Ya existe una cuenta con este NIT o RUT. Inicia sesión.' };
    }

    // 2. Crear Tenant
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
    const tenantId = newTenant.id;

    // 3. Generar PINs
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

    // 4. Guardar PINs y config
    await supabase.from('configuracion_restaurante').upsert([
      { restaurante_id: tenantId, clave: 'initial_admin_pin', valor: adminPin },
      { restaurante_id: tenantId, clave: 'initial_waiter_pin', valor: waiterPin },
      { restaurante_id: tenantId, clave: 'initial_kitchen_pin', valor: kitchenPin },
      { restaurante_id: tenantId, clave: 'restaurant_name', valor: name },
      { restaurante_id: tenantId, clave: 'contact_email', valor: email },
      { restaurante_id: tenantId, clave: 'contact_phone', valor: phone }
    ], { onConflict: 'restaurante_id, clave' });

    // 5. Activar Licencia Trial
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 14); // 14 días de trial

    await supabase.from('licencia_estado').insert({
      restaurante_id: tenantId,
      estado: 'trial',
      plan: planId,
      started_at: now.toISOString(),
      expires_at: expirationDate.toISOString(),
      trial_days: 14,
      payment_id: 'TRIAL-' + Date.now()
    });

    return {
      success: true,
      initPoint: `/pos?trial=success`,
    };

  } catch (error) {
    console.error('Error al crear tenant de prueba:', error);
    return {
      success: false,
      error: 'Hubo un error al generar la cuenta de prueba.',
    };
  }
}
