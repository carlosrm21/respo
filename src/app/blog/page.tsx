import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Blog de Gestion para Restaurantes',
  description: 'Guia y contenido practico sobre software POS, facturacion electronica DIAN e inventario para restaurantes.',
  keywords: [
    'blog restaurantes',
    'software POS restaurantes',
    'facturacion electronica DIAN restaurantes',
    'control inventario restaurante',
    'gestion restaurante Colombia'
  ],
  alternates: {
    canonical: `${siteUrl}/blog`
  },
  openGraph: {
    title: 'Blog de Gestion para Restaurantes | RestoPOS',
    description: 'Contenido practico sobre POS, DIAN, inventario y crecimiento para restaurantes en Colombia.',
    url: `${siteUrl}/blog`,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog de Gestion para Restaurantes | RestoPOS',
    description: 'Aprende a mejorar operacion, cumplimiento DIAN y rentabilidad de tu restaurante.'
  }
};

const posts = [
  {
    href: '/blog/software-pos-restaurantes',
    title: 'Software POS para restaurantes: que debe tener en 2026',
    excerpt: 'Checklist practico para elegir un sistema POS que realmente mejore ventas, tiempos y operacion.'
  },
  {
    href: '/blog/facturacion-electronica-dian-restaurantes',
    title: 'Facturacion electronica DIAN para restaurantes: guia rapida',
    excerpt: 'Pasos clave para cumplir normativa DIAN sin friccion y evitar errores de implementacion.'
  },
  {
    href: '/blog/control-inventario-restaurantes',
    title: 'Control de inventario para restaurantes sin perder margen',
    excerpt: 'Como reducir mermas y mejorar rentabilidad con procesos y tecnologia bien aplicados.'
  }
];

export default function BlogPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 20px 80px' }}>
        <p style={{ color: '#c084fc', fontWeight: 700, marginBottom: 10 }}>BLOG RESTOPOS</p>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 48px)', margin: 0, marginBottom: 12 }}>Contenido para crecer tu restaurante</h1>
        <p style={{ color: '#94a3b8', maxWidth: 680, lineHeight: 1.7 }}>
          Recursos de SEO, operaciones y tecnologia para restaurantes en Colombia: POS, DIAN, inventario y conversion.
        </p>

        <p style={{ color: '#a1a1aa', maxWidth: 760, lineHeight: 1.7, marginTop: 14 }}>
          Si buscas implementar un sistema completo, revisa tambien la
          {' '}
          <Link href="/dian-docs" style={{ color: '#a78bfa', textDecoration: 'none' }}>documentacion tecnica DIAN</Link>
          {' '}
          y la
          {' '}
          <Link href="/" style={{ color: '#a78bfa', textDecoration: 'none' }}>pagina principal de RestoPOS</Link>
          .
        </p>

        <div style={{ display: 'grid', gap: 16, marginTop: 30 }}>
          {posts.map((post) => (
            <article key={post.href} style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 20, background: 'rgba(24,24,27,0.7)' }}>
              <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>
                <Link href={post.href} style={{ color: '#f8fafc', textDecoration: 'none' }}>{post.title}</Link>
              </h2>
              <p style={{ color: '#a1a1aa', marginBottom: 12 }}>{post.excerpt}</p>
              <Link href={post.href} style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Leer articulo</Link>
            </article>
          ))}
        </div>

        <section style={{ marginTop: 36, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
          <h2 style={{ marginTop: 0, fontSize: 24 }}>Fuentes y referencias recomendadas</h2>
          <p style={{ color: '#a1a1aa', marginBottom: 10 }}>
            Para mantenerte actualizado en normativa y buenas practicas, consulta tambien fuentes oficiales.
          </p>
          <ul style={{ color: '#94a3b8', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
            <li>
              <a href="https://www.dian.gov.co" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'none' }}>
                DIAN Colombia
              </a>
            </li>
            <li>
              <a href="https://developers.google.com/search" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'none' }}>
                Google Search Central
              </a>
            </li>
          </ul>
        </section>
      </section>
    </main>
  );
}
