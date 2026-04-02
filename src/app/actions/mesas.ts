'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMesas() {
    try {
        const { rows: rows } = await db.execute('SELECT * FROM mesas ORDER BY numero ASC');
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching mesas:', error);
        return { success: false, error: 'Failed to fetch mesas' };
    }
}

export async function updateMesaEstado(id: number, nuevoEstado: string) {
    try {
        await db.execute({ sql: 'UPDATE mesas SET estado = ? WHERE id = ?', args: [nuevoEstado, id] });
        revalidatePath('/'); // Refresh the page to show the new state
        return { success: true };
    } catch (error) {
        console.error('Error updating mesa:', error);
        return { success: false, error: 'Failed to update mesa status' };
    }
}
