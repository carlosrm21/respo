import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad | RestoPOS',
  description: 'Conoce como protegemos tus datos y los de tu restaurante en RestoPOS. Seguridad de grado bancario y cumplimiento legal.',
  alternates: {
    canonical: `${siteUrl}/privacy`
  },
  openGraph: {
    title: 'Aviso de Privacidad | RestoPOS',
    description: 'Tus datos estan seguros con RestoPOS.',
    url: `${siteUrl}/privacy`,
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RestoPOS Privacidad'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Aviso de Privacidad | RestoPOS',
    description: 'Tus datos estan seguros con RestoPOS.',
    images: ['/logo.png']
  }
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
