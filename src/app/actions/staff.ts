'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMeseros() {
  try {
    const meseros = (await db.execute(`SELECT * FROM meseros ORDER BY nombre`)).rows;
    return { success: true, data: meseros };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addMesero(nombre: string, pin: string) {
  try {
    const result = (await db.execute({ sql: `INSERT INTO meseros (nombre, pin, activo) VALUES (?, ?, 1)`, args: [nombre, pin] }));
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateMesero(id: number, nombre: string, activo: number) {
  try {
    (await db.execute({ sql: `UPDATE meseros SET nombre = ?, activo = ? WHERE id = ?`, args: [nombre, activo, id] }));
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteMesero(id: number) {
  try {
    (await db.execute({ sql: `DELETE FROM meseros WHERE id = ?`, args: [id] }));
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
