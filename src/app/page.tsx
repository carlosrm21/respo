import LandingUI from '@/components/LandingUI';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Software POS para Restaurantes en Colombia',
  description: 'Impulsa tu restaurante con un software POS completo: facturacion electronica DIAN, control de mesas, inventario, cocina KDS y analiticas.',
  keywords: [
    'software para restaurantes colombia',
    'pos restaurante con inventario',
    'analiticas ventas restaurante',
    'facturacion electronica dian restaurantes',
    'sistema para meseros y cocina',
    'prueba gratis software restaurante'
  ],
  alternates: {
    canonical: `${siteUrl}/`
  },
  openGraph: {
    title: 'Software POS para Restaurantes en Colombia | RestoPOS',
    description: 'Sistema POS para restaurantes con control de pedidos, inventario, meseros, cocina KDS y analiticas diarias, semanales y mensuales.',
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
    title: 'Software POS para Restaurantes en Colombia | RestoPOS',
    description: 'POS para restaurantes con DIAN, inventario, mesas, cocina y analiticas en tiempo real.',
    images: ['/preview-dashboard.png']
  }
};

export default async function Home() {
  return <LandingUI />;
}
