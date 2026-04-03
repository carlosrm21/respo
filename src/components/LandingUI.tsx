'use client';
import { useState } from 'react';
import { ChefHat, ArrowRight, LayoutGrid, Users, UtensilsCrossed, Sparkles, CheckCircle2, ShieldCheck, Zap, Smartphone, Receipt, Package, Star, MessageCircle, ChevronDown, Quote, Loader2, X, Menu } from 'lucide-react';
import { createPaymentPreference } from '@/app/actions/payment';

export default function LandingUI() {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({ restaurantName: '', nit: '', email: '', phone: '' });

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessingPayment(true);
      const result = await createPaymentPreference(formData);
      if (result?.success && result?.initPoint) {
        window.location.href = result.initPoint;
      } else {
        alert("Ocurrió un error al generar la orden de pago. Verifica tu conexión e inténtalo de nuevo.");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado al conectar con el servidor de pagos.");
      setIsProcessingPayment(false);
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
    "creator": {
      "@type": "Organization",
      "name": "Movilcom Tecnology Solution",
      "url": "https://www.movilcomts.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "3"
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#09090b',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.12), transparent 60%), radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.08), transparent 60%)',
      fontFamily: '"Inter", system-ui, sans-serif',
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
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        .hero-title {
          background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
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
          box-shadow: 0 0 28px rgba(139, 92, 246, 0.5);
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
          background: rgba(9,9,11,0.85);
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
          padding: clamp(48px,8vw,80px) 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .preview-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 32px;
        }
        .preview-tab {
          padding: 9px 18px;
          border-radius: 99px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(24,24,27,0.6);
          color: #a1a1aa;
          transition: all 0.2s;
          font-family: inherit;
        }
        .preview-tab:hover { color: #f8fafc; border-color: rgba(255,255,255,0.2); }
        .preview-tab.active {
          background: rgba(139,92,246,0.15);
          border-color: rgba(139,92,246,0.4);
          color: #c084fc;
          font-weight: 600;
        }
        .preview-browser {
          max-width: 1000px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15);
        }
        .preview-browser-bar {
          background: #1c1c1f;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .preview-browser-dots { display: flex; gap: 6px; }
        .preview-browser-url {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .preview-browser img {
          width: 100%;
          display: block;
          aspect-ratio: 16/9;
          object-fit: cover;
          object-position: top;
        }
        .preview-img-enter {
          animation: previewFade 0.35s ease both;
        }
        @keyframes previewFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .preview-tab { font-size: 12px; padding: 7px 14px; }
          .preview-browser-url { display: none; }
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
        .modal-input {
          width: 100%;
          background: #27272a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 15px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .modal-input:focus { border-color: #8b5cf6; }

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

          .footer-wrapper { padding: 48px 24px 32px; }
          .footer-bottom { flex-direction: column; align-items: flex-start; gap: 8px; }

          .features-grid { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .hero-section { padding: 36px 16px 32px; }
          .highlights-grid { grid-template-columns: 1fr; gap: 12px; }
          .pricing-section { padding: 56px 16px; }
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
            <a href="/pos" className="btn-cta" style={{ padding: '10px 22px', background: '#8b5cf6', color: '#fff', borderRadius: '99px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
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
          <a href="/pos" style={{ marginTop: 8, display: 'block', textAlign: 'center', padding: '14px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 16 }} onClick={() => setNavOpen(false)}>
            Iniciar Sesión →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header aria-label="Introducción" className="hero-section">
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(600px, 90vw)', height: 350, background: '#8b5cf6', filter: 'blur(140px)', opacity: 0.12, borderRadius: '50%', pointerEvents: 'none' }} />

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
          <a href="/pos" aria-label="Ir a Iniciar Sesión en RestoPOS" className="btn-cta" style={{ padding: '15px 32px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
          { label: '📊 Dashboard', img: '/preview-dashboard.png', desc: 'Panel de control con estadísticas en tiempo real, mapa de mesas y accesos directos a cada módulo.' },
          { label: '🧑‍💼 Mesero', img: '/preview-waiter.png', desc: 'App de toma de pedidos para meseros: selección de mesa, productos, cantidades y envío directo a cocina.' },
          { label: '👨‍🍳 Cocina KDS', img: '/preview-kds.png', desc: 'Pantalla de cocina con comandas en tiempo real, tiempos de preparación y estados por pedido.' },
          { label: '📈 Analíticas', img: '/preview-analytics.png', desc: 'Reportes de ventas, platillos top, hora pico y gráficos de tendencia para tomar mejores decisiones.' },
          { label: '📦 Inventario', img: '/preview-inventory.png', desc: 'Control de stock con alertas de merma, niveles mínimos y registro de ingredientes por unidad.' },
        ];
        const tab = tabs[activeTab];
        return (
          <section id="preview" className="preview-section" style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.04) 0%, transparent 100%)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 99, marginBottom: 16 }}>
                  <img src="/logo.png" alt="RestoPOS Logo" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                  <span style={{ color: '#c084fc', fontSize: 12, fontWeight: 600 }}>Vista previa de la aplicación</span>
                </div>
                <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Mira RestoPOS en acción</h2>
                <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', maxWidth: 600, margin: '0 auto' }}>Explora cada módulo del sistema antes de suscribirte. Una plataforma diseñada para cada rol de tu equipo.</p>
              </div>

              {/* Tabs */}
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

              {/* Browser frame */}
              <div className="preview-browser">
                {/* Browser top bar */}
                <div className="preview-browser-bar">
                  <div className="preview-browser-dots">
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'block' }} />
                  </div>
                  <div className="preview-browser-url">
                    <img src="/logo.png" alt="RestoPOS" style={{ width: 14, height: 14, objectFit: 'contain', opacity: 0.7 }} />
                    <span>restopos.movilcomts.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src="/logo.png" alt="RestoPOS" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>RestoPOS</span>
                  </div>
                </div>

                {/* Screenshot */}
                <div style={{ position: 'relative', background: '#09090b' }}>
                  <img
                    key={activeTab}
                    src={tab.img}
                    alt={`RestoPOS - ${tab.label}`}
                    className="preview-img-enter"
                    loading="lazy"
                  />
                  {/* Overlay gradient at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, rgba(9,9,11,0.95), transparent)', pointerEvents: 'none' }} />
                  {/* Caption */}
                  <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', padding: '0 24px' }}>
                    <p style={{ color: '#e2e8f0', fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: 500, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)', maxWidth: 700, margin: '0 auto' }}>
                      {tab.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA below preview */}
              <div style={{ textAlign: 'center', marginTop: 36 }}>
                <a href="/pos" className="btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
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

      {/* ── PRICING ── */}
      <section id="pricing" className="pricing-section">
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 14, color: '#f8fafc' }}>Adquiere tu licencia</h2>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(14px, 2vw, 16px)', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
          Potencia tu restaurante hoy mismo con un sistema diseñado para profesionales.
        </p>

        <div style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(24, 24, 27, 0.7)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 24, padding: 'clamp(28px, 6vw, 40px) clamp(20px, 5vw, 32px)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
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
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#fdba74' }}>🔒 Requisito de Acceso</span>
              Para obtener acceso completo a RestoPOS, el pago de la licencia anual debe realizarse por adelantado.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
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
            <a href="https://www.movilcomts.com" aria-label="Contactar al equipo de ventas" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
              <MessageCircle size={16} /> Contactar a Ventas
            </a>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Producto SaaS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Características POS</a>
              <a href="#benefits" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Facturación Electrónica DIAN</a>
              <a href="#pricing" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Licencia Comercial</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Empresa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Acerca del Desarrollador</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Políticas de Privacidad</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Términos y Condiciones</a>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, width: '100%', maxWidth: 480, overflow: 'hidden', animation: 'fadeUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>Crear tu cuenta</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Completa estos datos antes del pago para configurar tu sistema.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                <div>
                  <label htmlFor="restaurantName" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nombre del Restaurante *</label>
                  <input required id="restaurantName" type="text" className="modal-input" value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} placeholder="Ej. Pizzería La Mamma" />
                </div>
                <div>
                  <label htmlFor="nit" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>NIT / Documento Identidad *</label>
                  <input required id="nit" type="text" className="modal-input" value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} placeholder="Ej. 900.123.456-7" />
                </div>
                <div>
                  <label htmlFor="email" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Correo Electrónico *</label>
                  <input required id="email" type="email" className="modal-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="gerencia@restaurante.com" />
                </div>
                <div>
                  <label htmlFor="phone" style={{ display: 'block', color: '#cbd5e1', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Teléfono Movil *</label>
                  <input required id="phone" type="tel" className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+57 300 000 0000" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="btn-cta"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: '12px', border: 'none', cursor: isProcessingPayment ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'inherit', opacity: isProcessingPayment ? 0.7 : 1 }}>
                {isProcessingPayment ? <><Loader2 size={20} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} /> Procesando pago...</> : 'Continuar al pago seguro'}
              </button>
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
