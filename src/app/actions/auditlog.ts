'use server';
import db from '@/lib/db';

export async function addAuditLog(usuario: string, accion: string, entidad?: string, detalle?: string) {
  try {
    await db.execute({ sql: 'INSERT INTO audit_log (usuario, accion, entidad, detalle) VALUES (?, ?, ?, ?)', args: [usuario, accion, entidad || null, detalle || null] });
  } catch {} // silently fail if table doesn't exist yet
}

export async function getAuditLog(limit = 100) {
  try {
    const data = (await db.execute({ sql: 'SELECT * FROM audit_log ORDER BY fecha DESC LIMIT ?', args: [limit] })).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}
