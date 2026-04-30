'use client';
import { useEffect, useState } from 'react';
import { ChefHat, ArrowRight, LayoutGrid, Users, UtensilsCrossed, Sparkles, CheckCircle2, ShieldCheck, Zap, Smartphone, Receipt, Package, Star, MessageCircle, ChevronDown, Quote, Loader2, X, Menu, Download, Cloud, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { appendTrackingToUrl, captureCampaignTracking, trackCampaignEvent } from '@/lib/campaignTracking';
import { createPaymentPreference, createTrialTenant } from '@/app/actions/payment';

export default function LandingUI() {
  const PAYMENT_URL = 'https://mpago.li/2cBBftf';
  const SALES_WHATSAPP = '3242877331';
  const SALES_WHATSAPP_URL = `https://wa.me/57${SALES_WHATSAPP}?text=${encodeURIComponent('Hola, quiero informacion de RestoPOS y la prueba de 7 dias.')}`;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Pro-plus' | 'Enterprise'>('Pro-plus');
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

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    trackCampaignEvent('checkout_started', {
      plan: 'annual',
      has_restaurant_name: Boolean(formData.restaurantName),
      has_nit: Boolean(formData.nit),
      has_email: Boolean(formData.email),
      has_phone: Boolean(formData.phone)
    });
    
    try {
      const response = await createTrialTenant(selectedPlan, formData);
      if (response.success && response.initPoint) {
        window.location.href = appendTrackingToUrl(response.initPoint);
      } else {
        alert(response.error || 'Ocurrió un error temporal al iniciar el proceso de registro.');
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error de red al intentar procesar el registro.');
      setIsProcessingPayment(false);
    }
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
          "price": "49900",
          "priceCurrency": "COP",
          "priceValidUntil": "2027-12-31",
          "description": "Incluye 14 días de prueba gratis. Suscripción mensual desde $49.900 COP."
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
        "logo": "https://restopos.movilcomts.com/logo.png",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "sales",
            "telephone": "+57 3242877331",
            "availableLanguage": ["Spanish"],
            "areaServed": "CO",
            "url": "https://wa.me/573242877331"
          }
        ]
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
      backgroundColor: '#000000',
      fontFamily: 'var(--font-sans), system-ui, sans-serif',
      color: '#ffffff',
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

        /* ── GLOBALS ── */
        .section-title { font-size: clamp(32px, 5vw, 48px); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 20px; line-height: 1.1; color: #f8fafc; text-align: center; }
        .section-subtitle { font-size: clamp(16px, 2vw, 18px); color: #94a3b8; max-width: 680px; margin: 0 auto 60px; text-align: center; line-height: 1.6; }
        .btn-primary { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; padding: 14px 28px; border-radius: 99px; font-weight: 700; font-size: 16px; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); display: inline-flex; justify-content: center; align-items: center; text-decoration: none; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3); }
        .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 24px rgba(139, 92, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.4); filter: brightness(1.1); }
        .btn-secondary { background: rgba(255,255,255,0.05); color: #f8fafc; padding: 14px 28px; border-radius: 99px; font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-flex; justify-content: center; align-items: center; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }

        /* ── NAVBAR ── */
        .nav-wrapper { padding: 20px 48px; display: flex; alignItems: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(14px); position: sticky; top: 0; z-index: 100; background: rgba(8,17,31,0.82); }
        .nav-left { flex: 1; display: flex; align-items: center; gap: 12px; }
        .nav-center { display: flex; align-items: center; justify-content: center; gap: 32px; }
        .nav-right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
        .nav-link { color: #a1a1aa; text-decoration: none; font-weight: 600; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #f8fafc; }
        .nav-hamburger { display: none; background: transparent; border: none; color: #f8fafc; cursor: pointer; padding: 6px; }
        .nav-mobile-menu { display: none; flex-direction: column; gap: 8px; padding: 16px 24px 20px; background: rgba(18,18,20,0.97); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .nav-mobile-menu.open { display: flex; }
        .nav-mobile-link { color: #a1a1aa; text-decoration: none; font-size: 16px; font-weight: 500; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }

        /* ── HERO ── */
        .hero-section { position: relative; padding: 120px 24px 80px; text-align: left; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; max-width: 1200px; margin: 0 auto; align-items: center; }
        .hero-spotlight { position: absolute; top: -20%; left: 10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%); filter: blur(60px); pointer-events: none; z-index: 0; }
        .hero-content { position: relative; z-index: 10; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); color: #c4b5fd; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
        .hero-title { font-size: clamp(40px, 6vw, 64px); font-weight: 800; line-height: 1.05; letter-spacing: -0.04em; margin-bottom: 24px; color: #fff; }
        .hero-title span { background: linear-gradient(135deg, #c4b5fd, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { font-size: clamp(16px, 2vw, 20px); color: #94a3b8; line-height: 1.6; margin-bottom: 40px; max-width: 540px; }
        .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        .hero-microcopy { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; font-weight: 500; }
        
        .hero-visual { position: relative; z-index: 5; display: flex; justify-content: center; perspective: 1000px; }
        .hero-mockup-wrapper { width: 100%; max-width: 500px; transform: rotateY(-15deg) rotateX(5deg); transition: transform 0.5s; box-shadow: -20px 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(139,92,246,0.2); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .hero-mockup-wrapper:hover { transform: rotateY(0deg) rotateX(0deg); }
        .hero-mockup-wrapper img { width: 100%; display: block; }

        /* ── BANDA CONFIANZA ── */
        .trust-band { background: #050505; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 40px 24px; }
        .trust-grid { max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-around; gap: 24px; text-align: center; }
        .trust-item { display: flex; flex-direction: column; align-items: center; }
        .trust-number { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.02em; }
        .trust-label { font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        /* ── PROBLEM ── */
        .problem-section { padding: 100px 24px; background: linear-gradient(180deg, #000 0%, #09090b 100%); }
        .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
        .problem-card { background: rgba(24,24,27,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 32px; transition: all 0.3s; position: relative; overflow: hidden; }
        .problem-card:hover { background: rgba(39,39,42,0.6); border-color: rgba(255,255,255,0.1); transform: translateY(-5px); }
        .problem-icon { width: 48px; height: 48px; background: rgba(239,68,68,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: #ef4444; }
        .problem-title { font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; }
        .problem-desc { color: #94a3b8; font-size: 15px; line-height: 1.6; }

        /* ── SOLUTION ── */
        .solution-section { padding: 120px 24px; max-width: 1200px; margin: 0 auto; }
        .solution-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; margin-top: 60px; }
        .solution-item { display: flex; flex-direction: column; gap: 16px; }
        .solution-item-title { font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 12px; }
        .solution-item-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #1e1e2e, #2d2d3d); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); }
        .solution-item-desc { color: #a1a1aa; line-height: 1.6; font-size: 15px; }

        /* ── PRODUCT TABS ── */
        .product-section { padding: 100px 24px; background: #09090b; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .product-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 350px 1fr; gap: 60px; align-items: center; }
        .product-tabs { display: flex; flex-direction: column; gap: 12px; }
        .product-tab { text-align: left; background: transparent; border: 1px solid transparent; border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.3s; }
        .product-tab:hover { background: rgba(255,255,255,0.03); }
        .product-tab.active { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }
        .product-tab-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
        .product-tab-desc { color: #94a3b8; font-size: 14px; line-height: 1.5; }
        .product-visual { background: #000; border-radius: 24px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .product-visual img { width: 100%; border-radius: 12px; display: block; border: 1px solid rgba(255,255,255,0.05); }

        /* ── AUTHORITY & EEAT ── */
        .eeat-section { padding: 100px 24px; max-width: 1200px; margin: 0 auto; position: relative; }
        .eeat-bg { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(59,130,246,0.05) 0%, transparent 70%); pointer-events: none; }
        .eeat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; position: relative; z-index: 2; }
        .eeat-card { background: #09090b; padding: 32px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
        .eeat-icon { width: 56px; height: 56px; margin: 0 auto 20px; background: rgba(255,255,255,0.03); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #3b82f6; }
        .eeat-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .eeat-desc { color: #888; font-size: 14px; line-height: 1.6; }

        /* ── TESTIMONIALS ── */
        .testimo-section { padding: 100px 24px; background: #09090b; }
        .testimo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
        .testimo-card { background: #000; padding: 40px 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); position: relative; }
        .testimo-quote { color: #cbd5e1; font-size: 16px; line-height: 1.7; font-style: italic; margin-bottom: 24px; }
        .testimo-author { display: flex; align-items: center; gap: 16px; }
        .testimo-avatar { width: 48px; height: 48px; border-radius: 50%; background: #2d2d3d; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 18px; }
        .testimo-name { font-weight: 700; color: #fff; font-size: 15px; margin-bottom: 4px; }
        .testimo-role { color: #64748b; font-size: 13px; }

        /* ── PRICING ── */
        .pricing-section-new { padding: 120px 24px; max-width: 1200px; margin: 0 auto; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .pricing-card { background: #09090b; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px 32px; display: flex; flex-direction: column; position: relative; }
        .pricing-card.popular { border-color: rgba(139,92,246,0.5); background: linear-gradient(180deg, rgba(139,92,246,0.05) 0%, #09090b 100%); box-shadow: 0 20px 60px rgba(139,92,246,0.1); }
        .pricing-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 16px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em; }
        .pricing-price { font-size: 42px; font-weight: 800; color: #fff; display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
        .pricing-period { font-size: 16px; color: #888; font-weight: 500; }
        .pricing-name { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .pricing-desc { color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 32px; min-height: 42px; }
        .btn-pricing { background: #ffffff; color: #000000; width: 100%; padding: 14px; border-radius: 99px; font-weight: 700; font-size: 15px; border: none; cursor: pointer; margin-bottom: 32px; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .btn-pricing:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 12px 24px rgba(255, 255, 255, 0.25), 0 0 15px rgba(139, 92, 246, 0.4); background: #f8fafc; }
        .btn-pricing.popular-btn { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; }
        .btn-pricing.popular-btn:hover { box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4); filter: brightness(1.1); }
        .pricing-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
        .pricing-feature { display: flex; align-items: flex-start; gap: 12px; color: #e2e8f0; font-size: 14px; line-height: 1.4; }

        /* ── FINAL CTA ── */
        .cta-section { padding: 0 24px 100px; }
        .cta-box { max-width: 1200px; margin: 0 auto; background: linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 100%); border: 1px solid rgba(139,92,246,0.3); border-radius: 32px; padding: 80px 40px; text-align: center; position: relative; overflow: hidden; }
        .cta-title { font-size: clamp(32px, 5vw, 54px); font-weight: 800; color: #fff; margin-bottom: 24px; letter-spacing: -0.03em; }
        .cta-desc { font-size: 18px; color: #cbd5e1; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }

        /* ── FOOTER ── */
        .footer-wrapper { padding: 80px 48px 40px; background: #000; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 32px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }

        /* ── MODAL ── */
        .pricing-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .pricing-modal-card { width: 100%; max-width: 520px; overflow: auto; max-height: min(88vh, 760px); border-radius: 28px; border: 1px solid rgba(255,255,255,0.14); background: #09090b; box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: fadeUp 0.3s ease both; }
        .pricing-modal-header { padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .pricing-modal-form { padding: 24px 32px 32px; }
        .modal-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 16px; color: #fff; font-size: 15px; font-family: inherit; margin-bottom: 16px; transition: all 0.2s; }
        .modal-input:focus { border-color: #8b5cf6; background: rgba(139,92,246,0.05); outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* ── RESPONSIVE ── */
        @media (max-width: 980px) {
          .hero-section { grid-template-columns: 1fr; text-align: center; }
          .hero-desc { margin: 0 auto 40px; }
          .hero-ctas { justify-content: center; }
          .hero-microcopy { justify-content: center; }
          .hero-visual { margin-top: 40px; }
          .product-container { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 768px) {
          .nav-wrapper { padding: 16px 20px; }
          .nav-center, .nav-right { display: none; }
          .nav-hamburger { display: flex; }
          .cta-box { padding: 60px 24px; }
          .floating-whatsapp { bottom: 20px; right: 20px; width: 50px; height: 50px; }
          .floating-whatsapp svg { width: 28px; height: 28px; }
        }

        /* ── FLOATING WHATSAPP ── */
        .floating-whatsapp {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background-color: #25d366;
          color: #FFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(37, 211, 102, 0.4);
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .floating-whatsapp:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 35px rgba(37, 211, 102, 0.6);
          background-color: #1ebe57;
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <div className="nav-wrapper">
          <div className="nav-left">
            <div style={{ width: 32, height: 32, position: 'relative' }}>
              <Image src="/logo.png" alt="Logo RestoPOS" fill style={{ objectFit: 'contain' }} priority />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>RESTO POS</span>
          </div>

          <div className="nav-center">
            <a href="#solucion" className="nav-link">Plataforma</a>
            <a href="#beneficios" className="nav-link">Beneficios</a>
            <a href="#pricing" className="nav-link">Planes</a>
            <a href="#faq" className="nav-link">Soporte</a>
          </div>

          <div className="nav-right">
            <a href="/pos" onClick={() => trackCampaignEvent('cta_click', { cta_id: 'nav_login' })} className="btn-secondary" style={{ padding: '8px 24px', fontSize: 13 }}>
              Iniciar Sesión
            </a>
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setNavOpen(o => !o)}
            aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`nav-mobile-menu${navOpen ? ' open' : ''}`}>
          <a href="#solucion" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Plataforma</a>
          <a href="#beneficios" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Beneficios</a>
          <a href="#pricing" className="nav-mobile-link" onClick={() => setNavOpen(false)}>Precios</a>
          <a href="/pos" style={{ marginTop: 16, display: 'block', textAlign: 'center', padding: '14px', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }} onClick={() => { setNavOpen(false); trackCampaignEvent('cta_click', { cta_id: 'mobile_login' }); }}>
            Iniciar Sesión
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header className="hero-section">
        <div className="hero-spotlight"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} /> Facturación electrónica y control total en 1 solo sistema.
          </div>
          <h1 className="hero-title">
            Elimina las Fugas de Dinero y <span>Toma el Control Total de tu Restaurante.</span>
          </h1>
          <p className="hero-desc">
            Integra comandas, inventario exacto y facturación DIAN en un solo flujo. Audita cada peso que entra y sale, reduce tiempos de espera y deja de perder dinero por descontrol operativo.
          </p>
          <div className="hero-ctas">
            <button onClick={() => { setShowModal(true); trackCampaignEvent('cta_click', { cta_id: 'hero_free_trial' }); }} className="btn-primary">
              Iniciar Prueba Gratis (14 días)
            </button>
            <a href={SALES_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Agendar Demostración
            </a>
          </div>
          <div className="hero-microcopy">
            <ShieldCheck size={16} color="#10b981" /> Configuración en 10 minutos. No requiere tarjeta de crédito.
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-mockup-wrapper">
            <Image src="/preview-analytics.png" alt="RestoPOS Analytics Dashboard" width={800} height={600} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
          </div>
        </div>
      </header>

      {/* ── BANDA DE CONFIANZA ── */}
      <div className="trust-band">
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-number">+450</div>
            <div className="trust-label">Restaurantes Activos en Colombia</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">+1.2M</div>
            <div className="trust-label">Comandas procesadas sin fallos</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">30%</div>
            <div className="trust-label">Reducción promedio en tiempos</div>
          </div>
        </div>
      </div>

      {/* ── PROBLEMA ── */}
      <section className="problem-section">
        <h2 className="section-title">Tu restaurante pierde rentabilidad todos los días y no sabes exactamente dónde.</h2>
        <p className="section-subtitle">El caos operativo es invisible hasta que cuentas la caja. Así es como estás perdiendo dinero hoy:</p>
        
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon"><Users size={24} /></div>
            <h3 className="problem-title">Meseros lentos = Clientes molestos</h3>
            <p className="problem-desc">Tomar pedidos en papel genera errores, platos fríos y retrasos en cocina que cuestan ventas repetidas.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon"><Package size={24} /></div>
            <h3 className="problem-title">Inventario ciego = Fugas silenciosas</h3>
            <p className="problem-desc">Sin saber tus costos reales, los ingredientes caducan o desaparecen de bodega reduciendo drásticamente tu margen de ganancia.</p>
          </div>
          <div className="problem-card">
            <div className="problem-icon"><Receipt size={24} /></div>
            <h3 className="problem-title">Cierres de caja y DIAN = Estrés</h3>
            <p className="problem-desc">Cuadrar la caja a medianoche y pagar contadores externos para la facturación electrónica te quita tiempo, dinero y paz mental.</p>
          </div>
        </div>
      </section>

      {/* ── SOLUCIÓN & BENEFICIOS ── */}
      <section id="beneficios" className="solution-section">
        <h2 className="section-title">Unifica tu operación. Sin hardware costoso, sin integraciones complicadas.</h2>
        <p className="section-subtitle">RestoPOS conecta la mesa, la cocina, la caja y la DIAN en una sola plataforma en la nube que funciona desde cualquier tablet o computadora.</p>
        
        <div className="solution-grid">
          <div className="solution-item">
            <div className="solution-item-icon"><ShieldCheck size={20} color="#10b981" /></div>
            <h3 className="solution-item-title">Evita pérdidas invisibles</h3>
            <p className="solution-item-desc">Audita cada cancelación, descuento y apertura de cajón. El acceso por PIN asegura que cada mesero sea responsable de sus movimientos.</p>
          </div>
          <div className="solution-item">
            <div className="solution-item-icon"><Zap size={20} color="#8b5cf6" /></div>
            <h3 className="solution-item-title">Reduce tiempos de atención</h3>
            <p className="solution-item-desc">Las comandas viajan de la mesa a la cocina en un segundo. Rotas más mesas, facturas más dinero en el mismo turno.</p>
          </div>
          <div className="solution-item">
            <div className="solution-item-icon"><LayoutGrid size={20} color="#f97316" /></div>
            <h3 className="solution-item-title">Controla cada peso</h3>
            <p className="solution-item-desc">Conoce tu costo de venta real. Recibe alertas antes de que se agoten tus insumos más rentables y automatiza tus compras.</p>
          </div>
        </div>
      </section>

      {/* ── PRODUCTO (TABS) ── */}
      <section id="solucion" className="product-section">
        <div className="product-container">
          <div className="product-tabs">
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: 40, fontSize: 32 }}>Del pedido a la facturación en 4 pasos exactos</h2>
            
            <button className={`product-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              <div className="product-tab-title"><Smartphone size={20} color={activeTab === 0 ? '#8b5cf6' : '#a1a1aa'} /> 1. Pedido en Mesa</div>
              <div className="product-tab-desc">El mesero toma el pedido en una tablet. Upselling automático sugerido por el sistema sin errores de escritura.</div>
            </button>
            
            <button className={`product-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              <div className="product-tab-title"><UtensilsCrossed size={20} color={activeTab === 1 ? '#f97316' : '#a1a1aa'} /> 2. Producción Inteligente</div>
              <div className="product-tab-desc">La order entra a la pantalla KDS con tiempos límite. El chef no lee papel arrugado, lee prioridades visuales.</div>
            </button>

            <button className={`product-tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <div className="product-tab-title"><LayoutGrid size={20} color={activeTab === 2 ? '#3b82f6' : '#a1a1aa'} /> 3. Cobro Rápido</div>
              <div className="product-tab-desc">Split de cuentas, propinas calculadas y cierre de mesa en 3 toques exactos.</div>
            </button>

            <button className={`product-tab ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
              <div className="product-tab-title"><Cloud size={20} color={activeTab === 3 ? '#ec4899' : '#a1a1aa'} /> 4. Legalidad (DIAN)</div>
              <div className="product-tab-desc">Emisión instantánea de la factura electrónica POS directo al correo del cliente. Cero multas y cero esfuerzo.</div>
            </button>
          </div>
          
          <div className="product-visual">
            <Image 
              src={activeTab === 0 ? "/preview-waiter.png" : activeTab === 1 ? "/preview-kds.png" : activeTab === 2 ? "/preview-dashboard.png" : "/preview-analytics.png"} 
              alt="Plataforma RestoPOS" 
              width={800} height={600}
              style={{ transition: 'opacity 0.3s', width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (EEAT - Experience) ── */}
      <section className="testimo-section">
        <h2 className="section-title">Restauradores que dejaron de apagar incendios</h2>
        <p className="section-subtitle">Casos reales de negocios que blindaron sus finanzas con datos exactos.</p>
        
        <div className="testimo-grid">
          <div className="testimo-card">
            <Quote size={32} color="rgba(139,92,246,0.2)" style={{ position: 'absolute', top: 32, right: 32 }} />
            <p className="testimo-quote">"Antes perdíamos hasta $500.000 COP mensuales en mermas inexplicables. Con el control de inventario de RestoPOS detectamos la fuga en la primera semana."</p>
            <div className="testimo-author">
              <div className="testimo-avatar">A</div>
              <div>
                <div className="testimo-name">Andrés M.</div>
                <div className="testimo-role">Propietario de Pizzería</div>
              </div>
            </div>
          </div>
          
          <div className="testimo-card">
            <Quote size={32} color="rgba(139,92,246,0.2)" style={{ position: 'absolute', top: 32, right: 32 }} />
            <p className="testimo-quote">"El módulo KDS eliminó los gritos en la cocina los fines de semana. Nuestros tiempos de entrega bajaron 12 minutos por mesa."</p>
            <div className="testimo-author">
              <div className="testimo-avatar">C</div>
              <div>
                <div className="testimo-name">Carlos T.</div>
                <div className="testimo-role">Chef Ejecutivo</div>
              </div>
            </div>
          </div>

          <div className="testimo-card">
            <Quote size={32} color="rgba(139,92,246,0.2)" style={{ position: 'absolute', top: 32, right: 32 }} />
            <p className="testimo-quote">"Poder emitir facturas DIAN directamente desde la caja sin pagar otro software externo nos redujo los costos fijos. Operación 100% legal y rápida."</p>
            <div className="testimo-author">
              <div className="testimo-avatar">V</div>
              <div>
                <div className="testimo-name">Valeria R.</div>
                <div className="testimo-role">Gerente Administrativa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AUTORIDAD & CONFIANZA (EEAT - Authority & Trust) ── */}
      <section className="eeat-section">
        <div className="eeat-bg"></div>
        <h2 className="section-title">Respaldado por Movilcom Tecnology Solution</h2>
        <p className="section-subtitle">No somos una startup improvisada. Desarrollamos infraestructura transaccional de alto tráfico. Tu negocio y tus datos fiscales están en manos de arquitectos de software expertos.</p>
        
        <div className="eeat-grid">
          <div className="eeat-card">
            <div className="eeat-icon"><ShieldCheck size={24} /></div>
            <h3 className="eeat-title">Aislamiento Multi-Tenant (RLS)</h3>
            <p className="eeat-desc">Tus datos financieros jamás se cruzan con los de otro restaurante. Infraestructura privada con grado bancario.</p>
          </div>
          <div className="eeat-card">
            <div className="eeat-icon"><Globe size={24} /></div>
            <h3 className="eeat-title">Uptime del 99.9% Garantizado</h3>
            <p className="eeat-desc">Bases de datos alojadas en Supabase con tolerancia a fallos. Si tu restaurante está abierto, el sistema está arriba.</p>
          </div>
          <div className="eeat-card">
            <div className="eeat-icon"><CheckCircle2 size={24} /></div>
            <h3 className="eeat-title">Cumplimiento DIAN 2026</h3>
            <p className="eeat-desc">Estándares de facturación electrónica actualizados y avalados por proveedores tecnológicos. Evita cierres y sanciones.</p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="pricing-section-new">
        <h2 className="section-title">Paga solo lo que necesitas para escalar</h2>
        <p className="section-subtitle">Recupera la inversión en tu primer mes al eliminar mermas y errores manuales.</p>
        
        <div className="pricing-grid">
          {/* Plan Pro */}
          <div className="pricing-card">
            <h3 className="pricing-name">Pro</h3>
            <p className="pricing-desc">Para negocios que necesitan orden inmediato y auditar su caja diaria.</p>
            <div className="pricing-price">$49.900 <span className="pricing-period">/mes</span></div>
            <button onClick={() => { setSelectedPlan('Pro'); setShowModal(true); trackCampaignEvent('cta_click', { plan: 'Pro' }); }} className="btn-pricing">Prueba Gratis 14 Días</button>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Toma de pedidos ágil</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Dashboard Analítico</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Máx. 2 Meseros Activos</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Soporte por Email</li>
            </ul>
          </div>

          {/* Plan Pro-plus */}
          <div className="pricing-card popular">
            <div className="pricing-badge">Más Elegido</div>
            <h3 className="pricing-name">Pro-plus</h3>
            <p className="pricing-desc">Para negocios que requieren control de bodega y tranquilidad legal total (DIAN).</p>
            <div className="pricing-price">$89.900 <span className="pricing-period">/mes</span></div>
            <button onClick={() => { setSelectedPlan('Pro-plus'); setShowModal(true); trackCampaignEvent('cta_click', { plan: 'Pro-plus' }); }} className="btn-pricing popular-btn">Prueba Gratis 14 Días</button>
            <div style={{ color: '#fff', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>Todo lo de Pro, más:</div>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="#3b82f6" style={{ flexShrink: 0 }} /> Facturación Electrónica DIAN</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#3b82f6" style={{ flexShrink: 0 }} /> Meseros Ilimitados</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#3b82f6" style={{ flexShrink: 0 }} /> Pantallas de Cocina KDS</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#3b82f6" style={{ flexShrink: 0 }} /> Control Exacto de Inventario</li>
            </ul>
          </div>

          {/* Plan Enterprise */}
          <div className="pricing-card">
            <h3 className="pricing-name">Enterprise</h3>
            <p className="pricing-desc">Para franquicias que manejan altas operaciones y múltiples bodegas.</p>
            <div className="pricing-price">$149.900 <span className="pricing-period">/mes</span></div>
            <button onClick={() => { setSelectedPlan('Enterprise'); setShowModal(true); trackCampaignEvent('cta_click', { plan: 'Enterprise' }); }} className="btn-pricing">Contactar Ventas</button>
            <div style={{ color: '#fff', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>Todo lo de Pro-plus, más:</div>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Gestión Multi-Sucursal</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Integración API Personalizada</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Soporte Prioritario WhatsApp</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="#8b5cf6" style={{ flexShrink: 0 }} /> Capacitación Presencial</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 className="section-title">Preguntas Frecuentes</h2>
        <p className="section-subtitle">Resolvemos tus dudas técnicas y operativas con total transparencia.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
              <button
                onClick={() => {
                  setOpenFaq(openFaq === idx ? null : idx);
                  if (openFaq !== idx) trackCampaignEvent('faq_opened', { faq_index: idx, faq_question: faq.q });
                }}
                aria-expanded={openFaq === idx}
                style={{ width: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                {faq.q}
                <ChevronDown size={20} color="#8b5cf6" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
              </button>
              <div style={{ maxHeight: openFaq === idx ? 200 : 0, opacity: openFaq === idx ? 1 : 0, overflow: 'hidden', transition: 'all 0.3s ease-in-out' }}>
                <p style={{ padding: '0 24px 24px', color: '#a1a1aa', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-box">
          <h2 className="cta-title">Deja de adivinar si tu restaurante es rentable.</h2>
          <p className="cta-desc">Configura tu cuenta en menos de 10 minutos. Únete a los negocios que auditan cada centavo sin estrés.</p>
          <button onClick={() => { setShowModal(true); trackCampaignEvent('cta_click', { cta_id: 'final_free_trial' }); }} className="btn-primary" style={{ fontSize: 18, padding: '16px 36px' }}>
            Iniciar Prueba Gratis (14 días)
          </button>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 16 }}><ShieldCheck size={14} style={{display:'inline', marginBottom:-2}}/> No pedimos tarjeta de crédito. Cancelas cuando quieras.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-wrapper">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, position: 'relative' }}>
                <Image src="/logo.png" alt="Logo RestoPOS" fill style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>RESTO POS</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
              Sistema POS premium líder en la gestión de alta eficiencia y control exacto para restaurantes de alta demanda.
              <br /><br />
              <strong>📍 Cali, Colombia</strong>
            </p>
            <a href={SALES_WHATSAPP_URL} aria-label="Contactar por WhatsApp" target="_blank" rel="noopener noreferrer" onClick={() => trackCampaignEvent('contact_sales_whatsapp')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>
              <MessageCircle size={16} style={{ marginRight: 8 }} /> Hablar con Asesor
            </a>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Producto SaaS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link href="#solucion" className="nav-link">Arquitectura POS</Link>
              <Link href="/dian-docs" className="nav-link">Cumplimiento DIAN</Link>
              <Link href="/blog" className="nav-link">Recursos para Restaurantes</Link>
              <Link href="#pricing" className="nav-link">Licencias Comerciales</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Compañía</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" onClick={() => trackCampaignEvent('visit_developer_site')} className="nav-link">Movilcom Tecnology Solution</a>
              <Link href="/refund-policy" className="nav-link">Políticas de Reembolso</Link>
              <Link href="/terms" className="nav-link">Términos de Servicio</Link>
              <Link href="/privacy" className="nav-link">Aviso de Privacidad</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Desarrollado con altos estándares por <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f8fafc', fontWeight: 600, textDecoration: 'none' }}>Movilcom TS</a>
          </p>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} RestoPOS. Infraestructura Segura.</p>
        </div>
      </footer>

      {/* ── MODAL DE REGISTRO / PAGO ── */}
      {showModal && (
        <div className="pricing-modal-overlay">
          <div className="pricing-modal-card">
            <div className="pricing-modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, position: 'relative' }}>
                      <Image src="/logo.png" alt="RestoPOS" fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Configuración Segura</div>
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Crea tu Tenant</h3>
                  <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8, margin: 0 }}>Completa tus datos para aprovisionar tu base de datos y facturación.</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="pricing-modal-form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Nombre del Restaurante</label>
                <input required type="text" className="modal-input" placeholder="Ej. Pizzería La Nonna" value={formData.restaurantName} onChange={e => setFormData({ ...formData, restaurantName: e.target.value })} disabled={isProcessingPayment} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>NIT o RUT Oficial</label>
                <input required type="text" className="modal-input" placeholder="Ej. 900.123.456-7" value={formData.nit} onChange={e => setFormData({ ...formData, nit: e.target.value })} disabled={isProcessingPayment} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Correo del Administrador</label>
                <input required type="email" className="modal-input" placeholder="gerencia@restaurante.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={isProcessingPayment} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Teléfono Móvil (WhatsApp)</label>
                <input required type="tel" className="modal-input" placeholder="+57 300 000 0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} disabled={isProcessingPayment} />
              </div>

              <button type="submit" disabled={isProcessingPayment} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16 }}>
                {isProcessingPayment ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={18} style={{ marginRight: 8 }} /> Procesar Pago Seguro (Mercado Pago)</>}
              </button>
              
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="#10b981" /> Certificado SSL 256-bits. Conexión segura.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── BOTÓN FLOTANTE WHATSAPP ── */}
      <a 
        href={SALES_WHATSAPP_URL} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-whatsapp"
        onClick={() => trackCampaignEvent('floating_whatsapp_click')}
        aria-label="Contactar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      </a>
    </main>
  );

}
