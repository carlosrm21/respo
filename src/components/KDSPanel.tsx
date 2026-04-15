'use client';
import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, RefreshCw, Flame } from 'lucide-react';
import { getKDSPedidos, updateItemEstado } from '@/app/actions/kds';

const ESTADO_CONFIG: Record<string, { label: string; color: string; next: 'cocinando' | 'servido' | null }> = {
  pendiente: { label: 'Pendiente', color: 'var(--amber)', next: 'cocinando' },
  cocinando: { label: 'Cocinando', color: 'var(--accent)', next: 'servido' },
  servido:   { label: 'Servido',   color: 'var(--green)',  next: null },
};

export default function KDSPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await getKDSPedidos();
    if (res.success) setPedidos(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, [load]);

  const handleEstado = async (detalleId: number, nuevoEstado: 'cocinando' | 'servido') => {
    await updateItemEstado(detalleId, nuevoEstado);
    load();
  };

  const getUrgencia = (minutos: number) => {
    if (minutos >= 20) return 'var(--red)';
    if (minutos >= 10) return 'var(--amber)';
    return 'var(--green)';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24, fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Cocina — Panel de Pedidos</h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Actualización automática cada 10 segundos</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button onClick={load} style={{ padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-2)' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }}></div> {v.label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', marginLeft: 16 }}>
          <Flame size={12} color="var(--red)" /> &gt;20min = urgente
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>Cargando pedidos...</div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)' }}>
          <CheckCircle2 size={48} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>¡Todo al día! No hay pedidos pendientes.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {pedidos.map((p: any) => (
            <div key={p.id} className="card" style={{ overflow: 'hidden', borderLeft: `3px solid ${getUrgencia(p.minutos)}` }}>
              {/* Card Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Mesa {p.mesa_numero}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.mesero_nombre || 'Mesero'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: getUrgencia(p.minutos), fontSize: 13, fontWeight: 700 }}>
                    <Clock size={13} /> {p.minutos}m
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Pedido #{p.id}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.items.map((item: any) => {
                  const cfg = ESTADO_CONFIG[item.estado] || ESTADO_CONFIG.pendiente;
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--surface-2)', border: `1px solid ${cfg.color}20` }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }}></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.cantidad}x {item.nombre}</div>
                        {item.notas && <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 1 }}>📝 {item.notas}</div>}
                      </div>
                      {cfg.next && (
                        <button onClick={() => handleEstado(item.id, cfg.next!)}
                          style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, border: `1px solid ${cfg.color}40`, background: cfg.color + '15', color: cfg.color, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 100ms' }}>
                          → {ESTADO_CONFIG[cfg.next]?.label}
                        </button>
                      )}
                      {!cfg.next && (
                        <CheckCircle2 size={16} color="var(--green)" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
