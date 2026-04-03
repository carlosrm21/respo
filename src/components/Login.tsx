'use client';
import { useEffect, useState } from 'react';
import { ChefHat, Lock, ArrowRight, Loader2, LayoutGrid, Users, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { checkAdminExists, createInitialAdmin, loginAdmin } from '@/app/actions/adminAuth';

type Role = 'admin' | 'waiter' | 'kitchen';

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

const MovilcomFooter = () => (
  <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em', fontWeight: 500 }}>
      by <a href="https://www.movilcomts.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 700, padding: '4px 8px', borderRadius: '8px', transition: 'all 0.3s ease', backgroundImage: 'linear-gradient(to right, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(234, 88, 12, 0.2)' }} onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.textShadow = '0 0 24px rgba(234, 88, 12, 0.5)';
      }} onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.textShadow = '0 0 20px rgba(234, 88, 12, 0.2)';
      }}>Movilcom Tecnology Solution</a>
    </p>
  </div>
);

export default function Login({ onLogin, restaurantName }: { onLogin: (role: Role, user?: string) => void, restaurantName?: string }) {
  const [isFirstSetup, setIsFirstSetup] = useState<boolean | null>(null);
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [pin, setPin] = useState('');
  
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminTotp, setAdminTotp] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAdminExists().then(r => {
      if (r.success && !r.exists) {
        setIsFirstSetup(true);
      } else {
        setIsFirstSetup(false);
      }
    }).catch(() => setIsFirstSetup(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedRole === 'admin') {
      const res = await loginAdmin(adminUser, adminPass, adminTotp);
      if (res.success) {
        onLogin('admin');
      } else if (res.require2FA) {
        setRequire2FA(true);
        if (res.error) setError(res.error);
      } else {
        setError(res.error || 'Credenciales inválidas');
      }
      setLoading(false);
      return;
    }

    const { loginWithPin } = await import('@/app/actions/auth');
    const authRes = await loginWithPin(selectedRole!, pin);
    
    if (authRes.success) {
      onLogin(selectedRole!);
    } else {
      setError(authRes.message || 'PIN incorrecto o licencia inactiva. Verifica la base de datos.');
      setPin('');
    }
    setLoading(false);
  };

  const ambientBackground = (
    <>
      <style>{`
        @keyframes float Orb {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-40px) scale(1.1); opacity: 0.6; }
          100% { transform: translateY(0) scale(1); opacity: 0.4; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        .orb-1 {
          position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%); border-radius: 50%; top: -200px; left: -150px; animation: orbit 25s linear infinite; filter: blur(60px); pointer-events: none;
        }
        .orb-2 {
          position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(234, 88, 12, 0.12) 0%, rgba(234, 88, 12, 0) 70%); border-radius: 50%; bottom: -150px; right: -100px; animation: orbit 30s linear infinite reverse; filter: blur(60px); pointer-events: none;
        }
        .login-input {
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none; color: white;
        }
        .login-input:focus {
          background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.25); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.03); transform: translateY(-1px);
        }
        .glass-panel {
          background: rgba(18, 18, 20, 0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 24px 40px -8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05); border-radius: 28px; padding: 32px;
        }
        .role-btn {
          background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .role-btn:hover {
          background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); transform: translateY(-4px) scale(1.02);
        }
      `}</style>
      <div className="orb-1" />
      <div className="orb-2" />
    </>
  );

  if (isFirstSetup === null) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="rgba(255,255,255,0.4)" />
      </div>
    );
  }

  if (isFirstSetup === true) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
         {ambientBackground}
         <div style={{ width: '100%', maxWidth: '420px', zIndex: 1 }} className="anim-fade-up">
           <div className="glass-panel">
             <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
               <img src="/logo.png" alt="RestoPOS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.1))' }} />
             </div>
             
             <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, color: 'white', textShadow: '0 2px 12px rgba(255,255,255,0.1)' }}>Asigna tu Acceso</h2>
             <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
               Crea tu cuenta de <strong style={{ color: 'white' }}>Administrador Principal</strong>. Este será tu acceso irrevocable al sistema {restaurantName || 'RestoPOS'}.
             </p>

             <form onSubmit={async (e) => {
               e.preventDefault();
               setLoading(true); setError('');
               const r = await createInitialAdmin(adminUser, adminPass);
               if (r.success) {
                 setIsFirstSetup(false);
                 setSelectedRole('admin');
                 setRequire2FA(false);
               } else {
                 setError(r.error || 'Error configurando la credencial maestra');
               }
               setLoading(false);
             }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usuario</label>
                  <input required autoFocus placeholder="Ej. gerencia" className="login-input" value={adminUser} onChange={e => setAdminUser(e.target.value)} style={{ padding: '16px', fontSize: 16, borderRadius: '14px' }} />
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contraseña Segura</label>
                  <input required type="password" placeholder="••••••••" className="login-input" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ padding: '16px', fontSize: 16, borderRadius: '14px', letterSpacing: adminPass ? '4px' : 'normal' }} />
               </div>
               
               {error && <div style={{ color: '#fca5a5', fontSize: 14, background: 'rgba(239, 68, 68, 0.1)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
               
               <button disabled={loading || adminUser.length < 3 || adminPass.length < 4} type="submit" 
                style={{
                  marginTop: 8, padding: '16px', fontSize: 16, borderRadius: '14px', fontWeight: 600, 
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none',
                  boxShadow: '0 8px 24px -8px rgba(59, 130, 246, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  cursor: loading || adminUser.length < 3 || adminPass.length < 4 ? 'not-allowed' : 'pointer',
                  opacity: loading || adminUser.length < 3 || adminPass.length < 4 ? 0.7 : 1, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                onMouseEnter={e => { if(!loading && adminUser.length >= 3 && adminPass.length >= 4) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
               >
                 {loading ? <Loader2 size={20} className="animate-spin" /> : 'Confirmar y Continuar'}
               </button>
             </form>
           </div>
         </div>
         <MovilcomFooter />
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {ambientBackground}
        <div style={{ width: '100%', maxWidth: '480px', zIndex: 1 }} className="anim-fade-up">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '56px', paddingLeft: '8px' }}>
            <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.1))' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: 'white', textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>{restaurantName || 'RestoPOS'}</div>
              <div style={{ fontSize: 11.5, color: '#fb923c', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Intelligent SaaS</div>
            </div>
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, color: 'white', paddingLeft: '8px' }}>Bienvenido</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 40, paddingLeft: '8px' }}>Ingresa a tu entorno de trabajo seguro</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ROLES.map(role => {
              const IconComponent = role.icon;
              const isAccent = role.accent;
              const isOrange = role.orange;
              
              const iconColors = isAccent 
                ? { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', color: '#60a5fa' }
                : isOrange 
                ? { bg: 'rgba(234,88,12,0.15)', border: 'rgba(234,88,12,0.3)', color: '#fb923c' }
                : { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' };
                
              const hoverShadow = isAccent 
                ? '0 16px 32px -12px rgba(59, 130, 246, 0.4)'
                : isOrange 
                ? '0 16px 32px -12px rgba(234, 88, 12, 0.4)'
                : '0 16px 32px -12px rgba(0,0,0,0.5)';

              return (
                <button key={role.id}
                  className="glass-panel role-btn"
                  onClick={() => { setSelectedRole(role.id); setError(''); }}
                  style={{ width: '100%', textAlign: 'left', padding: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = hoverShadow + ', inset 0 1px 1px rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 16px 40px -8px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.05)';
                  }}
                >
                  <div style={{ width: 52, height: 52, background: iconColors.bg, border: `1px solid ${iconColors.border}`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComponent size={24} color={iconColors.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, color: 'white' }}>{role.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.5 }}>{role.desc}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={18} color="rgba(255,255,255,0.6)" style={{ transform: 'translateX(1px)' }} />
                  </div>
                </button>
              );
            })}
          </div>

        </div>
        <MovilcomFooter />
      </div>
    );
  }

  const roleLabel = selectedRole === 'admin' ? 'Administrador' : selectedRole === 'waiter' ? 'Mesero' : 'Cocina';
  const roleHint = selectedRole === 'kitchen' ? 'PIN de Cocina del sistema' : 'PIN de Mesero asignado';

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {ambientBackground}
      <div style={{ width: '100%', maxWidth: '420px', zIndex: 1 }} className="anim-fade-up">
        
        <button onClick={() => { setSelectedRole(null); setPin(''); setError(''); setRequire2FA(false); setAdminPass(''); setAdminTotp(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, marginBottom: 36, display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
          ← Volver atrás
        </button>

        <div className="glass-panel">
          <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <img src="/logo.png" alt="RestoPOS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: selectedRole === 'kitchen' ? 'drop-shadow(0 4px 12px rgba(234,88,12,0.3))' : 'drop-shadow(0 4px 12px rgba(255,255,255,0.1))' }} />
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10, color: 'white', textShadow: '0 2px 8px rgba(255,255,255,0.1)' }}>Acceso Seguro</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 36 }}>
            Terminal para <strong style={{ color: 'white', fontWeight: 600 }}>{roleLabel}</strong>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedRole === 'admin' ? (
              !require2FA ? (
                 <>
                   <input required placeholder="Usuario" className="login-input" value={adminUser} onChange={e => { setAdminUser(e.target.value); setError(''); }} style={{ padding: '16px', fontSize: 16, borderRadius: '14px' }} />
                   <input required type="password" placeholder="Contraseña" className="login-input" value={adminPass} onChange={e => { setAdminPass(e.target.value); setError(''); }} style={{ padding: '16px', fontSize: 16, borderRadius: '14px', letterSpacing: adminPass ? '4px' : 'normal' }} />
                 </>
              ) : (
                 <div style={{ textAlign: 'center', marginBottom: 8 }}>
                   <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Verificación de seguridad. Ingresa tu código temporal.</p>
                   <input autoFocus required type="text" maxLength={6} placeholder="000000" className="login-input" style={{ textAlign: 'center', fontSize: 32, letterSpacing: '12px', padding: '20px', borderRadius: '16px', fontWeight: 800 }} value={adminTotp} onChange={e => { setAdminTotp(e.target.value); setError(''); }} />
                 </div>
              )
            ) : (
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                autoFocus
                placeholder="••••"
                className="login-input"
                value={pin}
                onChange={e => { setPin(e.target.value); setError(''); }}
                style={{ fontSize: 32, letterSpacing: '16px', textAlign: 'center', padding: '20px', borderRadius: '16px' }}
              />
            )}
            
            {error && <div style={{ color: '#fca5a5', fontSize: 14, background: 'rgba(239, 68, 68, 0.1)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            <button type="submit" disabled={loading || (selectedRole !== 'admin' && pin.length < 4)} 
              style={{
                marginTop: 8, padding: '18px 20px', fontSize: 16, borderRadius: '14px', fontWeight: 600, 
                background: selectedRole === 'kitchen' ? 'linear-gradient(135deg, #ea580c, #c2410c)' : 'white',
                color: selectedRole === 'kitchen' ? 'white' : '#09090b',
                border: 'none',
                boxShadow: selectedRole === 'kitchen' ? '0 12px 24px -8px rgba(234, 88, 12, 0.6), inset 0 2px 4px rgba(255,255,255,0.2)' : '0 12px 24px -8px rgba(255,255,255,0.3)',
                cursor: loading || (selectedRole !== 'admin' && pin.length < 4) ? 'not-allowed' : 'pointer',
                opacity: loading || (selectedRole !== 'admin' && pin.length < 4) ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => { if(!loading && !((selectedRole !== 'admin' && pin.length < 4))) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" style={{ marginRight: 10 }} /> Verificando...</> : (require2FA ? 'Verificar Identidad' : 'Acceder al Sistema')}
            </button>
            
            {selectedRole !== 'admin' && <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{roleHint}</p>}
          </form>

        </div>
      </div>
      <MovilcomFooter />
    </div>
  );
}
