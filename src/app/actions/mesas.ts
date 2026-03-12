'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMesas() {
    try {
        const stmt = db.prepare('SELECT * FROM mesas ORDER BY numero ASC');
        const rows = stmt.all();
        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching mesas:', error);
        return { success: false, error: 'Failed to fetch mesas' };
    }
}

export async function updateMesaEstado(id: number, nuevoEstado: string) {
    try {
        const stmt = db.prepare('UPDATE mesas SET estado = ? WHERE id = ?');
        stmt.run(nuevoEstado, id);
        revalidatePath('/'); // Refresh the page to show the new state
        return { success: true };
    } catch (error) {
        console.error('Error updating mesa:', error);
        return { success: false, error: 'Failed to update mesa status' };
    }
}
