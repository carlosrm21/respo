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
        const mesa = db.prepare('SELECT numero FROM mesas WHERE id = ?').get(mesaId) as { numero: number };

        // Basic transaction to insert a "pedido" and its "detalles"
        const transaction = db.transaction((mesaId: number, items: OrderItem[]) => {
            // 1. Create a new Pedido for this mesa
            // Assuming mesero_id = 1 for now
            const insertPedido = db.prepare('INSERT INTO pedidos (mesa_id, mesero_id) VALUES (?, ?)');
            const infoPedido = insertPedido.run(mesaId, 1);
            const pedidoId = infoPedido.lastInsertRowid;

            // 2. Insert items into detalles_pedido
            const insertItem = db.prepare('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');

            for (const item of items) {
                insertItem.run(pedidoId, item.id, item.cantidad, item.precio);
            }

            // 3. Mark the table as Ocupada automatically if it wasn't
            db.prepare('UPDATE mesas SET estado = ? WHERE id = ?').run('ocupada', mesaId);

            return pedidoId;
        });

        const result = transaction(mesaId, items);

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
        const stmt = db.prepare('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.disponible = 1');
        return { success: true, data: stmt.all() };
    } catch (error) {
        return { success: false, error: 'Failed to fetch products' };
    }
}
