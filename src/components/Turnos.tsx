'use client';
import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Plus, CheckCircle2, X, UserCheck, UserX } from 'lucide-react';
import { getTurnos, iniciarTurno, terminarTurno, getTurnoResumen } from '@/app/actions/turnos';

export default function Turnos() {
  const [turnos, setTurnos] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [meseros, setMeseros] = useState<any[]>([]);
  const [meseroSel, setMeseroSel] = useState('');
  const [notasTurno, setNotasTurno] = useState('');
  const [loading, setLoading] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    const [t, r] = await Promise.all([getTurnos(fechaFiltro), getTurnoResumen()]);
    if (t.success) setTurnos(t.data);
    if (r.success) { setResumen(r.data); setMeseros(r.data?.meseros || []); }
  };

  useEffect(() => { load(); }, [fechaFiltro]);

  const handleIniciar = async () => {
    if (!meseroSel) return;
    setLoading(true);
    const res = await iniciarTurno(parseInt(meseroSel), notasTurno);
    if (!res.success) alert(res.error);
    else { setMeseroSel(''); setNotasTurno(''); }
    await load();
    setLoading(false);
  };

  const handleTerminar = async (id: number) => {
    await terminarTurno(id);
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Row */}
      {resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'En turno ahora', value: resumen.activos, color: 'var(--green)', icon: UserCheck },
            { label: 'Turnos terminados hoy', value: resumen.terminados, color: 'var(--text-3)', icon: CheckCircle2 },
            { label: 'Total meseros', value: meseros.length, color: 'var(--accent)', icon: UserCheck },
          ].map((k, i) => (
            <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: k.color }}>{k.value}</p>
              </div>
              <k.icon size={20} color={k.color} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      )}

      {/* Iniciar turno */}
      <div className="card" style={{ padding: '16px 18px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-2)' }}>Registrar Ingreso de Turno</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Mesero</label>
            <select className="input" value={meseroSel} onChange={e => setMeseroSel(e.target.value)} style={{ fontSize: 13 }}>
              <option value="">Seleccionar mesero</option>
              {meseros.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Notas (opcional)</label>
            <input className="input" value={notasTurno} onChange={e => setNotasTurno(e.target.value)} placeholder="Ej: turno noche, reemplazo..." style={{ fontSize: 13 }} />
          </div>
          <button onClick={handleIniciar} disabled={!meseroSel || loading} className="btn btn-primary" style={{ fontSize: 13, gap: 6, minWidth: 'fit-content' }}>
            <Plus size={14} /> Iniciar turno
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="date" className="input" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} style={{ fontSize: 13, padding: '7px 12px' }} />
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{turnos.length} registros</span>
      </div>

      {/* Turnos list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Mesero', 'Fecha', 'Entrada', 'Salida', 'Duración', 'Notas', 'Estado', 'Acción'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Clock size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                No hay turnos registrados para esta fecha
              </td></tr>
            ) : turnos.map((t: any, i: number) => {
              const activo = t.estado === 'activo';
              let duracion = '—';
              if (t.hora_entrada && t.hora_salida) {
                const [h1, m1] = t.hora_entrada.split(':').map(Number);
                const [h2, m2] = t.hora_salida.split(':').map(Number);
                const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                duracion = mins > 0 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : '—';
              } else if (activo) {
                duracion = '⏳ activo';
              }
              return (
                <tr key={t.id} style={{ borderBottom: i < turnos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600 }}>{t.mesero_nombre}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-3)', fontSize: 12 }}>{t.fecha}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500 }}>{t.hora_entrada}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-3)' }}>{t.hora_salida || '—'}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{duracion}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-3)', fontSize: 12 }}>{t.notas || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, background: activo ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)', color: activo ? 'var(--green)' : 'var(--text-3)', border: `1px solid ${activo ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                      {activo ? 'Activo' : 'Terminado'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {activo && (
                      <button onClick={() => handleTerminar(t.id)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Terminar turno
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
