'use server';
import db from '@/lib/db';

// ── Period helpers ────────────────────────────────────────────────────────────
function periodFilter(period: 'hoy' | 'semana' | 'mes' | 'año') {
  switch (period) {
    case 'hoy':    return `DATE(f.fecha_emision) = DATE('now', 'localtime')`;
    case 'semana': return `DATE(f.fecha_emision) >= DATE('now', '-6 days', 'localtime')`;
    case 'mes':    return `strftime('%Y-%m', f.fecha_emision) = strftime('%Y-%m', 'now', 'localtime')`;
    case 'año':    return `strftime('%Y', f.fecha_emision) = strftime('%Y', 'now', 'localtime')`;
  }
}

// ── 1. Resumen de ventas por período ─────────────────────────────────────────
export async function getResumenPeriodo(period: 'hoy' | 'semana' | 'mes' | 'año' = 'hoy') {
  try {
    const filter = periodFilter(period);
    const data = (await db.execute(`
      SELECT
        COALESCE(SUM(f.total), 0)   AS total_ventas,
        COUNT(f.id)                 AS total_facturas,
        COALESCE(AVG(f.total), 0)  AS ticket_promedio,
        COUNT(DISTINCT p.mesa_id)  AS mesas_atendidas
      FROM facturas f
      JOIN pedidos p ON f.pedido_id = p.id
      WHERE ${filter}
    `)).rows[0];
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 2. Ventas diarias (últimos 7 días) ────────────────────────────────────────
export async function getVentasDiarias() {
  try {
    const data = (await db.execute(`
      SELECT
        DATE(f.fecha_emision, 'localtime') AS dia,
        COALESCE(SUM(f.total), 0)          AS total,
        COUNT(f.id)                        AS facturas
      FROM facturas f
      WHERE DATE(f.fecha_emision) >= DATE('now', '-6 days', 'localtime')
      GROUP BY dia
      ORDER BY dia ASC
    `)).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 3. Ventas por mesero con período ──────────────────────────────────────────
export async function getVentasMeseroPeriodo(period: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    const filter = periodFilter(period);
    const data = (await db.execute(`
      SELECT
        m.id,
        m.nombre,
        m.activo,
        COALESCE(SUM(f.total), 0) AS total_ventas,
        COUNT(DISTINCT p.id)      AS num_pedidos,
        COALESCE(AVG(f.total), 0) AS ticket_promedio,
        COUNT(DISTINCT DATE(p.fecha_creacion, 'localtime')) AS dias_trabajados
      FROM meseros m
      LEFT JOIN pedidos p ON m.id = p.mesero_id
      LEFT JOIN facturas f ON p.id = f.pedido_id AND ${filter}
      GROUP BY m.id
      ORDER BY total_ventas DESC
    `)).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 4. Alertas de meseros ─────────────────────────────────────────────────────
// Returns meseros activos que no han vendido hoy, y los que no han vendido esta semana
export async function getAlertasMeseros() {
  try {
    // Meseros activos sin ventas HOY
    const sinVentasHoy = (await db.execute(`
      SELECT m.id, m.nombre
      FROM meseros m
      WHERE m.activo = 1
        AND m.id NOT IN (
          SELECT DISTINCT p.mesero_id FROM pedidos p
          JOIN facturas f ON p.id = f.pedido_id
          WHERE DATE(f.fecha_emision, 'localtime') = DATE('now', 'localtime')
        )
    `)).rows as { id: number; nombre: string }[];

    // Meseros activos sin ventas EN TODA LA SEMANA
    const sinVentasSemana = (await db.execute(`
      SELECT m.id, m.nombre
      FROM meseros m
      WHERE m.activo = 1
        AND m.id NOT IN (
          SELECT DISTINCT p.mesero_id FROM pedidos p
          JOIN facturas f ON p.id = f.pedido_id
          WHERE DATE(f.fecha_emision) >= DATE('now', '-6 days', 'localtime')
        )
    `)).rows as { id: number; nombre: string }[];

    return {
      success: true,
      data: {
        sinVentasHoy,
        sinVentasSemana,
      }
    };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 5. Top productos por período ──────────────────────────────────────────────
export async function getTopProductos(period: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    const filterPeriod = period === 'hoy'
      ? `DATE(f.fecha_emision, 'localtime') = DATE('now', 'localtime')`
      : period === 'semana'
      ? `DATE(f.fecha_emision) >= DATE('now', '-6 days', 'localtime')`
      : period === 'mes'
      ? `strftime('%Y-%m', f.fecha_emision) = strftime('%Y-%m', 'now', 'localtime')`
      : `strftime('%Y', f.fecha_emision) = strftime('%Y', 'now', 'localtime')`;

    const data = (await db.execute(`
      SELECT
        prod.nombre,
        SUM(dp.cantidad)                              AS cantidad_vendida,
        SUM(dp.cantidad * dp.precio_unitario)         AS ingresos,
        SUM(dp.cantidad * (dp.precio_unitario - prod.costo)) AS margen
      FROM detalles_pedido dp
      JOIN productos prod ON dp.producto_id = prod.id
      JOIN pedidos ped ON dp.pedido_id = ped.id
      JOIN facturas f ON ped.id = f.pedido_id
      WHERE ${filterPeriod}
      GROUP BY prod.id
      ORDER BY ingresos DESC
      LIMIT 8
    `)).rows;
    return { success: true, data };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── Legacy exports (kept for backwards compatibility) ─────────────────────────
export async function getVentasPorMesero() { return getVentasMeseroPeriodo('mes'); }
export async function getMargenesGanancia() { return getTopProductos('mes'); }
export async function getResumenVentas() {
  try {
    const data = (await db.execute(`SELECT SUM(total) as gran_total, COUNT(*) as total_facturas, AVG(total) as promedio_ticket FROM facturas`)).rows[0];
    return { success: true, data };
  } catch { return { success: false }; }
}
