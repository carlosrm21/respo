'use client';
import { useState, useEffect, useCallback } from 'react';
import { getInventario, addInventarioItem, updateInventarioItem, deleteInventarioItem, ajustarCantidad } from '@/app/actions/inventario';
import { formatCOP } from '@/lib/format';
import { Plus, Search, Minus, AlertTriangle, Trash2, Edit2, X, Check, Package } from 'lucide-react';

const CATEGORIAS = ['Carnes', 'Panadería', 'Salsas', 'Lácteos', 'Bebidas', 'Vegetales', 'Empaques', 'Especias', 'Otros'];
const UNIDADES = ['kg', 'gramo', 'litro', 'ml', 'unidad', 'paquete', 'caja', 'bolsa'];

type Item = { id: number; nombre: string; categoria: string; unidad: string; cantidad: number; cantidad_minima: number; costo_unitario: number; proveedor: string; fecha_actualizacion: string; };
type Form = Omit<Item, 'id' | 'fecha_actualizacion'>;

const EMPTY: Form = { nombre: '', categoria: 'Carnes', unidad: 'kg', cantidad: 0, cantidad_minima: 0, costo_unitario: 0, proveedor: '' };

export default function Inventario() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState<number | null>(null);

  const load = useCallback(async () => {
    const r = await getInventario();
    if (r.success) setItems(r.data as Item[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => {
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase()) || i.proveedor?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? i.categoria === catFilter : true;
    return matchSearch && matchCat;
  });

  const cats = [...new Set(items.map(i => i.categoria))].sort();
  const lowStock = items.filter(i => i.cantidad <= i.cantidad_minima && i.cantidad_minima > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      await updateInventarioItem(editId, form);
    } else {
      await addInventarioItem(form);
    }
    await load();
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    setLoading(false);
  };

  const handleEdit = (item: Item) => {
    setForm({ nombre: item.nombre, categoria: item.categoria, unidad: item.unidad, cantidad: item.cantidad, cantidad_minima: item.cantidad_minima, costo_unitario: item.costo_unitario, proveedor: item.proveedor || '' });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este ítem del inventario?')) return;
    await deleteInventarioItem(id);
    await load();
  };

  const handleAdjust = async (id: number, delta: number) => {
    setAdjusting(id);
    await ajustarCantidad(id, delta);
    await load();
    setAdjusting(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Inventario de Comidas Rápidas</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{items.length} ítems · {filtered.length} mostrados</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} className="btn btn-primary" style={{ gap: 6, fontSize: 13 }}>
          <Plus size={14} /> Añadir ítem
        </button>
      </div>

      {/* Alert low stock */}
      {lowStock > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--r-md)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <AlertTriangle size={15} color="var(--amber)" />
          <span style={{ color: 'var(--amber)', fontWeight: 500 }}>{lowStock} ítem{lowStock > 1 ? 's' : ''} con stock bajo</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" placeholder="Buscar por nombre o proveedor..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, fontSize: 13 }} />
        </div>
        <select className="input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 'auto', minWidth: 160, fontSize: 13 }}>
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Ítem', 'Categoría', 'Stock', 'Ajustar', 'Costo/und', 'Proveedor', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const isLow = item.cantidad <= item.cantidad_minima && item.cantidad_minima > 0;
              return (
                <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 100ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isLow && <AlertTriangle size={12} color="var(--amber)" />}
                      {item.nombre}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-accent" style={{ fontSize: 10 }}>{item.categoria}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 600, color: isLow ? 'var(--amber)' : 'var(--text)', fontSize: 14 }}>{item.cantidad}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 11, marginLeft: 4 }}>{item.unidad}</span>
                    {item.cantidad_minima > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>Mín: {item.cantidad_minima}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => handleAdjust(item.id, -1)} disabled={adjusting === item.id} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'all 100ms' }}>
                        <Minus size={12} />
                      </button>
                      <button onClick={() => handleAdjust(item.id, 1)} disabled={adjusting === item.id} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'all 100ms' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{formatCOP(item.costo_unitario)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{item.proveedor || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleEdit(item)} style={{ padding: '5px 7px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-2)', transition: 'all 100ms' }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '5px 7px', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--text-3)', transition: 'all 100ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Package size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                No se encontraron ítems
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="anim-fade-in">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22, alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>{editId ? 'Editar ítem' : 'Nuevo ítem de inventario'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nombre del ítem *</label>
                <input className="input" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Carne de Res 250g" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Categoría *</label>
                  <select className="input" required value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Unidad *</label>
                  <select className="input" required value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                    {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Stock actual</label>
                  <input className="input" type="number" min="0" step="0.1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Stock mínimo</label>
                  <input className="input" type="number" min="0" step="0.1" value={form.cantidad_minima} onChange={e => setForm(f => ({ ...f, cantidad_minima: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Costo unitario</label>
                  <input className="input" type="number" min="0" step="10" value={form.costo_unitario} onChange={e => setForm(f => ({ ...f, costo_unitario: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Proveedor</label>
                <input className="input" value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} placeholder="Nombre del proveedor" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Guardando...' : <><Check size={14} /> {editId ? 'Actualizar' : 'Guardar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
