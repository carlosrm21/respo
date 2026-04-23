import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Control de Inventario para Restaurantes',
  description: 'Mejora el margen de tu restaurante con control de inventario: mermas, rotacion, compras y estandarizacion de recetas.',
  keywords: [
    'control inventario restaurante',
    'mermas restaurante',
    'rentabilidad restaurante',
    'software inventario para restaurantes'
  ],
  alternates: {
    canonical: `${siteUrl}/blog/control-inventario-restaurantes`
  },
  openGraph: {
    title: 'Control de inventario para restaurantes sin perder margen | 7 Días Gratis',
    description: 'Practicas para reducir mermas, mejorar compras y proteger rentabilidad con tecnologia. Empieza tu trial de 7 días.',
    url: `${siteUrl}/blog/control-inventario-restaurantes`,
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Control de inventario para restaurantes | 7 Días de Prueba',
    description: 'Guia practica para controlar stock, mermas y margen en restaurantes. Prueba nuestro software ahora.'
  }
};

export default function InventoryPostPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Control de inventario para restaurantes sin perder margen',
    description: 'Mejora el margen de tu restaurante con control de inventario y procesos claros.',
    datePublished: '2026-04-15',
    dateModified: '2026-04-15',
    mainEntityOfPage: `${siteUrl}/blog/control-inventario-restaurantes`,
    author: {
      '@type': 'Organization',
      name: 'Movilcom Tecnology Solution'
    },
    publisher: {
      '@type': 'Organization',
      name: 'RestoPOS',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article style={{ maxWidth: 840, margin: '0 auto', padding: '56px 20px 80px', lineHeight: 1.75 }}>
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>RENTABILIDAD</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 0 }}>Control de inventario para restaurantes sin perder margen</h1>
        <p style={{ color: '#a1a1aa' }}>
          Un restaurante puede vender mas y ganar menos si no controla inventario. Estas practicas ayudan a proteger margen y flujo de caja.
        </p>

        <h2>1. Recetas estandarizadas por producto</h2>
        <p>Cada venta debe descontar inventario real segun receta. Si no hay estandar, el dato operativo no sirve para tomar decisiones.</p>

        <h2>2. Minimos y alertas automatizadas</h2>
        <p>Configura umbrales por insumo critico. Comprar tarde o comprar de mas impacta costo y experiencia del cliente.</p>

        <h2>3. Mermas registradas por causa</h2>
        <p>No basta con contar faltantes: separa merma por caducidad, preparacion o desperdicio para atacar la raiz del problema.</p>

        <h2>4. Cruce inventario vs ventas</h2>
        <p>Compara consumo esperado con consumo real por periodo. Ese diferencial revela fugas, errores o procesos ineficientes.</p>

        <h2>5. Integracion con compras y proveedores</h2>
        <p>Conecta inventario con compras para anticipar reposiciones y negociar mejor con proveedores segun consumo real.</p>

        <p>
          Lectura complementaria:
          {' '}
          <a href="https://www.investopedia.com/terms/i/inventory-management.asp" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>
            fundamentos de inventory management
          </a>
          .
        </p>

        <p style={{ marginTop: 30 }}>
          Siguiente paso:
          {' '}
          <Link href="/blog/software-pos-restaurantes" style={{ color: '#a78bfa' }}>ver checklist de software POS para restaurantes</Link>
          {' '}
          | y
          {' '}
          <Link href="/blog/facturacion-electronica-dian-restaurantes" style={{ color: '#a78bfa' }}>revisar guia DIAN para restaurantes</Link>
          .
        </p>
      </article>
    </main>
  );
}
