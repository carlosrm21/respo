'use client';
import { useState } from 'react';
import { BarChart3, Wallet, Users, LayoutDashboard, UtensilsCrossed, Package, LogOut, Receipt, CalendarDays, QrCode, Shield, UserCheck, DollarSign, Truck, FileText, Printer, Menu, X } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: 'Menú', icon: UtensilsCrossed },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
  { id: 'caja', label: 'Tesorería', icon: Wallet },
  { id: 'staff', label: 'Personal', icon: Users },
];

const opItems = [
  { id: 'historial', label: 'Historial', icon: Receipt },
  { id: 'reservas', label: 'Reservas', icon: CalendarDays },
  { id: 'qr', label: 'QR Mesas', icon: QrCode },
  { id: 'auditoria', label: 'Auditoría', icon: Shield },
  { id: 'turnos', label: 'Turnos', icon: UserCheck },
  { id: 'pl', label: 'P&L Finanzas', icon: DollarSign },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

const configItems = [
  { id: 'fe', label: 'Facturación Elec.', icon: FileText },
  { id: 'ticket', label: 'Ticket POS', icon: Printer },
];

const ALL_ITEMS = [...navItems, ...opItems, ...configItems];

interface Props {
  activeSection: string;
  onSectionChange: (s: string) => void;
  onLogout: () => void;
  restaurantName?: string;
}

export default function AdminSidebar({ activeSection, onSectionChange, onLogout, restaurantName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavButton = ({ item, active }: { item: typeof navItems[0]; active: boolean }) => (
    <button
      key={item.id}
      onClick={() => { onSectionChange(item.id); setMobileOpen(false); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 10px', borderRadius: 'var(--r-md)',
        background: active ? 'var(--accent-muted)' : 'transparent',
        border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
        color: active ? 'var(--accent-hover)' : 'var(--text-2)',
        cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 500 : 400,
        textAlign: 'left', transition: 'all 120ms ease', fontFamily: 'inherit'
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; } }}
    >
      <item.icon size={15} strokeWidth={1.7} />
      {item.label}
    </button>
  );

  const sectionLabel = (label: string) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 6px' }}>
      {label}
    </div>
  );

  const navContent = (
    <>
      {sectionLabel('Gestión')}
      {navItems.map(item => <NavButton key={item.id} item={item} active={activeSection === item.id} />)}
      {sectionLabel('Operaciones')}
      {opItems.map(item => <NavButton key={item.id} item={item} active={activeSection === item.id} />)}
      {sectionLabel('Configuración')}
      {configItems.map(item => <NavButton key={item.id} item={item} active={activeSection === item.id} />)}
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="admin-sidebar-desktop" style={{ width: 224, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, flexShrink: 0 }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{restaurantName || 'RestoPOS'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Admin</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navContent}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={onLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--text-3)' }}>
            <LogOut size={15} strokeWidth={1.7} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="admin-mobile-bar" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26 }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{restaurantName || 'RestoPOS'}</span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 6 }}
          aria-label="Abrir menú de administración"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className="admin-mobile-drawer"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
          width: 260, background: 'var(--surface)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-110%)',
          transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28 }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{restaurantName || 'RestoPOS'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase' }}>Admin</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navContent}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { onLogout(); setMobileOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--text-3)' }}>
            <LogOut size={15} strokeWidth={1.7} /> Cerrar sesión
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
