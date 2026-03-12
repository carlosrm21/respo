'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getReservas(fecha?: string) {
  try {
    const query = fecha
      ? `SELECT r.*, m.numero as mesa_numero FROM reservas r LEFT JOIN mesas m ON r.mesa_id = m.id WHERE r.fecha = ? ORDER BY r.hora ASC`
      : `SELECT r.*, m.numero as mesa_numero FROM reservas r LEFT JOIN mesas m ON r.mesa_id = m.id ORDER BY r.fecha DESC, r.hora ASC LIMIT 100`;
    const data = fecha ? db.prepare(query).all(fecha) : db.prepare(query).all();
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function addReserva(data: { nombre: string; telefono?: string; fecha: string; hora: string; personas: number; mesa_id?: number; notas?: string }) {
  try {
    const result = db.prepare(`
      INSERT INTO reservas (nombre, telefono, fecha, hora, personas, mesa_id, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(data.nombre, data.telefono || null, data.fecha, data.hora, data.personas, data.mesa_id || null, data.notas || null);
    // If mesa assigned, mark as reserved
    if (data.mesa_id) {
      db.prepare(`UPDATE mesas SET estado = 'reservada' WHERE id = ?`).run(data.mesa_id);
    }
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateReservaEstado(id: number, estado: string) {
  try {
    const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id) as any;
    db.prepare('UPDATE reservas SET estado = ? WHERE id = ?').run(estado, id);
    // If cancelled or completed, free up the table
    if ((estado === 'cancelada' || estado === 'completada') && reserva?.mesa_id) {
      db.prepare(`UPDATE mesas SET estado = 'disponible' WHERE id = ? AND estado = 'reservada'`).run(reserva.mesa_id);
    }
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteReserva(id: number) {
  try {
    const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id) as any;
    db.prepare('DELETE FROM reservas WHERE id = ?').run(id);
    if (reserva?.mesa_id) {
      db.prepare(`UPDATE mesas SET estado = 'disponible' WHERE id = ? AND estado = 'reservada'`).run(reserva.mesa_id);
    }
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getMesas() {
  try {
    const data = db.prepare('SELECT id, numero, capacidad, estado FROM mesas ORDER BY numero ASC').all();
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [] }; }
}
