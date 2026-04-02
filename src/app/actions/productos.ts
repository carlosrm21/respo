'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProductos() {
  try {
    const productos = (await db.execute(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      ORDER BY c.nombre, p.nombre
    `)).rows;
    return { success: true, data: productos };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCategorias() {
  try {
    const cats = (await db.execute(`SELECT * FROM categorias ORDER BY nombre`)).rows;
    return { success: true, data: cats };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addProducto(data: {
  nombre: string;
  categoria_id: number;
  precio: number;
  costo: number;
  descripcion?: string;
}) {
  try {
    const result = (await db.execute({ sql: `
      INSERT INTO productos (nombre, categoria_id, precio, costo, descripcion, disponible)
      VALUES (?, ?, ?, ?, ?, 1)
    `, args: [data.nombre, data.categoria_id, data.precio, data.costo, data.descripcion || null] }));
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateProducto(id: number, data: {
  nombre?: string;
  precio?: number;
  costo?: number;
  disponible?: number;
}) {
  try {
    const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const vals = [...Object.values(data), id];
    (await db.execute({ sql: `UPDATE productos SET ${fields} WHERE id = ?`, args: [...vals] }));
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProducto(id: number) {
  try {
    (await db.execute({ sql: `DELETE FROM productos WHERE id = ?`, args: [id] }));
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addCategoria(nombre: string) {
  try {
    const result = (await db.execute({ sql: `INSERT INTO categorias (nombre) VALUES (?)`, args: [nombre] }));
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
