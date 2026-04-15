'use client';
import { useEffect, useState } from 'react';
import { ChefHat, ArrowRight, LayoutGrid, Users, UtensilsCrossed, Sparkles, CheckCircle2, ShieldCheck, Zap, Smartphone, Receipt, Package, Star, MessageCircle, ChevronDown, Quote, Loader2, X, Menu, Download, Cloud } from 'lucide-react';
import Link from 'next/link';
import { appendTrackingToUrl, captureCampaignTracking, trackCampaignEvent } from '@/lib/campaignTracking';

export default function LandingUI() {
  const PAYMENT_URL = 'https://mpago.li/2cBBftf';
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({ restaurantName: '', nit: '', email: '', phone: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    captureCampaignTracking();
    trackCampaignEvent('landing_view');

    const url = new URL(window.location.href);
    const paymentStatus = url.searchParams.get('payment');

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '').split('?')[1] || '');
    const hashPaymentStatus = hashParams.get('payment');
    const resolvedStatus = paymentStatus || hashPaymentStatus;

    if (resolvedStatus === 'success') {
      trackCampaignEvent('purchase_success', { from: 'landing_return' });
    }
    if (resolvedStatus === 'failure' || resolvedStatus === 'pending') {
      trackCampaignEvent('purchase_failure', { from: 'landing_return', status: resolvedStatus });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      trackCampaignEvent('pwa_install_prompt_available');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      trackCampaignEvent('pwa_app_installed');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    trackCampaignEvent('checkout_started', {
      plan: 'annual',
      has_restaurant_name: Boolean(formData.restaurantName),
      has_nit: Boolean(formData.nit),
      has_email: Boolean(formData.email),
      has_phone: Boolean(formData.phone)
    });
    window.location.href = appendTrackingToUrl(PAYMENT_URL);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      trackCampaignEvent('pwa_install_initiated');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        trackCampaignEvent('pwa_install_accepted');
      } else {
        trackCampaignEvent('pwa_install_dismissed');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const features = [
    { icon: LayoutGrid, title: 'Dashboard Analítico', desc: 'Control total de tu negocio con métricas en tiempo real. Ventas, inventario y gestión completa desde un solo lugar.', color: '#8b5cf6' },
    { icon: Users, title: 'Sistema de Meseros', desc: 'Toma de pedidos ágil, mapa visual de mesas y control de facturación simplificado para maximizar el servicio.', color: '#3b82f6' },
    { icon: UtensilsCrossed, title: 'KDS para Cocina', desc: 'Pantallas interactivas para gestión de comandas, control de tiempos de preparación y estados de los pedidos.', color: '#f97316' },
    { icon: ShieldCheck, title: 'Seguridad basada en Roles', desc: 'Acceso seguro mediante PIN por cada tipo de empleado. Permisos limitados a lo que cada uno necesita ver y hacer.', color: '#10b981' },
    { icon: Receipt, title: 'Facturación Electrónica', desc: 'Emisión directa de facturas y boletas electrónicas validables. Integración directa con la normativa DIAN.', color: '#ec4899' },
    { icon: Package, title: 'Control de Inventario', desc: 'Administración de stock inteligente, seguimiento de mermas y alertas automatizadas para tus ingredientes clave.', color: '#eab308' }
  ];

  const highlights = [
    'Actualizaciones en Tiempo Real',
    'Reportes de P&L Automáticos',
    'Soporte a Múltiples Zonas',
    'Facturación Electrónica DIAN',
    'Control de Inventario y Mermas',
    'Auditoría y Log de Accesos'
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const testimonials = [
    { name: "Andrés M.", role: "Propietario de Franquicia", rating: 5, text: "Con RestoPOS logramos reducir el tiempo de toma de pedidos a la mitad, y ahora las mermas están calculadas a la perfección." },
    { name: "Valeria R.", role: "Gerente Operativa", rating: 5, text: "La integración directa de la facturación electrónica DIAN nos quitó un dolor de cabeza contable. El sistema se paga solo." },
    { name: "Carlos T.", role: "Chef Ejecutivo", rating: 5, text: "El KDS de cocina revolucionó nuestro flujo de trabajo. Cero comandas perdidas de papel. Todo es tiempo real." }
  ];

  const faqs = [
    { q: "¿RestoPOS funciona en tablets e iPads para meseros?", a: "Sí. Está diseñado como una PWA. Tus meseros pueden instalar el sistema en sus pantallas y utilizarlo fluidamente como una app nativa." },
    { q: "¿La Facturación Electrónica DIAN requiere otro software?", a: "No, la emisión de comprobantes ocurre de forma directa e integrada, asegurando que cumplas los requisitos normativos sin salir de RestoPOS." },
    { q: "¿Cuántos usuarios o mesas puedo crear en el sistema?", a: "Operamos bajo un modelo transparente anual: acceso a la plataforma sin límites ridículos por cada mesa o dispositivo." },
    { q: "¿Es funcional si se interrumpe mi wifi local?", a: "La administración es un SaaS en la nube con altos niveles de uptime. Garantizamos robustez tecnológica." }
  ];

  // JSON-LD Schema para Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "RestoPOS",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android",
        "description": "Sistema de Punto de Venta (POS) para restaurantes con Facturación Electrónica DIAN, control de mesas, inventario y KDS.",
        "url": "https://restopos.movilcomts.com",
        "offers": {
          "@type": "Offer",
          "price": "850000",
          "priceCurrency": "COP",
          "priceValidUntil": "2027-12-31"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "5",
          "reviewCount": "3"
        }
      },
      {
        "@type": "Organization",
        "name": "Movilcom Tecnology Solution",
        "url": "https://www.movilcomts.com",
        "logo": "https://restopos.movilcomts.com/logo.png"
      },
      {
        "@type": "WebSite",
        "name": "RestoPOS",
        "url": "https://restopos.movilcomts.com",
        "inLanguage": "es-CO"
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#08111f',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.18), transparent 60%), radial-gradient(ellipse at bottom left, rgba(249, 115, 22, 0.12), transparent 58%), radial-gradient(ellipse at right, rgba(124, 58, 237, 0.08), transparent 54%)',
      fontFamily: 'var(--font-sans), system-ui, sans-serif',
      color: '#f8fafc',
      overflowX: 'hidden'
    }}>
      {/* JSON-LD para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f36; }

        .hero-title {
          background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 52%, #93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(39, 39, 42, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
        }
        .btn-cta {
          transition: all 0.2s;
        }
        .btn-cta:hover {
          filter: brightness(1.12);
          transform: scale(1.02);
          box-shadow: 0 0 28px rgba(37, 99, 235, 0.34), 0 0 18px rgba(249, 115, 22, 0.16);
        }
        .nav-link {
          transition: color 0.2s;
          text-decoration: none;
          color: #a1a1aa;
          font-weight: 500;
          font-size: 14px;
        }
        .nav-link:hover { color: #f8fafc; }

        /* ─── RESPONSIVE ─────────────────────────────────── */

        /* Navbar */
        .nav-wrapper {
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8,17,31,0.82);
        }
        .nav-desktop-links { display: flex; align-items: center; gap: 24px; }
        .nav-hamburger { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; padding: 6px; }
        .nav-mobile-menu {
          display: none;
          flex-direction: column;
          gap: 8px;
          padding: 16px 24px 20px;
          background: rgba(18,18,20,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .nav-mobile-menu.open { display: flex; }
        .nav-mobile-link {
          color: #a1a1aa;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        /* Hero */
        .hero-section {
          padding: 80px 24px 64px;
          text-align: center;
          position: relative;
        }
        .hero-title-text {
          font-size: clamp(36px, 7vw, 68px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          max-width: 900px;
          margin: 0 auto 24px;
          font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
        }
        .hero-subtitle {
          color: #94a3b8;
          font-size: clamp(15px, 2.5vw, 18px);
          line-height: 1.65;
          max-width: 600px;
          margin: 0 auto 48px;
        }
        .hero-cta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        /* Highlights */
        .highlights-section {
          padding: 80px 24px;
          background: linear-gradient(180deg, rgba(24,24,27,0) 0%, rgba(24,24,27,0.5) 100%);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .highlights-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .highlights-text { flex: 1 1 340px; }
        .highlights-visual { flex: 1 1 280px; display: flex; justify-content: center; }
        .highlights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* Preview section */
        .preview-section {
          padding: clamp(48px,8vw,84px) 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(520px 220px at 10% 5%, rgba(249, 115, 22, 0.28), transparent 70%),
            radial-gradient(560px 260px at 92% 90%, rgba(59, 130, 246, 0.22), transparent 72%),
            linear-gradient(135deg, rgba(24,24,27,0.92), rgba(39,39,42,0.9));
        }
        .preview-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.1));
          pointer-events: none;
        }
        .preview-section-content {
          position: relative;
          max-width: 1140px;
          margin: 0 auto;
          z-index: 2;
        }
        .preview-headline-wrap {
          text-align: center;
          margin-bottom: 34px;
        }
        .preview-showcase-shell {
          background: linear-gradient(120deg, rgba(249,115,22,0.9), rgba(234,88,12,0.88) 28%, rgba(139,92,246,0.88) 62%, rgba(59,130,246,0.92));
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 26px;
          padding: clamp(18px, 2.6vw, 32px);
          box-shadow: 0 38px 90px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .preview-showcase-grid {
          display: grid;
          grid-template-columns: minmax(260px, 0.95fr) minmax(0, 1.35fr);
          gap: clamp(16px, 2.8vw, 30px);
          align-items: center;
        }
        .preview-copy-title {
          font-size: clamp(30px, 4.2vw, 54px);
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #fff;
          margin: 0 0 14px;
          font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
        }
        .preview-copy-subtitle {
          margin: 0 0 20px;
          color: rgba(255,255,255,0.9);
          font-size: clamp(13px, 1.5vw, 15px);
          line-height: 1.65;
          max-width: 360px;
        }
        .preview-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }
        .preview-benefit-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          padding: 7px 12px;
          background: rgba(15, 23, 42, 0.33);
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 999px;
        }
        .preview-benefit-pill svg { color: #86efac; }
        .preview-metrics {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(2, 6, 23, 0.48);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding: 10px 16px;
        }
        .preview-metric-logo {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .preview-metric-logo img { width: 22px; height: 22px; object-fit: contain; }
        .preview-metric-value {
          color: #fff;
          font-weight: 800;
          font-size: 28px;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .preview-metric-label {
          color: rgba(255,255,255,0.88);
          font-size: 12px;
          line-height: 1.2;
        }
        .preview-devices {
          position: relative;
          min-height: clamp(260px, 32vw, 400px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-laptop {
          width: min(100%, 740px);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow: 0 24px 54px rgba(0, 0, 0, 0.38);
          background: rgba(9, 9, 11, 0.9);
          animation: previewFloatUp 6s ease-in-out infinite;
        }
        .preview-browser-bar {
          background: rgba(17,24,39,0.9);
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .preview-browser-dots { display: flex; gap: 5px; }
        .preview-browser-url {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .preview-laptop img {
          width: 100%;
          display: block;
          aspect-ratio: 16/9;
          object-fit: cover;
          object-position: top;
        }
        .preview-phone {
          position: absolute;
          left: clamp(-4px, 2vw, 20px);
          bottom: clamp(-28px, -2vw, -8px);
          width: min(34%, 200px);
          border-radius: 28px;
          background: #020617;
          border: 7px solid #0f172a;
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.52);
          transform: rotate(-12deg);
          overflow: hidden;
          animation: previewFloatDown 6s ease-in-out infinite;
          animation-delay: 0.7s;
        }
        .preview-phone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 42%;
          height: 16px;
          border-radius: 0 0 12px 12px;
          background: #020617;
          z-index: 4;
        }
        .preview-phone img {
          width: 100%;
          display: block;
          aspect-ratio: 9 / 18;
          object-fit: cover;
          object-position: top;
        }
        .preview-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 28px;
        }
        .preview-tab {
          padding: 9px 17px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.24);
          background: rgba(15,23,42,0.36);
          color: rgba(255,255,255,0.86);
          transition: all 0.2s;
          font-family: inherit;
        }
        .preview-tab:hover {
          color: #fff;
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.36);
        }
        .preview-tab.active {
          background: rgba(255,255,255,0.2);
          color: #fff;
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
        }
        .preview-caption {
          color: #e2e8f0;
          font-size: clamp(13px, 2vw, 15px);
          line-height: 1.55;
          text-align: center;
          max-width: 740px;
          margin: 20px auto 0;
          font-weight: 500;
        }
        .preview-img-enter { animation: previewFade 0.35s ease both; }
        @keyframes previewFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes previewFloatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes previewFloatDown {
          0%, 100% { transform: rotate(-12deg) translateY(0); }
          50% { transform: rotate(-12deg) translateY(-6px); }
        }
        @media (max-width: 980px) {
          .preview-showcase-grid {
            grid-template-columns: 1fr;
          }
          .preview-copy-subtitle {
            max-width: none;
          }
          .preview-devices {
            margin-top: 4px;
          }
        }
        @media (max-width: 768px) {
          .preview-browser-url { display: none; }
          .preview-tab {
            font-size: 12px;
            padding: 8px 14px;
          }
          .preview-metrics {
            width: 100%;
            justify-content: center;
          }
          .preview-phone {
            width: min(44%, 170px);
            left: -2px;
            bottom: -20px;
          }
        }

        /* Pricing */
        .pricing-section {
          padding: 80px 24px;
          text-align: center;
          position: relative;
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Footer */
        .footer-wrapper {
          padding: 64px 48px 40px;
          background: #09090b;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .footer-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-bottom: 48px;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 28px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        /* Modal form input */
        .pricing-modal-overlay {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(360px 180px at 18% 18%, rgba(59,130,246,0.16), transparent 70%),
            radial-gradient(360px 180px at 85% 85%, rgba(249,115,22,0.12), transparent 72%),
            rgba(2, 6, 23, 0.82);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .pricing-modal-card {
          width: 100%;
          max-width: 520px;
          overflow: auto;
          max-height: min(88vh, 760px);
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(180deg, rgba(11,18,32,0.92), rgba(17,24,39,0.82));
          backdrop-filter: blur(20px);
          box-shadow: 0 38px 100px rgba(2, 6, 23, 0.56), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: fadeUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
          position: relative;
        }
        .pricing-modal-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(300px 140px at 14% 6%, rgba(255,255,255,0.08), transparent 72%);
          pointer-events: none;
        }
        .pricing-modal-header {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          position: relative;
          z-index: 2;
        }
        .pricing-modal-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .pricing-modal-logo {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 34px rgba(15, 23, 42, 0.28);
        }
        .pricing-modal-logo img {
          width: 70%;
          height: 70%;
          object-fit: contain;
        }
        .pricing-modal-close {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          cursor: pointer;
          padding: 8px;
          border-radius: 14px;
          flex-shrink: 0;
          transition: all 0.18s ease;
        }
        .pricing-modal-close:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .pricing-modal-form {
          padding: 22px 24px 24px;
          position: relative;
          z-index: 2;
        }
        .pricing-modal-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 26px;
        }
        .pricing-modal-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .pricing-modal-label {
          display: block;
          color: #dbe4f0;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .modal-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 14px 16px;
          color: #fff;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .modal-input::placeholder {
          color: rgba(226,232,240,0.42);
        }
        .modal-input:focus {
          border-color: rgba(125, 211, 252, 0.52);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.14);
          background: rgba(255,255,255,0.1);
        }
        .pricing-modal-submit {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #f97316, #8b5cf6 52%, #2563eb 100%);
          color: #fff;
          border-radius: 18px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          font-size: 16px;
          font-family: inherit;
          box-shadow: 0 18px 34px rgba(37,99,235,0.24);
        }
        .pricing-modal-note {
          margin-top: 14px;
          text-align: center;
          color: rgba(203,213,225,0.68);
          font-size: 12px;
          line-height: 1.5;
        }

        /* ─── BREAKPOINTS ────────────────────────────────── */
        @media (max-width: 768px) {
          .nav-wrapper { padding: 16px 20px; }
          .nav-desktop-links { display: none; }
          .nav-hamburger { display: flex; }

          .hero-section { padding: 48px 20px 40px; }
          .hero-cta-row { flex-direction: column; align-items: stretch; }
          .hero-cta-row a { text-align: center; justify-content: center; }

          .highlights-inner { gap: 32px; }
          .highlights-grid { grid-template-columns: 1fr; }
          .highlights-visual { display: none; }

          .preview-showcase-shell { border-radius: 22px; }
          .preview-copy-title { font-size: clamp(28px, 8vw, 42px); }
          .preview-copy-subtitle { max-width: none; }
          .preview-phone { width: min(46%, 160px); bottom: -16px; left: 0; }
          .preview-devices { min-height: 250px; }

          .footer-wrapper { padding: 48px 24px 32px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }

          .features-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .hero-section { padding: 36px 16px 32px; }
          .highlights-grid { grid-template-columns: 1fr; gap: 12px; }
          .pricing-section { padding: 56px 16px; }
          .hero-title-text { font-size: clamp(34px, 11vw, 46px); }
          .hero-subtitle { margin-bottom: 32px; }
          .preview-tabs { gap: 8px; }
          .preview-tab { padding: 8px 12px; }
          .pricing-modal-overlay { align-items: flex-start; padding: 14px; }
          .pricing-modal-card { max-height: calc(100vh - 28px); border-radius: 24px; }
          .pricing-modal-header,
          .pricing-modal-form { padding-left: 16px; padding-right: 16px; }
        }

        @media (min-width: 480px) and (max-width: 768px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .testimonials-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <div className="nav-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>RestoPOS</span>
          </div>

          {/* Desktop links */}
          <div className="nav-desktop-links">
            <a href="#features" className="nav-link">Características</a>
            <a href="#preview" className="nav-link">Vista Previa</a>
            <a href="#pricing" className="nav-link">Precios</a>
            <a href="/pos" onClick={() => trackCampaignEvent('cta_click', { cta_id: 'nav_login' })} className="btn-cta" style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb)', color: '#fff', borderRadius: '99px', textDecoration: 'none', fontWeight: 600, fontSize: 14, boxShadow: '0 14px 28px rgba(37,99,235,0.18)' }}>
              Ir al Login →
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setNavOpen(o => !o)}
            aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div className={`nav-mobile-menu${navOpen ? ' open' : ''}`} role="navigation" aria-label="Navegación móvil">
          <a href="#features" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Características</a>
          <a href="#preview" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Vista Previa</a>
          <a href="#pricing" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Precios</a>
          <a href="/pos" style={{ marginTop: 8, display: 'block', textAlign: 'center', padding: '14px 20px', background: 'linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 16 }} onClick={() => { setNavOpen(false); trackCampaignEvent('cta_click', { cta_id: 'mobile_login' }); }}>
            Iniciar Sesión →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header aria-label="Introducción" className="hero-section">
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(680px, 92vw)', height: 360, background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(249,115,22,0.14) 44%, rgba(124,58,237,0.12) 62%, transparent 78%)', filter: 'blur(120px)', opacity: 0.78, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '99px', marginBottom: 28 }}>
          <Sparkles size={15} color="#c084fc" />
          <span style={{ color: '#c084fc', fontSize: 13, fontWeight: 600 }}>Sistema líder de Punto de Venta en Colombia</span>
        </div>

        <h1 className="hero-title hero-title-text">
          Software POS y Sistema de Gestión para Restaurantes
        </h1>

        <p className="hero-subtitle">
          Optimiza tus operaciones con el mejor punto de venta (POS) y control de mesas. Facturación electrónica DIAN integrada, inventarios en tiempo real y KDS para tu cocina.
        </p>

        <div className="hero-cta-row">
          <a href="/pos" aria-label="Ir a Iniciar Sesión en RestoPOS" onClick={() => trackCampaignEvent('cta_click', { cta_id: 'hero_login' })} className="btn-cta" style={{ padding: '15px 32px', background: 'linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 18px 34px rgba(37,99,235,0.2)' }}>
            Iniciar Sistema <ArrowRight size={18} />
          </a>
          <a href="https://www.movilcomts.com" aria-label="Visitar página corporativa del desarrollador" target="_blank" rel="noopener noreferrer" style={{ padding: '15px 32px', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderRadius: '16px', textDecoration: 'none', fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
            Conocer al Desarrollador
          </a>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: 'clamp(48px,8vw,80px) 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Ecosistema de Software para tu Negocio Gastronómico</h2>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', maxWidth: 680, margin: '0 auto' }}>Herramientas especializadas (App para meseros, Inventarios, Facturación DIAN) pensadas para cada rol de tu equipo.</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ padding: '28px', background: 'rgba(24, 24, 27, 0.5)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 52, height: 52, background: `${f.color}18`, border: `1px solid ${f.color}35`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <f.icon size={26} color={f.color} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#f8fafc' }}>{f.title}</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.65, fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── APP PREVIEW ── */}
      {(() => {
        const tabs = [
          { label: 'Dashboard', img: '/preview-dashboard.png', desc: 'Panel de control con estadísticas en tiempo real, mapa de mesas y accesos directos a cada módulo.' },
          { label: 'Meseros', img: '/preview-waiter.png', desc: 'App de toma de pedidos para meseros: selección de mesa, productos, cantidades y envío directo a cocina.' },
          { label: 'Cocina KDS', img: '/preview-kds.png', desc: 'Pantalla de cocina con comandas en tiempo real, tiempos de preparación y estados por pedido.' },
          { label: 'Analíticas', img: '/preview-analytics.png', desc: 'Reportes de ventas, platillos top, hora pico y gráficos de tendencia para tomar mejores decisiones.' },
          { label: 'Inventario', img: '/preview-inventory.png', desc: 'Control de stock con alertas de merma, niveles mínimos y registro de ingredientes por unidad.' },
        ];
        const tab = tabs[activeTab];
        return (
          <section id="preview" className="preview-section">
            <div className="preview-section-content">
              <div className="preview-headline-wrap">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 99, marginBottom: 16 }}>
                  <img src="/logo.png" alt="RestoPOS Logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                  <span style={{ color: '#c084fc', fontSize: 12, fontWeight: 600 }}>Vista previa de la aplicación</span>
                </div>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Mira RestoPOS en acción</h2>
                <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', maxWidth: 600, margin: '0 auto' }}>Explora cada módulo del sistema antes de suscribirte. Una plataforma diseñada para cada rol de tu equipo.</p>
              </div>

              <div className="preview-showcase-shell">
                <div className="preview-showcase-grid">
                  <div>
                    <h3 className="preview-copy-title">Interfaz POS lista para alto flujo de pedidos</h3>
                    <p className="preview-copy-subtitle">Diseño operativo para restaurantes en servicio real: rápido, claro y pensado para que cada rol trabaje sin fricción.</p>

                    <div className="preview-benefits">
                      <span className="preview-benefit-pill"><CheckCircle2 size={13} /> Operación en tiempo real</span>
                      <span className="preview-benefit-pill"><CheckCircle2 size={13} /> Diseño optimizado para tablets</span>
                      <span className="preview-benefit-pill"><CheckCircle2 size={13} /> Flujo meseros + cocina sincronizado</span>
                      <span className="preview-benefit-pill"><CheckCircle2 size={13} /> Branding RestoPOS</span>
                    </div>

                    <div className="preview-metrics">
                      <div className="preview-metric-logo">
                        <img src="/logo.png" alt="Logo RestoPOS" />
                      </div>
                      <div>
                        <div className="preview-metric-value">80+</div>
                        <div className="preview-metric-label">pantallas y vistas operativas del sistema</div>
                      </div>
                    </div>
                  </div>

                  <div className="preview-devices">
                    <div className="preview-laptop">
                      <div className="preview-browser-bar">
                        <div className="preview-browser-dots">
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb7185', display: 'block' }} />
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'block' }} />
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', display: 'block' }} />
                        </div>
                        <div className="preview-browser-url">
                          <img src="/logo.png" alt="RestoPOS" style={{ width: 13, height: 13, objectFit: 'contain', opacity: 0.9 }} />
                          <span>restopos.movilcomts.com</span>
                        </div>
                      </div>
                      <img key={activeTab} src={tab.img} alt={`RestoPOS - ${tab.label}`} className="preview-img-enter" loading="lazy" />
                    </div>

                    <div className="preview-phone">
                      <div className="preview-phone-notch" />
                      <img key={`phone-${activeTab}`} src="/preview-waiter.png" alt="RestoPOS móvil para meseros" className="preview-img-enter" loading="lazy" />
                    </div>
                  </div>
                </div>

                <div className="preview-tabs" role="tablist" aria-label="Módulos de la aplicación">
                  {tabs.map((t, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={activeTab === i}
                      className={`preview-tab${activeTab === i ? ' active' : ''}`}
                      onClick={() => setActiveTab(i)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <p className="preview-caption">{tab.desc}</p>
              </div>

              <div style={{ textAlign: 'center', marginTop: 36 }}>
                <a href="/pos" onClick={() => trackCampaignEvent('cta_click', { cta_id: 'preview_login' })} className="btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb)', color: '#fff', borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 15, boxShadow: '0 16px 28px rgba(37,99,235,0.18)' }}>
                  <img src="/logo.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  Probar RestoPOS ahora <ArrowRight size={17} />
                </a>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── HIGHLIGHTS / BENEFITS ── */}
      <section id="benefits" className="highlights-section">
        <div className="highlights-inner">
          <div className="highlights-text">
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>Punto de Venta POS Ultrarrápido y Seguro</h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: 1.65, marginBottom: 28 }}>
              Desarrollado con las últimas tecnologías en software de facturación para garantizar disponibilidad permanente. Administración de mesas y cierre de caja automatizado.
            </p>
            <div className="highlights-grid">
              {highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={17} color="#8b5cf6" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: 14 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="highlights-visual">
            <div style={{ width: 260, height: 340, background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.1))', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 }}>
              <Smartphone size={56} color="#8b5cf6" style={{ opacity: 0.6 }} />
              <Zap size={40} color="#fcd34d" style={{ opacity: 0.85 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── PWA INSTALL SECTION ── */}
      <section style={{ padding: 'clamp(48px,8vw,80px) 20px', background: 'rgba(139,92,246,0.05)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
            {/* Left: Logo y descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '99px', marginBottom: 20 }}>
                  <Cloud size={15} color="#c084fc" />
                  <span style={{ color: '#c084fc', fontSize: 13, fontWeight: 600 }}>Aplicación Instalable</span>
                </div>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 16, color: '#f8fafc', lineHeight: 1.2 }}>Instala RestoPOS en tu dispositivo</h2>
                <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: 1.65, marginBottom: 28 }}>
                  Accede a la plataforma como una aplicación nativa desde tu tablet, iPad o smartphone. Funciona incluso sin conexión a internet y recibe notificaciones en tiempo real.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: '#cbd5e1', fontSize: 14 }}>Acceso instantáneo sin abrir navegador</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: '#cbd5e1', fontSize: 14 }}>Compatible con IoS, Android y Windows</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: '#cbd5e1', fontSize: 14 }}>Sincronización automática en la nube</span>
                  </div>
                </div>

                {showInstallPrompt && deferredPrompt && (
                  <button
                    onClick={handleInstallApp}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb)', color: '#fff', borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', transition: 'all 200ms', boxShadow: '0 16px 28px rgba(37,99,235,0.18)' }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 12px 24px rgba(139,92,246,0.4)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
                  >
                    <Download size={17} />
                    Instalar Aplicación
                  </button>
                )}
              </div>
            </div>

            {/* Right: Visual mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ 
                position: 'relative',
                width: 'min(100%, 300px)',
                aspectRatio: '9/16',
                background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d3d 100%)',
                borderRadius: 32,
                border: '8px solid #0e0e10',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                padding: 24,
                boxShadow: '0 20px 60px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}>
                {/* Notch */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '35%', height: 24, background: '#0e0e10', borderRadius: '0 0 20px 20px', zIndex: 10 }} />

                {/* Content */}
                <img 
                  src="/logo.png" 
                  alt="RestoPOS" 
                  style={{ width: 64, height: 64, objectFit: 'contain', marginTop: 16 }} 
                />
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '0 0 4px 0' }}>RestoPOS</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>restopos.movilcomts.com</p>
                </div>

                {/* Glow effect */}
                <div style={{ 
                  position: 'absolute',
                  bottom: 60,
                  width: 140,
                  height: 140,
                  background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(30px)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="pricing-section">
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Prueba 7 días y activa tu licencia</h2>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
          Empieza con una prueba operativa de 7 días. Si quieres seguir usando RestoPOS después del trial, activas la licencia anual.
        </p>

        <div style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(24, 24, 27, 0.7)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 24, padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #f97316, #7c3aed 52%, #2563eb)' }} />
          <h3 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Plan Anual</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
            <span style={{ fontSize: 18, color: '#94a3b8', fontWeight: 600 }}>$</span>
            <span style={{ fontSize: 'clamp(36px, 8vw, 48px)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>850.000</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={17} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Gestión ilimitada de mesas y pedidos</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={17} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Perfiles: Administrador, Mesero y Cocina</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={17} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Soporte técnico y actualizaciones</span></li>
          </ul>

          <div style={{ padding: '13px 16px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 12, border: '1px solid rgba(249, 115, 22, 0.22)', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: '#fb923c', fontSize: 13, margin: 0, fontWeight: 500, lineHeight: 1.55 }}>
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#fdba74' }}>⏳ Prueba Gratuita</span>
              Todos los restaurantes empiezan con 7 días de prueba. Al finalizar ese periodo, se solicita el pago de la licencia anual para seguir usando el sistema.
            </p>
          </div>

          <button
            onClick={() => { setShowModal(true); trackCampaignEvent('cta_click', { cta_id: 'pricing_open_modal' }); }}
            aria-label="Comprar Plan Anual RestoPOS"
            className="btn-cta"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit' }}>
            Contratar Plan Anual
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" aria-label="Testimonios de Clientes" style={{ padding: 'clamp(48px,8vw,80px) 20px', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Confiado por operadores gastronómicos</h2>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)' }}>Testimonios de quienes revolucionaron su flujo de servicio con RestoPOS.</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <article key={idx} style={{ padding: '28px', background: 'rgba(24, 24, 27, 0.5)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
              <Quote size={28} color="rgba(139, 92, 246, 0.25)" style={{ position: 'absolute', top: 24, right: 24 }} />
              <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={15} fill="#facc15" color="#facc15" />)}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.65, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 2, fontSize: 14 }}>{t.name}</strong>
                <span style={{ color: '#64748b', fontSize: 13 }}>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section id="faq" aria-label="Preguntas Frecuentes" style={{ padding: 'clamp(48px,8vw,80px) 20px', background: 'rgba(24,24,27,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Preguntas Frecuentes</h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)' }}>Resolvemos tus inquietudes para que des el paso a la digitalización.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'rgba(24, 24, 27, 0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  style={{ width: '100%', padding: 'clamp(16px,3vw,20px) clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: 'clamp(14px,2vw,16px)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 16 }}>
                  {faq.q}
                  <ChevronDown size={18} color="#94a3b8" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
                </button>
                <div style={{ maxHeight: openFaq === idx ? 200 : 0, opacity: openFaq === idx ? 1 : 0, overflow: 'hidden', transition: 'all 0.3s ease-in-out' }}>
                  <p style={{ padding: 'clamp(0px,0px,0px) clamp(16px,4vw,24px) clamp(16px,2vw,24px)', color: '#a1a1aa', fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-wrapper">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>RestoPOS</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Sistema POS premium líder en la gestión de alta eficiencia y control exacto para restaurantes en toda la región.
            </p>
            <a href="https://www.movilcomts.com" aria-label="Contactar al equipo de ventas" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7dd3fc', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              <MessageCircle size={16} /> Contactar a Ventas
            </a>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Producto SaaS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="#features" className="nav-link">Características POS</Link>
              <Link href="/dian-docs" className="nav-link">Facturación Electrónica DIAN</Link>
              <Link href="/blog" className="nav-link">Blog para Restaurantes</Link>
              <Link href="#pricing" className="nav-link">Licencia Comercial</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Empresa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" className="nav-link">Acerca del Desarrollador</a>
              <Link href="/refund-policy" className="nav-link">Políticas de Reembolso</Link>
              <Link href="/terms" className="nav-link">Términos y Condiciones</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Desarrollado por <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f8fafc', fontWeight: 600, textDecoration: 'none' }}>Movilcom Tecnology Solution</a>
          </p>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} RestoPOS SaaS. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="pricing-modal-overlay">
          <div className="pricing-modal-card">
            <div className="pricing-modal-header">
              <div>
                <div className="pricing-modal-brand">
                  <div className="pricing-modal-logo">
                    <img src="/logo.png" alt="Logo RestoPOS" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>RestoPOS · Trial 7 días</div>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.03em' }}>Crear tu cuenta</h3>
                  </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, maxWidth: 360, lineHeight: 1.6 }}>Completa estos datos para preparar tu prueba de 7 días. Cuando el trial termine, te pediremos activar la licencia para seguir operando.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="pricing-modal-close">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="pricing-modal-form">
              <div className="pricing-modal-grid">
                <div className="pricing-modal-field">
                  <label htmlFor="restaurantName" className="pricing-modal-label">Nombre del Restaurante *</label>
                  <input required id="restaurantName" type="text" className="modal-input" value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} placeholder="Ej. Pizzería La Mamma" />
                </div>
                <div className="pricing-modal-field">
                  <label htmlFor="nit" className="pricing-modal-label">NIT / Documento Identidad *</label>
                  <input required id="nit" type="text" className="modal-input" value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} placeholder="Ej. 900.123.456-7" />
                </div>
                <div className="pricing-modal-field">
                  <label htmlFor="email" className="pricing-modal-label">Correo Electrónico *</label>
                  <input required id="email" type="email" className="modal-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="gerencia@restaurante.com" />
                </div>
                <div className="pricing-modal-field">
                  <label htmlFor="phone" className="pricing-modal-label">Teléfono Móvil *</label>
                  <input required id="phone" type="tel" className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+57 300 000 0000" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="btn-cta pricing-modal-submit"
                style={{ opacity: isProcessingPayment ? 0.7 : 1, cursor: isProcessingPayment ? 'not-allowed' : 'pointer' }}>
                {isProcessingPayment ? <><Loader2 size={20} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /> Procesando pago...</> : 'Continuar al pago seguro'}
              </button>

              <p className="pricing-modal-note">Tus datos se usan para preparar la activación inicial de tu restaurante y dejar listo el trial de 7 días.</p>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
