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
  Package, Settings, Activity, ExternalLink, Download, Bell, BellOff, Sun, Moon
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
            <div style={{ width: 32, height: 32, background: '#ea580c', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={16} color="white" />
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
    const stats = [
      { label: 'Ventas hoy', value: '$2,450', change: '+12%', icon: TrendingUp, color: 'var(--accent)' },
      { label: 'Pedidos activos', value: '12', change: 'en este momento', icon: ShoppingBag, color: 'var(--green)' },
      { label: 'Personal en turno', value: '4', change: 'de 6 total', icon: Users, color: 'var(--amber)' },
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {stats.map((s, i) => (
                    <div key={i} className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 6 }}>{s.label}</p>
                        <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 5 }}>{s.change}</p>
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: s.color + '18', border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.icon size={17} color={s.color} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shortcuts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {[
                    { label: 'Historial', section: 'historial', emoji: '🧾' },
                    { label: 'Reservas', section: 'reservas', emoji: '📅' },
                    { label: 'QR Mesas', section: 'qr', emoji: '📱' },
                    { label: 'Auditoría', section: 'auditoria', emoji: '🔍' },
                    { label: 'Turnos', section: 'turnos', emoji: '⏰' },
                    { label: 'P&L', section: 'pl', emoji: '📊' },
                    { label: 'Delivery', section: 'delivery', emoji: '🛵' },
                    { label: 'Backup DB', section: '', emoji: '💾', href: '/api/backup' },
                  ].map(s => (
                    s.href ? (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" download
                        className="card" style={{ padding: '14px 16px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 150ms' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                        <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{s.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                      </a>
                    ) : (
                      <button key={s.section} onClick={() => setSection(s.section)}
                        className="card" style={{ padding: '14px 16px', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'transform 150ms' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                        <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{s.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                      </button>
                    )
                  ))}
                </div>

                {/* Table map */}
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Activity size={15} color="var(--text-3)" />
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>Mapa de Mesas</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {[['var(--green)', 'Libre'], ['var(--red)', 'Ocupada'], ['var(--amber)', 'Reservada']].map(([c, l]) => (
                        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-3)' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block' }}></span> {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    <TableMap initialMesas={mesas} mesas={mesasData} onMesaClick={handleMesaClick} />
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
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChefHat size={16} color="white" />
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

