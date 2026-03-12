'use server';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProductos() {
  try {
    const productos = db.prepare(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      ORDER BY c.nombre, p.nombre
    `).all();
    return { success: true, data: productos };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCategorias() {
  try {
    const cats = db.prepare(`SELECT * FROM categorias ORDER BY nombre`).all();
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
    const result = db.prepare(`
      INSERT INTO productos (nombre, categoria_id, precio, costo, descripcion, disponible)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(data.nombre, data.categoria_id, data.precio, data.costo, data.descripcion || null);
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
    db.prepare(`UPDATE productos SET ${fields} WHERE id = ?`).run(...vals);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProducto(id: number) {
  try {
    db.prepare(`DELETE FROM productos WHERE id = ?`).run(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addCategoria(nombre: string) {
  try {
    const result = db.prepare(`INSERT INTO categorias (nombre) VALUES (?)`).run(nombre);
    revalidatePath('/');
    return { success: true, id: result.lastInsertRowid };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
