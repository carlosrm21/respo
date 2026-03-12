'use server';
import db from '@/lib/db';

export async function getPLReport(periodo: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    const dateFilter: Record<string, string> = {
      hoy: `DATE(f.fecha_emision,'localtime') = DATE('now','localtime')`,
      semana: `DATE(f.fecha_emision) >= DATE('now','-6 days','localtime')`,
      mes: `strftime('%Y-%m',f.fecha_emision) = strftime('%Y-%m','now','localtime')`,
      año: `strftime('%Y',f.fecha_emision) = strftime('%Y','now','localtime')`,
    };

    const ingresos = db.prepare(`
      SELECT COALESCE(SUM(f.total),0) AS total, COUNT(*) AS facturas
      FROM facturas f WHERE ${dateFilter[periodo]}
    `).get() as any;

    // Cost = sum of (cantidad * costo producto) from detalles
    const costos = db.prepare(`
      SELECT COALESCE(SUM(dp.cantidad * p.costo), 0) AS total
      FROM detalles_pedido dp
      JOIN pedidos ped ON dp.pedido_id = ped.id
      JOIN productos p ON dp.producto_id = p.id
      JOIN facturas f ON f.pedido_id = ped.id
      WHERE ${dateFilter[periodo]}
    `).get() as any;

    // Top 5 most profitable products
    const topProductos = db.prepare(`
      SELECT p.nombre,
        SUM(dp.cantidad) as qty,
        SUM(dp.cantidad * dp.precio_unitario) as ingresos,
        SUM(dp.cantidad * p.costo) as costos,
        SUM(dp.cantidad * (dp.precio_unitario - p.costo)) as utilidad
      FROM detalles_pedido dp
      JOIN pedidos ped ON dp.pedido_id = ped.id
      JOIN productos p ON dp.producto_id = p.id
      JOIN facturas f ON f.pedido_id = ped.id
      WHERE ${dateFilter[periodo]}
      GROUP BY p.id
      ORDER BY utilidad DESC
      LIMIT 5
    `).all();

    // Average service time
    const avgServicio = db.prepare(`
      SELECT AVG(minutos_servicio) as promedio
      FROM pedidos
      WHERE minutos_servicio IS NOT NULL AND ${dateFilter[periodo].replace('f.fecha_emision', 'fecha_creacion')}
    `).get() as any;

    // Comparison vs previous period
    const prevFilter: Record<string, string> = {
      hoy: `DATE(f.fecha_emision,'localtime') = DATE('now','-1 day','localtime')`,
      semana: `DATE(f.fecha_emision) BETWEEN DATE('now','-13 days') AND DATE('now','-7 days')`,
      mes: `strftime('%Y-%m',f.fecha_emision) = strftime('%Y-%m',date('now','-1 month'),'localtime')`,
      año: `strftime('%Y',f.fecha_emision) = CAST(strftime('%Y','now','localtime') AS INTEGER) - 1`,
    };

    const ingresosAnt = db.prepare(`
      SELECT COALESCE(SUM(f.total),0) AS total
      FROM facturas f WHERE ${prevFilter[periodo]}
    `).get() as any;

    const margenBruto = ingresos.total - costos.total;
    const margenPct = ingresos.total > 0 ? (margenBruto / ingresos.total) * 100 : 0;
    const cambio = ingresosAnt.total > 0 ? ((ingresos.total - ingresosAnt.total) / ingresosAnt.total) * 100 : null;

    return {
      success: true,
      data: {
        ingresos: ingresos.total,
        facturas: ingresos.facturas,
        costos: costos.total,
        margenBruto,
        margenPct,
        cambio,
        ingresosAnterior: ingresosAnt.total,
        topProductos,
        avgServicioMinutos: avgServicio?.promedio || null,
      }
    };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getComparativaSemanal() {
  try {
    const rows = db.prepare(`
      SELECT
        DATE(f.fecha_emision,'localtime') as dia,
        COALESCE(SUM(f.total),0) as total,
        COUNT(*) as facturas
      FROM facturas f
      WHERE DATE(f.fecha_emision) >= DATE('now','-13 days')
      GROUP BY dia
      ORDER BY dia ASC
    `).all();
    return { success: true, data: rows };
  } catch (e: any) { return { success: false, data: [] }; }
}
