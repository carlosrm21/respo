'use server';
import { revalidatePath } from 'next/cache';
import {
  addInventarioData,
  adjustInventarioCantidadData,
  deleteInventarioData,
  getInventarioData,
  updateInventarioData
} from '@/lib/opsBackofficeData';

export async function getInventario() {
  try {
    const items = await getInventarioData();
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
    const id = await addInventarioData(data);
    revalidatePath('/');
    return { success: true, id };
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
    await updateInventarioData(id, data);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteInventarioItem(id: number) {
  try {
    await deleteInventarioData(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function ajustarCantidad(id: number, delta: number) {
  try {
    await adjustInventarioCantidadData(id, delta);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
