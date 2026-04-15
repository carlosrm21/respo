'use server';
import { revalidatePath } from 'next/cache';
import {
  getTurnoResumenData,
  getTurnosData,
  iniciarTurnoData,
  terminarTurnoData
} from '@/lib/opsBackofficeData';

export async function getTurnos(fecha?: string) {
  try {
    return { success: true, data: await getTurnosData(fecha) };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function iniciarTurno(meseroId: number, notas?: string) {
  try {
    const id = await iniciarTurnoData(meseroId, notas);
    revalidatePath('/');
    return { success: true, id };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function terminarTurno(turnoId: number) {
  try {
    await terminarTurnoData(turnoId);
    revalidatePath('/');
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getTurnoResumen() {
  try {
    return { success: true, data: await getTurnoResumenData() };
  } catch (e: any) { return { success: false }; }
}
