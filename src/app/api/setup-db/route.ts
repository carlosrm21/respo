export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { ensureLicenseState } from '@/lib/license';
import { seedSupabaseOperationalData } from '@/lib/opsData';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { hashPin } from '@/lib/pinSecurity';

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason || 'No autorizado para configurar la base de datos en producción.' }, { status: 401 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    await ensureLicenseState();

    await seedSupabaseOperationalData();

    const isProduction = process.env.NODE_ENV === 'production';
    const seedAdminPin = process.env.INITIAL_ADMIN_PIN;
    const seedKitchenPin = process.env.INITIAL_KITCHEN_PIN;
    const seedWaiterPin = process.env.INITIAL_WAITER_PIN;
    const supabase = getSupabaseAdmin();

    const desiredUsers = [
      { nombre: 'Acceso Administrador', rol: 'admin', pin: seedAdminPin || (!isProduction ? '1234' : '') },
      { nombre: 'Terminal Cocina', rol: 'kitchen', pin: seedKitchenPin || (!isProduction ? '5678' : '') },
      { nombre: 'Terminal Mesero', rol: 'waiter', pin: seedWaiterPin || (!isProduction ? '0000' : '') }
    ].filter((user) => user.pin);

    for (const user of desiredUsers) {
      const { data: existing, error: existingError } = await supabase
        .from('meseros')
        .select('id')
        .eq('rol', user.rol)
        .eq('activo', 1)
        .limit(1)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (!existing) {
        const hashedPin = await hashPin(user.pin);
        const { error } = await supabase.from('meseros').insert({
          nombre: user.nombre,
          rol: user.rol,
          pin: hashedPin,
          activo: 1
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Base de datos Supabase inicializada con seguridad habilitada y trial de 7 dias.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
