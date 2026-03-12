'use server';
import db from '@/lib/db';

export async function getKDSPedidos() {
  try {
    const pedidos = db.prepare(`
      SELECT p.id, p.fecha_creacion, m.numero AS mesa_numero, mes.nombre AS mesero_nombre
      FROM pedidos p
      JOIN mesas m ON p.mesa_id = m.id
      LEFT JOIN meseros mes ON p.mesero_id = mes.id
      WHERE p.estado = 'abierto'
      ORDER BY p.fecha_creacion ASC
    `).all() as any[];

    const items = db.prepare(`
      SELECT dp.id, dp.pedido_id, dp.cantidad, dp.notas, dp.estado, pr.nombre
      FROM detalles_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id IN (
        SELECT id FROM pedidos WHERE estado = 'abierto'
      )
      ORDER BY dp.id ASC
    `).all() as any[];

    const result = pedidos.map(p => ({
      ...p,
      items: items.filter(i => i.pedido_id === p.id),
      minutos: Math.floor((Date.now() - new Date(p.fecha_creacion).getTime()) / 60000),
    }));

    return { success: true, data: result };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function updateItemEstado(detalleId: number, estado: 'pendiente' | 'cocinando' | 'servido') {
  try {
    db.prepare('UPDATE detalles_pedido SET estado = ? WHERE id = ?').run(estado, detalleId);
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getMeseroOrdenStatus(meseroId: number) {
  try {
    const data = db.prepare(`
      SELECT p.id as pedido_id, m.numero as mesa_numero, p.fecha_creacion,
             dp.id as detalle_id, dp.cantidad, dp.estado as item_estado, dp.notas, pr.nombre as producto_nombre
      FROM pedidos p
      JOIN mesas m ON p.mesa_id = m.id
      JOIN detalles_pedido dp ON dp.pedido_id = p.id
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE p.mesero_id = ? AND p.estado = 'abierto'
      ORDER BY p.fecha_creacion ASC
    `).all(meseroId);
    return { success: true, data };
  } catch (e: any) { return { success: false, data: [] }; }
}
