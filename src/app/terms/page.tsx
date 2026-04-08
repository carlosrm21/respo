'use client';
import { ShieldCheck, FileText, Scale, Lock, Globe, Mail, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditions() {
  const sections = [
    {
      title: '1. Aceptación de los Términos',
      icon: CheckCircle2,
      content: 'Al acceder y utilizar el software RestoPOS (el "Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestro software ni los servicios relacionados.'
    },
    {
      title: '2. Licencia de Uso',
      icon: ShieldCheck,
      content: 'Movilcom Tecnology Solution otorga al usuario una licencia anual, no exclusiva y no transferible para utilizar RestoPOS bajo el plan comercial contratado. Esta licencia está condicionada al pago puntual del Plan Anual ($850.000 COP) y al cumplimiento total de estos términos.'
    },
    {
      title: '3. Responsabilidades del Usuario',
      icon: FileText,
      content: 'El usuario es responsable de: (a) Proporcionar información fiscal veraz (NIT, Razón Social); (b) Mantener la seguridad de sus credenciales de acceso; (c) Cumplir con las normativas locales de facturación electrónica (DIAN); (d) El uso lícito de la plataforma para la gestión de su establecimiento.'
    },
    {
      title: '4. Propiedad Intelectual',
      icon: Lock,
      content: 'Todo el contenido, código fuente, logotipos y diseños de RestoPOS son propiedad exclusiva de Movilcom Tecnology Solution. El usuario no podrá copiar, modificar, distribuir ni realizar ingeniería inversa sobre el software sin autorización previa y por escrito.'
    },
    {
      title: '5. Disponibilidad y Soporte',
      icon: Globe,
      content: 'Nos esforzamos por garantizar una disponibilidad del 99.9% del Servicio. No obstante, no nos hacemos responsables por interrupciones debidas a fallas en el proveedor de internet del usuario, mantenimientos programados o problemas técnicos externos a nuestra infraestructura.'
    },
    {
      title: '6. Limitación de Responsabilidad',
      icon: Scale,
      content: 'RestoPOS no se hace responsable de pérdidas financieras, mermas de inventario ni multas fiscales de la DIAN derivadas de un uso incorrecto de la plataforma o de la omisión de las regulaciones vigentes por parte del usuario.'
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
          fontWeight: 600;
        }
        .term-section {
          margin-bottom: 40px;
        }
        .term-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .term-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }
        .term-content {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 15px;
          padding-left: 36px;
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
          .term-content { padding-left: 0; margin-top: 10px; }
        }
      `}</style>

      {/* Navbar Simple */}
      <nav style={{ padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>RestoPOS Legal</span>
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/refund-policy" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Reembolsos</Link>
            <Link href="/dian-docs" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>DIAN</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px 100px' }}>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <header style={{ marginBottom: 64 }}>
          <div className="header-badge">
            <Scale size={14} /> Marco Jurídico SaaS
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>Términos y Condiciones</h1>
          <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, maxWidth: 650 }}>
            Este documento rige la relación contractual entre Movilcom Tecnology Solution y el usuario final del software RestoPOS.
          </p>
        </header>

        <div className="glass-card">
          {sections.map((s, idx) => (
            <section key={idx} className="term-section">
              <div className="term-header">
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color="#8b5cf6" />
                </div>
                <h2>{s.title}</h2>
              </div>
              <p className="term-content">{s.content}</p>
            </section>
          ))}

          <div style={{ marginTop: 48, padding: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="#c084fc" /> Consultas Legales
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Para cualquier aclaración sobre estos términos, por favor contacte a nuestro equipo legal en <strong>gerencia@movilcomts.com</strong>. Estos términos fueron actualizados por última vez el 5 de abril de 2026.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c084fc', fontSize: 14, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={16} /> Contactar a Soporte
              </a>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 80, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Desarrollado para el sector gastronómico de Colombia.
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
            © {new Date().getFullYear()} RestoPOS - Movilcom Tecnology Solution.
          </p>
        </footer>
      </div>
    </main>
  );
}
