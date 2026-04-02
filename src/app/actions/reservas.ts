'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getReservas(fecha?: string) {
  try {
    const query = fecha
      ? `SELECT r.*, m.numero as mesa_numero FROM reservas r LEFT JOIN mesas m ON r.mesa_id = m.id WHERE r.fecha = ? ORDER BY r.hora ASC`
      : `SELECT r.*, m.numero as mesa_numero FROM reservas r LEFT JOIN mesas m ON r.mesa_id = m.id ORDER BY r.fecha DESC, r.hora ASC LIMIT 100`;
    const data = fecha ? (await db.execute({ sql: query, args: [fecha] })).rows : (await db.execute(query)).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function addReserva(data: { nombre: string; telefono?: string; fecha: string; hora: string; personas: number; mesa_id?: number; notas?: string }) {
  try {
    const result = await db.execute({ sql: `
      INSERT INTO reservas (nombre, telefono, fecha, hora, personas, mesa_id, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, args: [data.nombre, data.telefono || null, data.fecha, data.hora, data.personas, data.mesa_id || null, data.notas || null] });
    // If mesa assigned, mark as reserved
    if (data.mesa_id) {
      await db.execute({ sql: `UPDATE mesas SET estado = 'reservada' WHERE id = ?`, args: [data.mesa_id] });
    }
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateReservaEstado(id: number, estado: string) {
  try {
    const reserva = (await db.execute({ sql: 'SELECT * FROM reservas WHERE id = ?', args: [id] })).rows[0] as any;
    (await db.execute({ sql: 'UPDATE reservas SET estado = ? WHERE id = ?', args: [estado, id] }));
    // If cancelled or completed, free up the table
    if ((estado === 'cancelada' || estado === 'completada') && reserva?.mesa_id) {
      (await db.execute({ sql: `UPDATE mesas SET estado = 'disponible' WHERE id = ? AND estado = 'reservada'`, args: [reserva.mesa_id] }));
    }
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteReserva(id: number) {
  try {
    const reserva = (await db.execute({ sql: 'SELECT * FROM reservas WHERE id = ?', args: [id] })).rows[0] as any;
    await db.execute({ sql: 'DELETE FROM reservas WHERE id = ?', args: [id] });
    if (reserva?.mesa_id) {
      (await db.execute({ sql: `UPDATE mesas SET estado = 'disponible' WHERE id = ? AND estado = 'reservada'`, args: [reserva.mesa_id] }));
    }
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getMesas() {
  try {
    const data = (await db.execute('SELECT id, numero, capacidad, estado FROM mesas ORDER BY numero ASC')).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [] }; }
}
