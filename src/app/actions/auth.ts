'use server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPin, isHashedPin, normalizePin, verifyPin } from '@/lib/pinSecurity';
import { getLicenseStatus } from '@/lib/license';

function isMissingLicenseTableError(error: unknown) {
  const message = String((error as any)?.message || error || '').toLowerCase();
  return message.includes('licencia_estado') && message.includes('schema cache');
}

export async function verifyLicense() {
  try {
    const status = await getLicenseStatus();
    if (!status.valid) {
      return { valid: false, message: status.message, status };
    }

    return { valid: true, status };
  } catch (error) {
    console.error(error);
    if (isMissingLicenseTableError(error)) {
      // Do not block operational login if the license table was not provisioned yet.
      return {
        valid: true,
        message: 'Licenciamiento temporalmente en modo de recuperacion.',
        status: {
          valid: true,
          status: 'trial',
          plan: 'trial-recovery',
          startedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 1,
          trialDays: 1,
          paymentRequired: false,
          message: 'Licenciamiento temporalmente en modo de recuperacion.'
        }
      };
    }
    return { valid: false, message: 'Error interno al verificar la licencia SaaS' };
  }
}

export async function loginWithPin(role: string, pin: string) {
  try {
    const cleanPin = normalizePin(pin);

    // 1. Verify license first
    const licenseCheck = await verifyLicense();
    if (!licenseCheck.valid) {
      return { success: false, error: 'LICENCIA_EXPIRADA', message: licenseCheck.message };
    }

    // 2. Verify PIN in writable data source (Supabase preferred), with hash support
    let user: any;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('meseros')
      .select('id, nombre, rol, pin, activo')
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

      // Transparently upgrade legacy plain PINs to bcrypt hash.
      if (candidate.pin && !isHashedPin(candidate.pin)) {
        const hashed = await hashPin(cleanPin);
        await supabase.from('meseros').update({ pin: hashed }).eq('id', candidate.id);
      }
      break;
    }
    
    if (!user) {
      return { success: false, error: 'PIN_INVALIDO', message: 'El PIN ingresado es incorrecto para este rol.' };
    }

    if (user.activo === 0) {
      return { success: false, error: 'USUARIO_INACTIVO', message: 'Este usuario ha sido desactivado.' };
    }

    // Return success
    return { success: true, user: { id: user.id, nombre: user.nombre, rol: user.rol } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'ERROR_SERVIDOR', message: 'Ocurrió un error al conectarse a la base de datos' };
  }
}
