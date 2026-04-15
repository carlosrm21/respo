'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import TableMap from '@/components/TableMap';
import WaiterOrder from '@/components/WaiterOrder';
import FacturacionModal from '@/components/Facturacion';
import CajaControl from '@/components/CajaControl';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Login from '@/components/Login';
import AdminSidebar from '@/components/AdminSidebar';
import ProductManagement from '@/components/ProductManagement';
import Inventario from '@/components/Inventario';
import Staff from '@/components/Staff';
import HistorialFacturas from '@/components/HistorialFacturas';
import Reservas from '@/components/Reservas';
import AuditLog from '@/components/AuditLog';
import QRMesas from '@/components/QRMesas';
import Turnos from '@/components/Turnos';
import PLReport from '@/components/PLReport';
import DeliveryPanel from '@/components/DeliveryPanel';
import FacturacionElectronica from '@/components/FacturacionElectronica';
import TicketPOSConfig from '@/components/TicketPOSConfig';
import KDSPanel from '@/components/KDSPanel';
import { submitOrder } from './actions/pedido';
import { getEstadoCaja } from './actions/caja';
import { getCombos } from './actions/combos';
import { usePushNotifications, sendPushNotification } from '@/hooks/usePushNotifications';
import { useTheme } from '@/hooks/useTheme';
import { trackCampaignEvent } from '@/lib/campaignTracking';
import {
  ChefHat, LogOut, TrendingUp, Users, ShoppingBag,
  Package, Settings, Activity, ExternalLink, Download, Bell, BellOff, Sun, Moon,
  BarChart3, Wallet, Receipt, CalendarDays, QrCode, Shield, FileText, ArrowUpRight, LayoutDashboard
} from 'lucide-react';

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analíticas',
  caja: 'Tesorería',
  menu: 'Gestión de Menú',
  inventory: 'Inventario',
  staff: 'Personal',
  historial: 'Historial de Facturas',
  reservas: 'Reservas',
  qr: 'QR de Mesas',
  auditoria: 'Auditoría',
  turnos: 'Gestión de Turnos',
  pl: 'P&L Finanzas',
  delivery: 'Pedidos Delivery',
  fe: 'Facturación Electrónica',
  ticket: 'Configuración Ticket POS',
};

