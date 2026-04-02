'use server';

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Initialize the database table
async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sistema_admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      totp_secret TEXT,
      totp_enabled INTEGER DEFAULT 0
    )
  `);
}

export async function checkAdminExists() {
  await initDb();
  try {
    const result = await db.execute(`SELECT COUNT(*) as count FROM sistema_admin`);
    const count = parseInt(String(result.rows[0].count), 10);
    return { success: true, exists: count > 0 };
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
    
    await db.execute({
      sql: `INSERT INTO sistema_admin (username, password_hash) VALUES (?, ?)`,
      args: [username, hash]
    });
    
    return { success: true };
  } catch (e) {
     console.error(e);
     return { success: false, error: 'Hubo un error configurando la cuenta' };
  }
}

export async function loginAdmin(username: string, passwordPlain: string, totpCode?: string) {
  await initDb();
  try {
     const result = await db.execute({
       sql: `SELECT * FROM sistema_admin WHERE username = ?`,
       args: [username]
     });
     
     if (!result.rows || result.rows.length === 0) {
       return { success: false, error: 'Credenciales inválidas.' };
     }
     
     const user = result.rows[0];
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
   const restaurantResult = await db.execute(`SELECT valor FROM configuracion_restaurante WHERE clave = 'restaurant_name'`).catch(()=>({rows:[]}));
   const appName = restaurantResult.rows?.[0] ? restaurantResult.rows[0].valor : 'RestoPOS';
   
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
      await db.execute({
         sql: `UPDATE sistema_admin SET totp_secret = ?, totp_enabled = 1 WHERE username = ?`,
         args: [secret, username]
      });
      return { success: true };
   } catch (e) {
      console.error(e);
      return { success: false, error: 'No pudimos registrar tu llave de seguridad en la Base de Datos.' };
   }
}

export async function check2FAStatus(username: string) {
  try {
    const result = await db.execute({
       sql: `SELECT totp_enabled FROM sistema_admin WHERE username = ?`,
       args: [username]
    });
    if (!result.rows || result.rows.length === 0) return { success: false, exists: false };
    return { success: true, enabled: result.rows[0].totp_enabled === 1 };
  } catch (e) {
    return { success: false, error: 'Error accediendo al sistema admin.' };
  }
}

export async function disable2FA(username: string, token: string) {
   try {
     const dbResult = await db.execute({
       sql: `SELECT totp_secret, totp_enabled FROM sistema_admin WHERE username = ?`,
       args: [username]
     });
     
     if (!dbResult.rows || dbResult.rows.length === 0) return { success: false, error: 'Administrador no encontrado.' };
     const user = dbResult.rows[0];
     
     if (user.totp_enabled !== 1) return { success: false, error: 'La seguridad doble paso ya estaba apagada.' };
     
     const isValid = authenticator.check(token, user.totp_secret as string);
     if (!isValid) return { success: false, error: 'Código inválido. No se puede remover el cerrojo sin comprobar tu identidad.' };
     
     await db.execute({
        sql: `UPDATE sistema_admin SET totp_enabled = 0, totp_secret = NULL WHERE username = ?`,
        args: [username]
     });
     
     return { success: true };
   } catch(e) {
     return { success: false, error: 'Error al desconectar seguridad' };
   }
}
