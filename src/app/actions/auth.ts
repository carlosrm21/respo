'use server';
import db from '../../lib/db';

export async function verifyLicense() {
  try {
    const config = (await db.execute("SELECT valor FROM configuracion WHERE clave = 'vencimiento_licencia'")).rows[0] as { valor: string } | undefined;
    if (!config) return { valid: false, message: 'Licencia SaaS no configurada o corrupta' };
    
    const expiration = new Date(config.valor);
    if (new Date() > expiration) {
      return { valid: false, message: 'Tu licencia anual de RestoPOS ha expirado. Por favor, realiza el pago para reactivar el sistema.' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error(error);
    return { valid: false, message: 'Error interno al verificar la licencia SaaS' };
  }
}

export async function loginWithPin(role: string, pin: string) {
  try {
    // 1. Verify license first
    const licenseCheck = await verifyLicense();
    if (!licenseCheck.valid) {
      return { success: false, error: 'LICENCIA_EXPIRADA', message: licenseCheck.message };
    }

    // 2. Verify PIN in database
    const user = (await db.execute({ sql: "SELECT * FROM meseros WHERE rol = ? AND pin = ?", args: [role, pin] })).rows[0] as any;
    
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
