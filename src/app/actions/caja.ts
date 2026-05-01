'use server';

import { revalidatePath } from 'next/cache';
import { abrirCajaData, cerrarCajaData, getCajaEstadoData } from '@/lib/opsData';

export async function getEstadoCaja() {
    try {
        const caja = await getCajaEstadoData();
        return { success: true, data: caja || null };
    } catch (error) {
        return { success: false, error: 'Error al obtener estado de caja' };
    }
}

export async function abrirCaja(monto: number, meseroId: number) {
    try {
        console.log('Attempting to open caja with monto:', monto, 'and meseroId:', meseroId);
        const resolvedMeseroId = meseroId === 0 ? null : (meseroId || null);
        const id = await abrirCajaData(monto, resolvedMeseroId);
        console.log('Caja opened successfully, ID:', id);
        revalidatePath('/');
        return { success: true, id };
    } catch (error: any) {
        console.error('CRITICAL ERROR in abrirCaja:', error.message, error.stack);
        return { success: false, error: `Error al abrir caja: ${error.message}` };
    }
}

export async function cerrarCaja(id: number, montoReal: number) {
    try {
        await cerrarCajaData(id, montoReal);
        
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al cerrar caja' };
    }
}
