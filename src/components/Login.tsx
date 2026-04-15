'use client';
import { useState } from 'react';
import { Lock, ArrowRight, Loader2, LayoutGrid, Users, UtensilsCrossed } from 'lucide-react';
import { loginWithPin } from '@/app/actions/auth';

type Role = 'admin' | 'waiter' | 'kitchen';
const SHOW_LOGIN_HINTS = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SHOW_LOGIN_HINTS === 'true';

const ROLES = [
  {
    id: 'admin' as Role,
    label: 'Administrador',
    desc: 'Dashboard, analíticas, inventario y gestión completa',
    icon: LayoutGrid,
    accent: true,
  },
  {
    id: 'waiter' as Role,
    label: 'Mesero',
    desc: 'Mapa de mesas, toma de pedidos y facturación',
    icon: Users,
    accent: false,
  },
  {
    id: 'kitchen' as Role,
    label: 'Cocina',
    desc: 'Panel de pedidos activos, estados y tiempos de preparación',
    icon: UtensilsCrossed,
    accent: false,
    orange: true,
  },
];

export default function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRoleConfig = selectedRole ? ROLES.find((role) => role.id === selectedRole) : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    const result = await loginWithPin(selectedRole, pin);
    if (result.success) {
      onLogin(selectedRole);
    } else {
      setError(result.message || 'No fue posible iniciar sesión con este PIN.');
      setLoading(false);
      setPin('');
    }
  };

  const roleLabel = selectedRoleConfig?.label || 'Acceso';
  const roleDescription = selectedRoleConfig?.desc || 'Acceso operativo';
  const roleHint = SHOW_LOGIN_HINTS
    ? selectedRole === 'kitchen'
      ? 'PIN de desarrollo: 5678'
      : 'PIN de desarrollo: 1234'
    : null;

  return (
    <div
      className="glass-login-screen"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(900px 540px at 82% 12%, rgba(37,99,235,0.34), transparent 55%), radial-gradient(760px 460px at 18% 92%, rgba(249,115,22,0.18), transparent 58%), radial-gradient(520px 320px at 55% 45%, rgba(124,58,237,0.12), transparent 60%), linear-gradient(135deg, #071525 0%, #0a2b56 45%, #0b4a8f 100%)'
      }}
    >
      <style>{`
        @keyframes glassFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes glassAppear {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .glass-login-screen::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.22;
          pointer-events: none;
        }
        .glass-shape {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255,255,255,0.28), rgba(255,255,255,0.02));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 40px rgba(3, 7, 18, 0.22);
          filter: blur(0.2px);
          animation: glassFloat 7s ease-in-out infinite;
        }
        .glass-shape-a { width: 132px; height: 34px; top: 16%; left: 12%; transform: rotate(-42deg); opacity: 0.5; }
        .glass-shape-b { width: 108px; height: 32px; top: 23%; left: 26%; transform: rotate(42deg); animation-delay: 1s; opacity: 0.58; }
        .glass-shape-c { width: 168px; height: 42px; bottom: 20%; right: 11%; transform: rotate(26deg); animation-delay: 1.5s; opacity: 0.46; }
        .glass-shape-d { width: 180px; height: 42px; bottom: 12%; left: 8%; transform: rotate(-34deg); animation-delay: 2s; opacity: 0.3; }
        .glass-shape-e { width: 200px; height: 48px; top: 18%; right: 16%; transform: rotate(-58deg); animation-delay: 2.4s; opacity: 0.24; }
        .glass-login-shell {
          width: min(1080px, 100%);
          position: relative;
          z-index: 2;
          animation: glassAppear 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .glass-login-frame {
          background: linear-gradient(180deg, rgba(7,35,74,0.62), rgba(5,29,64,0.5));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 30px;
          padding: clamp(20px, 3vw, 34px);
          backdrop-filter: blur(18px);
          box-shadow: 0 36px 90px rgba(2, 6, 23, 0.44), inset 0 1px 0 rgba(255,255,255,0.12);
          position: relative;
          overflow: hidden;
        }
        .glass-login-frame::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(460px 180px at 8% 10%, rgba(255,255,255,0.08), transparent 70%);
          pointer-events: none;
        }
        .glass-login-grid {
          display: grid;
          grid-template-columns: minmax(280px, 1.05fr) minmax(320px, 430px);
          gap: clamp(20px, 4vw, 54px);
          align-items: center;
          position: relative;
          z-index: 2;
        }
        .glass-brand-block {
          padding: clamp(8px, 1vw, 14px);
          color: #eff6ff;
        }
        .glass-brand-header {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(125,211,252,0.2);
        }
        .glass-brand-logo {
          width: clamp(96px, 10vw, 122px);
          height: clamp(96px, 10vw, 122px);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04));
          border: 1px solid rgba(255,255,255,0.24);
          box-shadow: 0 24px 54px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255,255,255,0.16);
          margin-bottom: 22px;
        }
        .glass-brand-logo img {
          width: 78%;
          height: 78%;
          object-fit: contain;
          filter: drop-shadow(0 10px 18px rgba(255,255,255,0.1));
        }
        .glass-brand-title {
          margin: 0 0 12px;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 0.98;
          letter-spacing: -0.05em;
          font-weight: 800;
          max-width: 440px;
          font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
        }
        .glass-brand-title span {
          display: block;
          color: rgba(255,255,255,0.78);
          font-size: clamp(18px, 2vw, 24px);
          letter-spacing: -0.02em;
          margin-top: 10px;
        }
        .glass-brand-copy {
          margin: 0 0 18px;
          max-width: 420px;
          color: rgba(226,232,240,0.84);
          font-size: 15px;
          line-height: 1.7;
        }
        .glass-brand-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .glass-brand-pill {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(8, 24, 48, 0.34);
          border: 1px solid rgba(255,255,255,0.16);
          color: #e0f2fe;
          font-size: 12px;
          font-weight: 600;
        }
        .glass-login-card {
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          border: 1px solid rgba(255,255,255,0.24);
          border-radius: 28px;
          padding: clamp(22px, 2.6vw, 28px);
          backdrop-filter: blur(20px);
          box-shadow: 0 26px 70px rgba(2, 6, 23, 0.44), inset 0 1px 0 rgba(255,255,255,0.16);
        }
        .glass-login-card::before {
          content: '';
          position: absolute;
          inset: 10px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .glass-login-card-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .glass-mini-logo {
          width: 58px;
          height: 58px;
          margin: 0 auto 14px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.24);
        }
        .glass-mini-logo img { width: 70%; height: 70%; object-fit: contain; }
        .glass-card-title {
          margin: 0 0 6px;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
        }
        .glass-card-subtitle {
          margin: 0;
          color: rgba(226,232,240,0.78);
          font-size: 13px;
          line-height: 1.5;
        }
        .glass-role-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .glass-role-card {
          width: 100%;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(4,22,44,0.4), rgba(5,19,38,0.24));
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          color: inherit;
        }
        .glass-role-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.24);
          box-shadow: 0 18px 30px rgba(3, 7, 18, 0.18);
        }
        .glass-role-icon {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
        }
        .glass-role-copy strong {
          display: block;
          color: #fff;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .glass-role-copy span {
          display: block;
          color: rgba(226,232,240,0.72);
          font-size: 12px;
          line-height: 1.45;
        }
        .glass-back-button {
          background: none;
          border: none;
          color: rgba(226,232,240,0.82);
          cursor: pointer;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding: 0;
        }
        .glass-form-label {
          display: block;
          color: rgba(226,232,240,0.82);
          font-size: 12px;
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .glass-pin-input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 16px;
          background: rgba(7,20,40,0.34);
          color: #fff;
          font-size: 28px;
          letter-spacing: 0.48em;
          text-align: center;
          padding: 16px 14px;
          outline: none;
          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .glass-pin-input:focus {
          border-color: rgba(125,211,252,0.56);
          box-shadow: 0 0 0 4px rgba(56,189,248,0.12);
          background: rgba(7,20,40,0.48);
        }
        .glass-submit-button {
          width: 100%;
          margin-top: 4px;
          border: none;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #f97316, #7c3aed 52%, #2563eb);
          box-shadow: 0 16px 30px rgba(37, 99, 235, 0.28);
          transition: transform 180ms ease, filter 180ms ease, opacity 180ms ease;
        }
        .glass-submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }
        .glass-submit-button:disabled {
          opacity: 0.46;
          cursor: not-allowed;
          box-shadow: none;
        }
        .glass-error {
          padding: 11px 13px;
          border-radius: 14px;
          background: rgba(127,29,29,0.28);
          border: 1px solid rgba(248,113,113,0.28);
          color: #fecaca;
          font-size: 13px;
        }
        .glass-security-row {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: rgba(226,232,240,0.66);
          font-size: 11px;
          flex-wrap: wrap;
        }
        .glass-card-footnote {
          margin-top: 14px;
          color: rgba(226,232,240,0.72);
          font-size: 12px;
          text-align: center;
        }
        @media (max-width: 920px) {
          .glass-login-grid {
            grid-template-columns: 1fr;
          }
          .glass-brand-block {
            text-align: center;
          }
          .glass-brand-logo {
            margin-left: auto;
            margin-right: auto;
          }
          .glass-brand-copy {
            margin-left: auto;
            margin-right: auto;
          }
          .glass-brand-pills {
            justify-content: center;
          }
          .glass-login-card {
            max-width: 480px;
            margin: 0 auto;
          }
        }
        @media (max-width: 640px) {
          .glass-login-screen {
            padding: 16px !important;
          }
          .glass-shape-c,
          .glass-shape-d,
          .glass-shape-e {
            display: none;
          }
          .glass-login-frame {
            border-radius: 24px;
            padding: 16px;
          }
          .glass-login-card {
            border-radius: 22px;
            padding: 18px;
          }
          .glass-brand-title {
            font-size: 34px;
            line-height: 1.02;
          }
          .glass-brand-copy {
            font-size: 14px;
            line-height: 1.6;
          }
          .glass-brand-pills {
            gap: 8px;
          }
          .glass-brand-pill {
            padding: 9px 12px;
            font-size: 11px;
          }
          .glass-pin-input {
            font-size: 24px;
            padding: 15px 12px;
          }
          .glass-security-row {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <div className="glass-shape glass-shape-a" />
      <div className="glass-shape glass-shape-b" />
      <div className="glass-shape glass-shape-c" />
      <div className="glass-shape glass-shape-d" />
      <div className="glass-shape glass-shape-e" />

      <div className="glass-login-shell">
        <div className="glass-login-frame">
          <div className="glass-login-grid">
            <div className="glass-brand-block">
              <div className="glass-brand-header">
                <img src="/logo.png" alt="Logo RestoPOS" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e0f2fe' }}>RestoPOS Access</span>
              </div>

              <div className="glass-brand-logo">
                <img src="/logo.png" alt="Logo dominante de RestoPOS" />
              </div>

              <h1 className="glass-brand-title">
                Ingresa al sistema
                <span>control operativo para restaurantes</span>
              </h1>

              <p className="glass-brand-copy">
                Una experiencia de acceso más visual, más clara y coherente con la marca RestoPOS. Elige tu perfil y entra directo al flujo que te corresponde.
              </p>

              <div className="glass-brand-pills">
                <span className="glass-brand-pill">Diseño glass</span>
                <span className="glass-brand-pill">Acceso por rol</span>
                <span className="glass-brand-pill">PIN seguro</span>
              </div>
            </div>

            <div className="glass-login-card">
              {!selectedRole ? (
                <>
                  <div className="glass-login-card-header">
                    <div className="glass-mini-logo">
                      <img src="/logo.png" alt="Logo RestoPOS" />
                    </div>
                    <h2 className="glass-card-title">Selecciona tu acceso</h2>
                    <p className="glass-card-subtitle">Cada perfil abre un módulo preparado para su trabajo diario.</p>
                  </div>

                  <div className="glass-role-list">
                    {ROLES.map((role) => {
                      const IconComponent = role.icon;
                      const iconColor = role.accent ? '#7dd3fc' : role.orange ? '#fdba74' : '#cbd5e1';

                      return (
                        <button key={role.id} type="button" className="glass-role-card" onClick={() => setSelectedRole(role.id)}>
                          <div className="glass-role-icon">
                            <IconComponent size={18} color={iconColor} />
                          </div>
                          <div className="glass-role-copy" style={{ flex: 1 }}>
                            <strong>{role.label}</strong>
                            <span>{role.desc}</span>
                          </div>
                          <ArrowRight size={16} color="rgba(226,232,240,0.7)" />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button type="button" className="glass-back-button" onClick={() => { setSelectedRole(null); setPin(''); setError(''); }}>
                    ← Volver a perfiles
                  </button>

                  <div className="glass-login-card-header" style={{ marginBottom: 18 }}>
                    <div className="glass-mini-logo">
                      <img src="/logo.png" alt="Logo RestoPOS" />
                    </div>
                    <h2 className="glass-card-title">{roleLabel}</h2>
                    <p className="glass-card-subtitle">{roleDescription}</p>
                  </div>

                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label className="glass-form-label" htmlFor="role-pin">PIN de acceso</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="role-pin"
                          type="password"
                          maxLength={4}
                          value={pin}
                          onChange={e => { setPin(e.target.value); setError(''); }}
                          placeholder="••••"
                          autoFocus
                          className="glass-pin-input"
                        />
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <Lock size={16} color="rgba(226,232,240,0.84)" />
                        </div>
                      </div>
                    </div>

                    {error ? <div className="glass-error">{error}</div> : null}

                    <button type="submit" disabled={loading || pin.length < 4} className="glass-submit-button">
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : 'Ingresar al sistema'}
                    </button>

                    {roleHint ? (
                      <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(226,232,240,0.68)', margin: 0 }}>{roleHint}</p>
                    ) : null}
                  </form>
                </>
              )}

              <div className="glass-security-row">
                <span>Sesión cifrada</span>
                <span>Control por rol</span>
                <span>PIN de 4 dígitos</span>
              </div>

              <div className="glass-card-footnote">RestoPOS Management System</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
