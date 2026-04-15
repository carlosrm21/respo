'use server';
import { getKDSPedidosData, getMeseroOrdenStatusData, updateDetalleEstadoData } from '@/lib/opsData';

export async function getKDSPedidos() {
  try {
    const result = await getKDSPedidosData();

    return { success: true, data: result };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function updateItemEstado(detalleId: number, estado: 'pendiente' | 'cocinando' | 'servido') {
  try {
    await updateDetalleEstadoData(detalleId, estado);
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getMeseroOrdenStatus(meseroId: number) {
  try {
    const data = await getMeseroOrdenStatusData(meseroId);
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [] }; }
}
