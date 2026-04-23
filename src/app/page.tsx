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
  return <LandingUI />;
}
