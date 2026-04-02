'use client';
import { useState, useEffect, useCallback } from 'react';
import { Truck, Clock, CheckCircle2, XCircle, ChefHat, RefreshCw } from 'lucide-react';
import { formatCOP } from '@/lib/format';

const PLATAFORMAS = ['rappi', 'ifood', 'domicilios', 'otro'];

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  recibido: { label: 'Recibido', color: 'var(--amber)' },
  cocinando: { label: 'Cocinando', color: 'var(--accent)' },
  en_camino: { label: 'En camino', color: '#a78bfa' },
  entregado: { label: 'Entregado', color: 'var(--green)' },
  cancelado: { label: 'Cancelado', color: 'var(--red)' },
};

export default function DeliveryPanel() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery');
      const data = await res.json();
      if (data.success) setPedidos(data.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleEstado = async (id: number, estado: string) => {
    await fetch('/api/delivery', { method: 'PATCH', body: JSON.stringify({ id, estado }), headers: { 'Content-Type': 'application/json' } });
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Pedidos recibidos de plataformas externas. Webhook URL:</p>
          <code style={{ fontSize: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 8, display: 'inline-block', marginTop: 4, color: 'var(--accent-hover)' }}>
            POST {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/delivery
          </code>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Header: <code>x-platform: rappi</code> | Body: {'{'} order_id, cliente, direccion, items[], total {'}'}</p>
        </div>
        <button onClick={load} style={{ padding: '7px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-3)' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-3)' }}>
          <Truck size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13 }}>No hay pedidos de delivery recientes</p>
          <p style={{ fontSize: 11, marginTop: 4 }}>Los pedidos aparecerán aquí cuando lleguen al webhook</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {pedidos.map((p: any) => {
            const cfg = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.recibido;
            const items = (() => { try { return JSON.parse(p.items_json); } catch { return []; } })();
            return (
              <div key={p.id} className="card" style={{ overflow: 'hidden', borderLeft: `3px solid ${cfg.color}` }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: cfg.color + '15', color: cfg.color, border: `1px solid ${cfg.color}25`, textTransform: 'capitalize' }}>{p.plataforma}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>#{p.id}</span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.cliente_nombre}</div>
                    {p.cliente_direccion && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>📍 {p.cliente_direccion}</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-hover)' }}>{formatCOP(p.total)}</div>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  {items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 2 }}>
                      {item.cantidad || 1}x {item.nombre || item.name || 'Ítem'}
                    </div>
                  ))}
                  {items.length > 3 && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>+{items.length - 3} más</div>}
                  {p.notas && <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 6 }}>📝 {p.notas}</div>}
                </div>
                <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.estado === 'recibido' && <button onClick={() => handleEstado(p.id, 'cocinando')} style={{ ...btnStyle, background: 'rgba(99,102,241,0.1)', color: 'var(--accent-hover)', border: '1px solid rgba(99,102,241,0.2)' }}>→ Cocinar</button>}
                  {p.estado === 'cocinando' && <button onClick={() => handleEstado(p.id, 'en_camino')} style={{ ...btnStyle, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>→ En camino</button>}
                  {p.estado === 'en_camino' && <button onClick={() => handleEstado(p.id, 'entregado')} style={{ ...btnStyle, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}>✓ Entregado</button>}
                  {['recibido', 'cocinando'].includes(p.estado) && <button onClick={() => handleEstado(p.id, 'cancelado')} style={{ ...btnStyle, background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)' }}>Cancelar</button>}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: cfg.color, fontWeight: 600, alignSelf: 'center' }}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 100ms'
};
