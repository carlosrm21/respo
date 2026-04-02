'use server';

import { emitirFacturaElectronica } from '@/lib/dian';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPedidosActivos(mesaId: number) {
    try {
        const pedidos = (await db.execute({ sql: 'SELECT p.* FROM pedidos p WHERE p.mesa_id = ? AND p.estado = ?', args: [mesaId, 'abierto'] })).rows as any[];

        // In a real app we might combine multiple open orders per table into one invoice.
        // For simplicity, we just take the first one.
        if (!pedidos || pedidos.length === 0) return { success: false, error: 'No open orders' };

        // Fetch details
        const detalles = (await db.execute({ sql: `
      SELECT dp.*, pr.nombre 
      FROM detalles_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = ?
    `, args: [pedidos[0].id] })).rows as any[];

        const subtotal = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        return {
            success: true,
            pedidoId: pedidos[0].id,
            detalles,
            subtotal
        };
    } catch (error) {
        return { success: false, error: 'Failed to fetch active orders' };
    }
}

export async function cerrarMesaYFacturar(pedidoId: number, metodoPago: string) {
    // This uses the DIAN simulation we built
    const result = await emitirFacturaElectronica(pedidoId, {
        tipo_documento: 'CC',
        numero_documento: '123456789',
        nombres: 'Cliente C. Final',
    }, metodoPago);

    if (result.success) {
        revalidatePath('/');
    }

    return result;
}
