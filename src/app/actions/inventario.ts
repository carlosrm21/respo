'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getInventario() {
  try {
    const items = db.prepare(`SELECT * FROM inventario ORDER BY categoria, nombre`).all();
    return { success: true, data: items };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addInventarioItem(data: {
  nombre: string;
  categoria: string;
  unidad: string;
  cantidad: number;
  cantidad_minima: number;
  costo_unitario: number;
  proveedor?: string;
}) {
  try {
    const stmt = db.prepare(`
      INSERT INTO inventario (nombre, categoria, unidad, cantidad, cantidad_minima, costo_unitario, proveedor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.nombre, data.categoria, data.unidad,
      data.cantidad, data.cantidad_minima, data.costo_unitario,
      data.proveedor || null
    );
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateInventarioItem(id: number, data: {
  nombre?: string;
  categoria?: string;
  unidad?: string;
  cantidad?: number;
  cantidad_minima?: number;
  costo_unitario?: number;
  proveedor?: string;
}) {
  try {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const vals = [...Object.values(data), id];
    db.prepare(`UPDATE inventario SET ${fields}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`).run(...vals);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteInventarioItem(id: number) {
  try {
    db.prepare(`DELETE FROM inventario WHERE id = ?`).run(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function ajustarCantidad(id: number, delta: number) {
  try {
    db.prepare(`UPDATE inventario SET cantidad = MAX(0, cantidad + ?), fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?`).run(delta, id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
