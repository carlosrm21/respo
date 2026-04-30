import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Facturacion Electronica DIAN para Restaurantes',
  description: 'Guia practica para implementar facturacion electronica DIAN en restaurantes, con pasos, errores comunes y recomendaciones.',
  keywords: [
    'facturacion electronica DIAN restaurantes',
    'integracion DIAN POS',
    'api facturacion electronica Colombia',
    'cumplimiento DIAN restaurante'
  ],
  alternates: {
    canonical: `${siteUrl}/blog/facturacion-electronica-dian-restaurantes`
  },
  openGraph: {
    title: 'Facturacion electronica DIAN para restaurantes: guia rapida',
    description: 'Implementa DIAN en tu restaurante con menos errores y mejor trazabilidad operativa.',
    url: `${siteUrl}/blog/facturacion-electronica-dian-restaurantes`,
    type: 'article'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facturacion electronica DIAN para restaurantes',
    description: 'Guia rapida de implementacion DIAN integrada al POS.'
  }
};

export default function DianPostPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Facturacion electronica DIAN para restaurantes: guia rapida',
    description: 'Guia practica para implementar facturacion electronica DIAN en restaurantes usando RestoPOS (Incluye 7 días gratis).',
    datePublished: '2026-04-15',
    dateModified: '2026-04-15',
    mainEntityOfPage: `${siteUrl}/blog/facturacion-electronica-dian-restaurantes`,
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
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>CUMPLIMIENTO DIAN</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 0 }}>Facturacion electronica DIAN para restaurantes: guia rapida</h1>
        <p style={{ color: '#a1a1aa' }}>
          La facturacion electronica no es solo cumplimiento: tambien mejora control, trazabilidad y cierre diario cuando esta integrada al POS.
        </p>

        <h2>1. Marco Legal Obligatorio (Resolución 000042 de 2020)</h2>
        <p>En Colombia, la Resolución 042 de 2020 establece el marco técnico y legal para la facturación electrónica. Para restaurantes, esto implica reportar correctamente el <strong>Impuesto Nacional al Consumo (INC) del 8%</strong> (Art. 512-1 E.T.) o el IVA según corresponda.</p>

        <h2>2. Actores en el Ecosistema Electrónico</h2>
        <p>RestoPOS actúa como un <strong>Software POS intermediario</strong>. Para cumplir legalmente, el restaurante debe contratar un <strong>Proveedor Tecnológico Habilitado (PTH)</strong> (como Siigo, Alegra o Factus). RestoPOS se conecta a la API de su PTH para transmitir los datos de venta de forma automática.</p>

        <h2>3. Datos Mínimos del Emisor (Restaurante)</h2>
        <p>Cada factura electrónica emitida a través de RestoPOS debe incluir obligatoriamente:</p>
        <ul style={{ color: '#d1d1db', marginLeft: '20px', marginBottom: '20px' }}>
          <li>NIT con dígito de verificación y Razón Social exacta según RUT.</li>
          <li>Dirección física del establecimiento y municipio/departamento.</li>
          <li>Código de actividad económica <strong>CIIU 5611</strong> (Restaurantes).</li>
          <li>Correo electrónico registrado ante la DIAN para recepción de facturas.</li>
          <li>Prefijo y rango de numeración autorizado vigente.</li>
        </ul>

        <h2>4. Requisitos del Receptor (Cliente)</h2>
        <p>Para facturas superiores a 5 UVT (aprox. $247.000 COP en 2024) o cuando el cliente lo solicite, se deben capturar:</p>
        <ul style={{ color: '#d1d1db', marginLeft: '20px', marginBottom: '20px' }}>
          <li>Tipo de documento (CC, NIT, CE) y número.</li>
          <li>Nombre o razón social.</li>
          <li>Correo electrónico para envío del XML y PDF.</li>
        </ul>

        <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', padding: '20px', borderRadius: '12px', marginTop: '30px' }}>
          <h3 style={{ marginTop: 0, color: '#a78bfa' }}>⚠️ Importante: Conservación de Datos</h3>
          <p style={{ marginBottom: 0, fontSize: '0.95em' }}>Según el <strong>Art. 632 del Estatuto Tributario</strong>, los obligados a facturar deben conservar los documentos y soportes por un periodo de <strong>5 años</strong>. RestoPOS mantiene un log histórico de todas las transmisiones para su respaldo ante auditorías.</p>
        </div>

        <p>
          Consulta oficial:
          {' '}
          <a href="https://www.dian.gov.co/impuestos/factura-electronica/Paginas/default.aspx" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa' }}>
            Portal de Factura Electronica DIAN
          </a>
          .
        </p>

        <p style={{ marginTop: 30 }}>
          Ver tambien:
          {' '}
          <Link href="/dian-docs" style={{ color: '#a78bfa' }}>Documentacion tecnica DIAN de RestoPOS</Link>
          {' '}
          | y
          {' '}
          <Link href="/blog/software-pos-restaurantes" style={{ color: '#a78bfa' }}>checklist de software POS para restaurantes</Link>
          .
        </p>
      </article>
    </main>
  );
}
