'use server';
import { revalidatePath } from 'next/cache';
import {
  addReservaData,
  deleteReservaData,
  getMesasBasicData,
  getReservasData,
  updateReservaEstadoData
} from '@/lib/opsBackofficeData';

export async function getReservas(fecha?: string) {
  try {
    return { success: true, data: await getReservasData(fecha) };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function addReserva(data: { nombre: string; telefono?: string; fecha: string; hora: string; personas: number; mesa_id?: number; notas?: string }) {
  try {
    const id = await addReservaData(data);
    revalidatePath('/');
    return { success: true, id };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateReservaEstado(id: number, estado: string) {
  try {
    await updateReservaEstadoData(id, estado);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteReserva(id: number) {
  try {
    await deleteReservaData(id);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getMesas() {
  try {
    const data = await getMesasBasicData();
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [] }; }
}
