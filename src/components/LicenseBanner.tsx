'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, CreditCard, Trash2, X } from 'lucide-react';

type StatusCode = 'active_paid' | 'active_trial' | 'trial_warning' | 'expired_grace' | 'expired_final' | null;

interface LicenseInfo {
  statusCode: StatusCode;
  message: string;
  paymentRequired: boolean;
  daysRemaining: number;
  graceDaysRemaining: number;
  plan: string;
}

const PAYMENT_URL = 'https://mpago.li/2cBBftf';

export default function LicenseBanner() {
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/license-check')
      .then(r => r.json())
      .then(data => {
        if (data.success) setLicense(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // No mostrar si está cargando, fue descartado, o la licencia está OK sin advertencias
  if (loading || dismissed || !license) return null;
  if (license.statusCode === 'active_paid' || license.statusCode === 'active_trial') return null;

  const isWarning = license.statusCode === 'trial_warning';
  const isGrace = license.statusCode === 'expired_grace';
  const isFinal = license.statusCode === 'expired_final';

  const bgColor = isFinal ? 'rgba(127,29,29,0.95)' : isGrace ? 'rgba(120,53,15,0.95)' : 'rgba(30,58,138,0.95)';
  const borderColor = isFinal ? 'rgba(248,113,113,0.4)' : isGrace ? 'rgba(251,191,36,0.4)' : 'rgba(147,197,253,0.4)';
  const Icon = isFinal ? Trash2 : isGrace ? AlertTriangle : Clock;
  const iconColor = isFinal ? '#f87171' : isGrace ? '#fbbf24' : '#93c5fd';

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'min(680px, calc(100vw - 32px))',
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 16,
      padding: '14px 18px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icono */}
      <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, background: `${iconColor}20`, border: `1px solid ${iconColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={iconColor} />
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
          {license.message}
        </p>
        {isGrace && (
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            En {license.graceDaysRemaining} días hábiles tus datos y configuración serán eliminados permanentemente.
          </p>
        )}
        {isFinal && (
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Contacta soporte en WhatsApp o activa tu plan para recuperar el acceso.
          </p>
        )}
      </div>

      {/* Botón de pago */}
      {license.paymentRequired && (
        <a
          href={PAYMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#fff',
            color: '#1e3a5f',
            fontWeight: 700,
            fontSize: 13,
            padding: '8px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <CreditCard size={14} />
          Activar plan
        </a>
      )}
      {isWarning && (
        <a
          href={PAYMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 12,
            padding: '7px 12px',
            borderRadius: 8,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          <CreditCard size={13} />
          Ver planes
        </a>
      )}

      {/* Cerrar (solo si no es crítico) */}
      {!license.paymentRequired && (
        <button
          onClick={() => setDismissed(true)}
          style={{ flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 4 }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
