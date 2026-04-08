import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://restopos.movilcomts.com";
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | RestoPOS Software",
    default: "RestoPOS | El Mejor Software POS y Sistema de Gestión para Restaurantes",
  },
  description: "Optimiza tu restaurante con RestoPOS: Sistema de Punto de Venta (POS) integral con toma de pedidos, control de mesas, inventario, KDS y Facturación Electrónica DIAN.",
  keywords: [
    "Software POS para restaurantes", 
    "Sistema punto de venta restaurante", 
    "Facturación electrónica DIAN restaurantes", 
    "Control de mesas y pedidos", 
    "Software de inventario gastronómico", 
    "Sistema KDS cocina", 
    "Software restaurante Colombia", 
    "POS nube restaurantes", 
    "SaaS para restaurantes"
  ],
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
    url: siteUrl,
    title: "RestoPOS | Software POS y Sistema de Gestión para Restaurantes",
    description: "Multiplica las ventas de tu restaurante y agiliza el servicio. Plataforma POS con control de inventario, mesas y Facturación DIAN automatizada.",
    siteName: "RestoPOS",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "RestoPOS Software para Restaurantes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RestoPOS | Software POS en la Nube para Restaurantes",
    description: "Gestión completa: Control de mesas, App para meseros, Inventario y Facturación Electrónica. Descubre el ecosistema RestoPOS.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  formatDetection: {
    email: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RestoPOS",
  },
  category: "software",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.variable}>
        {gaId ? (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
