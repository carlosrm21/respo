'use client';
import { useState, useEffect } from 'react';
import { QrCode, Download, Grid3X3 } from 'lucide-react';

// QR generation using a free public API (no npm install needed)
function getQRUrl(data: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0e0e10&color=a5b4fc&format=png`;
}

interface Mesa { id: number; numero: number; capacidad: number; estado: string; }

export default function QRMesas({ mesas }: { mesas?: Mesa[] }) {
  const [baseUrl, setBaseUrl] = useState('');
  const [selectedMesa, setSelectedMesa] = useState<number | null>(null);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const downloadQR = (mesa: Mesa) => {
    const url = getQRUrl(`${baseUrl}/menu/${mesa.id}`, 400);
    const a = document.createElement('a');
    a.href = url; a.download = `qr-mesa-${mesa.numero}.png`; a.click();
  };

  const printAll = () => window.print();

  if (!mesas || mesas.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>No hay mesas disponibles</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-3)', flex: 1 }}>
          Cada QR lleva al cliente al menú de su mesa para ver los productos disponibles.
        </div>
        <button onClick={printAll} className="btn btn-outline" style={{ fontSize: 12, gap: 6 }}>
          <Download size={13} /> Imprimir todos
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }} className="print-grid">
        {mesas.map(mesa => (
          <div key={mesa.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 150ms' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
            onClick={() => setSelectedMesa(selectedMesa === mesa.id ? null : mesa.id)}>
            <div style={{ fontSize: 13, fontWeight: 700, alignSelf: 'flex-start' }}>Mesa {mesa.numero}</div>
            <img
              src={getQRUrl(`${baseUrl}/menu/${mesa.id}`, 160)}
              alt={`QR Mesa ${mesa.numero}`}
              style={{ width: 140, height: 140, borderRadius: 8, background: '#0e0e10' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{mesa.capacidad} personas</div>
            <button onClick={e => { e.stopPropagation(); downloadQR(mesa); }} className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px', gap: 4, width: '100%', justifyContent: 'center' }}>
              <Download size={11} /> Descargar
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
        Los QR direccionan a <strong>{baseUrl}/menu/[id]</strong> — puedes personalizar lo que muestra el menú público en esa ruta.
      </p>
    </div>
  );
}
