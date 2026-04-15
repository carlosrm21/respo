'use client';
import { useState } from 'react';
import { ChefHat, Lock, ArrowRight, Loader2, LayoutGrid, Users, UtensilsCrossed } from 'lucide-react';

type Role = 'admin' | 'waiter' | 'kitchen';

const PINS: Record<Role, string[]> = {
  admin:   ['1234', '0000'],
  waiter:  ['1234', '0000'],
  kitchen: ['5678', '0000'],
};

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const validPins = PINS[selectedRole!] || [];
    if (validPins.includes(pin)) {
      onLogin(selectedRole!);
    } else {
      setError(selectedRole === 'kitchen' ? 'PIN incorrecto. PIN de cocina: 5678' : 'PIN incorrecto. Prueba con 1234');
      setLoading(false);
      setPin('');
    }
  };

  if (!selectedRole) {
    return (
      <div
        className="pos-login-screen"
        style={{
          background: 'radial-gradient(900px 500px at 20% -10%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(700px 420px at 100% 100%, rgba(234,88,12,0.14), transparent 60%), var(--bg)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <style>{`
          @keyframes posFloat {
            0%, 100% { transform: translateY(0px); opacity: 0.9; }
            50% { transform: translateY(-10px); opacity: 1; }
          }
          @keyframes posCardIn {
            from { opacity: 0; transform: translateY(8px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .pos-blob-a,
          .pos-blob-b {
            position: absolute;
            border-radius: 999px;
            pointer-events: none;
            filter: blur(8px);
            animation: posFloat 6s ease-in-out infinite;
          }
          .pos-blob-a {
            width: 220px;
            height: 220px;
            left: -60px;
            top: 40px;
            background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.02) 70%);
          }
          .pos-blob-b {
            width: 180px;
            height: 180px;
            right: -40px;
            bottom: 50px;
            background: radial-gradient(circle, rgba(234,88,12,0.28) 0%, rgba(234,88,12,0.02) 70%);
            animation-delay: 1.4s;
          }
          .pos-login-shell {
            width: 100%;
            max-width: 560px;
            position: relative;
            z-index: 2;
          }
          .pos-login-role-card {
            animation: posCardIn 420ms cubic-bezier(0.22,1,0.36,1) both;
          }
          @media (max-width: 640px) {
            .pos-login-screen { padding: 16px !important; }
            .pos-login-panel { padding: 18px !important; border-radius: 16px !important; }
            .pos-login-headline { font-size: 29px !important; line-height: 1.08 !important; }
            .pos-login-meta-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
            .pos-login-role-card { padding: 14px 14px !important; }
          }
        `}</style>
        <div className="pos-blob-a" />
        <div className="pos-blob-b" />
        <div className="pos-login-shell anim-fade-up">
          <div
            className="pos-login-panel"
            style={{
              background: 'linear-gradient(165deg, rgba(24,24,27,0.92) 0%, rgba(24,24,27,0.78) 100%)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              boxShadow: '0 24px 56px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(16px)',
              padding: '26px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px rgba(99,102,241,0.35)' }}>
                  <ChefHat size={21} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 750, fontSize: 18, letterSpacing: '-0.02em' }}>RestoPOS</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Operations Login</div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#a5b4fc', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 999, padding: '5px 10px', fontWeight: 600 }}>
                Acceso Seguro
              </span>
            </div>

            <h1 className="pos-login-headline" style={{ fontSize: 34, lineHeight: 1.06, fontWeight: 760, letterSpacing: '-0.04em', marginBottom: 10 }}>
              Bienvenido al centro de control
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14.5, marginBottom: 26 }}>
              Elige tu perfil para iniciar. Cada rol muestra solo lo que necesitas para operar rapido y sin errores.
            </p>

            <div className="pos-login-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.28)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#a5b4fc', marginBottom: 3 }}>Rol</div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>Administrador</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Rol</div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>Mesero</div>
              </div>
              <div style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.28)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, color: '#fdba74', marginBottom: 3 }}>Rol</div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>Cocina</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ROLES.map((role, index) => {
                const IconComponent = role.icon;
                const iconBg = role.accent
                  ? 'var(--accent-muted)' : role.orange
                  ? 'rgba(234,88,12,0.14)' : 'var(--surface-2)';
                const iconBorder = role.accent
                  ? 'var(--accent-border)' : role.orange
                  ? 'rgba(234,88,12,0.35)' : 'var(--border-active)';
                const iconColor = role.accent
                  ? 'var(--accent-hover)' : role.orange
                  ? '#f97316' : 'var(--text-2)';
                return (
                  <button key={role.id}
                    className="pos-login-role-card"
                    onClick={() => setSelectedRole(role.id)}
                    style={{ width: '100%', textAlign: 'left', padding: '18px 18px', background: 'linear-gradient(180deg, rgba(39,39,42,0.7), rgba(24,24,27,0.9))', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', transition: 'all 180ms ease', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${100 + index * 70}ms` }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = 'translateY(-2px)';
                      el.style.borderColor = role.accent ? 'var(--accent-border)' : role.orange ? 'rgba(234,88,12,0.45)' : 'var(--border-active)';
                      el.style.boxShadow = role.accent ? '0 10px 24px rgba(99,102,241,0.18)' : role.orange ? '0 10px 24px rgba(234,88,12,0.16)' : 'var(--shadow-sm)';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = 'translateY(0)';
                      el.style.borderColor = 'var(--border)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ width: 42, height: 42, background: iconBg, border: `1px solid ${iconBorder}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComponent size={18} color={iconColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>{role.label}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: 12.5, lineHeight: 1.4 }}>{role.desc}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-3)" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = selectedRole === 'admin' ? 'administrador' : selectedRole === 'waiter' ? 'mesero' : 'cocina';
  const roleHint = selectedRole === 'kitchen' ? 'PIN: 5678' : 'PIN: 1234';

  return (
    <div style={{ background: 'radial-gradient(900px 500px at 20% -10%, rgba(99,102,241,0.2), transparent 55%), radial-gradient(700px 420px at 100% 100%, rgba(234,88,12,0.12), transparent 60%), var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="anim-fade-up">
        <button onClick={() => { setSelectedRole(null); setPin(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver
        </button>

        <div style={{ background: 'linear-gradient(165deg, rgba(24,24,27,0.9) 0%, rgba(24,24,27,0.78) 100%)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 24px 56px rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', padding: 24 }}>
          <div style={{ width: 46, height: 46, background: selectedRole === 'kitchen' ? 'rgba(234,88,12,0.14)' : 'var(--accent-muted)', border: `1px solid ${selectedRole === 'kitchen' ? 'rgba(234,88,12,0.28)' : 'var(--accent-border)'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Lock size={20} color={selectedRole === 'kitchen' ? '#f97316' : 'var(--accent-hover)'} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 750, letterSpacing: '-0.03em', marginBottom: 7 }}>Ingresa tu PIN</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>
            Acceso de <strong style={{ color: 'var(--text)' }}>{roleLabel}</strong>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              placeholder="••••"
              autoFocus
              className="input"
              style={{ fontSize: 30, letterSpacing: '0.52em', textAlign: 'center', padding: '16px 14px', background: 'rgba(39,39,42,0.8)' }}
            />
            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--red-muted)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || pin.length < 4} className="btn btn-primary" style={{ marginTop: 6, padding: '12px 18px', opacity: pin.length < 4 ? 0.45 : 1, fontSize: 14.5, background: selectedRole === 'kitchen' ? '#ea580c' : undefined, borderColor: selectedRole === 'kitchen' ? '#ea580c' : undefined }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : 'Continuar →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{roleHint}</p>
          </form>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--text-3)', fontSize: 11.5 }}>
            <span>Sesion cifrada</span>
            <span>Control por rol</span>
            <span>PIN de 4 digitos</span>
          </div>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--text-3)', fontSize: 11 }}>
          RestoPOS Management System
        </div>
      </div>
    </div>
  );
}
