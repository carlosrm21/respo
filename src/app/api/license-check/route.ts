import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' });
    }

    const cookieStore = await cookies();
    const tenantId = cookieStore.get('tenant_id')?.value;
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Sin sesión activa.' });
    }

    const supabase = getSupabaseAdmin();

    // Obtener la última licencia del tenant
    const { data: license } = await supabase
      .from('licencia_estado')
      .select('*')
      .eq('restaurante_id', tenantId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!license) {
      return NextResponse.json({ success: false, error: 'Licencia no encontrada.' });
    }

    const now = new Date();
    const expiresAt = new Date(license.expires_at);
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    // Calcular días hábiles desde expiración (para el período de gracia de 5 días hábiles)
    let businessDaysElapsed = 0;
    if (diffMs < 0) {
      // Contar días hábiles transcurridos desde la expiración
      const checkDate = new Date(expiresAt);
      while (checkDate < now) {
        checkDate.setDate(checkDate.getDate() + 1);
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=domingo, 6=sábado
          businessDaysElapsed++;
        }
      }
    }

    const isPaid = license.estado === 'paid';
    const isTrial = license.estado === 'trial';
    const isActive = diffMs > 0;
    const isInGracePeriod = !isActive && !isPaid && businessDaysElapsed <= 5;
    const isExpiredFinal = !isActive && !isPaid && businessDaysElapsed > 5;
    const graceDaysRemaining = Math.max(0, 5 - businessDaysElapsed);

    let statusCode: 'active_paid' | 'active_trial' | 'trial_warning' | 'expired_grace' | 'expired_final';
    let message = '';
    let paymentRequired = false;

    if (isPaid && isActive) {
      statusCode = 'active_paid';
      message = `Tu licencia está activa hasta ${expiresAt.toLocaleDateString('es-CO')}.`;
    } else if (isTrial && isActive && daysRemaining > 3) {
      statusCode = 'active_trial';
      message = `Período de prueba activo. Te quedan ${daysRemaining} días.`;
    } else if (isTrial && isActive && daysRemaining <= 3) {
      statusCode = 'trial_warning';
      message = `⚠️ Tu prueba gratuita vence en ${daysRemaining} día(s). Activa tu plan para no perder el acceso.`;
      paymentRequired = false;
    } else if (isInGracePeriod) {
      statusCode = 'expired_grace';
      message = `Tu período de prueba ha finalizado. Tienes ${graceDaysRemaining} días hábiles para activar tu plan, luego tus datos serán eliminados.`;
      paymentRequired = true;
    } else if (isExpiredFinal || (!isPaid && !isActive)) {
      statusCode = 'expired_final';
      message = 'Tu período de prueba ha finalizado y tus datos están programados para eliminación. Contacta soporte o activa un plan ahora.';
      paymentRequired = true;
    } else {
      statusCode = 'active_paid';
      message = 'Licencia activa.';
    }

    return NextResponse.json({
      success: true,
      statusCode,
      message,
      paymentRequired,
      daysRemaining: Math.max(0, daysRemaining),
      graceDaysRemaining,
      businessDaysElapsed,
      expiresAt: license.expires_at,
      plan: license.plan,
      estado: license.estado,
    });

  } catch (err: any) {
    console.error('Error en license-check:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Error interno.' });
  }
}
