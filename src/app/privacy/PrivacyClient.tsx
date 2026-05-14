'use client';
import { ShieldCheck, ArrowLeft, Lock, Eye, Database, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: '1. Recolección de Información',
      icon: Eye,
      content: 'Recolectamos información necesaria para la prestación del servicio POS, incluyendo: nombre del restaurante, NIT, datos de contacto y registros de transacciones. También recolectamos datos técnicos como dirección IP y tipo de navegador para fines de seguridad y mejora del servicio.'
    },
    {
      title: '2. Uso de los Datos',
      icon: Database,
      content: 'Sus datos se utilizan exclusivamente para: (a) Gestionar su suscripción y acceso a RestoPOS; (b) Facilitar la facturación electrónica ante la DIAN; (c) Brindar soporte técnico; (d) Enviar notificaciones críticas sobre el servicio.'
    },
    {
      title: '3. Seguridad de la Información',
      icon: Lock,
      content: 'Implementamos medidas de seguridad de grado bancario, incluyendo cifrado SSL/TLS para todas las comunicaciones y aislamiento de datos mediante Row Level Security (RLS) en nuestras bases de datos Supabase. Sus datos fiscales y financieros están protegidos contra accesos no autorizados.'
    },
    {
      title: '4. Compartición con Terceros',
      icon: ShieldCheck,
      content: 'No vendemos ni alquilamos sus datos personales a terceros. Compartimos información estrictamente necesaria con: (a) Proveedores tecnológicos habilitados por la DIAN para la facturación; (b) Pasarelas de pago (MercadoPago) para procesar transacciones; (c) Autoridades legales cuando sea requerido por la normativa colombiana.'
    }
  ];

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
        }
        .policy-section {
          margin-bottom: 40px;
        }
        .policy-section h2 {
          font-size: 20px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .policy-section p {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 15px;
          margin: 0;
        }
        .back-link {
          color: #a1a1aa;
          text-decoration: none;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
          margin-bottom: 32px;
        }
        .back-link:hover { color: #f8fafc; }
        
        @media (max-width: 768px) {
          .glass-card { padding: 24px; }
        }
      `}</style>

      <nav style={{ padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>RestoPOS Privacy</span>
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/terms" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Términos</Link>
            <Link href="/refund-policy" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Reembolsos</Link>
            <Link href="/dian-docs" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>DIAN</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 80px' }}>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <header style={{ marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 99, marginBottom: 20 }}>
            <Lock size={14} color="#c084fc" />
            <span style={{ color: '#c084fc', fontSize: 12, fontWeight: 600 }}>Protección de Datos SaaS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>Aviso de Privacidad</h1>
          <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, maxWidth: 600 }}>
            Su privacidad y la seguridad de sus datos comerciales son fundamentales para RestoPOS y Movilcom Tecnology Solution.
          </p>
        </header>

        <div className="glass-card">
          {sections.map((s, idx) => (
            <section key={idx} className="policy-section">
              <h2><s.icon size={20} color="#8b5cf6" /> {s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}

          <div style={{ marginTop: 40, padding: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="#c084fc" /> Derechos ARCO
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, por favor contacte a nuestro Oficial de Privacidad a través de los canales de soporte de Movilcom Tecnology Solution.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c084fc', fontSize: 14, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={16} /> Contactar a Soporte
              </a>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 60, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Última actualización: 13 de mayo de 2026.
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
            © {new Date().getFullYear()} RestoPOS - Movilcom Tecnology Solution.
          </p>
        </footer>
      </div>
    </main>
  );
}
