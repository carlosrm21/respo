'use server';

import { revalidatePath } from 'next/cache';
import { printKitchenTicket } from '@/lib/printer';
import { createPedidoData, getProductosData } from '@/lib/opsData';

interface OrderItem {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
}

export async function submitOrder(mesaId: number, items: OrderItem[]) {
    try {
        const created = await createPedidoData(mesaId, 1, items);
        const pedidoId = created.pedidoId;
        const mesaNumero = created.mesaNumero;

        // Attempt to print receipt, but don't fail the order if the printer is offline
        try {
            await printKitchenTicket(mesaNumero, 'Carlos', items);
        } catch (e) {
            console.error('Failed to print receipt, but order was saved');
        }

        // Refresh UI
        revalidatePath('/');

        return { success: true, pedidoId };
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error: 'Failed to process order' };
    }
}

export async function getProductos() {
    try {
        const data = await getProductosData({ onlyAvailable: true });
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch products' };
    }
}
