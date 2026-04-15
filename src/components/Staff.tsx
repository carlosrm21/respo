'use client';
import { useState, useEffect, useCallback } from 'react';
import { getMeseros, addMesero, updateMesero, deleteMesero } from '@/app/actions/staff';
import { Plus, Trash2, Edit2, X, Check, Users, UserCheck, UserX } from 'lucide-react';

type Mesero = { id: number; nombre: string; pin: string; activo: number; };
const EMPTY = { nombre: '', pin: '' };

export default function Staff() {
  const [meseros, setMeseros] = useState<Mesero[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const r = await getMeseros();
    if (r.success) setMeseros(r.data as Mesero[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      await updateMesero(editId, form.nombre, 1, form.pin);
    } else {
      await addMesero(form.nombre, form.pin);
    }
    await load();
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    setLoading(false);
  };

  const handleToggleActive = async (m: Mesero) => {
    await updateMesero(m.id, m.nombre, m.activo ? 0 : 1);
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este mesero?')) return;
    await deleteMesero(id);
    await load();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Gestión de Personal</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            {meseros.filter(m => m.activo).length} activos · {meseros.length} total
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} className="btn btn-primary" style={{ gap: 6, fontSize: 13 }}>
          <Plus size={14} /> Añadir mesero
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {meseros.map(m => (
          <div key={m.id} style={{ background: 'var(--surface)', border: `1px solid ${m.activo ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 'var(--r-lg)', padding: '16px 18px', transition: 'all 150ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: m.activo ? 'var(--accent-muted)' : 'var(--red-muted)', border: `1px solid ${m.activo ? 'var(--accent-border)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: m.activo ? 'var(--accent-hover)' : 'var(--red)' }}>
                  {m.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.nombre}</div>
                  <span className={`badge ${m.activo ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10, marginTop: 2 }}>
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handleToggleActive(m)} style={{ flex: 1, padding: '6px', fontSize: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 100ms', fontFamily: 'inherit' }}>
                {m.activo ? <><UserX size={12} /> Desactivar</> : <><UserCheck size={12} /> Activar</>}
              </button>
              <button onClick={() => { setForm({ nombre: m.nombre, pin: m.pin || '' }); setEditId(m.id); setShowForm(true); }} style={{ padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 100ms' }}>
                <Edit2 size={13} />
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ padding: '6px 10px', background: 'transparent', border: '1px solid transparent', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--text-3)', transition: 'all 100ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {meseros.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
            <Users size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
            Sin personal registrado
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="anim-fade-in">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22, alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>{editId ? 'Editar mesero' : 'Nuevo mesero'}</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nombre completo *</label>
                <input className="input" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Carlos Rodríguez" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>
                  {editId ? 'Nuevo PIN (opcional)' : 'PIN de acceso (4 dígitos)'}
                </label>
                <input
                  className="input"
                  type="password"
                  maxLength={4}
                  value={form.pin}
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="••••"
                  style={{ letterSpacing: '0.5em', fontSize: 20 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Guardando...' : <><Check size={14} /> {editId ? 'Actualizar' : 'Crear'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
