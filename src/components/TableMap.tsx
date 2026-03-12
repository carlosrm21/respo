'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Clock } from 'lucide-react';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'libre' | 'ocupada' | 'reservada' | 'disponible';
  fecha_ocupacion?: string;
}

function useElapsedMinutes(fecha?: string) {
  const [mins, setMins] = useState(0);
  useEffect(() => {
    if (!fecha) return;
    const update = () => setMins(Math.floor((Date.now() - new Date(fecha).getTime()) / 60000));
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [fecha]);
  return mins;
}

function MesaCard({ mesa, onClick }: { mesa: Mesa; onClick: (m: Mesa) => void }) {
  const mins = useElapsedMinutes(mesa.estado === 'ocupada' ? mesa.fecha_ocupacion : undefined);
  const isOcupada = mesa.estado === 'ocupada';
  const isReservada = mesa.estado === 'reservada';

  const borderColor = isOcupada ? 'rgba(239,68,68,0.2)' : isReservada ? 'rgba(245,158,11,0.3)' : 'var(--border)';
  const bg = isOcupada ? 'rgba(239,68,68,0.04)' : isReservada ? 'rgba(245,158,11,0.04)' : 'var(--surface-2)';
  const dotColor = isOcupada ? 'var(--red)' : isReservada ? 'var(--amber)' : 'var(--green)';
  const urgencia = isOcupada && mins > 60 ? 'var(--red)' : mins > 30 ? 'var(--amber)' : 'var(--green)';

  return (
    <button
      onClick={() => onClick(mesa)}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '14px 16px', background: bg, border: `1px solid ${borderColor}`, borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all 120ms ease', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = isOcupada ? 'rgba(239,68,68,0.4)' : isReservada ? 'rgba(245,158,11,0.4)' : 'var(--border-active)'; el.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = borderColor; el.style.transform = 'translateY(0)'; }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, width: 7, height: 7, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}></div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>Mesa {mesa.numero}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 11.5, marginBottom: 8 }}>
        <Users size={11} /> {mesa.capacidad} personas
      </div>
      {isOcupada && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: urgencia, fontWeight: 600 }}>
          <Clock size={10} /> {mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`}
        </div>
      )}
      <div style={{ marginTop: isOcupada ? 6 : 0 }}>
        <span className={`badge ${isOcupada ? 'badge-red' : isReservada ? 'badge-amber' : 'badge-green'}`}>
          {isOcupada ? 'Ocupada' : isReservada ? 'Reservada' : 'Disponible'}
        </span>
      </div>
    </button>
  );
}

interface TableMapProps {
  initialMesas?: Mesa[];
  mesas?: Mesa[];
  onMesaClick: (m: Mesa) => void;
  autoRefresh?: () => Promise<Mesa[]>;
}

export default function TableMap({ initialMesas, mesas: mesasProp, onMesaClick, autoRefresh }: TableMapProps) {
  const [mesas, setMesas] = useState<Mesa[]>(mesasProp ?? initialMesas ?? []);

  // Sync when parent passes updated mesas
  useEffect(() => {
    if (mesasProp) setMesas(mesasProp);
  }, [mesasProp]);

  // Auto-refresh polling every 10 seconds (for waiter view)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const updated = await autoRefresh();
        setMesas(updated);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const libre = mesas.filter(m => m.estado === 'libre' || m.estado === 'disponible').length;
  const ocupada = mesas.filter(m => m.estado === 'ocupada').length;
  const reservada = mesas.filter(m => m.estado === 'reservada').length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          <strong style={{ color: 'var(--green)', fontWeight: 600 }}>{libre}</strong> disponibles &nbsp;·&nbsp;
          <strong style={{ color: 'var(--red)', fontWeight: 600 }}>{ocupada}</strong> ocupadas &nbsp;·&nbsp;
          <strong style={{ color: 'var(--amber)', fontWeight: 600 }}>{reservada}</strong> reservadas &nbsp;·&nbsp;
          <span style={{ color: 'var(--text-3)' }}>{mesas.length} total</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {mesas.map(mesa => <MesaCard key={mesa.id} mesa={mesa} onClick={onMesaClick} />)}
      </div>
    </div>
  );
}
