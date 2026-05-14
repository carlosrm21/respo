import LandingUI from '@/components/LandingUI';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Software POS para Restaurantes en Colombia | 7 Días de Prueba Gratis',
  description: 'Impulsa tu restaurante con un software POS completo. Prueba gratis de 7 días. Facturación electrónica DIAN, mesas, inventario, cocina KDS y analíticas.',
  keywords: [
    'software para restaurantes colombia',
    'pos restaurante con inventario',
    'analiticas ventas restaurante',
    'facturacion electronica dian restaurantes',
    'sistema para meseros y cocina',
    'prueba gratis software restaurante',
    'pos 7 dias prueba'
  ],
  alternates: {
    canonical: `${siteUrl}/`
  },
  openGraph: {
    title: 'Software POS para Restaurantes en Colombia | Prueba Gratis de 7 Días',
    description: 'Sistema POS para restaurantes con control de pedidos, inventario, meseros, cocina KDS y facturación DIAN. Inicia tu prueba de 7 días sin compromiso.',
    url: `${siteUrl}/`,
    siteName: 'RestoPOS',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/preview-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'RestoPOS dashboard para restaurantes'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Software POS para Restaurantes en Colombia | Prueba de 7 Días',
    description: 'POS para restaurantes con DIAN, inventario y mesas. Inicia tu trial de 7 días.',
    images: ['/preview-dashboard.png']
  }
};

export default async function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "RestoPOS",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android",
        "description": "Sistema de Punto de Venta (POS) para restaurantes con Facturación Electrónica DIAN, control de mesas, inventario y KDS.",
        "url": "https://restopos.movilcomts.com",
        "offers": {
          "@type": "Offer",
          "price": "49900",
          "priceCurrency": "COP",
          "priceValidUntil": "2027-12-31",
          "description": "Incluye 14 días de prueba gratis. Suscripción mensual desde $49.900 COP."
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "reviewCount": "3"
        }
      },
      {
        "@type": "Organization",
        "name": "Movilcom Tecnology Solution",
        "url": "https://www.movilcomts.com",
        "logo": "https://restopos.movilcomts.com/logo.png",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "telephone": "+57 3242877331",
            "availableLanguage": ["Spanish"],
            "areaServed": "CO",
            "url": "https://wa.me/573242877331"
          }
        ]
      },
      {
        "@type": "WebSite",
        "name": "RestoPOS",
        "url": "https://restopos.movilcomts.com",
        "inLanguage": "es-CO"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿RestoPOS funciona en tablets e iPads para meseros?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. Está diseñado como una PWA. Tus meseros pueden instalar el sistema en sus pantallas y utilizarlo fluidamente como una app nativa."
            }
          },
          {
            "@type": "Question",
            "name": "¿La Facturación Electrónica DIAN requiere otro software?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, la emisión de comprobantes ocurre de forma directa e integrada, asegurando que cumplas los requisitos normativos sin salir de RestoPOS."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cuántos usuarios o mesas puedo crear en el sistema?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Operamos bajo un modelo transparente anual: acceso a la plataforma sin límites ridículos por cada mesa o dispositivo."
            }
          },
          {
            "@type": "Question",
            "name": "¿Es funcional si se interrumpe mi wifi local?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La administración es un SaaS en la nube con altos niveles de uptime. Garantizamos robustez tecnológica."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingUI />
    </>
  );
}
