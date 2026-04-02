'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { printKitchenTicket } from '@/lib/printer';

interface OrderItem {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
}

export async function submitOrder(mesaId: number, items: OrderItem[]) {
    try {
        // We need the mesa number for the ticket
        const mesa = (await db.execute({ sql: 'SELECT numero FROM mesas WHERE id = ?', args: [mesaId] })).rows[0] as { numero: number };

        const insertPedido = await db.execute({ sql: 'INSERT INTO pedidos (mesa_id, mesero_id) VALUES (?, ?)', args: [mesaId, 1] });
        const pedidoId = insertPedido.lastInsertRowid;

        // 2. Insert items into detalles_pedido
        for (const item of items) {
             await db.execute({ sql: 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', args: [pedidoId, item.id, item.cantidad, item.precio] });
        }

        // 3. Mark the table as Ocupada automatically if it wasn't
        await db.execute({ sql: 'UPDATE mesas SET estado = ? WHERE id = ?', args: ['ocupada', mesaId] });

        const result = pedidoId;

        // Attempt to print receipt, but don't fail the order if the printer is offline
        try {
            await printKitchenTicket(mesa.numero, 'Carlos', items);
        } catch (e) {
            console.error('Failed to print receipt, but order was saved');
        }

        // Refresh UI
        revalidatePath('/');

        return { success: true, pedidoId: result };
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error: 'Failed to process order' };
    }
}

export async function getProductos() {
    try {
        const { rows } = await db.execute('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.disponible = 1');
        return { success: true, data: rows };
    } catch (error) {
        return { success: false, error: 'Failed to fetch products' };
    }
}
