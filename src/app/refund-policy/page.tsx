import type { Metadata } from 'next';
import RefundClient from './RefundClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Politica de Reembolsos | RestoPOS',
  description: 'Conoce nuestra politica de devoluciones y reembolsos para el software RestoPOS. Derecho de retracto y condiciones de soporte.',
  alternates: {
    canonical: `${siteUrl}/refund-policy`
  },
  openGraph: {
    title: 'Politica de Reembolsos | RestoPOS',
    description: 'Transparencia y seguridad en tus pagos con RestoPOS.',
    url: `${siteUrl}/refund-policy`,
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RestoPOS Reembolsos'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Politica de Reembolsos | RestoPOS',
    description: 'Transparencia y seguridad en tus pagos con RestoPOS.',
    images: ['/logo.png']
  }
};

export default function RefundPage() {
  return <RefundClient />;
}
