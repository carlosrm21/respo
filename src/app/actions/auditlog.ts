'use server';
import { addAuditLogData, getAuditLogData } from '@/lib/opsBackofficeData';

export async function addAuditLog(usuario: string, accion: string, entidad?: string, detalle?: string) {
  try {
    await addAuditLogData(usuario, accion, entidad, detalle);
  } catch {} // silently fail if table doesn't exist yet
}

export async function getAuditLog(limit = 100) {
  try {
    const data = await getAuditLogData(limit);
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}
