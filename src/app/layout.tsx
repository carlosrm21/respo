import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
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
    url: "https://restopos.movilcomts.com",
    title: "RestoPOS | Software POS y Sistema de Gestión para Restaurantes",
    description: "Multiplica las ventas de tu restaurante y agiliza el servicio. Plataforma POS con control de inventario, mesas y Facturación DIAN automatizada.",
    siteName: "RestoPOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "RestoPOS | Software POS en la Nube para Restaurantes",
    description: "Gestión completa: Control de mesas, App para meseros, Inventario y Facturación Electrónica. Descubre el ecosistema RestoPOS.",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://restopos.movilcomts.com",
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
