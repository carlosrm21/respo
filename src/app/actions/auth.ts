'use server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPin, isHashedPin, normalizePin, verifyPin } from '@/lib/pinSecurity';
import { getLicenseStatus } from '@/lib/license';
import { cookies } from 'next/headers';

function isMissingLicenseTableError(error: unknown) {
  const message = String((error as any)?.message || error || '').toLowerCase();
  return message.includes('licencia_estado') && message.includes('schema cache');
}

export async function verifyLicense(tenantId: string) {
  try {
    const supabase = getSupabaseAdmin();
    const { data: currentLicense, error } = await supabase
      .from('licencia_estado')
      .select('*')
      .eq('restaurante_id', tenantId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingLicenseTableError(error)) {
        return {
          valid: true,
          message: 'Licenciamiento temporalmente en modo de recuperacion.',
          status: { valid: true, status: 'trial', plan: 'trial-recovery' }
        };
      }
      return { valid: false, message: 'Error interno al verificar la licencia.' };
    }

    if (!currentLicense) {
      // Si no existe, al menos le damos el Trial Default
      return { valid: true, status: { status: 'trial' } };
    }

    const resolvedStatus = currentLicense.estado === 'paid' ? 'paid' : 'trial';
    const expiresAt = new Date(currentLicense.expires_at || Date.now() + 7 * 86400000);
    const valid = expiresAt.getTime() > Date.now();

    if (!valid) {
      return { valid: false, message: 'Tu licencia ha expirado. Debes renovar el pago para continuar.' };
    }

    return { valid: true, status: { status: resolvedStatus } };
  } catch (error) {
    console.error(error);
    return { valid: false, message: 'Error interno al verificar la licencia SaaS' };
  }
}

export async function loginWithPin(nit: string, role: string, pin: string) {
  try {
    if (!nit || nit.trim() === '') {
      return { success: false, error: 'NIT_REQUERIDO', message: 'Por favor ingresa el NIT o Código de Restaurante.' };
    }

    const cleanPin = normalizePin(pin);
    const supabase = getSupabaseAdmin();

    // 1. Validar el Inquilino (Restaurante) basado en el NIT
    const { data: tenantData, error: tenantError } = await supabase
      .from('restaurantes')
      .select('id, nombre, activo')
      .eq('nit', nit)
      .maybeSingle();

    if (tenantError || !tenantData) {
      return { success: false, error: 'NIT_INVALIDO', message: 'No se encontró un restaurante con este NIT.' };
    }

    if (tenantData.activo === 0) {
      return { success: false, error: 'RESTAURANTE_INACTIVO', message: 'La cuenta del restaurante está suspendida.' };
    }

    const tenantId = tenantData.id;

    // 2. Verificar la Licencia para este Inquilino particular
    const licenseCheck = await verifyLicense(tenantId);
    if (!licenseCheck.valid) {
      return { success: false, error: 'LICENCIA_EXPIRADA', message: licenseCheck.message };
    }

    // 3. Validar PIN Operativo atado al Inquilino
    const MASTER_PIN = process.env.MASTER_ADMIN_PIN || '8899'; // PIN Maestro para el creador
    let user: any;

    if (cleanPin === MASTER_PIN) {
      // Acceso Maestro: Simula un usuario administrador del sistema
      user = { id: 0, nombre: 'Soporte Maestro', rol: role };
    } else {
      const { data, error } = await supabase
        .from('meseros')
        .select('id, nombre, rol, pin, activo')
        .eq('restaurante_id', tenantId)
        .eq('rol', role)
        .eq('activo', 1);

      if (error) {
        return { success: false, error: 'ERROR_SERVIDOR', message: `Error de autenticación: ${error.message}` };
      }

      const users = data || [];
      for (const candidate of users) {
        const valid = await verifyPin(cleanPin, candidate.pin);
        if (!valid) continue;
        user = candidate;

        if (candidate.pin && !isHashedPin(candidate.pin)) {
          const hashed = await hashPin(cleanPin);
          await supabase.from('meseros').update({ pin: hashed }).eq('id', candidate.id);
        }
        break;
      }
    }
    
    if (!user) {
      return { success: false, error: 'PIN_INVALIDO', message: 'El PIN ingresado es incorrecto para este restaurante.' };
    }

    // 4. Establecer Sesión (Cookie de Tenant)
    const cookieStore = await cookies();
    cookieStore.set('tenant_id', tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });
    
    cookieStore.set('tenant_name', tenantData.nombre, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return { 
      success: true, 
      user: { id: user.id, nombre: user.nombre, rol: user.rol, restaurante: tenantData.nombre } 
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'ERROR_SERVIDOR', message: 'Ocurrió un error al conectarse a la base de datos' };
  }
}
