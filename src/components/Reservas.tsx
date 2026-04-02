'use client';
import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, Trash2, Phone, Users, MessageSquare, X, Check } from 'lucide-react';
import { getReservas, addReserva, updateReservaEstado, deleteReserva, getMesas } from '@/app/actions/reservas';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'var(--amber)', confirmada: 'var(--green)', cancelada: 'var(--red)', completada: 'var(--text-3)'
};

const EMPTY = { nombre: '', telefono: '', fecha: new Date().toISOString().slice(0,10), hora: '12:00', personas: 2, mesa_id: '', notas: '' };

export default function Reservas() {
  const [reservas, setReservas] = useState<any[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('');

  const load = useCallback(async () => {
    const [r, m] = await Promise.all([getReservas(filtroFecha || undefined), getMesas()]);
    if (r.success) setReservas(r.data);
    if (m.success) setMesas(m.data);
  }, [filtroFecha]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addReserva({ ...form, personas: parseInt(form.personas), mesa_id: form.mesa_id ? parseInt(form.mesa_id) : undefined });
    await load();
    setShowForm(false);
    setForm(EMPTY);
    setLoading(false);
  };

  const grupos: Record<string, any[]> = {};
  reservas.forEach(r => { (grupos[r.fecha] = grupos[r.fecha] || []).push(r); });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="date" className="input" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} style={{ fontSize: 13, padding: '7px 12px' }} />
        {filtroFecha && <button className="btn btn-outline" onClick={() => setFiltroFecha('')} style={{ fontSize: 12 }}>Ver todas</button>}
        <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ marginLeft: 'auto', fontSize: 13, gap: 6 }}>
          <Plus size={14} /> Nueva reserva
        </button>
      </div>

      {Object.keys(grupos).sort().map(fecha => (
        <div key={fecha}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {grupos[fecha].map((r: any) => (
              <div key={r.id} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 52, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{r.hora}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{r.personas} pax</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.nombre}</span>
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: ESTADO_COLORS[r.estado] || 'var(--text-3)', flexShrink: 0 }}></span>
                    <span style={{ fontSize: 11, color: ESTADO_COLORS[r.estado] || 'var(--text-3)', fontWeight: 500, textTransform: 'capitalize' }}>{r.estado}</span>
                    {r.mesa_numero && <span className="badge badge-accent" style={{ fontSize: 10 }}>Mesa {r.mesa_numero}</span>}
                  </div>
                  {r.telefono && <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> {r.telefono}</div>}
                  {r.notas && <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><MessageSquare size={11} /> {r.notas}</div>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {r.estado === 'pendiente' && <>
                    <button onClick={async () => { await updateReservaEstado(r.id, 'confirmada'); load(); }} style={{ padding: '5px 8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--green)' }}><CheckCircle size={13} /></button>
                    <button onClick={async () => { await updateReservaEstado(r.id, 'cancelada'); load(); }} style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--red)' }}><XCircle size={13} /></button>
                  </>}
                  {r.estado === 'confirmada' && <button onClick={async () => { await updateReservaEstado(r.id, 'completada'); load(); }} style={{ padding: '5px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: 'var(--text-2)', fontFamily: 'inherit' }}>Completar</button>}
                  <button onClick={async () => { if (confirm('¿Eliminar reserva?')) { await deleteReserva(r.id); load(); } }} style={{ padding: '5px 8px', background: 'transparent', border: '1px solid transparent', borderRadius: 8, cursor: 'pointer', color: 'var(--text-3)', transition: 'color 100ms' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(grupos).length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
          <CalendarDays size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
          <p style={{ fontSize: 13 }}>No hay reservas {filtroFecha ? 'para esta fecha' : 'registradas'}</p>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="anim-fade-in">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Nueva Reserva</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Nombre *</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm((f: any) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm((f: any) => ({ ...f, telefono: e.target.value }))} placeholder="300 000 0000" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Fecha *</label>
                  <input className="input" type="date" required value={form.fecha} onChange={e => setForm((f: any) => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Hora *</label>
                  <input className="input" type="time" required value={form.hora} onChange={e => setForm((f: any) => ({ ...f, hora: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Personas</label>
                  <input className="input" type="number" min="1" max="20" value={form.personas} onChange={e => setForm((f: any) => ({ ...f, personas: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Mesa (opcional)</label>
                <select className="input" value={form.mesa_id} onChange={e => setForm((f: any) => ({ ...f, mesa_id: e.target.value }))}>
                  <option value="">Sin asignar</option>
                  {mesas.map((m: any) => <option key={m.id} value={m.id}>Mesa {m.numero} ({m.estado})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Notas</label>
                <input className="input" value={form.notas} onChange={e => setForm((f: any) => ({ ...f, notas: e.target.value }))} placeholder="Ocasión especial, preferencias..." />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Guardando...' : <><Check size={14} /> Confirmar reserva</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
