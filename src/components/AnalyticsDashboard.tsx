'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Users, TrendingUp, DollarSign, ShoppingBag,
  AlertTriangle, RefreshCw, Award, UserX, Target
} from 'lucide-react';
import {
  getResumenPeriodo, getVentasDiarias, getVentasMeseroPeriodo,
  getAlertasMeseros, getTopProductos
} from '@/app/actions/analytics';
import { formatCOP } from '@/lib/format';

type Period = 'hoy' | 'semana' | 'mes' | 'año';
const PERIODS: { id: Period; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'año', label: 'Año' },
];

const DAY_LABELS: Record<string, string> = {
  '0': 'Dom', '1': 'Lun', '2': 'Mar', '3': 'Mié',
  '4': 'Jue', '5': 'Vie', '6': 'Sáb'
};

function shortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function AnalyticsDashboard({ onClose, isFullEmbed = false }: { onClose?: () => void; isFullEmbed?: boolean }) {
  const [period, setPeriod] = useState<Period>('mes');
  const [resumen, setResumen] = useState<any>(null);
  const [ventas7d, setVentas7d] = useState<any[]>([]);
  const [meseros, setMeseros] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any>({ sinVentasHoy: [], sinVentasSemana: [] });
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (p: Period) => {
    setRefreshing(true);
    const [r, v7, m, a, prod] = await Promise.all([
      getResumenPeriodo(p),
      getVentasDiarias(),
      getVentasMeseroPeriodo(p),
      getAlertasMeseros(),
      getTopProductos(p),
    ]);
    if (r.success) setResumen(r.data);
    if (v7.success) setVentas7d(v7.data || []);
    if (m.success) setMeseros(m.data || []);
    if (a.success) setAlertas(a.data);
    if (prod.success) setProductos(prod.data || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(period); }, [period, fetchAll]);

  const hasAlerts = alertas.sinVentasHoy.length > 0 || alertas.sinVentasSemana.length > 0;
  const maxDiario = Math.max(...ventas7d.map((d: any) => d.total || 0), 1);
  const maxMesero = Math.max(...meseros.map((m: any) => m.total_ventas || 0), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="anim-fade-up">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em' }}>Analíticas de Ventas</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Panel de rendimiento operacional</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Period tabs */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 3, gap: 2 }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit', transition: 'all 120ms ease', background: period === p.id ? 'var(--accent)' : 'transparent', color: period === p.id ? 'white' : 'var(--text-2)' }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={() => fetchAll(period)} style={{ padding: '7px 8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 100ms' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Alerts banner */}
      {hasAlerts && (
        <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-lg)', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <AlertTriangle size={15} color="var(--amber)" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--amber)' }}>Alertas del personal</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
            {alertas.sinVentasHoy.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--amber)', fontWeight: 500 }}>Sin ventas hoy: </span>
                {alertas.sinVentasHoy.map((m: any) => m.nombre).join(', ')}
              </div>
            )}
            {alertas.sinVentasSemana.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--red)', fontWeight: 500 }}>Sin ventas esta semana: </span>
                {alertas.sinVentasSemana.map((m: any) => m.nombre).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Ventas totales', value: formatCOP(resumen?.total_ventas), icon: DollarSign, color: 'var(--accent)' },
          { label: 'Facturas emitidas', value: String(resumen?.total_facturas || 0), icon: ShoppingBag, color: 'var(--green)' },
          { label: 'Ticket promedio', value: formatCOP(resumen?.ticket_promedio), icon: TrendingUp, color: 'var(--amber)' },
          { label: 'Mesas atendidas', value: String(resumen?.mesas_atendidas || 0), icon: Target, color: '#a78bfa' },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{loading ? '—' : kpi.value}</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', background: kpi.color + '18', border: `1px solid ${kpi.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={16} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Bar chart — últimos 7 días */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <BarChart3 size={15} color="var(--text-3)" />
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>Ventas últimos 7 días</span>
          </div>
          {ventas7d.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0', fontSize: 13 }}>Sin datos en este período</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {ventas7d.map((d: any, i: number) => {
                const pct = (d.total / maxDiario) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{formatCOP(d.total)}</span>
                    <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', height: `${Math.max(pct, 4)}%`, transition: 'height 300ms ease', opacity: 0.85 }}></div>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{shortDate(d.dia)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top productos */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Award size={15} color="var(--text-3)" />
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>Productos más vendidos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {productos.slice(0, 5).map((p: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', width: 16, textAlign: 'right' }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.nombre}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-hover)' }}>{formatCOP(p.ingresos)}</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${(p.ingresos / (productos[0]?.ingresos || 1)) * 100}%`, transition: 'width 400ms' }}></div>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-3)', width: 32, textAlign: 'right' }}>{p.cantidad_vendida}u</span>
              </div>
            ))}
            {productos.length === 0 && <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin ventas en este período</p>}
          </div>
        </div>
      </div>

      {/* Waiter ranking */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={15} color="var(--text-3)" />
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>Rendimiento por mesero</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 999, border: '1px solid var(--border)', marginLeft: 4 }}>
            Período: {PERIODS.find(p => p.id === period)?.label}
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Mesero', 'Pedidos', 'Ticket prom.', 'Días trabajados', 'Total ventas', 'Participación', 'Estado'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meseros.map((m: any, i: number) => {
              const pct = maxMesero > 0 ? (m.total_ventas / maxMesero) * 100 : 0;
              const alertaHoy = alertas.sinVentasHoy.some((a: any) => a.id === m.id);
              const alertaSemana = alertas.sinVentasSemana.some((a: any) => a.id === m.id);
              const sinVentas = m.total_ventas === 0 || m.total_ventas === null;
              return (
                <tr key={m.id} style={{ borderBottom: i < meseros.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 100ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: sinVentas ? 'var(--red-muted)' : i === 0 ? 'var(--accent-muted)' : 'var(--surface-2)', border: `1px solid ${sinVentas ? 'rgba(239,68,68,0.2)' : i === 0 ? 'var(--accent-border)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: sinVentas ? 'var(--red)' : i === 0 ? 'var(--accent-hover)' : 'var(--text-2)' }}>
                        {sinVentas ? <UserX size={13} /> : i === 0 ? '👑' : m.nombre.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px', color: 'var(--text-2)' }}>{m.num_pedidos}</td>
                  <td style={{ padding: '13px 14px', color: 'var(--text-2)' }}>{formatCOP(m.ticket_promedio)}</td>
                  <td style={{ padding: '13px 14px', color: 'var(--text-2)' }}>{m.dias_trabajados}</td>
                  <td style={{ padding: '13px 14px', fontWeight: 700 }}>{formatCOP(m.total_ventas)}</td>
                  <td style={{ padding: '13px 14px', width: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: 'var(--surface-2)', borderRadius: 3 }}>
                        <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 3, width: `${pct}%`, transition: 'width 400ms' }}></div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', width: 34, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    {!m.activo ? (
                      <span className="badge badge-red" style={{ fontSize: 10 }}>Inactivo</span>
                    ) : alertaSemana ? (
                      <span className="badge badge-red" style={{ fontSize: 10 }}>⚠️ Sin ventas semana</span>
                    ) : alertaHoy ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.1)', color: 'var(--amber)' }}>
                        ⚠️ Sin ventas hoy
                      </span>
                    ) : sinVentas ? (
                      <span className="badge" style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--text-3)' }}>Sin ventas</span>
                    ) : (
                      <span className="badge badge-green" style={{ fontSize: 10 }}>Activo</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {meseros.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin datos de meseros disponibles</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
