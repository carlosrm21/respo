'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getEstadoCaja() {
    try {
        const caja = db.prepare('SELECT * FROM caja WHERE estado = ? ORDER BY fecha_apertura DESC LIMIT 1').get('abierta');
        return { success: true, data: caja || null };
    } catch (error) {
        return { success: false, error: 'Error al obtener estado de caja' };
    }
}

export async function abrirCaja(monto: number, meseroId: number) {
    try {
        console.log('Attempting to open caja with monto:', monto, 'and meseroId:', meseroId);
        // Ensure mesero exists or fallback to null if necessary for testing
        const stmt = db.prepare('INSERT INTO caja (monto_apertura, mesero_id_apertura, estado) VALUES (?, ?, ?)');
        const result = stmt.run(monto, meseroId || null, 'abierta');
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
        const caja = db.prepare('SELECT fecha_apertura FROM caja WHERE id = ?').get(id) as { fecha_apertura: string };
        
        const ventas = db.prepare(`
            SELECT SUM(total) as total_ventas 
            FROM facturas 
            WHERE fecha_emision >= ?
        `).get(caja.fecha_apertura) as { total_ventas: number };

        const totalEsperado = ventas.total_ventas || 0;

        const stmt = db.prepare(`
            UPDATE caja 
            SET fecha_cierre = CURRENT_TIMESTAMP, 
                monto_cierre = ?, 
                ventas_esperadas = ?, 
                estado = ? 
            WHERE id = ?
        `);
        stmt.run(montoReal, totalEsperado, 'cerrada', id);
        
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error al cerrar caja' };
    }
}
