'use client';

import { useState, useEffect } from 'react';
import { FileText, CreditCard, Banknote, HelpCircle, CheckCircle, Percent, Tag, SplitSquareHorizontal, Plus, Printer } from 'lucide-react';
import { getPedidosActivos, cerrarMesaYFacturar } from '@/app/actions/facturacion';
import { formatCOP } from '@/lib/format';

interface FacturacionProps {
    mesaId: number;
    mesaNumero: number;
    onClose: () => void;
    onSuccess?: (mesaNumero: number) => void;
}

export default function FacturacionModal({ mesaId, mesaNumero, onClose, onSuccess }: FacturacionProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState<any>(null);
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [procesando, setProcesando] = useState(false);
    const [facturaResult, setFacturaResult] = useState<any>(null);
    const [ticketConfig, setTicketConfig] = useState<any>(null);

    // Discounts & Tips
    const [descuento, setDescuento] = useState(0);
    const [descuentoTipo, setDescuentoTipo] = useState<'porcentaje' | 'fijo'>('porcentaje');
    const [propina, setPropina] = useState(0);
    const [propinaCustom, setPropinaCustom] = useState('');

    // Split bill
    const [splitting, setSplitting] = useState(false);
    const [numPersonas, setNumPersonas] = useState(2);

    useEffect(() => {
        async function fetchOrder() {
            const res = await getPedidosActivos(mesaId);
            if (res.success) setOrderData(res);
            else setError(res.error || 'No hay pedidos abiertos para esta mesa.');
            setLoading(false);
        }
        fetchOrder();
        // Load ticket config
        fetch('/api/ticket-config').then(r => r.json()).then(r => {
            if (r.success && r.data) setTicketConfig(r.data);
        }).catch(() => {});
    }, [mesaId]);

    const subtotal = orderData?.subtotal || 0;
    const ivaPct = ticketConfig?.ivaPorcentaje ?? 8;
    const iva = subtotal * (ivaPct / 100);
    const descuentoValor = descuentoTipo === 'porcentaje' ? (subtotal * descuento / 100) : descuento;
    const baseConDescuento = subtotal - descuentoValor;
    const ivaFinal = baseConDescuento * (ivaPct / 100);
    const propinaValor = propina > 0 ? propina : (propinaCustom ? parseFloat(propinaCustom) || 0 : 0);
    const total = baseConDescuento + ivaFinal + propinaValor;
    const totalPorPersona = splitting && numPersonas > 1 ? total / numPersonas : null;

    const handleFacturar = async () => {
        setProcesando(true);
        const res = await cerrarMesaYFacturar(orderData.pedidoId, metodoPago);
        if (res.success) {
            setFacturaResult(res);
            // NOTE: onSuccess is called when the user clicks ‘Aceptar y Continuar’,
            // NOT here — so the success screen (with the print button) stays visible.
        } else {
            setError(res.error || 'Error al emitir factura electrónica.');
        }
        setProcesando(false);
    };

    const printReceipt = () => {
        const tc = ticketConfig || {};
        const nombre = tc.nombreNegocio || 'RestoPOS';
        const anchoPapel = tc.anchoPapel || '80mm';
        const mensajePie = tc.mensajePie ?? '¡Gracias por su visita!';
        const mostrarDIAN = tc.mostrarDIAN ?? true;
        const mostrarLogo = tc.mostrarLogo ?? false;
        const logoDataUrl = typeof tc.logoDataUrl === 'string' ? tc.logoDataUrl : '';
        const fecha = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
        const itemsHtml = (orderData?.detalles || []).map((item: any) => `
            <tr>
                <td>${item.cantidad}x ${item.nombre}</td>
                <td style="text-align:right">${formatCOP(item.cantidad * item.precio_unitario)}</td>
            </tr>
        `).join('');
        const descHtml = descuentoValor > 0
            ? `<tr><td>Descuento</td><td style="text-align:right">- ${formatCOP(descuentoValor)}</td></tr>`
            : '';
        const propHtml = propinaValor > 0
            ? `<tr><td>Propina</td><td style="text-align:right">${formatCOP(propinaValor)}</td></tr>`
            : '';
        const headerInfoHtml = [
            tc.nit ? `<p class="center" style="font-size:10px">NIT: ${tc.nit}</p>` : '',
            tc.direccion ? `<p class="center" style="font-size:10px">${tc.direccion}</p>` : '',
            tc.telefono ? `<p class="center" style="font-size:10px">Tel: ${tc.telefono}</p>` : '',
        ].filter(Boolean).join('\n');
        const dianHtml = mostrarDIAN ? [
            facturaResult?.numero_dian ? `<div class="line"></div><p class="footer">DIAN: ${facturaResult.numero_dian}</p>` : '',
            facturaResult?.cufe ? `<p class="footer" style="font-size:9px">CUFE: ${facturaResult.cufe}</p>` : '',
        ].join('\n') : '';
        const logoHtml = mostrarLogo && logoDataUrl
            ? `<div class="center" style="margin-bottom:8px"><img src="${logoDataUrl}" alt="Logo" style="max-width:70%; max-height:56px; object-fit:contain;" /></div>`
            : '';
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: ${anchoPapel}; padding: 8px; color: #000; }
            h1 { font-size: 16px; text-align: center; margin-bottom: 2px; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; vertical-align: top; }
            .total-row td { font-weight: bold; font-size: 14px; padding-top: 4px; }
            .footer { font-size: 10px; text-align: center; margin-top: 8px; }
            @media print { @page { margin: 0; size: ${anchoPapel} auto; } }
        </style></head>
        <body>
            ${logoHtml}
            <h1>${nombre}</h1>
            ${headerInfoHtml}
            <p class="center">Factura de Consumo</p>
            <div class="line"></div>
            <p>Mesa: <b>${mesaNumero}</b></p>
            <p>Fecha: ${fecha}</p>
            <p>Pago: ${metodoPago}</p>
            <div class="line"></div>
            <table>${itemsHtml}</table>
            <div class="line"></div>
            <table>
                ${descHtml}
                <tr><td>IVA ${ivaPct}%</td><td style="text-align:right">${formatCOP(ivaFinal)}</td></tr>
                ${propHtml}
                <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${formatCOP(total)}</td></tr>
            </table>
            ${dianHtml}
            <div class="line"></div>
            <p class="footer">${mensajePie}</p>
        </body></html>`;
        const win = window.open('', '_blank', 'width=400,height=600');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.focus();
            setTimeout(() => { win.print(); win.close(); }, 300);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass p-8 rounded-lg max-w-sm w-full text-center shadow-lg">
                <p>Cargando pedidos de Mesa {mesaNumero}...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-lg flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', maxHeight: '90vh' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={16} color="var(--accent-hover)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Facturar Mesa {mesaNumero}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                    {error && !facturaResult ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <HelpCircle size={44} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>{error}</p>
                            <button className="btn btn-outline" style={{ marginTop: 20, fontSize: 13 }} onClick={onClose}>Volver</button>
                        </div>
                    ) : facturaResult ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle size={32} color="var(--green)" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>¡Mesa Cerrada!</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Factura electrónica procesada correctamente.</p>
                            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 20 }}>
                                <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Comprobante DIAN</p>
                                <p style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 14 }}>{facturaResult.numero_dian}</p>
                                {facturaResult.cufe && <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>CUFE: {facturaResult.cufe}</p>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <button
                                    onClick={printReceipt}
                                    className="btn btn-outline"
                                    style={{ width: '100%', fontSize: 14, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <Printer size={16} /> Imprimir Factura POS
                                </button>
                                <button className="btn btn-primary" style={{ width: '100%', fontSize: 14 }} onClick={() => { onSuccess?.(mesaNumero); onClose(); }}>Aceptar y Continuar</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Items */}
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Detalle del Consumo</p>
                                <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                                    {orderData?.detalles.map((item: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < orderData.detalles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <div>
                                                <span style={{ fontWeight: 500, fontSize: 13 }}>{item.nombre}</span>
                                                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>x{item.cantidad}</span>
                                            </div>
                                            <span style={{ fontWeight: 500, fontSize: 13 }}>{formatCOP(item.cantidad * item.precio_unitario)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Discount */}
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Descuento</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => setDescuentoTipo('porcentaje')} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${descuentoTipo === 'porcentaje' ? 'var(--accent)' : 'var(--border)'}`, background: descuentoTipo === 'porcentaje' ? 'var(--accent-muted)' : 'transparent', cursor: 'pointer', color: descuentoTipo === 'porcentaje' ? 'var(--accent-hover)' : 'var(--text-3)', fontSize: 12, fontFamily: 'inherit' }}>% </button>
                                        <button onClick={() => setDescuentoTipo('fijo')} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${descuentoTipo === 'fijo' ? 'var(--accent)' : 'var(--border)'}`, background: descuentoTipo === 'fijo' ? 'var(--accent-muted)' : 'transparent', cursor: 'pointer', color: descuentoTipo === 'fijo' ? 'var(--accent-hover)' : 'var(--text-3)', fontSize: 12, fontFamily: 'inherit' }}>$ </button>
                                    </div>
                                    <input type="number" min="0" max={descuentoTipo === 'porcentaje' ? 100 : undefined} value={descuento || ''} onChange={e => setDescuento(parseFloat(e.target.value) || 0)}
                                        className="input" placeholder={descuentoTipo === 'porcentaje' ? '0 %' : 'Monto fijo'} style={{ flex: 1, fontSize: 13 }} />
                                </div>
                            </div>

                            {/* Tip */}
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Propina (voluntaria)</p>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {[0, 5, 10, 15].map(pct => (
                                        <button key={pct} onClick={() => { setPropina(pct === 0 ? 0 : Math.round(baseConDescuento * pct / 100)); setPropinaCustom(''); }}
                                            style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${propina === (pct === 0 ? 0 : Math.round(baseConDescuento * pct / 100)) && !propinaCustom ? 'var(--accent)' : 'var(--border)'}`, background: propina === (pct === 0 ? 0 : Math.round(baseConDescuento * pct / 100)) && !propinaCustom ? 'var(--accent-muted)' : 'var(--surface-2)', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'inherit', fontFamily: 'inherit' }}>
                                            {pct === 0 ? 'Sin propina' : `${pct}%`}
                                        </button>
                                    ))}
                                    <input type="number" min="0" value={propinaCustom} onChange={e => { setPropinaCustom(e.target.value); setPropina(0); }} className="input" placeholder="Otro valor" style={{ width: 110, fontSize: 12 }} />
                                </div>
                            </div>

                            {/* Split bill */}
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={() => setSplitting(!splitting)} style={{ fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: `1px solid ${splitting ? 'var(--accent)' : 'var(--border)'}`, background: splitting ? 'var(--accent-muted)' : 'transparent', cursor: 'pointer', color: splitting ? 'var(--accent-hover)' : 'var(--text-3)', fontFamily: 'inherit' }}>
                                        <SplitSquareHorizontal size={13} /> Dividir cuenta
                                    </button>
                                    {splitting && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>entre</span>
                                            <input type="number" min="2" max="20" value={numPersonas} onChange={e => setNumPersonas(parseInt(e.target.value) || 2)} className="input" style={{ width: 60, fontSize: 13, textAlign: 'center' }} />
                                            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>personas</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals */}
                            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                                {[
                                    { label: 'Subtotal', val: subtotal },
                                    ...(descuentoValor > 0 ? [{ label: `Descuento (${descuentoTipo === 'porcentaje' ? descuento + '%' : 'fijo'})`, val: -descuentoValor, color: 'var(--amber)' }] : []),
                                    { label: `IVA consumo ${ivaPct}%`, val: ivaFinal, color: 'var(--text-3)' },
                                    ...(propinaValor > 0 ? [{ label: 'Propina', val: propinaValor, color: 'var(--green)' }] : []),
                                ].map((row: any, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                                        <span style={{ color: row.color || 'var(--text-2)' }}>{row.label}</span>
                                        <span style={{ color: row.color || 'var(--text-2)' }}>{formatCOP(row.val)}</span>
                                    </div>
                                ))}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: 16 }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--accent-hover)' }}>{formatCOP(total)}</span>
                                </div>
                                {totalPorPersona && (
                                    <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                                        {formatCOP(totalPorPersona)} por persona
                                    </div>
                                )}
                            </div>

                            {/* Payment method */}
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Método de Pago</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {[['Efectivo', '💵'], ['Tarjeta', '💳'], ['Transferencia', '📱']].map(([m, icon]) => (
                                    <button key={m} onClick={() => setMetodoPago(m)} style={{ padding: '10px 8px', borderRadius: 10, border: `1px solid ${metodoPago === m ? 'var(--accent)' : 'var(--border)'}`, background: metodoPago === m ? 'var(--accent-muted)' : 'var(--surface-2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: metodoPago === m ? 'var(--accent-hover)' : 'var(--text-2)', transition: 'all 100ms' }}>
                                        {icon} {m}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {!error && !facturaResult && (
                    <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: 14, padding: '12px' }} onClick={handleFacturar} disabled={procesando}>
                            {procesando ? 'Procesando en la DIAN...' : `Cerrar Mesa · ${formatCOP(total)}`}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Emite factura electrónica DIAN simulada</p>
                    </div>
                )}
            </div>
        </div>
    );
}
