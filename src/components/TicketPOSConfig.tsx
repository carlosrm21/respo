'use client';

import { useState, useEffect } from 'react';
import { Printer, Save, CheckCircle, Store, FileText, Phone, MapPin, MessageSquare, Ruler } from 'lucide-react';

interface TicketConfig {
    nombreNegocio: string;
    nit: string;
    direccion: string;
    telefono: string;
    mensajePie: string;
    anchoPapel: '58mm' | '80mm';
    ivaPorcentaje: number;
    mostrarDIAN: boolean;
}

const DEFAULT: TicketConfig = {
    nombreNegocio: 'RestoPOS',
    nit: '',
    direccion: '',
    telefono: '',
    mensajePie: '¡Gracias por su visita!',
    anchoPapel: '80mm',
    ivaPorcentaje: 8,
    mostrarDIAN: true,
};

export default function TicketPOSConfig() {
    const [config, setConfig] = useState<TicketConfig>(DEFAULT);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ticket-config')
            .then(r => r.json())
            .then(r => { if (r.success && r.data) setConfig({ ...DEFAULT, ...r.data }); })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch('/api/ticket-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const r = await res.json();
            if (r.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch { }
        setSaving(false);
    };

    const update = (key: keyof TicketConfig, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

    const previewWidth = config.anchoPapel === '58mm' ? 220 : 302;
    const now = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--text-3)' }}>
            <p>Cargando configuración...</p>
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
            {/* Form */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{ width: 38, height: 38, background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Printer size={18} color="var(--accent-hover)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Configuración del Ticket POS</h2>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, marginTop: 2 }}>Personaliza la información que aparece en el recibo impreso</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Business Info */}
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Store size={14} /> Información del Negocio
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Nombre del Negocio</label>
                                <input className="input" value={config.nombreNegocio} onChange={e => update('nombreNegocio', e.target.value)} placeholder="RestoPOS" style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>NIT</label>
                                    <input className="input" value={config.nit} onChange={e => update('nit', e.target.value)} placeholder="900.000.000-0" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Teléfono</label>
                                    <input className="input" value={config.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+57 300 000 0000" style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Dirección</label>
                                <input className="input" value={config.direccion} onChange={e => update('direccion', e.target.value)} placeholder="Calle 00 #00-00, Ciudad" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Ticket Settings */}
                    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={14} /> Configuración del Recibo
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Mensaje al pie del ticket</label>
                                <input className="input" value={config.mensajePie} onChange={e => update('mensajePie', e.target.value)} placeholder="¡Gracias por su visita!" style={inputStyle} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Ancho del papel</label>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {(['58mm', '80mm'] as const).map(w => (
                                            <button key={w} onClick={() => update('anchoPapel', w)}
                                                style={{
                                                    flex: 1, padding: '9px 12px', borderRadius: 10,
                                                    border: `1px solid ${config.anchoPapel === w ? 'var(--accent)' : 'var(--border)'}`,
                                                    background: config.anchoPapel === w ? 'var(--accent-muted)' : 'var(--surface)',
                                                    color: config.anchoPapel === w ? 'var(--accent-hover)' : 'var(--text-2)',
                                                    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                    transition: 'all 120ms ease'
                                                }}>
                                                <Ruler size={13} /> {w}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>IVA / Impuesto (%)</label>
                                    <input className="input" type="number" min={0} max={100} step={0.5}
                                        value={config.ivaPorcentaje}
                                        onChange={e => update('ivaPorcentaje', parseFloat(e.target.value) || 0)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <button onClick={() => update('mostrarDIAN', !config.mostrarDIAN)}
                                    style={{
                                        width: 42, height: 24, borderRadius: 12,
                                        background: config.mostrarDIAN ? 'var(--accent)' : 'var(--border)',
                                        border: 'none', cursor: 'pointer', position: 'relative',
                                        transition: 'background 150ms ease', flexShrink: 0,
                                    }}>
                                    <span style={{
                                        position: 'absolute', top: 3, left: config.mostrarDIAN ? 21 : 3,
                                        width: 18, height: 18, borderRadius: '50%', background: 'white',
                                        transition: 'left 150ms ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }} />
                                </button>
                                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Mostrar información DIAN en el ticket</span>
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <button onClick={handleSave} disabled={saving}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '13px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12 }}>
                        {saved ? <><CheckCircle size={16} /> ¡Guardado!</> : saving ? 'Guardando...' : <><Save size={16} /> Guardar Configuración</>}
                    </button>
                </div>
            </div>

            {/* Live Preview */}
            <div style={{ position: 'sticky', top: 24 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Vista Previa del Ticket
                </p>
                <div style={{
                    background: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08)',
                    width: previewWidth, margin: '0 auto',
                    transition: 'width 250ms ease'
                }}>
                    <div style={{
                        fontFamily: "'Courier New', monospace", fontSize: 11, color: '#000',
                        padding: '12px 10px', lineHeight: 1.5
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: 4 }}>
                            <div style={{ fontSize: 15, fontWeight: 'bold' }}>{config.nombreNegocio || 'RestoPOS'}</div>
                            {config.nit && <div style={{ fontSize: 10 }}>NIT: {config.nit}</div>}
                            {config.direccion && <div style={{ fontSize: 10 }}>{config.direccion}</div>}
                            {config.telefono && <div style={{ fontSize: 10 }}>Tel: {config.telefono}</div>}
                            <div style={{ fontSize: 10 }}>Factura de Consumo</div>
                        </div>

                        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                        {/* Order info */}
                        <div style={{ fontSize: 10.5 }}>
                            <div><b>Mesa:</b> 5</div>
                            <div><b>Fecha:</b> {now}</div>
                            <div><b>Pago:</b> Efectivo</div>
                        </div>

                        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                        {/* Sample items */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                            <tbody>
                                <tr><td>2x Bandeja Paisa</td><td style={{ textAlign: 'right' }}>$50.000</td></tr>
                                <tr><td>1x Limonada</td><td style={{ textAlign: 'right' }}>$4.000</td></tr>
                                <tr><td>1x Coca Cola</td><td style={{ textAlign: 'right' }}>$3.500</td></tr>
                            </tbody>
                        </table>

                        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

                        {/* Totals */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                            <tbody>
                                <tr><td>IVA {config.ivaPorcentaje}%</td><td style={{ textAlign: 'right' }}>$4.600</td></tr>
                                <tr><td style={{ fontWeight: 'bold', fontSize: 13, paddingTop: 4 }}>TOTAL</td><td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 13, paddingTop: 4 }}>$62.100</td></tr>
                            </tbody>
                        </table>

                        {config.mostrarDIAN && (
                            <>
                                <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
                                <div style={{ textAlign: 'center', fontSize: 9 }}>
                                    <div>DIAN: FE-2026-00042</div>
                                    <div style={{ fontSize: 8, wordBreak: 'break-all' }}>CUFE: a1b2c3d4e5f6...</div>
                                </div>
                            </>
                        )}

                        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
                        <div style={{ textAlign: 'center', fontSize: 10, fontStyle: 'italic' }}>
                            {config.mensajePie || '¡Gracias por su visita!'}
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 10 }}>
                    Papel: {config.anchoPapel}
                </p>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11.5, fontWeight: 500,
    color: 'var(--text-3)', marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: 13,
};
