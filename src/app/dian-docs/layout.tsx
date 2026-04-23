import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Integración DIAN para Restaurantes | RestoPOS (Prueba 7 Días)',
  description: 'Guía técnica para integrar facturación electrónica DIAN en RestoPOS con proveedores como Siigo, Alegra y Factus. Empieza con 7 días de prueba.',
  keywords: [
    'integracion DIAN',
    'facturacion electronica DIAN',
    'API SIIGO',
    'API Alegra',
    'software restaurante Colombia',
    'prueba gratis 7 dias'
  ],
  alternates: {
    canonical: `${siteUrl}/dian-docs`
  },
  openGraph: {
    title: 'Integración DIAN para Restaurantes | RestoPOS',
    description: 'Implementa facturación electrónica DIAN en tu restaurante con nuestra guía paso a paso. Únete gratis por 7 días.',
    url: `${siteUrl}/dian-docs`,
    siteName: 'RestoPOS',
    locale: 'es_CO',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'Integración DIAN para Restaurantes | RestoPOS',
    description: 'Guía de integración DIAN para restaurantes en Colombia. Trial de 7 días.'
  }
};

export default function DianDocsLayout({ children }: { children: React.ReactNode }) {
  // JSON-LD para SEO (TechArticle)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Guía de Integración DIAN para Restaurantes",
    "description": "Configura la conexión técnica de facturación electrónica DIAN entre RestoPOS y tu proveedor tecnológico.",
    "publisher": {
      "@type": "Organization",
      "name": "Movilcom Tecnology Solution",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "COP",
      "description": "Prueba de 7 días gratuita"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
