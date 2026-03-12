/**
 * Formatea un valor numérico como pesos colombianos (COP).
 * Ejemplo: 27000 → "$27.000"
 */
export function formatCOP(value: number | null | undefined): string {
  const n = Math.round(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
