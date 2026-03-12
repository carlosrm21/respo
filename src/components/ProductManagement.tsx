'use client';
import { useState, useEffect, useCallback } from 'react';
import { getProductos, getCategorias, addProducto, updateProducto, deleteProducto, addCategoria } from '@/app/actions/productos';
import { formatCOP } from '@/lib/format';
import { Plus, Search, Edit2, Trash2, BarChart3, Tag, X, Check, TrendingUp } from 'lucide-react';

type Producto = { id: number; nombre: string; precio: number; costo: number; disponible: number; categoria_id: number; categoria_nombre: string; descripcion?: string; };
type Categoria = { id: number; nombre: string; };
const EMPTY = { nombre: '', precio: 0, costo: 0, categoria_id: 0, descripcion: '' };

export default function ProductManagement() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState('');

  const load = useCallback(async () => {
    const [pRes, cRes] = await Promise.all([getProductos(), getCategorias()]);
    if (pRes.success) setProductos(pRes.data as Producto[]);
    if (cRes.success) setCategorias(cRes.data as Categoria[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria_nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      await updateProducto(editId, { nombre: form.nombre, precio: form.precio, costo: form.costo });
    } else {
      await addProducto({ nombre: form.nombre, categoria_id: form.categoria_id || categorias[0]?.id, precio: form.precio, costo: form.costo, descripcion: form.descripcion });
    }
    await load();
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
    setLoading(false);
  };

  const handleToggleDisp = async (p: Producto) => {
    await updateProducto(p.id, { disponible: p.disponible ? 0 : 1 });
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto del menú?')) return;
    await deleteProducto(id);
    await load();
  };

  const handleAddCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    await addCategoria(newCat.trim());
    setNewCat('');
    await load();
  };

  const totalVenteValor = productos.reduce((s, p) => s + p.precio, 0);
  const avgMargin = productos.length > 0
    ? productos.reduce((s, p) => s + (((p.precio || 0) - (p.costo || 0)) / Math.max(p.precio || 1, 1) * 100), 0) / productos.length
    : 0;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: '14px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>Productos en Menú</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{productos.length}</div>
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>Margen Promedio</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{avgMargin.toFixed(1)}%</div>
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>Categorías</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{categorias.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." style={{ paddingLeft: 32, fontSize: 13 }} />
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY, categoria_id: categorias[0]?.id || 0 }); }} className="btn btn-primary" style={{ fontSize: 13, gap: 6 }}>
          <Plus size={14} /> Nuevo producto
        </button>
      </div>

      {/* Add Category quick form */}
      <form onSubmit={handleAddCat} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input className="input" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nueva categoría..." style={{ fontSize: 12, padding: '7px 12px' }} />
        <button type="submit" className="btn btn-outline" style={{ fontSize: 12, padding: '7px 14px', gap: 4 }}>
          <Tag size={12} /> Agregar cat.
        </button>
      </form>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Producto', 'Categoría', 'Precio venta', 'Costo', 'Margen', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const margen = (p.precio || 0) > 0 ? (((p.precio || 0) - (p.costo || 0)) / (p.precio || 0) * 100) : 0;
              return (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 100ms' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '12px 14px', fontWeight: 500 }}>{p.nombre}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-accent" style={{ fontSize: 10 }}>{p.categoria_nombre}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{formatCOP(p.precio || 0)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{formatCOP(p.costo || 0)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <TrendingUp size={12} color={margen > 40 ? 'var(--green)' : margen > 20 ? 'var(--amber)' : 'var(--red)'} />
                      <span style={{ color: margen > 40 ? 'var(--green)' : margen > 20 ? 'var(--amber)' : 'var(--red)', fontWeight: 600, fontSize: 13 }}>{margen.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => handleToggleDisp(p)}>
                      <span className={`badge ${p.disponible ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10, cursor: 'pointer' }}>
                        {p.disponible ? 'Disponible' : 'Oculto'}
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setForm({ nombre: p.nombre, precio: p.precio, costo: p.costo, categoria_id: p.categoria_id, descripcion: p.descripcion || '' }); setEditId(p.id); setShowForm(true); }} style={{ padding: '5px 7px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-2)' }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 7px', background: 'transparent', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--text-3)', transition: 'color 100ms' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--text-3)' }}>
                <BarChart3 size={28} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                No hay productos
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="anim-fade-in">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22, alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Nombre del producto *</label>
                <input className="input" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Hamburguesa Especial" />
              </div>
              {!editId && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Categoría *</label>
                  <select className="input" required value={form.categoria_id} onChange={e => setForm(f => ({ ...f, categoria_id: parseInt(e.target.value) }))}>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Precio de venta *</label>
                  <input className="input" type="number" min="0" required value={form.precio} onChange={e => setForm(f => ({ ...f, precio: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 5 }}>Costo del producto</label>
                  <input className="input" type="number" min="0" value={form.costo} onChange={e => setForm(f => ({ ...f, costo: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              {form.precio > 0 && (
                <div style={{ padding: '10px 14px', background: 'var(--green-muted)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--green)' }}>
                  Margen: <strong>{((((form.precio || 0) - (form.costo || 0)) / Math.max(form.precio || 1, 1)) * 100).toFixed(1)}%</strong>
                  {' · '}Ganancia: <strong>{formatCOP((form.precio || 0) - (form.costo || 0))}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
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
