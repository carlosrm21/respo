import { notFound } from 'next/navigation';
import db from '@/lib/db';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function MenuPublicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mesaId = parseInt(id);
  const mesa = db.prepare('SELECT * FROM mesas WHERE id = ?').get(mesaId) as any;
  if (!mesa) notFound();

  const categorias = db.prepare('SELECT * FROM categorias ORDER BY nombre').all() as any[];
  const productos = db.prepare(`
    SELECT p.*, c.nombre as cat_nombre
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.disponible = 1
    ORDER BY c.nombre, p.nombre
  `).all() as any[];

  const grupos: Record<string, any[]> = {};
  productos.forEach(p => { (grupos[p.cat_nombre] = grupos[p.cat_nombre] || []).push(p); });

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e10', fontFamily: "'Inter', system-ui, sans-serif", color: '#e4e4e7' }}>
      {/* Header */}
      <div style={{ background: '#18181b', borderBottom: '1px solid #27272a', padding: '24px 20px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          🍽️ Menú Digital
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>RestoPOS</h1>
        <div style={{ display: 'inline-block', marginTop: 8, background: '#6366f115', border: '1px solid #6366f130', borderRadius: 999, padding: '4px 14px', fontSize: 12, color: '#a5b4fc', fontWeight: 500 }}>
          Mesa {mesa.numero} · {mesa.capacidad} personas
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 40px' }}>
        {Object.keys(grupos).map(cat => (
          <div key={cat} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>
              {cat}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grupos[cat].map((p: any) => (
                <div key={p.id} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: '#18181b', border: '1px solid #27272a', borderRadius: 14, alignItems: 'center' }}>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 10, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {cat.includes('Bebida') ? '🥤' : cat.includes('Postre') ? '🍰' : cat.includes('Entrada') ? '🥗' : cat.includes('Carne') ? '🥩' : '🍽️'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{p.nombre}</div>
                    {p.descripcion && <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.4 }}>{p.descripcion}</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#a5b4fc', flexShrink: 0, letterSpacing: '-0.01em' }}>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(p.precio)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {productos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#52525b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍳</div>
            <p style={{ fontSize: 15 }}>El menú está siendo preparado...</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, color: '#52525b', fontSize: 12 }}>
          Escanea el QR en tu mesa o pide a tu mesero · Precios incluyen impuestos
        </div>
      </div>
    </div>
  );
}
