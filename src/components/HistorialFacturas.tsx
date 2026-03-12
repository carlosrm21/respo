'use client';
import { useState, useEffect, useCallback } from 'react';
import { Receipt, Calendar, User, CreditCard, Download, Search, Filter, TrendingUp, ChevronDown } from 'lucide-react';
import { getHistorialFacturas, getResumenHistorial, getMeserosForFilter } from '@/app/actions/historial';
import { formatCOP } from '@/lib/format';

export default function HistorialFacturas() {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [meseros, setMeseros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [meseroId, setMeseroId] = useState('');
  const [metodo, setMetodo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [f, r, m] = await Promise.all([
      getHistorialFacturas({ fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined, meseroId: meseroId ? parseInt(meseroId) : undefined, metodo: metodo || undefined }),
      getResumenHistorial(),
      getMeserosForFilter(),
    ]);
    if (f.success) setFacturas(f.data);
    if (r.success) setResumen(r.data);
    if (m.success) setMeseros(m.data);
    setLoading(false);
  }, [fechaDesde, fechaHasta, meseroId, metodo]);

  useEffect(() => { load(); }, [load]);

  const exportCSV = () => {
    const header = ['ID', 'Fecha', 'Mesa', 'Mesero', 'Método', 'Descuento', 'Total', 'Items'];
    const rows = facturas.map(f => [
      f.id, new Date(f.fecha_emision).toLocaleString('es-CO'),
      f.mesa_numero, f.mesero_nombre || '—', f.metodo_pago || '—',
      f.descuento || 0, f.total, `"${f.items || ''}"`,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `facturas_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Row */}
      {resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Hoy', total: resumen.hoy?.total, facturas: resumen.hoy?.facturas },
            { label: 'Esta semana', total: resumen.semana?.total, facturas: resumen.semana?.facturas },
            { label: 'Este mes', total: resumen.mes?.total, facturas: resumen.mes?.facturas },
          ].map((k, i) => (
            <div key={i} className="card" style={{ padding: '14px 18px' }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{formatCOP(k.total)}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{k.facturas} factura{k.facturas !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Desde</label>
          <input type="date" className="input" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} style={{ fontSize: 13, padding: '6px 10px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Hasta</label>
          <input type="date" className="input" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} style={{ fontSize: 13, padding: '6px 10px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Mesero</label>
          <select className="input" value={meseroId} onChange={e => setMeseroId(e.target.value)} style={{ fontSize: 13, padding: '6px 10px' }}>
            <option value="">Todos</option>
            {meseros.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Método de pago</label>
          <select className="input" value={metodo} onChange={e => setMetodo(e.target.value)} style={{ fontSize: 13, padding: '6px 10px' }}>
            <option value="">Todos</option>
            <option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option><option>Otro</option>
          </select>
        </div>
        <button onClick={exportCSV} className="btn btn-outline" style={{ fontSize: 12, gap: 5, marginLeft: 'auto' }}>
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['#', 'Fecha & Hora', 'Mesa', 'Mesero', 'Ítems', 'Descuento', 'Total', 'Método'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--text-3)' }}>Cargando...</td></tr>
            ) : facturas.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Receipt size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                No hay facturas con esos filtros
              </td></tr>
            ) : facturas.map((f: any, i: number) => (
              <tr key={f.id} style={{ borderBottom: i < facturas.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 100ms' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '11px 14px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-3)', fontSize: 11 }}>#{f.id}</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{new Date(f.fecha_emision).toLocaleDateString('es-CO')}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(f.fecha_emision).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span className="badge badge-accent" style={{ fontSize: 10 }}>Mesa {f.mesa_numero}</span>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--text-2)', fontWeight: 500 }}>{f.mesero_nombre || '—'}</td>
                <td style={{ padding: '11px 14px', fontSize: 11, color: 'var(--text-3)', maxWidth: 200 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.items || '—'}</div>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  {f.descuento > 0 ? (
                    <span style={{ color: 'var(--amber)', fontSize: 12 }}>
                      {f.descuento_tipo === 'porcentaje' ? `-${f.descuento}%` : `-${formatCOP(f.descuento)}`}
                    </span>
                  ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                </td>
                <td style={{ padding: '11px 14px', fontWeight: 700 }}>{formatCOP(f.total)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span className="badge" style={{ fontSize: 10, background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                    {f.metodo_pago || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{facturas.length} registro(s)</p>
    </div>
  );
}
