'use server';
import { revalidatePath } from 'next/cache';
import {
  addCategoriaData,
  addProductoData,
  deleteProductoData,
  getCategoriasData,
  getProductosData,
  updateProductoData
} from '@/lib/opsData';

export async function getProductos() {
  try {
    const productos = await getProductosData();
    return { success: true, data: productos };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCategorias() {
  try {
    const cats = await getCategoriasData();
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
    const id = await addProductoData(data);
    revalidatePath('/');
    return { success: true, id };
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
    await updateProductoData(id, data);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteProducto(id: number) {
  try {
    await deleteProductoData(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addCategoria(nombre: string) {
  try {
    const id = await addCategoriaData(nombre);
    revalidatePath('/');
    return { success: true, id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
