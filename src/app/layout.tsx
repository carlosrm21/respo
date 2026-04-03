import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: "%s | RestoPOS",
    default: "RestoPOS — Sistema de Restaurante y POS SaaS",
  },
  description: "Sistema de gestión de restaurante completo: mesas, pedidos, facturación DIAN, inventario, KDS para cocina y analíticas en tiempo real.",
  keywords: ["POS", "restaurante", "sistema de gestión", "facturación DIAN", "software gastronómico", "KDS", "toma de pedidos", "Colombia", "SaaS"],
  authors: [{ name: "Movilcom Tecnology Solution", url: "https://www.movilcomts.com" }],
  creator: "Movilcom Tecnology Solution",
  publisher: "Movilcom Tecnology Solution",
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://restopos.movilcomts.com",
    title: "RestoPOS — Sistema Integral para Restaurantes",
    description: "Revoluciona el servicio de tu restaurante con nuestro sistema POS en la nube. Facturación electrónica, control de mesas y reportes automáticos.",
    siteName: "RestoPOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "RestoPOS — Software POS para Restaurantes",
    description: "Gestión eficiente de mesas, pedidos y facturación DIAN. Optimiza tu negocio gastronómico.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.variable}>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
