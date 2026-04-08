'use client';
import { ChefHat, ArrowLeft, ShieldCheck, RefreshCcw, HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicy() {
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
        .policy-section p, .policy-section li {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 15px;
        }
        .policy-section ul {
          padding-left: 20px;
          margin-top: 12px;
        }
        .policy-section li {
          margin-bottom: 8px;
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

      {/* Navigation */}
      <nav style={{ padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Logo RestoPOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>RestoPOS</span>
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/terms" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Términos y Condiciones</Link>
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
            <ShieldCheck size={14} color="#c084fc" />
            <span style={{ color: '#c084fc', fontSize: 12, fontWeight: 600 }}>Transparencia y Seguridad</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>Política de Devoluciones y Reembolsos</h1>
          <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, maxWidth: 600 }}>
            En RestoPOS nos comprometemos con la satisfacción de nuestros clientes y el cumplimiento de la normativa legal vigente en Colombia.
          </p>
        </header>

        <div className="glass-card">
          <section className="policy-section">
            <h2><RefreshCcw size={20} color="#8b5cf6" /> 1. Derecho de Retracto</h2>
            <p>
              De acuerdo con la <strong>Ley 1480 de 2011 (Estatuto del Consumidor)</strong> en Colombia, usted tiene derecho a retractarse de su compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la contratación y pago del servicio.
            </p>
            <ul>
              <li>El retracto se debe solicitar dentro de los 5 días hábiles posteriores al pago de la licencia anual.</li>
              <li>RestoPOS procederá a la devolución total del dinero en un plazo no mayor a treinta (30) días calendario desde la solicitud.</li>
              <li>El servicio será suspendido inmediatamente tras la solicitud de retracto.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2><ShieldCheck size={20} color="#8b5cf6" /> 2. Condiciones de Reembolso</h2>
            <p>
              Fuera del periodo de retracto legal, RestoPOS evaluará solicitudes de reembolso bajo las siguientes condiciones excepcionales:
            </p>
            <ul>
              <li><strong>Fallas Técnicas Críticas:</strong> Si el software presenta errores que impidan su funcionamiento básico por más de 72 horas consecutivas, atribuibles exclusivamente a nuestra infraestructura.</li>
              <li><strong>Errores de Facturación:</strong> Cobros dobles o montos incorrectos procesados por la pasarela de pagos.</li>
              <li><strong>Incumplimiento de Servicio:</strong> Si las características principales ofrecidas no están disponibles en la plataforma tras la configuración inicial.</li>
            </ul>
            <p style={{ marginTop: 16, color: '#f43f5e', fontSize: 14 }}>
              <strong>Nota:</strong> No se realizarán reembolsos por falta de uso del sistema, cambios en el modelo de negocio del restaurante o solicitudes realizadas después de 30 días de la compra original.
            </p>
          </section>

          <section className="policy-section">
            <h2><FileText size={20} color="#8b5cf6" /> 3. Suscripción Anual</h2>
            <p>
              Nuestra licencia comercial de <strong>$850.000 COP</strong> es de pago anual anticipado. El pago garantiza el acceso a todas las funcionalidades, actualizaciones y soporte técnico por un periodo de 365 días.
            </p>
            <p>
              Al cancelar la suscripción antes de finalizar el año contratado, el usuario mantendrá el acceso hasta la fecha de vencimiento. No se realizarán reembolsos prorrateados por meses no utilizados, a menos que se aplique lo estipulado en la sección 2.
            </p>
          </section>

          <section className="policy-section">
            <h2><HelpCircle size={20} color="#8b5cf6" /> 4. Proceso de Solicitud</h2>
            <p>
              Para solicitar una devolución o reembolso, debe seguir estos pasos:
            </p>
            <ol style={{ paddingLeft: 20, marginTop: 12, color: '#94a3b8' }}>
              <li style={{ marginBottom: 12 }}>Enviar un correo electrónico a <strong>soporte@movilcomts.com</strong> o <strong>gerencia@movilcomts.com</strong>.</li>
              <li style={{ marginBottom: 12 }}>Incluir en el asunto: "Solicitud de Reembolso - [Nombre de su Restaurante]".</li>
              <li style={{ marginBottom: 12 }}>Adjuntar el comprobante de pago de MercadoPago y una breve explicación del motivo.</li>
            </ol>
          </section>

          <div style={{ marginTop: 40, padding: '24px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="#c084fc" /> ¿Necesitas ayuda?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
              Si tienes dudas sobre nuestras políticas, nuestro equipo de soporte está disponible para atenderte a través de los canales oficiales de Movilcom Tecnology Solution.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
              <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#c084fc', fontSize: 14, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={16} /> Contactar Soporte
              </a>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 60, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Última actualización: 5 de abril de 2026.
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
            © {new Date().getFullYear()} RestoPOS - Movilcom Tecnology Solution.
          </p>
        </footer>
      </div>
    </main>
  );
}
