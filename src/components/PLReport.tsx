'use client';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, Award } from 'lucide-react';
import { getPLReport, getComparativaSemanal } from '@/app/actions/reportes';
import { formatCOP } from '@/lib/format';

const PERIODOS = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'año', label: 'Año' },
] as const;

type Periodo = 'hoy' | 'semana' | 'mes' | 'año';

export default function PLReport() {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [data, setData] = useState<any>(null);
  const [comparativa, setComparativa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, c] = await Promise.all([getPLReport(periodo), getComparativaSemanal()]);
    if (r.success) setData(r.data);
    if (c.success) setComparativa(c.data);
    setLoading(false);
  }, [periodo]);

  useEffect(() => { load(); }, [load]);

  const cambioColor = data?.cambio !== null && data?.cambio !== undefined
    ? data.cambio >= 0 ? 'var(--green)' : 'var(--red)'
    : 'var(--text-3)';

  // Split comparativa into this week vs last week
  const today = new Date();
  const thisWeek = comparativa.filter(d => {
    const dd = new Date(d.dia + 'T00:00:00');
    return (today.getTime() - dd.getTime()) <= 7 * 24 * 60 * 60 * 1000;
  });
  const lastWeek = comparativa.filter(d => {
    const dd = new Date(d.dia + 'T00:00:00');
    const diff = today.getTime() - dd.getTime();
    return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 14 * 24 * 60 * 60 * 1000;
  });
  const maxComp = Math.max(...comparativa.map(d => d.total), 1);

  const shortDay = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--surface-2)', borderRadius: 12, width: 'fit-content', border: '1px solid var(--border)' }}>
        {PERIODOS.map(p => (
          <button key={p.id} onClick={() => setPeriodo(p.id)}
            style={{ padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 120ms', background: periodo === p.id ? 'var(--accent)' : 'transparent', color: periodo === p.id ? 'white' : 'var(--text-3)' }}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Calculando...</div>
      ) : data ? (
        <>
          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Ingresos', value: formatCOP(data.ingresos), icon: DollarSign, color: 'var(--accent)', sub: `${data.facturas} facturas` },
              { label: 'Costos', value: formatCOP(data.costos), icon: ShoppingBag, color: 'var(--red)', sub: 'costo de productos' },
              { label: 'Margen Bruto', value: formatCOP(data.margenBruto), icon: TrendingUp, color: 'var(--green)', sub: `${data.margenPct.toFixed(1)}% del ingreso` },
              { label: 'Tiempo servicio', value: data.avgServicioMinutos ? `${Math.round(data.avgServicioMinutos)}m` : 'N/D', icon: Clock, color: 'var(--amber)', sub: 'promedio por pedido' },
            ].map((k, i) => (
              <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>{k.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{k.sub}</p>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: k.color + '15', border: `1px solid ${k.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <k.icon size={16} color={k.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Comparison vs previous */}
          {data.cambio !== null && (
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {data.cambio >= 0 ? <TrendingUp size={18} color="var(--green)" /> : <TrendingDown size={18} color="var(--red)" />}
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                Vs. período anterior: <span style={{ color: cambioColor, fontWeight: 700 }}>
                  {data.cambio >= 0 ? '+' : ''}{data.cambio.toFixed(1)}%
                </span> ({formatCOP(data.ingresosAnterior)} anteriores → {formatCOP(data.ingresos)} actuales)
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Comparativa semanal chart */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, color: 'var(--text-2)' }}>Esta semana vs. semana anterior</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => {
                  const tw = thisWeek[i];
                  const lw = lastWeek[i];
                  const twPct = tw ? (tw.total / maxComp) * 100 : 4;
                  const lwPct = lw ? (lw.total / maxComp) * 100 : 4;
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: '80%' }}>
                        <div style={{ flex: 1, background: 'var(--accent)', borderRadius: '2px 2px 0 0', height: `${twPct}%`, transition: 'height 400ms', opacity: 0.9 }}></div>
                        <div style={{ flex: 1, background: 'var(--border)', borderRadius: '2px 2px 0 0', height: `${lwPct}%`, transition: 'height 400ms', opacity: 0.6 }}></div>
                      </div>
                      <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{day}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                  <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: 2 }}></div> Esta semana
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                  <div style={{ width: 8, height: 8, background: 'var(--border)', borderRadius: 2 }}></div> Semana anterior
                </div>
              </div>
            </div>

            {/* Top productos más rentables */}
            <div className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <Award size={14} color="var(--text-3)" />
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Productos más rentables</p>
              </div>
              {data.topProductos.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>Sin datos</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.topProductos.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', width: 14 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{p.nombre}</span>
                          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{formatCOP(p.utilidad)}</span>
                        </div>
                        <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2 }}>
                          <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: `${(p.utilidad / (data.topProductos[0]?.utilidad || 1)) * 100}%`, transition: 'width 400ms' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>No hay datos financieros aún</div>
      )}
    </div>
  );
}
