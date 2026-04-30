import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { hashPin, generateStrongPin } from '@/lib/pinSecurity';

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
    }

    const body = await req.json();
    const { restaurantName, nit, email, phone, planId = 'Pro-plus', adminPin } = body;

    if (!nit || !restaurantName) {
      return NextResponse.json({ success: false, error: 'Nombre y NIT son obligatorios.' }, { status: 400 });
    }

    if (!adminPin || String(adminPin).trim().length !== 4 || !/^\d{4}$/.test(String(adminPin).trim())) {
      return NextResponse.json({ success: false, error: 'El PIN de administrador debe ser de exactamente 4 dígitos numéricos.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const nitClean = String(nit).trim();
    const name = String(restaurantName).trim();

    // 1. Verificar si ya existe
    const { data: existing } = await supabase
      .from('restaurantes')
      .select('id')
      .eq('nit', nitClean)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ success: false, error: 'Ya existe una cuenta con este NIT. Inicia sesión.' }, { status: 409 });
    }

    // 2. Crear Tenant
    const { data: newTenant, error: insertError } = await supabase
      .from('restaurantes')
      .insert({ nombre: name, nit: nitClean, email: String(email || ''), telefono: String(phone || ''), activo: 1 })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creando tenant:', insertError);
      return NextResponse.json({ success: false, error: `Error al crear restaurante: ${insertError.message}` }, { status: 500 });
    }

    const tenantId = newTenant.id;

    // 3. Generar PINs: admin usa el elegido por el usuario, los demás son aleatorios
    const usedPins = new Set<string>();
    usedPins.add(String(adminPin)); // Reservar el PIN del admin
    const waiterPin = generateStrongPin(usedPins);
    const kitchenPin = generateStrongPin(usedPins);

    const [adminHash, waiterHash, kitchenHash] = await Promise.all([
      hashPin(String(adminPin)),
      hashPin(waiterPin),
      hashPin(kitchenPin),
    ]);

    // 4. Crear usuarios (meseros)
    const { error: meserosError } = await supabase.from('meseros').insert([
      { restaurante_id: tenantId, nombre: 'Admin Master', rol: 'admin', pin: adminHash, activo: 1 },
      { restaurante_id: tenantId, nombre: 'Mesero Caja', rol: 'waiter', pin: waiterHash, activo: 1 },
      { restaurante_id: tenantId, nombre: 'Equipo Cocina', rol: 'kitchen', pin: kitchenHash, activo: 1 },
    ]);

    if (meserosError) {
      console.error('Error creando meseros:', meserosError);
    }

    // 5. Guardar PINs y configuración inicial
    await supabase.from('configuracion_restaurante').upsert([
      { restaurante_id: tenantId, clave: 'initial_admin_pin', valor: adminPin },
      { restaurante_id: tenantId, clave: 'initial_waiter_pin', valor: waiterPin },
      { restaurante_id: tenantId, clave: 'initial_kitchen_pin', valor: kitchenPin },
      { restaurante_id: tenantId, clave: 'restaurant_name', valor: name },
      { restaurante_id: tenantId, clave: 'contact_email', valor: String(email || '') },
      { restaurante_id: tenantId, clave: 'contact_phone', valor: String(phone || '') },
    ], { onConflict: 'restaurante_id, clave' });

    // 6. Activar licencia trial 14 días
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error: licenciaError } = await supabase.from('licencia_estado').insert({
      restaurante_id: tenantId,
      estado: 'trial',
      plan: planId,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      trial_days: 14,
      payment_id: `TRIAL-${Date.now()}`,
    });

    if (licenciaError) {
      console.error('Error activando licencia trial:', licenciaError);
    }

    return NextResponse.json({
      success: true,
      tenantId,
      adminPin,
      waiterPin,
      kitchenPin,
      redirectTo: '/pos?trial=success',
    });

  } catch (err: any) {
    console.error('Error inesperado en /api/trial:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
