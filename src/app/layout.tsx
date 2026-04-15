import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RestoPOS | Software POS para Restaurantes en Colombia',
    template: '%s | RestoPOS'
  },
  description: 'Software POS para restaurantes con facturacion electronica DIAN, control de mesas, inventario, cocina KDS y analiticas en tiempo real.',
  applicationName: 'RestoPOS',
  keywords: [
    'software POS restaurantes',
    'sistema POS Colombia',
    'facturacion electronica DIAN',
    'control de mesas restaurante',
    'software inventario restaurante',
    'kds cocina restaurante',
    'programa para restaurantes'
  ],
  category: 'technology',
  creator: 'Movilcom Tecnology Solution',
  publisher: 'Movilcom Tecnology Solution',
  authors: [{ name: 'Movilcom Tecnology Solution', url: 'https://www.movilcomts.com' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'RestoPOS',
    url: siteUrl,
    title: 'RestoPOS | Software POS para Restaurantes en Colombia',
    description: 'Gestiona tu restaurante con un software POS moderno: pedidos, mesas, inventario, KDS y facturacion electronica DIAN.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'RestoPOS - Software POS para restaurantes'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RestoPOS | Software POS para Restaurantes en Colombia',
    description: 'POS para restaurantes con DIAN, inventario, mesas y cocina KDS en una sola plataforma.',
    images: ['/logo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: '#6366f1'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.variable}>
        {children}
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LF12VPKQHN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LF12VPKQHN');
          `}
        </Script>
      </body>
    </html>
  );
}
