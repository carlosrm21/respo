'use server';
import {
  getAlertasMeserosData,
  getResumenPeriodoData,
  getTopProductosPeriodoData,
  getVentasDiariasData,
  getVentasMeseroPeriodoData
} from '@/lib/opsBackofficeData';

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
    return { success: true, data: await getResumenPeriodoData(period) };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 2. Ventas diarias (últimos 7 días) ────────────────────────────────────────
export async function getVentasDiarias() {
  try {
    return { success: true, data: await getVentasDiariasData() };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 3. Ventas por mesero con período ──────────────────────────────────────────
export async function getVentasMeseroPeriodo(period: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    return { success: true, data: await getVentasMeseroPeriodoData(period) };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 4. Alertas de meseros ─────────────────────────────────────────────────────
// Returns meseros activos que no han vendido hoy, y los que no han vendido esta semana
export async function getAlertasMeseros() {
  try {
    return {
      success: true,
      data: await getAlertasMeserosData()
    };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── 5. Top productos por período ──────────────────────────────────────────────
export async function getTopProductos(period: 'hoy' | 'semana' | 'mes' | 'año' = 'mes') {
  try {
    return { success: true, data: await getTopProductosPeriodoData(period) };
  } catch (e: any) { return { success: false, error: e.message }; }
}

// ── Legacy exports (kept for backwards compatibility) ─────────────────────────
export async function getVentasPorMesero() { return getVentasMeseroPeriodo('mes'); }
export async function getMargenesGanancia() { return getTopProductos('mes'); }
export async function getResumenVentas() {
  try {
    const result = await getResumenPeriodoData('año');
    const data = {
      gran_total: result.total_ventas,
      total_facturas: result.total_facturas,
      promedio_ticket: result.ticket_promedio
    };
    return { success: true, data };
  } catch { return { success: false }; }
}
