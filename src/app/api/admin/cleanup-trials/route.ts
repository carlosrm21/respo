import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

// Este endpoint debe llamarse desde un Cron Job de Vercel (vercel.json)
// o manualmente desde el panel de administración.
export async function POST(req: NextRequest) {
  // Proteger con un secret para que no lo llame cualquiera
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET || 'restopos-cron-2024';
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const deleted: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Obtener todos los tenants con trial expirado
    const { data: expiredLicenses } = await supabase
      .from('licencia_estado')
      .select('restaurante_id, expires_at, estado')
      .eq('estado', 'trial')
      .lt('expires_at', now.toISOString());

    if (!expiredLicenses || expiredLicenses.length === 0) {
      return NextResponse.json({ success: true, message: 'No hay tenants expirados para eliminar.', deleted: [] });
    }

    for (const license of expiredLicenses) {
      const expiresAt = new Date(license.expires_at);
      
      // Contar días hábiles desde la expiración
      let businessDaysElapsed = 0;
      const checkDate = new Date(expiresAt);
      while (checkDate < now) {
        checkDate.setDate(checkDate.getDate() + 1);
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDaysElapsed++;
        }
      }

      // Solo eliminar si han pasado MÁS de 5 días hábiles
      if (businessDaysElapsed <= 5) continue;

      const tenantId = license.restaurante_id;

      try {
        // 2. Guardar el NIT en la tabla de NITs bloqueados ANTES de eliminar
        const { data: restaurante } = await supabase
          .from('restaurantes')
          .select('nit, email, nombre')
          .eq('id', tenantId)
          .maybeSingle();

        if (restaurante?.nit) {
          await supabase
            .from('trial_nits_usados')
            .upsert({
              nit: restaurante.nit,
              nombre_original: restaurante.nombre,
              email_original: restaurante.email,
              trial_expires_at: license.expires_at,
              deleted_at: now.toISOString(),
            }, { onConflict: 'nit' });
        }

        // 3. Eliminar datos del tenant en cascada
        await supabase.from('detalles_pedido').delete().eq('restaurante_id', tenantId);
        await supabase.from('pedidos').delete().eq('restaurante_id', tenantId);
        await supabase.from('facturas').delete().eq('restaurante_id', tenantId);
        await supabase.from('mesas').delete().eq('restaurante_id', tenantId);
        await supabase.from('productos').delete().eq('restaurante_id', tenantId);
        await supabase.from('categorias').delete().eq('restaurante_id', tenantId);
        await supabase.from('meseros').delete().eq('restaurante_id', tenantId);
        await supabase.from('caja').delete().eq('restaurante_id', tenantId);
        await supabase.from('configuracion_restaurante').delete().eq('restaurante_id', tenantId);
        await supabase.from('licencia_estado').delete().eq('restaurante_id', tenantId);
        await supabase.from('restaurantes').delete().eq('id', tenantId);

        deleted.push(tenantId);
        console.log(`[cleanup] Tenant ${tenantId} eliminado. Días hábiles expirados: ${businessDaysElapsed}`);
      } catch (tenantErr: any) {
        console.error(`[cleanup] Error eliminando tenant ${tenantId}:`, tenantErr);
        errors.push(`${tenantId}: ${tenantErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza completada. ${deleted.length} tenant(s) eliminado(s).`,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err: any) {
    console.error('[cleanup] Error general:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
