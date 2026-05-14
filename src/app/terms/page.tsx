import type { Metadata } from 'next';
import TermsClient from './TermsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Terminos y Condiciones | RestoPOS',
  description: 'Conoce los terminos y condiciones de uso del software POS RestoPOS: licencias, responsabilidades y soporte técnico.',
  alternates: {
    canonical: `${siteUrl}/terms`
  },
  openGraph: {
    title: 'Terminos y Condiciones | RestoPOS',
    description: 'Marco legal de uso del software POS para restaurantes RestoPOS.',
    url: `${siteUrl}/terms`,
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RestoPOS Legal'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Terminos y Condiciones | RestoPOS',
    description: 'Marco legal de uso del software POS para restaurantes RestoPOS.',
    images: ['/logo.png']
  }
};

export default function TermsPage() {
  return <TermsClient />;
}
