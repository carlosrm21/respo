'use client';
import { useState } from 'react';
import { FileCheck, ShieldCheck, Zap, BookOpen, ExternalLink, Settings, Terminal, CheckCircle2, Info, ArrowLeft, Building2, Key, Code2, Globe } from 'lucide-react';
import Link from 'next/link';
import { trackCampaignEvent } from '@/lib/campaignTracking';

export default function DianDocs() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers = [
    { 
      id: 'siigo',
      name: 'Siigo', 
      desc: 'Proveedor líder en Colombia con infraestructura robusta.', 
      url: 'https://www.siigo.com/blog/siigo-api/',
      steps: [
        'Obtener Partner ID y Access Key desde el portal de API Siigo Nube.',
        'Configurar el entorno en modo Sandbox para pruebas iniciales.',
        'Mapear productos y categorías de RestoPOS con los IDs contables de Siigo.',
        'Realizar el set de pruebas ante la DIAN a través de la integración.'
      ],
      legal: 'Requiere firma digital vigente y resolución de facturación asociada al software Siigo.'
    },
    { 
      id: 'alegra',
      name: 'Alegra', 
      desc: 'Ideal para pymes con necesidad de gestión contable íntegra.', 
      url: 'https://alegra.com',
      steps: [
        'Generar el API Token desde Configuración > API.',
        'Habilitar el webhook de confirmación de emisión en Alegra.',
        'Verificar que el NIT de la organización coincida en ambos sistemas.',
        'Configurar la numeración DIAN en la sección de Terminales de Venta.'
      ],
      legal: 'Alegra actúa como emisor directo. Debes autorizar el software ante la DIAN (Habilitación).'
    },
    { 
      id: 'factus',
      name: 'Factus (DIAN)', 
      desc: 'Especializado en cumplimiento normativo directo.', 
      url: 'https://developers.factus.com.co/',
      steps: [
        'Registrar la aplicación en el portal Factus para obtener Client Id y Secret.',
        'Implementar el flujo OAuth2 para la generación de tokens dinámicos.',
        'Vincular el certificado digital para la firma de XMLs.',
        'Ejecutar las pruebas de consumo de servicio JSON.'
      ],
      legal: 'Validación previa 100% en tiempo real obligatoria para cada transacción.'
    },
    { 
      id: 'loggro',
      name: 'Loggro', 
      desc: 'ERP + Facturación electrónica líder en Colombia.', 
      url: 'https://loggro.com',
      steps: [
        'Obtener el API Token desde el módulo de configuración de Loggro.',
        'Verificar que la resolución de facturación esté habilitada para API.',
        'Configurar el Webhook de notificaciones en el dashboard de RestoPOS.',
        'Realizar sincronización de catálogo de productos inicial.'
      ],
      legal: 'Loggro cumple íntegramente con la Resolución 042 de la DIAN para grandes operaciones.'
    },
  ];

  const currentProvider = selectedProvider ? providers.find(p => p.id === selectedProvider) : null;

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#09090b',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.12), transparent 60%), radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.08), transparent 60%)',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: '#f8fafc',
      overflowX: 'hidden'
    }}>
      <style>{`
        .glass-card {
          background: rgba(24, 24, 27, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 32px;
        }
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 99px;
          margin-bottom: 24px;
          color: #c084fc;
          font-size: 13px;
          font-weight: 600;
        }
        .step-num {
          width: 28px;
          height: 28px;
          background: #8b5cf6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          flex-shrink: 0;
        }
        .doc-section { margin-bottom: 48px; }
        .doc-section h2 {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .doc-section p, .doc-section li { color: #94a3b8; line-height: 1.7; font-size: 15px; }
        .provider-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 24px; }
        .provider-card {
          background: rgba(18, 18, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .provider-card:hover {
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(30, 30, 35, 0.8);
          transform: translateY(-4px);
        }
        .provider-card.active {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
          box-shadow: 0 0 24px rgba(139, 92, 246, 0.1);
        }
        .btn-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-link-internal { background: rgba(139, 92, 246, 0.1); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.2); }
        .btn-link-internal:hover { background: rgba(139, 92, 246, 0.2); }
        .btn-link-external { background: rgba(255, 255, 255, 0.05); color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-link-external:hover { background: rgba(255, 255, 255, 0.1); }

        .code-block {
          background: #000;
          border-radius: 12px;
          padding: 20px;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 13px;
          color: #818cf8;
          border: 1px solid rgba(139, 92, 246, 0.2);
          overflow-x: auto;
          margin: 20px 0;
        }
        .alert-box { background: rgba(234, 179, 8, 0.05); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 16px; padding: 20px; display: flex; gap: 16px; color: #eab308; font-size: 14px; }
        .back-link {
          color: #a1a1aa; text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: color 0.2s; margin-bottom: 32px;
        }
        .back-link:hover { color: #f8fafc; }

        @keyframes flow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulse-purple {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.4); }
        }
        .flow-line {
          stroke-dasharray: 8;
          animation: flow 1s linear infinite;
        }
        .node-pulse {
          animation: pulse-purple 3s ease-in-out infinite;
        }
        @media (max-width: 768px) { .glass-card { padding: 24px; } .provider-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Navbar */}
      <nav style={{ padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>Documentación Técnica</span>
          </Link>
          <Link href="/pos" onClick={() => trackCampaignEvent('cta_click', { cta_id: 'dian_docs_login' })} style={{ padding: '8px 20px', background: '#8b5cf6', color: '#fff', borderRadius: '99px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Probar Sistema
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px 100px' }}>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <header style={{ marginBottom: 64 }}>
          <div className="header-badge">
            <ShieldCheck size={14} /> Facturación Electrónica DIAN Integrada
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 800, color: '#f8fafc', marginBottom: 20, letterSpacing: '-0.04em' }}>
            Guía de Integración DIAN
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, maxWidth: 800 }}>
            Configura la conexión técnica entre RestoPOS y tu proveedor tecnológico autorizado.
          </p>
        </header>

        {/* DIAGRAMA DE FLUJO - MODELO DE OPERACIÓN */}
        <section className="doc-section" style={{ marginBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 12, justifyContent: 'center' }}>
               Modelo de Interoperabilidad
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>
              RestoPOS actúa como el <strong>Integrador</strong> (Software de Gestión) que conecta tu negocio con los Proveedores Tecnológicos Habilitados (PTH).
            </p>
          </div>

          <div className="glass-card" style={{ padding: '80px 40px', position: 'relative' }}>
            <div style={{ minWidth: 800, display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
              
              {/* SVG de fondo para líneas animadas */}
              <svg style={{ position: 'absolute', top: 40, left: '10%', width: '80%', height: 2, overflow: 'visible', zIndex: 0 }}>
                <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="flow-line" />
              </svg>

              {/* Paso 1: RestoPOS */}
              <div className="node-pulse" style={{ textAlign: 'center', width: 160, zIndex: 1 }}>
                <div style={{ width: 85, height: 85, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.08))', border: '2px solid #8b5cf6', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', transition: 'transform 0.3s', padding: 15 }}>
                  <img src="/logo.png?v=3" alt="RestoPOS Branding" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f8fafc', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>RestoPOS</div>
                <div style={{ background: '#8b5cf6', color: '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: 12 }}>INTEGRADOR</div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>Solicitud <strong>JSON</strong> de factura</p>
              </div>

              {/* Paso 2: PTH */}
              <div style={{ textAlign: 'center', width: 160, zIndex: 1 }}>
                <div style={{ width: 85, height: 85, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))', border: '2px solid #3b82f6', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Building2 color="#60a5fa" size={36} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f8fafc', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Factus / Siigo / Alegra</div>
                <div style={{ background: '#3b82f6', color: '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: 12 }}>PROVEEDOR (PTH)</div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>Firma Digital y <strong>XML</strong></p>
              </div>

              {/* Paso 3: DIAN */}
              <div style={{ textAlign: 'center', width: 160, zIndex: 1 }}>
                <div style={{ width: 85, height: 85, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', border: '2px solid #10b981', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <ShieldCheck color="#34d399" size={36} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f8fafc', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>DIAN</div>
                <div style={{ background: '#10b981', color: '#fff', fontSize: 10, padding: '3px 10px', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: 12 }}>AUTORIDAD</div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>Validación y <strong>CUFE</strong></p>
              </div>

              {/* Paso 4: Cliente */}
              <div style={{ textAlign: 'center', width: 160, zIndex: 1 }}>
                <div style={{ width: 85, height: 85, background: 'rgba(255, 255, 255, 0.05)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Globe color="#f8fafc" size={36} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#f8fafc', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Cliente Final</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc', fontSize: 10, padding: '3px 10px', borderRadius: 99, display: 'inline-block', fontWeight: 700, marginBottom: 12 }}>DESTINO</div>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>Email con <strong>PDF + XML</strong></p>
              </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginTop: 80, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#8b5cf6', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Zap size={14} /> Latencia Ultra-Baja
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  La comunicación entre RestoPOS y el PTH ocurre en menos de <strong>300ms</strong>, garantizando que la factura esté lista antes de que el cliente se levante de la mesa.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Settings size={14} /> Firma Delegada
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  El Proveedor Tecnológico aplica la firma electrónica de forma automática, eliminando la necesidad de gestionar certificados locales complejos.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#10b981', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <ShieldCheck size={14} /> Cumplimiento Res. 042
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                  Garantizamos que el documento XML cumple con todos los esquemas XSD y validaciones de la DIAN vigentes para el año 2024.
                </p>
              </div>
          {/* SECCIÓN DE STACK DE PROVEEDORES (ESTILO TECH STACK) */}
        <section className="doc-section" style={{ marginBottom: 100 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#f8fafc', marginBottom: 16, letterSpacing: '-0.02em' }}>
              INTEGRA CON TUS PROVEEDORES FAVORITOS
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
              RestoPOS es el <strong>Software de Gestión</strong> que centraliza tu operación y se comunica de forma nativa con los Proveedores Tecnológicos Habilitados (PTH) más importantes de Colombia.
            </p>
            <div style={{ width: 60, height: 4, background: '#eab308', margin: '30px auto 0', borderRadius: 2 }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, justifyContent: 'center' }}>
            {providers.map((p) => (
              <div 
                key={p.id} 
                onClick={() => {
                  setSelectedProvider(p.id);
                  trackCampaignEvent('dian_provider_selected', { provider: p.id });
                  document.getElementById('detail-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ 
                  background: '#fff', 
                  borderRadius: 24, 
                  padding: '40px 20px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: selectedProvider === p.id ? '0 20px 40px rgba(139, 92, 246, 0.2)' : '0 10px 20px rgba(0,0,0,0.1)',
                  transform: selectedProvider === p.id ? 'scale(1.05) translateY(-10px)' : 'scale(1)',
                  border: selectedProvider === p.id ? '3px solid #8b5cf6' : '3px solid transparent'
                }}
                onMouseOver={(e) => {
                  if (selectedProvider !== p.id) {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedProvider !== p.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{ marginBottom: 16, fontSize: 32, fontWeight: 900, color: '#1e1e2d', letterSpacing: '-0.05em' }}>
                  {p.name === 'Factus (DIAN)' ? 'FACTUS' : p.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Proveedor PTH
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40 }}>
            {/* Logos adicionales de plataformas si hubiera mas */}
            <div style={{ display: 'flex', gap: 12, opacity: 0.4, filter: 'grayscale(1)' }}>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#000' }}>SIIGO</div>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#000' }}>ALEGRA</div>
              <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#000' }}>LOGGRO</div>
            </div>
          </div>
        </section>

        {/* 2. DETALLE DINAMICO */}
        {currentProvider ? (
          <section className="doc-section anim-fade-in" id="detail-section" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, background: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>2</div>
                <h2 style={{ margin: 0 }}>Paso a Paso: {currentProvider.name}</h2>
            </div>
            
            <div className="glass-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, color: '#f8fafc', fontWeight: 700, fontSize: 18 }}>
                    <Settings size={22} color="#8b5cf6" /> Configuración en Panel RestoPOS
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {currentProvider.steps.map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: 14 }}>
                        <div className="step-num">{i + 1}</div>
                        <span style={{ fontSize: 15, color: '#cbd5e1' }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, color: '#f8fafc', fontWeight: 700, fontSize: 18 }}>
                    <ShieldCheck size={22} color="#8b5cf6" /> Requisitos y Enlaces
                  </div>
                  <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', padding: 24, borderRadius: 20, marginBottom: 24 }}>
                    <p style={{ fontSize: 14, margin: 0, color: '#cbd5e1', lineHeight: 1.6 }}>{currentProvider.legal}</p>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '20px 0' }} />
                    
                    <a 
                      href={currentProvider.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 10, 
                        padding: '14px', 
                        background: '#8b5cf6', 
                        color: '#fff', 
                        borderRadius: '12px', 
                        textDecoration: 'none', 
                        fontWeight: 700,
                        fontSize: 14,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                      onClick={() => trackCampaignEvent('dian_external_docs_click_big', { provider: currentProvider.id })}
                    >
                      <Globe size={18} /> Ir a Documentación Oficial de {currentProvider.name}
                    </a>
                  </div>
                  
                  <div className="code-block">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#8b5cf6', fontSize: 12, fontWeight: 700 }}>
                      <Code2 size={14} /> EJEMPLO DE CONSUMO (API)
                    </div>
                    {`POST /api/v1/billing/invoice
Auth: Bearer {YOUR_TOKEN}

{
  "prefix": "SETT",
  "number": 1001,
  "client_nit": "900.123...",
  "total": 850000
}`}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="doc-section">
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <BookOpen size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
              <p style={{ color: '#64748b' }}>Haz clic en un proveedor arriba para ver los pasos de configuración.</p>
            </div>
          </section>
        )}

        {/* 3. PROCESO GENERAL DIAN */}
        <section className="doc-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, background: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>3</div>
            <h2 style={{ margin: 0 }}>Flujo de Habilitación ante la DIAN</h2>
          </div>
          <div className="glass-card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '16px', color: '#f8fafc' }}>Fase</th>
                    <th style={{ padding: '16px', color: '#f8fafc' }}>Descripción del Proceso</th>
                    <th style={{ padding: '16px', color: '#f8fafc' }}>Impacto</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#94a3b8' }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '20px 16px', color: '#8b5cf6', fontWeight: 600 }}>1. Registro</td>
                    <td style={{ padding: '20px 16px' }}>Inscripción oficial en el portal MUISCA de la DIAN como emisor electrónico.</td>
                    <td style={{ padding: '20px 16px' }}>Legal</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '20px 16px', color: '#8b5cf6', fontWeight: 600 }}>2. Habilitación</td>
                    <td style={{ padding: '20px 16px' }}>Asociación del Software RestoPOS con el modo de operación del proveedor.</td>
                    <td style={{ padding: '20px 16px' }}>Técnico</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '20px 16px', color: '#8b5cf6', fontWeight: 600 }}>3. Set de Pruebas</td>
                    <td style={{ padding: '20px 16px' }}>Envío de documentos ficticios para validar la recepción correcta por la DIAN.</td>
                    <td style={{ padding: '20px 16px' }}>Validación</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 600 }}>4. Producción</td>
                    <td style={{ padding: '20px 16px' }}>Solicitud de prefijos y numeración para empezar a facturar legalmente.</td>
                    <td style={{ padding: '20px 16px' }}>Comercial</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="alert-box" style={{ marginTop: 32 }}>
              <Info size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Nota Importante</strong>
                Recuerda que cada proveedor tecnológico puede cobrar una tarifa adicional por el consumo de sus folios de facturación. Consulta sus planes en el Sitio Oficial.
              </div>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 48 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32 }}>
            <div style={{ maxWidth: 400 }}>
              <h4 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Marco Legal</h4>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                RestoPOS facilita la integración, pero la responsabilidad del cumplimiento tributario recae en el representante legal del restaurante ante la DIAN.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>© {new Date().getFullYear()} RestoPOS SaaS.</p>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Bogotá, Colombia</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
