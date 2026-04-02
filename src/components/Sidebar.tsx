'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  CalendarDays,
  Package,
  Wallet,
  ChefHat,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/mesas', icon: UtensilsCrossed, label: 'Mesas' },
  { href: '/pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { href: '/reservas', icon: CalendarDays, label: 'Reservas' },
  { href: '/productos', icon: Package, label: 'Productos' },
  { href: '/caja', icon: Wallet, label: 'Caja' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ChefHat size={22} color="var(--accent)" />
          <div>
            <h1>RestAdmin</h1>
            <p>Sistema de Gestión</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-title">Principal</span>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          v1.0 · RestAdmin
        </div>
      </div>
    </aside>
  );
}
