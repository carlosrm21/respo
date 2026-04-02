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
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }} className="anim-fade-up">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>RestoPOS</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Management System</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>Bienvenido</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 28 }}>Selecciona tu perfil para continuar</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map(role => {
              const IconComponent = role.icon;
              const iconBg = role.accent
                ? 'var(--accent-muted)' : role.orange
                ? 'rgba(234,88,12,0.1)' : 'var(--surface-2)';
              const iconBorder = role.accent
                ? 'var(--accent-border)' : role.orange
                ? 'rgba(234,88,12,0.25)' : 'var(--border-active)';
              const iconColor = role.accent
                ? 'var(--accent-hover)' : role.orange
                ? '#ea580c' : 'var(--text-2)';
              return (
                <button key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 150ms ease', display: 'flex', alignItems: 'center', gap: 16 }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = role.accent ? 'var(--accent-border)' : role.orange ? 'rgba(234,88,12,0.3)' : 'var(--border-active)';
                    el.style.background = role.accent ? 'var(--accent-muted)' : role.orange ? 'rgba(234,88,12,0.05)' : 'var(--surface-2)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--border)';
                    el.style.background = 'var(--surface)';
                  }}
                >
                  <div style={{ width: 40, height: 40, background: iconBg, border: `1px solid ${iconBorder}`, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComponent size={18} color={iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{role.label}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{role.desc}</div>
                  </div>
                  <ArrowRight size={16} color="var(--text-3)" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const roleLabel = selectedRole === 'admin' ? 'administrador' : selectedRole === 'waiter' ? 'mesero' : 'cocina';
  const roleHint = selectedRole === 'kitchen' ? 'PIN: 5678' : 'PIN: 1234';

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }} className="anim-fade-up">
        <button onClick={() => { setSelectedRole(null); setPin(''); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Volver
        </button>

        <div style={{ width: 44, height: 44, background: selectedRole === 'kitchen' ? 'rgba(234,88,12,0.1)' : 'var(--surface-2)', border: `1px solid ${selectedRole === 'kitchen' ? 'rgba(234,88,12,0.25)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Lock size={20} color={selectedRole === 'kitchen' ? '#ea580c' : 'var(--accent-hover)'} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Ingresa tu PIN</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 28 }}>
          Acceso de <strong>{roleLabel}</strong>
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
            style={{ fontSize: 28, letterSpacing: '0.6em', textAlign: 'center', padding: '16px 14px' }}
          />
          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-muted)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading || pin.length < 4} className="btn btn-primary" style={{ marginTop: 4, padding: '12px 18px', opacity: pin.length < 4 ? 0.4 : 1, fontSize: 14, background: selectedRole === 'kitchen' ? '#ea580c' : undefined, borderColor: selectedRole === 'kitchen' ? '#ea580c' : undefined }}>
            {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : 'Continuar →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>{roleHint}</p>
        </form>
      </div>
    </div>
  );
}
