'use server';
import { addComboData, deleteComboData, getCombosData } from '@/lib/opsData';

export async function getCombos() {
  try {
    return { success: true, data: await getCombosData() };
  } catch (e: any) { return { success: false, data: [] }; }
}

export async function addCombo(nombre: string, descripcion: string, items: { producto_id: number; cantidad: number }[], precio_especial?: number) {
  try {
    const comboId = await addComboData(nombre, descripcion, items, precio_especial);
    return { success: true, id: comboId };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteCombo(id: number) {
  try {
    await deleteComboData(id);
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
