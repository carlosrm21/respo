'use server';

import db from '@/lib/db';

// This is a template integration for a "Proveedor Tecnológico" DIAN API.
// E.g. Siigo, Alegra, Loggro, etc.

const DIAN_API_URL = process.env.DIAN_API_URL || 'https://api.proveedor-dian.ejemplo.com/v1';
const DIAN_API_TOKEN = process.env.DIAN_API_TOKEN || '';

interface PayloadFactura {
    cliente: {
        tipo_documento: string; // CC, NIT, CE
        numero_documento: string;
        nombres: string;
        apellidos?: string;
        correo?: string;
    };
    metodo_pago: string;
    items: Array<{
        codigo: string;
        descripcion: string;
        cantidad: number;
        precio_unitario: number;
        impuestos: Array<{
            tipo: string; // IVA, INC
            porcentaje: number;
        }>;
    }>;
}

export async function emitirFacturaElectronica(pedidoId: number, datosCliente: PayloadFactura['cliente'], metodoPago: string) {
    try {
        // 1. Gather all info from the DB
        const pedido = db.prepare(`
      SELECT p.*, m.numero as mesa_numero
      FROM pedidos p 
      JOIN mesas m ON p.mesa_id = m.id 
      WHERE p.id = ?
    `).get(pedidoId) as any;

        if (!pedido) throw new Error('Pedido no encontrado');

        const detalles = db.prepare(`
      SELECT dp.*, pr.nombre 
      FROM detalles_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = ?
    `).all(pedidoId) as any[];

        // 2. Build the exact JSON structure your provider expects
        const payload: PayloadFactura = {
            cliente: datosCliente,
            metodo_pago: metodoPago,
            items: detalles.map(d => ({
                codigo: d.producto_id.toString(),
                descripcion: d.nombre,
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                impuestos: [
                    { tipo: 'INC', porcentaje: 8 } // Impuesto al consumo (ejemplo 8%)
                ]
            }))
        };

        // Calculate total
        const subtotal = payload.items.reduce((s, i) => s + (i.cantidad * i.precio_unitario), 0);
        const inc = subtotal * 0.08;
        const total = subtotal + inc;

        // 3. Send to API (Commented out until you have a real provider)
        console.log('--- ENVIANDO A LA DIAN [SIMULADO] ---');
        console.log(JSON.stringify(payload, null, 2));

        /*
        const response = await fetch(`${DIAN_API_URL}/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DIAN_API_TOKEN}`
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`Dian API Error: ${response.statusText}`);
        }
    
        const apiResult = await response.json();
        const cufe = apiResult.cufe; // Código Único de Factura Electrónica
        const numero_dian = apiResult.number; // e.g FACT-1001
        */

        // Simulated successful response
        const cufe = 'SIMULADO-' + Math.random().toString(36).substring(7);
        const numero_dian = 'FACT-' + Math.floor(Math.random() * 10000);

        // 4. Save the reference in our database
        db.prepare(`
      INSERT INTO facturas (pedido_id, numero_dian, total, metodo_pago, estado_dian) 
      VALUES (?, ?, ?, ?, ?)
    `).run(pedidoId, numero_dian, total, metodoPago, 'enviado');

        // 5. Update order state
        db.prepare('UPDATE pedidos SET estado = ? WHERE id = ?').run('pagado', pedidoId);

        // 6. Free the table
        if (pedido.mesa_id) {
            db.prepare('UPDATE mesas SET estado = ? WHERE id = ?').run('disponible', pedido.mesa_id);
        }

        return { success: true, cufe, numero_dian };

    } catch (error: any) {
        console.error('Error emitiendo factura:', error);
        return { success: false, error: error.message };
    }
}
