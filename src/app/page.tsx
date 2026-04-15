import LandingUI from '@/components/LandingUI';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Software POS para Restaurantes en Colombia',
  description: 'Impulsa tu restaurante con un software POS completo: facturacion electronica DIAN, control de mesas, inventario, cocina KDS y analiticas.',
  alternates: {
    canonical: `${siteUrl}/`
  }
};

export default async function Home() {
  return <LandingUI />;
}
