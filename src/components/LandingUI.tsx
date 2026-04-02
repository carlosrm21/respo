'use client';
import { useState } from 'react';
import { ChefHat, ArrowRight, LayoutGrid, Users, UtensilsCrossed, Sparkles, CheckCircle2, ShieldCheck, Zap, Smartphone, Receipt, Package, Star, MessageCircle, ChevronDown, Quote } from 'lucide-react';

export default function LandingUI() {
  const features = [
    {
      icon: LayoutGrid,
      title: 'Dashboard Analítico',
      desc: 'Control total de tu negocio con métricas en tiempo real. Ventas, inventario y gestión completa desde un solo lugar.',
      color: '#8b5cf6'
    },
    {
      icon: Users,
      title: 'Sistema de Meseros',
      desc: 'Toma de pedidos ágil, mapa visual de mesas y control de facturación simplificado para maximizar el servicio.',
      color: '#3b82f6'
    },
    {
      icon: UtensilsCrossed,
      title: 'KDS para Cocina',
      desc: 'Pantallas interactivas para gestión de comandas, control de tiempos de preparación y estados de los pedidos.',
      color: '#f97316'
    },
    {
      icon: ShieldCheck,
      title: 'Seguridad basada en Roles',
      desc: 'Acceso seguro mediante PIN por cada tipo de empleado. Permisos limitados a lo que cada uno necesita ver y hacer.',
      color: '#10b981'
    },
    {
      icon: Receipt,
      title: 'Facturación Electrónica',
      desc: 'Emisión directa de facturas y boletas electrónicas validables. Integración rápida y sin fricción con la normativa tributaria.',
      color: '#ec4899'
    },
    {
      icon: Package,
      title: 'Control de Inventario',
      desc: 'Administración de stock inteligente, seguimiento de mermas y alertas automatizadas para tus ingredientes clave.',
      color: '#eab308'
    }
  ];

  const highlights = [
    'Actualizaciones en Tiempo Real',
    'Reportes de P&L Automáticos',
    'Soporte a Múltiples Zonas del Restaurante',
    'Facturación Electrónica Integrada',
    'Control de Inventario y Mermas',
    'Auditoría y Log de Accesos'
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Andrés M.", role: "Propietario de Franquicia", rating: 5,
      text: "Con RestoPOS logramos reducir el tiempo de toma de pedidos a la mitad, y ahora las mermas están calculadas a la perfección."
    },
    {
      name: "Valeria R.", role: "Gerente Operativa", rating: 5,
      text: "La integración directa de la facturación electrónica DIAN nos quitó un dolor de cabeza contable. El sistema se paga solo."
    },
    {
      name: "Carlos T.", role: "Chef Ejecutivo", rating: 5,
      text: "El KDS de cocina revolucionó nuestro flujo de trabajo. Cero comandas perdidas de papel. Todo es tiempo real."
    }
  ];

  const faqs = [
    {
      q: "¿RestoPOS funciona en tablets e iPads para meseros?",
      a: "Sí. Está diseñado como una PWA. Tus meseros pueden instalar el sistema en sus pantallas y utilizarlo fluidamente como una app nativa."
    },
    {
      q: "¿La Facturación Electrónica DIAN requiere otro software?",
      a: "No, la emisión de comprobantes ocurre de forma directa e integrada, asegurando que cumplas los requisitos normativos sin salir de RestoPOS."
    },
    {
      q: "¿Cuántos usuarios o mesas puedo crear en el sistema?",
      a: "Operamos bajo un modelo transparente anual: acceso a la plataforma sin límites ridículos por cada mesa o dispositivo."
    },
    {
      q: "¿Es funcional si se interrumpe mi wifi local?",
      a: "La administración es un SaaS en la nube con altos niveles de uptime (Disponibilidad). Garantizamos robustez tecnológica."
    }
  ];

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#09090b',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1), transparent 50%), radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.1), transparent 50%)',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: '#f8fafc',
      overflowX: 'hidden'
    }}>
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
        
        .hero-title {
          background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .feature-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(39, 39, 42, 0.6) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .btn-primary {
          transition: all 0.2s;
        }
        .btn-primary:hover {
          filter: brightness(1.1);
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
        }
      `}</style>
      
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2e1065, #1e3a8a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChefHat size={20} color="#f8fafc" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>RestoPOS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 14, fontWeight: 500, color: '#a1a1aa' }}>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Características</a>
          <a href="#benefits" style={{ color: 'inherit', textDecoration: 'none' }}>Beneficios</a>
          <a href="/pos" className="btn-primary" style={{ padding: '10px 20px', background: '#8b5cf6', color: '#fff', borderRadius: '99px', textDecoration: 'none', fontWeight: 600 }}>
            Ir al Login →
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header aria-label="Introducción" style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: '#8b5cf6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '99px', marginBottom: 32 }}>
          <Sparkles size={16} color="#c084fc" />
          <span style={{ color: '#c084fc', fontSize: 13, fontWeight: 600 }}>La nueva era de la gestión gastronómica</span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, maxWidth: 900, margin: '0 auto 24px' }}>
          Tecnología de punta para restaurantes visionarios
        </h1>
        
        <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 48px' }}>
          Optimiza tus operaciones, deleita a tus clientes e incrementa tus ganancias con nuestro ecosistema de punto de venta y gestión integral.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <a href="/pos" aria-label="Ir a Iniciar Sesión en RestoPOS" className="btn-primary" style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', borderRadius: '16px', textDecoration: 'none', fontWeight: 600, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Iniciar Sistema <ArrowRight size={18} />
          </a>
          <a href="https://www.movilcomts.com" aria-label="Visitar página corporativa del desarrollador" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', borderRadius: '16px', textDecoration: 'none', fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
            Conocer al Desarrollador
          </a>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>Todo lo que tu restaurante necesita</h2>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Herramientas especializadas pensadas para cada rol de tu equipo.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ padding: '32px', background: 'rgba(24, 24, 27, 0.4)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
              <div style={{ width: 56, height: 56, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <f.icon size={28} color={f.color} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#f8fafc' }}>{f.title}</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section id="benefits" style={{ padding: '80px 24px', background: 'linear-gradient(180deg, rgba(24,24,27,0) 0%, rgba(24,24,27,0.5) 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 24, lineHeight: 1.2 }}>Rendimiento ultrarrápido y seguro</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Desarrollado con las últimas tecnologías del mercado, garantizando que tu operación nunca se detenga. Desde la impresión de tickets hasta notificaciones push.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} color="#8b5cf6" />
                  <span style={{ color: '#cbd5e1', fontSize: 14 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 300, height: 400, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Smartphone size={64} color="#8b5cf6" style={{ opacity: 0.5 }} />
                <Zap size={48} color="#fcd34d" style={{ opacity: 0.8 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>Adquiere tu licencia</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          Potencia tu restaurante hoy mismo con un sistema diseñado para profesionales.
        </p>
        
        <div style={{ maxWidth: 420, margin: '0 auto', background: 'rgba(24, 24, 27, 0.6)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Plan Anual</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
            <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 600 }}>$</span>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>850.000</span>
          </div>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={18} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Gestión ilimitada de mesas y pedidos</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={18} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Perfiles: Administrador, Mesero y Cocina</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}><CheckCircle2 size={18} color="#10b981" /> <span style={{ color: '#cbd5e1', fontSize: 15 }}>Soporte técnico y actualizaciones</span></li>
          </ul>
          
          <div style={{ padding: '14px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 12, border: '1px solid rgba(249, 115, 22, 0.2)', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: '#fb923c', fontSize: 13, margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
              <span style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#fdba74' }}>🔒 Requisito de Acceso</span>
              Para obtener acceso completo a RestoPOS, el pago de la licencia anual debe realizarse por adelantado.
            </p>
          </div>

          <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" aria-label="Comprar Plan Anual" className="btn-primary" style={{ display: 'block', padding: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
            Contratar Plan Anual
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" aria-label="Testimonios de Clientes" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>Confiado por operadores gastronómicos</h2>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Testimonios de quienes revolucionaron su flujo de servicio con RestoPOS.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {testimonials.map((t, idx) => (
            <article key={idx} style={{ padding: '32px', background: 'rgba(24, 24, 27, 0.4)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
              <Quote size={32} color="rgba(139, 92, 246, 0.2)" style={{ position: 'absolute', top: 24, right: 32 }} />
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="#facc15" color="#facc15" />)}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: 15, lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 4 }}>{t.name}</strong>
                <span style={{ color: '#64748b', fontSize: 13 }}>{t.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" aria-label="Preguntas Frecuentes" style={{ padding: '80px 24px', background: 'rgba(24,24,27,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: '#f8fafc' }}>Preguntas Frecuentes</h2>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Resolvemos tus inquietudes para que des el paso a la digitalización.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} 
                style={{ background: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#f8fafc', fontSize: 16, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                  {faq.q}
                  <ChevronDown size={20} color="#94a3b8" style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
                <div style={{ 
                  maxHeight: openFaq === idx ? 200 : 0, 
                  opacity: openFaq === idx ? 1 : 0, 
                  overflow: 'hidden', 
                  transition: 'all 0.3s ease-in-out' 
                }}>
                  <p style={{ padding: '0 24px 24px', color: '#a1a1aa', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Advanced Footer */}
      <footer style={{ padding: '80px 48px 40px', background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #2e1065, #1e3a8a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={16} color="#f8fafc" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>RestoPOS</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Sistema POS premium líder en la gestión de alta eficiencia y control exacto para restaurantes en toda la región.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="https://www.movilcomts.com" aria-label="Soporte y Ventas por Chat" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
                <MessageCircle size={18} /> Contactar a Ventas
              </a>
            </div>
          </div>
          
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Producto SaaS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Características POS</a>
              <a href="#benefits" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Facturación Electrónica DIAN</a>
              <a href="#pricing" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Licencia Comercial</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Empresa</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Acerca del Desarrollador</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Políticas de Privacidad</a>
              <a href="#" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }}>Términos y Condiciones</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Desarrollado y operado por <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#f8fafc', fontWeight: 600, textDecoration: 'none' }}>Movilcom Tecnology Solution</a>
          </p>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} RestoPOS SaaS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}

