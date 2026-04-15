'use server';

import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { getRestaurantSetting } from '@/lib/opsData';

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado para autenticación admin.');
  }

  return getSupabaseAdmin();
}

export async function checkAdminExists() {
  try {
    const supabase = requireSupabase();
    const { count, error } = await supabase
      .from('sistema_admin')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, exists: (count || 0) > 0 };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Database error' };
  }
}

export async function createInitialAdmin(username: string, passwordPlain: string) {
  try {
    const exists = await checkAdminExists();
    if (exists.success && exists.exists) {
       return { success: false, error: 'Administrador ya existente. Solo se permite un Administrador principal.' };
    }
    
    const hash = await bcrypt.hash(passwordPlain, 10);
    const supabase = requireSupabase();
    const { error } = await supabase
      .from('sistema_admin')
      .insert({ username, password_hash: hash, totp_enabled: 0 });

    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (e) {
     console.error(e);
     return { success: false, error: 'Hubo un error configurando la cuenta' };
  }
}

export async function loginAdmin(username: string, passwordPlain: string, totpCode?: string) {
  try {
     const supabase = requireSupabase();
     const { data, error } = await supabase
       .from('sistema_admin')
       .select('*')
       .eq('username', username)
       .maybeSingle();

     if (error) {
       return { success: false, error: error.message };
     }

     if (!data) {
       return { success: false, error: 'Credenciales inválidas.' };
     }

     const user = data;

     const isValid = await bcrypt.compare(passwordPlain, user.password_hash as string);
     
     if (!isValid) {
       return { success: false, error: 'Credenciales inválidas.' };
     }
     
     // 2FA Check
     if (user.totp_enabled === 1) {
       if (!totpCode || totpCode.trim() === '') {
         return { success: false, require2FA: true };
       }
       // Validate TOTP
       const isOtpValid = authenticator.check(totpCode, user.totp_secret as string);
       if (!isOtpValid) {
         return { success: false, require2FA: true, error: 'El código numérico es incorrecto. Revisa tu celular.' };
       }
     }
     
     return { success: true, username: user.username };
  } catch (e) {
     console.error(e);
     return { success: false, error: 'Hubo un error interno procesando tus datos.' };
  }
}

export async function generate2FASecret(username: string) {
   // Generate a secret
   const secret = authenticator.generateSecret();
   
   // Formulate issuer conditionally
   requireSupabase();
   const appName = (await getRestaurantSetting('restaurant_name')) || 'RestoPOS';
   
   // Build the key URI
   const otpauth = authenticator.keyuri(username, String(appName), secret);
   
   // Render as QR code
   const qrCodeUrl = await QRCode.toDataURL(otpauth, {
     color: {
       dark: '#000000',
       light: '#ffffff'
     }
   });
   
   return { success: true, secret, qrCodeUrl };
}

export async function verifyAndEnable2FA(username: string, token: string, secret: string) {
   const isValid = authenticator.check(token, secret);
   if (!isValid) {
      return { success: false, error: 'El código introducido no coincide. Intenta de nuevo por favor.' };
   }
   
   try {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('sistema_admin')
        .update({ totp_secret: secret, totp_enabled: 1 })
        .eq('username', username);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
   } catch (e) {
      console.error(e);
      return { success: false, error: 'No pudimos registrar tu llave de seguridad en la Base de Datos.' };
   }
}

export async function check2FAStatus(username: string) {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('sistema_admin')
      .select('totp_enabled')
      .eq('username', username)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, exists: false };
    return { success: true, enabled: data.totp_enabled === 1 };
  } catch (e) {
    return { success: false, error: 'Error accediendo al sistema admin.' };
  }
}

export async function disable2FA(username: string, token: string) {
   try {
     const supabase = requireSupabase();
     const { data, error } = await supabase
       .from('sistema_admin')
       .select('totp_secret, totp_enabled')
       .eq('username', username)
       .maybeSingle();

     if (error) return { success: false, error: error.message };
     if (!data) return { success: false, error: 'Administrador no encontrado.' };
     const user = data;
     
     if (user.totp_enabled !== 1) return { success: false, error: 'La seguridad doble paso ya estaba apagada.' };
     
     const isValid = authenticator.check(token, user.totp_secret as string);
     if (!isValid) return { success: false, error: 'Código inválido. No se puede remover el cerrojo sin comprobar tu identidad.' };

     const { error: updateError } = await supabase
       .from('sistema_admin')
       .update({ totp_enabled: 0, totp_secret: null })
       .eq('username', username);

     if (updateError) return { success: false, error: updateError.message };
     
     return { success: true };
   } catch(e) {
     return { success: false, error: 'Error al desconectar seguridad' };
   }
}
