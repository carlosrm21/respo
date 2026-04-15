'use server';
import {
  getHistorialFacturasData,
  getMeserosForFilterData,
  getResumenHistorialData
} from '@/lib/opsBackofficeData';

export async function getHistorialFacturas(filters?: { fechaDesde?: string; fechaHasta?: string; meseroId?: number; metodo?: string }) {
  try {
    return { success: true, data: await getHistorialFacturasData(filters) };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function getResumenHistorial() {
  try {
    return { success: true, data: await getResumenHistorialData() };
  } catch (e: any) { return { success: false }; }
}

export async function getMeserosForFilter() {
  try {
    const data = await getMeserosForFilterData();
    return { success: true, data };
  } catch { return { success: false, data: [] }; }
}
