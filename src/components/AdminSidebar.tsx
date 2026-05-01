'use client';
import { BarChart3, Wallet, Users, LayoutDashboard, UtensilsCrossed, Package, LogOut, Receipt, CalendarDays, QrCode, Shield, UserCheck, DollarSign, Truck, FileText, Printer } from 'lucide-react';

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

import { HelpCircle } from 'lucide-react';

const configItems = [
  { id: 'fe', label: 'Facturación Elec.', icon: FileText },
  { id: 'ticket', label: 'Ticket POS', icon: Printer },
  { id: 'instructivo', label: 'Instructivo Impresión', icon: HelpCircle, href: '/instructivo' },
];

interface Props {
  activeSection: string;
  onSectionChange: (s: string) => void;
  onLogout: () => void;
  plan?: string;
}

export default function AdminSidebar({ activeSection, onSectionChange, onLogout, plan = 'Pro' }: Props) {
  const normalizedPlan = plan?.toLowerCase() || 'pro';
  const isProPlus = normalizedPlan.includes('plus') || normalizedPlan.includes('enterprise') || normalizedPlan.includes('annual');
  const isEnterprise = normalizedPlan.includes('enterprise');

  // Filter items based on plan
  const visibleNavItems = navItems.filter(item => {
    if (item.id === 'inventory') return isProPlus;
    if (item.id === 'staff') return isEnterprise;
    return true;
  });

  const visibleOpItems = opItems.filter(item => {
    if (['reservas', 'auditoria', 'turnos', 'pl', 'delivery'].includes(item.id)) return isEnterprise;
    return true;
  });

  const visibleConfigItems = configItems.filter(item => {
    if (item.id === 'fe') return isProPlus;
    return true;
  });
  return (
    <aside style={{ width: 224, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="brand-mark brand-mark-sm" style={{ flexShrink: 0 }}>
          <img src="/logo.png" alt="RestoPOS" className="brand-mark-image" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>RestoPOS</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 8px 6px' }}>
          Gestión
        </div>
        {visibleNavItems.map(item => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
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
        })}

        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 6px' }}>
          Operaciones
        </div>
        {visibleOpItems.map(item => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--r-md)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                color: active ? 'var(--accent-hover)' : 'var(--text-2)',
                cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 500 : 400,
                textAlign: 'left', transition: 'all 120ms ease', fontFamily: 'inherit'
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              <item.icon size={15} strokeWidth={1.7} />
              {item.label}
            </button>
          );
        })}

        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 8px 6px' }}>
          Configuración
        </div>
        {visibleConfigItems.map(item => {
          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  padding: '8px 10px', borderRadius: 'var(--r-md)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--accent-border)',
                  color: 'var(--accent-hover)',
                  cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
                  textAlign: 'left', transition: 'all 120ms ease', fontFamily: 'inherit',
                  textDecoration: 'none', marginTop: 4
                }}
                title="Ver instructivo de impresión"
              >
                <item.icon size={15} strokeWidth={1.7} />
                {item.label}
                <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.7 }}>↗</span>
              </a>
            );
          }
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--r-md)',
                background: active ? 'var(--accent-muted)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                color: active ? 'var(--accent-hover)' : 'var(--text-2)',
                cursor: 'pointer', fontSize: 13.5, fontWeight: active ? 500 : 400,
                textAlign: 'left', transition: 'all 120ms ease', fontFamily: 'inherit'
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              <item.icon size={15} strokeWidth={1.7} />
              {item.label}
            </button>
          );
        })}
      </nav>


      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', gap: 9, fontSize: 13.5, color: 'var(--text-3)' }}
        >
          <LogOut size={15} strokeWidth={1.7} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
