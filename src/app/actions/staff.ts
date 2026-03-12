'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMeseros() {
  try {
    const meseros = db.prepare(`SELECT * FROM meseros ORDER BY nombre`).all();
    return { success: true, data: meseros };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addMesero(nombre: string, pin: string) {
  try {
    const result = db.prepare(`INSERT INTO meseros (nombre, pin, activo) VALUES (?, ?, 1)`).run(nombre, pin);
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateMesero(id: number, nombre: string, activo: number) {
  try {
    db.prepare(`UPDATE meseros SET nombre = ?, activo = ? WHERE id = ?`).run(nombre, activo, id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteMesero(id: number) {
  try {
    db.prepare(`DELETE FROM meseros WHERE id = ?`).run(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
