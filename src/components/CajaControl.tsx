'use client';

import { useState, useEffect } from 'react';
import { Wallet, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getEstadoCaja, abrirCaja, cerrarCaja } from '@/app/actions/caja';

export default function CajaControl({ onClose, isFullEmbed = false }: { onClose?: () => void, isFullEmbed?: boolean }) {
    const [caja, setCaja] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCaja();
    }, []);

    async function fetchCaja() {
        const res = await getEstadoCaja();
        if (res.success) setCaja(res.data);
        setLoading(false);
    }

    const handleAbrir = async () => {
        if (!amount || isNaN(Number(amount))) return setError('Ingrese un monto válido');
        const res = await abrirCaja(Number(amount), 1); 
        if (res.success) {
            setSuccess('Caja abierta correctamente');
            if (onClose) setTimeout(onClose, 1500);
            fetchCaja();
        } else {
            setError(res.error || 'Error al abrir caja');
        }
    };

    const handleCerrar = async () => {
        if (!amount || isNaN(Number(amount))) return setError('Ingrese el monto real en caja');
        const res = await cerrarCaja(caja.id, Number(amount));
        if (res.success) {
            setSuccess('Caja cerrada correctamente');
            if (onClose) setTimeout(onClose, 1500);
            fetchCaja();
        } else {
            setError(res.error || 'Error al cerrar caja');
        }
    };

    if (loading) return null;

    const content = (
        <div className={`relative ${isFullEmbed ? 'p-10' : 'glass w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-white/10'} overflow-hidden`}>
            {!isFullEmbed && (
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/20 text-primary rounded-[1.5rem] shadow-xl">
                            <Wallet size={28} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">{caja ? 'Cierre de Caja' : 'Apertura de Caja'}</h2>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    )}
                </div>
            )}

            {success ? (
                <div className="text-center py-20 animate-fade-in">
                    <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={56} />
                    </div>
                    <p className="text-2xl font-black tracking-tight">{success}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {error && (
                        <div className="p-5 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold flex items-center gap-4 animate-shake">
                            <AlertCircle size={22} />
                            {error}
                        </div>
                    )}

                    <div className="animate-fade-up">
                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-muted mb-4 ml-1">
                            {caja ? 'Monto Real en Efectivo (COP)' : 'Monto de Apertura (COP)'}
                        </label>
                        <div className="relative group">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-4xl font-black focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all shadow-inner tracking-tighter"
                                placeholder="0.00"
                                autoFocus
                            />
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-muted font-bold tracking-widest pointer-events-none">COP</div>
                        </div>
                        {caja && (
                            <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-3">
                                <p className="text-xs font-bold text-muted uppercase tracking-widest">Información de Turno</p>
                                <p className="text-sm font-medium leading-relaxed">
                                    Apertura registrada a las <span className="text-primary font-black uppercase">{new Date(caja.fecha_apertura).toLocaleTimeString()}</span>. 
                                    Se realizará el cuadre comparando con las facturas emitidas en este periodo.
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={caja ? handleCerrar : handleAbrir}
                        className="btn btn-primary w-full py-6 text-lg font-black tracking-widest shadow-2xl hover:scale-[1.02]"
                    >
                        {caja ? 'PROCESAR CIERRE DE TURNO' : 'INICIAR TURNO DE CAJA'}
                    </button>
                </div>
            )}
        </div>
    );

    if (isFullEmbed) return content;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose}></div>
            {content}
        </div>
    );
}