export default function HomeClient({ mesas, productos }: { mesas: any[], productos: any[] }) {
  const [role, setRole] = useState<'admin' | 'waiter' | 'kitchen' | null>(null);
  const [section, setSection] = useState('dashboard');
  const [selectedMesa, setSelectedMesa] = useState<any | null>(null);
  const [facturarMesa, setFacturarMesa] = useState<any | null>(null);
  const [showCaja, setShowCaja] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState<any>(null);
  const [combos, setCombos] = useState<any[]>([]);
  const [mesasData, setMesasData] = useState<any[]>(mesas);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const push = usePushNotifications();
  const { theme, toggle: toggleTheme } = useTheme();


  // Detect mobile/tablet vs desktop
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    getEstadoCaja().then(r => { if (r.success) setCajaAbierta(r.data); });
    getCombos().then(r => { if (r.success) setCombos(r.data); });
    // Load mesas from REST API (not server action to avoid SSR hydration issues)
    fetch('/api/mesas').then(r => r.json()).then(r => { if (r.success) setMesasData(r.data); });
    setCurrentTime(new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }));

    const url = new URL(window.location.href);
    const paymentStatus = url.searchParams.get('payment');
    if (paymentStatus === 'success') {
      trackCampaignEvent('purchase_success');
    }

    if (paymentStatus === 'failure') {
      trackCampaignEvent('purchase_failure');
    }
  }, []);

  const refreshMesas = useCallback(async (): Promise<any[]> => {
    try {
      const res = await fetch('/api/mesas');
      const r = await res.json();
      if (r.success) {
        setMesasData(r.data);
        return r.data;
      }
    } catch {}
    return [];
  }, []);

  const handleOrderSubmit = async (mesaId: number, items: any[], mesaNumero?: number) => {
    await submitOrder(mesaId, items);
    // Immediately update the mesa to 'ocupada' in local state
    setMesasData(prev => prev.map((m: any) => m.id === mesaId ? { ...m, estado: 'ocupada' } : m));
    // Also reload from DB for accuracy
    await refreshMesas();
    await sendPushNotification(
      `🍽️ Mesa ${mesaNumero ?? mesaId} — Nuevo pedido`,
      `${items.length} producto(s) enviado(s) a cocina`
    );
  };

  const handleMesaClick = (mesa: any) => {
    if (!cajaAbierta) {
      role === 'waiter' ? setShowCaja(true) : setSection('caja');
      return;
    }
    mesa.estado === 'ocupada' ? setFacturarMesa(mesa) : setSelectedMesa(mesa);
  };

  const handleMesaClosed = async (mesaNumero: number) => {
    // Reload mesas after table is closed (DB already updated by cerrarMesaYFacturar)
    await refreshMesas();
    setFacturarMesa(null);
    await sendPushNotification(
      `✅ Mesa ${mesaNumero} — Cerrada`,
      `La mesa ${mesaNumero} ha sido facturada y cerrada`
    );
  };

  if (!role) return <Login onLogin={r => setRole(r as any)} />;

  /* ── KITCHEN (KDS) ── */
  if (role === 'kitchen') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-mark brand-mark-sm">
              <img src="/logo.png" alt="RestoPOS" className="brand-mark-image" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>RestoPOS</span>
            <span style={{ fontSize: 11, background: 'rgba(234,88,12,0.1)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(234,88,12,0.25)', color: '#ea580c' }}>Cocina</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '9px', borderRadius: 8 }} title={theme === 'dark' ? 'Modo día' : 'Modo noche'}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => setRole(null)} className="btn btn-ghost" style={{ padding: '9px 12px', fontSize: 14, gap: 6 }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>
        <div style={{ flex: 1 }}>
          <KDSPanel />
        </div>
      </div>
    );
  }

  /* ── ADMIN ── */
  if (role === 'admin') {
    const totalMesas = mesasData.length;
    const mesasOcupadas = mesasData.filter((mesa: any) => mesa.estado === 'ocupada').length;
    const mesasReservadas = mesasData.filter((mesa: any) => mesa.estado === 'reservada').length;
    const mesasLibres = Math.max(totalMesas - mesasOcupadas - mesasReservadas, 0);
    const ocupacion = totalMesas ? Math.round((mesasOcupadas / totalMesas) * 100) : 0;
    const reservasPct = totalMesas ? Math.round((mesasReservadas / totalMesas) * 100) : 0;
    const actions = [
      { label: 'Analíticas', description: 'Rendimiento por ventas, ticket y mesero.', section: 'analytics', icon: BarChart3 },
      { label: 'Tesorería', description: 'Apertura, cierre y control de caja.', section: 'caja', icon: Wallet },
      { label: 'Historial', description: 'Facturas emitidas y trazabilidad.', section: 'historial', icon: Receipt },
      { label: 'Reservas', description: 'Seguimiento y confirmación de mesas.', section: 'reservas', icon: CalendarDays },
      { label: 'QR Mesas', description: 'Entrega de accesos para autoatención.', section: 'qr', icon: QrCode },
      { label: 'Auditoría', description: 'Cambios sensibles y monitoreo interno.', section: 'auditoria', icon: Shield },
      { label: 'Facturación', description: 'Configuración y operación electrónica.', section: 'fe', icon: FileText },
      { label: 'Respaldo', description: 'Descarga inmediata de la base actual.', href: '/api/backup', icon: Download }
    ];
    const dashboardStats = [
      {
        eyebrow: 'Sala',
        label: 'Mesas activas',
        value: `${mesasOcupadas}/${totalMesas || 0}`,
        meta: `${ocupacion}% de ocupación actual`,
        icon: Activity,
        color: 'var(--accent)',
        progress: ocupacion
      },
      {
        eyebrow: 'Capacidad',
        label: 'Mesas disponibles',
        value: String(mesasLibres),
        meta: mesasLibres > 0 ? 'capacidad inmediata para servicio' : 'sin disponibilidad libre',
        icon: LayoutDashboard,
        color: 'var(--green)',
        progress: totalMesas ? Math.round((mesasLibres / totalMesas) * 100) : 0
      },
      {
        eyebrow: 'Agenda',
        label: 'Reservas pendientes',
        value: String(mesasReservadas),
        meta: mesasReservadas > 0 ? 'requieren seguimiento operativo' : 'sin reservas por gestionar',
        icon: CalendarDays,
        color: 'var(--amber)',
        progress: reservasPct
      },
      {
        eyebrow: 'Tesorería',
        label: 'Estado de caja',
        value: cajaAbierta ? 'Activa' : 'Cerrada',
        meta: cajaAbierta ? 'lista para facturar y cerrar ventas' : 'requiere apertura antes de operar',
        icon: Wallet,
        color: cajaAbierta ? 'var(--green)' : 'var(--red)',
        progress: cajaAbierta ? 100 : 18
      }
    ];
    const operationalFlags = [
      {
        label: 'Notificaciones push',
        value: push.supported ? (push.subscribed ? 'Activas' : 'Desactivadas') : 'No disponibles',
        tone: push.supported && push.subscribed ? 'var(--green)' : 'var(--text-2)'
      },
      {
        label: 'Combos cargados',
        value: `${combos.length}`,
        tone: 'var(--accent)'
      },
      {
        label: 'Modo visual',
        value: theme === 'dark' ? 'Nocturno' : 'Claro',
        tone: 'var(--text)'
      }
    ];
    const roomBreakdown = [
      { label: 'Ocupadas', count: mesasOcupadas, color: 'var(--accent)' },
      { label: 'Libres', count: mesasLibres, color: 'var(--green)' },
      { label: 'Reservadas', count: mesasReservadas, color: 'var(--amber)' }
    ];

    return (
      <div className="app-layout">
        <AdminSidebar activeSection={section} onSectionChange={setSection} onLogout={() => setRole(null)} />

        <div className="main-content">
          {/* Top bar */}
          <header style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg)' }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {SECTION_LABELS[section] || 'Dashboard'}
              </h1>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1, textTransform: 'capitalize' }}>{currentTime}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Link to KDS Kitchen */}
              <a href="/cocina" target="_blank" rel="noopener noreferrer"
                className="btn btn-outline" style={{ fontSize: 12, gap: 5, padding: '6px 12px' }}>
                <ChefHat size={13} /> Cocina
                <ExternalLink size={11} />
              </a>
              {/* Push Notifications toggle */}
              {push.supported && (
                <button
                  onClick={push.subscribed ? push.unsubscribe : push.subscribe}
                  disabled={push.loading}
                  title={push.subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones push'}
                  className="btn btn-outline"
                  style={{ fontSize: 12, gap: 5, padding: '6px 12px', borderColor: push.subscribed ? 'var(--green)' : undefined, color: push.subscribed ? 'var(--green)' : undefined }}
                >
                  {push.subscribed ? <Bell size={13} /> : <BellOff size={13} />}
                  {push.loading ? '...' : push.subscribed ? 'Notif. activas' : 'Activar notif.'}
                </button>
              )}
              <span className={`badge ${cajaAbierta ? 'badge-green' : 'badge-red'}`}
                onClick={() => setSection('caja')} style={{ cursor: 'pointer' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                {cajaAbierta ? 'Caja activa' : 'Caja cerrada'}
              </span>
              <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '7px', borderRadius: 8 }} title={theme === 'dark' ? 'Modo día' : 'Modo noche'}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="btn btn-ghost" style={{ padding: '7px' }}><Settings size={16} /></button>

            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }} className="anim-fade-up" key={section}>
            {section === 'dashboard' && (
              <div className="dashboard-shell">
                <section className="dashboard-hero card">
                  <div className="dashboard-hero-copy">
                    <span className="dashboard-eyebrow">Centro de operaciones</span>
                    <h2 className="dashboard-headline">Dashboard ejecutivo para servicio, caja y control del salón.</h2>
                    <p className="dashboard-subline">
                      Esta vista resume capacidad operativa real, estado del servicio y accesos críticos sin ruido visual ni métricas de relleno.
                    </p>
                    <div className="dashboard-chip-row">
                      <span className="dashboard-chip">{currentTime}</span>
                      <span className={`dashboard-chip ${cajaAbierta ? 'dashboard-chip-success' : 'dashboard-chip-danger'}`}>
                        {cajaAbierta ? 'Caja operativa' : 'Caja pendiente'}
                      </span>
                      <span className="dashboard-chip">
                        {push.supported ? (push.subscribed ? 'Push activado' : 'Push disponible') : 'Push no disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-hero-side">
                    <div className="dashboard-side-metric">
                      <span className="dashboard-side-label">Capacidad disponible</span>
                      <strong>{mesasLibres}</strong>
                      <small>{mesasLibres > 0 ? 'mesas listas para recibir clientes' : 'sin mesas libres ahora'}</small>
                    </div>
                    <div className="dashboard-side-metric">
                      <span className="dashboard-side-label">Cobertura del salón</span>
                      <strong>{ocupacion}%</strong>
                      <small>{mesasOcupadas} ocupadas de {totalMesas || 0} mesas registradas</small>
                    </div>
                  </div>
                </section>

                <div className="dashboard-kpi-grid">
                  {dashboardStats.map((item) => (
                    <article key={item.label} className="dashboard-kpi-card card">
                      <div className="dashboard-kpi-topline">
                        <span>{item.eyebrow}</span>
                        <div className="dashboard-kpi-icon" style={{ color: item.color, background: `${item.color}18`, borderColor: `${item.color}32` }}>
                          <item.icon size={16} />
                        </div>
                      </div>
                      <p className="dashboard-kpi-label">{item.label}</p>
                      <strong className="dashboard-kpi-value">{item.value}</strong>
                      <p className="dashboard-kpi-meta">{item.meta}</p>
                      <div className="dashboard-progress-track">
                        <span style={{ width: `${Math.max(item.progress, 6)}%`, background: item.color }} />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="dashboard-grid">
                  <section className="dashboard-panel card dashboard-panel-main">
                    <div className="dashboard-panel-header">
                      <div>
                        <p className="dashboard-panel-eyebrow">Visión del salón</p>
                        <h3>Mapa operativo de mesas</h3>
                      </div>
                      <div className="dashboard-legend">
                        {roomBreakdown.map((item) => (
                          <span key={item.label}>
                            <i style={{ background: item.color }} />
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="dashboard-room-grid">
                      <div className="dashboard-room-summary">
                        {roomBreakdown.map((item) => {
                          const percentage = totalMesas ? Math.round((item.count / totalMesas) * 100) : 0;
                          return (
                            <div key={item.label} className="dashboard-status-row">
                              <div className="dashboard-status-copy">
                                <span>{item.label}</span>
                                <strong>{item.count}</strong>
                              </div>
                              <div className="dashboard-status-bar">
                                <span style={{ width: `${Math.max(percentage, item.count > 0 ? 10 : 0)}%`, background: item.color }} />
                              </div>
                              <small>{percentage}%</small>
                            </div>
                          );
                        })}
                      </div>

                      <div className="dashboard-table-card">
                        <TableMap initialMesas={mesas} mesas={mesasData} onMesaClick={handleMesaClick} />
                      </div>
                    </div>
                  </section>

                  <div className="dashboard-side-stack">
                    <section className="dashboard-panel card">
                      <div className="dashboard-panel-header">
                        <div>
                          <p className="dashboard-panel-eyebrow">Estado operativo</p>
                          <h3>Señales del turno</h3>
                        </div>
                      </div>

                      <div className="dashboard-ops-list">
                        {operationalFlags.map((flag) => (
                          <div key={flag.label} className="dashboard-ops-item">
                            <span>{flag.label}</span>
                            <strong style={{ color: flag.tone }}>{flag.value}</strong>
                          </div>
                        ))}
                        <div className="dashboard-ops-item">
                          <span>Acceso a cocina</span>
                          <a href="/cocina" target="_blank" rel="noopener noreferrer" className="dashboard-inline-link">
                            Abrir módulo <ArrowUpRight size={14} />
                          </a>
                        </div>
                      </div>
                    </section>

                    <section className="dashboard-panel card">
                      <div className="dashboard-panel-header">
                        <div>
                          <p className="dashboard-panel-eyebrow">Accesos rápidos</p>
                          <h3>Operaciones críticas</h3>
                        </div>
                      </div>

                      <div className="dashboard-actions-grid">
                        {actions.map((item) => item.href ? (
                          <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="dashboard-action-card"
                          >
                            <div className="dashboard-action-icon"><item.icon size={16} /></div>
                            <div>
                              <strong>{item.label}</strong>
                              <p>{item.description}</p>
                            </div>
                          </a>
                        ) : (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setSection(item.section || 'dashboard')}
                            className="dashboard-action-card"
                          >
                            <div className="dashboard-action-icon"><item.icon size={16} /></div>
                            <div>
                              <strong>{item.label}</strong>
                              <p>{item.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {section === 'analytics' && (
              <div className="card" style={{ padding: 24 }}>
                <AnalyticsDashboard onClose={() => setSection('dashboard')} isFullEmbed />
              </div>
            )}

            {section === 'caja' && (
              <div style={{ maxWidth: 480 }}>
                <div className="card" style={{ padding: 24 }}>
                  <CajaControl onClose={() => setSection('dashboard')} isFullEmbed />
                </div>
              </div>
            )}

            {section === 'menu' && (
              <div className="card" style={{ padding: 24 }}>
                <ProductManagement />
              </div>
            )}

            {section === 'inventory' && (
              <div className="card" style={{ padding: 24 }}>
                <Inventario />
              </div>
            )}

            {section === 'staff' && (
              <div className="card" style={{ padding: 24 }}>
                <Staff />
              </div>
            )}

            {section === 'historial' && <HistorialFacturas />}
            {section === 'reservas' && <Reservas />}
            {section === 'qr' && (<div className="card" style={{ padding: 24 }}><QRMesas mesas={mesasData} /></div>)}
            {section === 'auditoria' && <AuditLog />}
            {section === 'turnos' && (<div className="card" style={{ padding: 24 }}><Turnos /></div>)}
            {section === 'pl' && (<div className="card" style={{ padding: 24 }}><PLReport /></div>)}
            {section === 'delivery' && (<div className="card" style={{ padding: 24 }}><DeliveryPanel /></div>)}
            {section === 'fe' && (<div className="card" style={{ padding: 24 }}><FacturacionElectronica /></div>)}
            {section === 'ticket' && (<div className="card" style={{ padding: 24 }}><TicketPOSConfig /></div>)}

          </div>
        </div>
      </div>
    );
  }

  /* ── WAITER ── */
  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Navbar */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark brand-mark-sm">
            <img src="/logo.png" alt="RestoPOS" className="brand-mark-image" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>RestoPOS</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>Mesero</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`badge ${cajaAbierta ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer', padding: '6px 12px' }} onClick={() => setShowCaja(true)}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
            {cajaAbierta ? 'Caja activa' : 'Abrir caja'}
          </span>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '9px', borderRadius: 8 }} title={theme === 'dark' ? 'Modo día' : 'Modo noche'}>
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={() => setRole(null)} className="btn btn-ghost" style={{ padding: '9px 12px', fontSize: 14, gap: 6 }}>
            <LogOut size={16} /> Salir
          </button>

        </div>
      </header>

      {/* MOBILE: full-screen table map, or WaiterOrder as full-screen overlay */}
      {isMobile ? (
        <>
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ padding: '14px 14px 6px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>Selecciona una mesa</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {mesasData.map((mesa: any) => {
                  const isOcupada = mesa.estado === 'ocupada';
                  const isReservada = mesa.estado === 'reservada';
                  const dotColor = isOcupada ? 'var(--red)' : isReservada ? 'var(--amber)' : 'var(--green)';
                  return (
                    <button key={mesa.id}
                      onClick={() => {
                        if (isOcupada) { setFacturarMesa(mesa); setSelectedMesa(null); }
                        else { setSelectedMesa(mesa); setFacturarMesa(null); }
                      }}
                      style={{ position: 'relative', padding: '16px 14px', minHeight: 90, borderRadius: 16, border: `2px solid ${isOcupada ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, background: isOcupada ? 'rgba(239,68,68,0.05)' : 'var(--surface-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent' }}>
                      <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Mesa {mesa.numero}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>{mesa.capacidad} personas</div>
                      <span className={`badge ${isOcupada ? 'badge-red' : isReservada ? 'badge-amber' : 'badge-green'}`}>
                        {isOcupada ? 'Ocupada' : isReservada ? 'Reservada' : 'Disponible'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Full-screen order overlay on mobile */}
          {selectedMesa && (
            <WaiterOrder
              mesaId={selectedMesa.id}
              mesaNumero={selectedMesa.numero}
              productos={productos}
              combos={combos}
              onClose={() => setSelectedMesa(null)}
              onOrderSubmit={(id, items) => handleOrderSubmit(id, items, selectedMesa.numero)}
            />
          )}
        </>
      ) : (
        /* DESKTOP: split-screen */
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT: compact table list */}
          <div style={{ width: selectedMesa ? '300px' : '100%', minWidth: selectedMesa ? '240px' : undefined, borderRight: selectedMesa ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', transition: 'width 200ms ease', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{selectedMesa ? `Mesa ${selectedMesa.numero} seleccionada` : 'Selecciona una mesa para iniciar'}</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: selectedMesa ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {mesasData.map((mesa: any) => {
                  const isSelected = selectedMesa?.id === mesa.id;
                  const isOcupada = mesa.estado === 'ocupada';
                  const isReservada = mesa.estado === 'reservada';
                  const dotColor = isOcupada ? 'var(--red)' : isReservada ? 'var(--amber)' : 'var(--green)';
                  return (
                    <button key={mesa.id}
                      onClick={() => {
                        if (isOcupada) { setSelectedMesa(null); setFacturarMesa(mesa); }
                        else { setSelectedMesa(isSelected ? null : mesa); setFacturarMesa(null); }
                      }}
                      style={{ position: 'relative', padding: '12px', minHeight: 80, borderRadius: 14, border: `2px solid ${isSelected ? 'var(--accent)' : isOcupada ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`, background: isSelected ? 'var(--accent-muted)' : isOcupada ? 'rgba(239,68,68,0.04)' : 'var(--surface-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 100ms' }}>
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: `0 0 5px ${dotColor}` }} />
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: isSelected ? 'var(--accent-hover)' : 'var(--text)' }}>Mesa {mesa.numero}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>{mesa.capacidad} personas</div>
                      <span className={`badge ${isOcupada ? 'badge-red' : isReservada ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: 10 }}>
                        {isOcupada ? 'Ocupada' : isReservada ? 'Reservada' : 'Disponible'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* RIGHT: Inline order panel */}
          {selectedMesa ? (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <WaiterOrder
                mesaId={selectedMesa.id}
                mesaNumero={selectedMesa.numero}
                productos={productos}
                combos={combos}
                onClose={() => setSelectedMesa(null)}
                onOrderSubmit={(id, items) => handleOrderSubmit(id, items, selectedMesa.numero)}
                inline
              />
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexDirection: 'column', gap: 12 }}>
              <ChefHat size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Selecciona una mesa para iniciar el pedido</p>
            </div>
          )}
        </div>
      )}

      {/* Billing modal */}
      {facturarMesa && (
        <FacturacionModal mesaId={facturarMesa.id} mesaNumero={facturarMesa.numero} onClose={() => setFacturarMesa(null)} onSuccess={handleMesaClosed} />
      )}

      {/* Caja modal */}
      {showCaja && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="anim-fade-in">
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 28 }}>
            <CajaControl onClose={() => setShowCaja(false)} isFullEmbed />
          </div>
        </div>
      )}
    </div>
  );
}

