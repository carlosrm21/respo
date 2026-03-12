'use client';
import { useState, useEffect, useCallback } from 'react';
import { Shield, User, Clock, Filter } from 'lucide-react';
import { getAuditLog } from '@/app/actions/auditlog';

const ACTION_COLORS: Record<string, string> = {
  'crear': 'var(--green)', 'eliminar': 'var(--red)', 'editar': 'var(--amber)',
  'login': 'var(--accent)', 'factura': '#a78bfa', 'stock': 'cyan',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  const load = useCallback(async () => {
    const res = await getAuditLog(200);
    if (res.success) setLogs(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l =>
    !filtro || l.accion.toLowerCase().includes(filtro.toLowerCase()) ||
    l.usuario.toLowerCase().includes(filtro.toLowerCase()) ||
    (l.entidad || '').toLowerCase().includes(filtro.toLowerCase())
  );

  const getColor = (accion: string) => {
    for (const [key, color] of Object.entries(ACTION_COLORS)) {
      if (accion.toLowerCase().includes(key)) return color;
    }
    return 'var(--text-3)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Filter size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar por usuario, acción..." style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        <button onClick={load} className="btn btn-outline" style={{ fontSize: 12 }}>Actualizar</button>
        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>{filtered.length} eventos</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Fecha & Hora', 'Usuario', 'Acción', 'Entidad', 'Detalle'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-3)' }}>Cargando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Shield size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                Sin eventos de auditoría registrados aún
              </td></tr>
            ) : filtered.map((l: any, i: number) => (
              <tr key={l.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 100ms' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-3)' }}>
                  <div>{new Date(l.fecha).toLocaleDateString('es-CO')}</div>
                  <div style={{ fontSize: 11 }}>{new Date(l.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent-hover)', flexShrink: 0 }}>
                      {l.usuario.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{l.usuario}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: getColor(l.accion) + '15', color: getColor(l.accion) }}>
                    {l.accion}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--text-2)', fontSize: 12 }}>{l.entidad || '—'}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-3)', fontSize: 12, maxWidth: 250 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.detalle || '—'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
