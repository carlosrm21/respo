'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTurnos(fecha?: string) {
  try {
    const q = fecha
      ? `SELECT t.*, mes.nombre as mesero_nombre FROM turnos t JOIN meseros mes ON t.mesero_id = mes.id WHERE t.fecha = ? ORDER BY t.hora_entrada ASC`
      : `SELECT t.*, mes.nombre as mesero_nombre FROM turnos t JOIN meseros mes ON t.mesero_id = mes.id ORDER BY t.fecha DESC, t.hora_entrada ASC LIMIT 100`;
    const data = fecha ? db.prepare(q).all(fecha) : db.prepare(q).all();
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function iniciarTurno(meseroId: number, notas?: string) {
  try {
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const horaAhora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    // Check if already has an active turno today
    const existing = db.prepare(`SELECT id FROM turnos WHERE mesero_id = ? AND fecha = ? AND estado = 'activo'`).get(meseroId, fechaHoy);
    if (existing) return { success: false, error: 'Ya tiene un turno activo hoy' };
    const result = db.prepare(`INSERT INTO turnos (mesero_id, fecha, hora_entrada, notas) VALUES (?, ?, ?, ?)`).run(meseroId, fechaHoy, horaAhora, notas || null);
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function terminarTurno(turnoId: number) {
  try {
    const horaAhora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    db.prepare(`UPDATE turnos SET hora_salida = ?, estado = 'terminado' WHERE id = ?`).run(horaAhora, turnoId);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getTurnoResumen() {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const activos = db.prepare(`SELECT COUNT(*) as c FROM turnos WHERE fecha = ? AND estado = 'activo'`).get(hoy) as any;
    const terminados = db.prepare(`SELECT COUNT(*) as c FROM turnos WHERE fecha = ? AND estado = 'terminado'`).get(hoy) as any;
    const meseros = db.prepare(`SELECT id, nombre FROM meseros WHERE activo = 1`).all();
    return { success: true, data: { activos: activos.c, terminados: terminados.c, meseros } };
  } catch (e: any) { return { success: false }; }
}
