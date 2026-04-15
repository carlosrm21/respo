'use server';

import { revalidatePath } from 'next/cache';
import { getMesasData, updateMesaData } from '@/lib/opsData';

export async function getMesas() {
    try {
        const rows = await getMesasData();
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching mesas:', error);
        return { success: false, error: 'Failed to fetch mesas' };
    }
}

export async function updateMesaEstado(id: number, nuevoEstado: string) {
    try {
        await updateMesaData(id, { estado: nuevoEstado });
        revalidatePath('/'); // Refresh the page to show the new state
        return { success: true };
    } catch (error) {
        console.error('Error updating mesa:', error);
        return { success: false, error: 'Failed to update mesa status' };
    }
}
