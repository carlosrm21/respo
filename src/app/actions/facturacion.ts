'use server';

import { emitirFacturaElectronica } from '@/lib/dian';
import { revalidatePath } from 'next/cache';
import { getOpenPedidoForMesaData } from '@/lib/opsData';

export async function getPedidosActivos(mesaId: number) {
    try {
        const pedido = await getOpenPedidoForMesaData(mesaId);
        if (!pedido) return { success: false, error: 'No open orders' };

        return {
            success: true,
            pedidoId: pedido.pedidoId,
            detalles: pedido.detalles,
            subtotal: pedido.subtotal
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
