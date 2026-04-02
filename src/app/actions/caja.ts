'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getEstadoCaja() {
    try {
        const caja = (await db.execute({ sql: 'SELECT * FROM caja WHERE estado = ? ORDER BY fecha_apertura DESC LIMIT 1', args: ['abierta'] })).rows[0];
        return { success: true, data: caja || null };
    } catch (error) {
        return { success: false, error: 'Error al obtener estado de caja' };
    }
}

export async function abrirCaja(monto: number, meseroId: number) {
    try {
        console.log('Attempting to open caja with monto:', monto, 'and meseroId:', meseroId);
        // Ensure mesero exists or fallback to null if necessary for testing
        const result = await db.execute({ sql: 'INSERT INTO caja (monto_apertura, mesero_id_apertura, estado) VALUES (?, ?, ?)', args: [monto, meseroId || null, 'abierta'] });
        console.log('Caja opened successfully, ID:', result.lastInsertRowid);
        revalidatePath('/');
        return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
        console.error('CRITICAL ERROR in abrirCaja:', error.message, error.stack);
        return { success: false, error: `Error al abrir caja: ${error.message}` };
    }
}

export async function cerrarCaja(id: number, montoReal: number) {
    try {
        // Calcular ventas esperadas desde la apertura
        const caja = (await db.execute({sql: 'SELECT fecha_apertura FROM caja WHERE id = ?', args: [id] })).rows[0] as { fecha_apertura: string };
        
        const ventas = (await db.execute({ sql: `
            SELECT SUM(total) as total_ventas 
            FROM facturas 
            WHERE fecha_emision >= ?
        `, args: [caja.fecha_apertura] })).rows[0] as { total_ventas: number };

        const totalEsperado = ventas.total_ventas || 0;

        await db.execute({ sql: `
            UPDATE caja 
            SET fecha_cierre = CURRENT_TIMESTAMP, 
                monto_cierre = ?, 
                ventas_esperadas = ?, 
                estado = ? 
            WHERE id = ?
        `, args: [montoReal, totalEsperado, 'cerrada', id] });
        
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al cerrar caja' };
    }
}
