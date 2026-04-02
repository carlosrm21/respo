'use server';
import db from '@/lib/db';

export async function getHistorialFacturas(filters?: { fechaDesde?: string; fechaHasta?: string; meseroId?: number; metodo?: string }) {
  try {
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (filters?.fechaDesde) { where += ` AND DATE(f.fecha_emision) >= ?`; params.push(filters.fechaDesde); }
    if (filters?.fechaHasta) { where += ` AND DATE(f.fecha_emision) <= ?`; params.push(filters.fechaHasta); }
    if (filters?.meseroId) { where += ` AND p.mesero_id = ?`; params.push(filters.meseroId); }
    if (filters?.metodo) { where += ` AND f.metodo_pago = ?`; params.push(filters.metodo); }

    const data = (await db.execute({ sql: `
      SELECT
        f.id, f.total, f.metodo_pago, f.fecha_emision, f.numero_dian,
        COALESCE(f.descuento, 0) AS descuento,
        f.descuento_tipo,
        m.numero AS mesa_numero,
        mes.nombre AS mesero_nombre,
        GROUP_CONCAT(pr.nombre || ' x' || dp.cantidad, ' | ') AS items
      FROM facturas f
      JOIN pedidos p ON f.pedido_id = p.id
      JOIN mesas m ON p.mesa_id = m.id
      LEFT JOIN meseros mes ON p.mesero_id = mes.id
      LEFT JOIN detalles_pedido dp ON dp.pedido_id = p.id
      LEFT JOIN productos pr ON dp.producto_id = pr.id
      ${where}
      GROUP BY f.id
      ORDER BY f.fecha_emision DESC
      LIMIT 200
    `, args: params })).rows;

    return { success: true, data };
  } catch (e: any) { return { success: false, data: [], error: e.message }; }
}

export async function getResumenHistorial() {
  try {
    const hoy = (await db.execute(`
      SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS facturas
      FROM facturas WHERE DATE(fecha_emision,'localtime') = DATE('now','localtime')
    `)).rows[0] as any;
    const semana = (await db.execute(`
      SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS facturas
      FROM facturas WHERE DATE(fecha_emision) >= DATE('now','-6 days','localtime')
    `)).rows[0] as any;
    const mes = (await db.execute(`
      SELECT COALESCE(SUM(total),0) AS total, COUNT(*) AS facturas
      FROM facturas WHERE strftime('%Y-%m',fecha_emision)=strftime('%Y-%m','now','localtime')
    `)).rows[0] as any;
    return { success: true, data: { hoy, semana, mes } };
  } catch (e: any) { return { success: false }; }
}

export async function getMeserosForFilter() {
  try {
    const data = (await db.execute('SELECT id, nombre FROM meseros ORDER BY nombre')).rows;
    return { success: true, data };
  } catch { return { success: false, data: [] }; }
}
