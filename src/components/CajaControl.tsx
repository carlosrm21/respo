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
        <div className={`relative ${isFullEmbed ? 'p-0' : 'glass w-full max-w-lg rounded-[3rem] shadow-2xl p-12 border border-white/10'} overflow-hidden`}>
            {/* Background Decorative Gradient */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
            
            {!isFullEmbed && (
                <div className="flex justify-between items-center mb-12 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Wallet size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-white leading-tight">Tesorería</h2>
                            <p className="text-sm font-bold text-muted uppercase tracking-[0.2em]">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-muted hover:text-white">
                            <X size={24} />
                        </button>
                    )}
                </div>
            )}

            {success ? (
                <div className="text-center py-24 animate-fade-in relative z-10">
                    <div className="w-28 h-28 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(16,185,129,0.15)] border border-success/20">
                        <CheckCircle2 size={64} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-white mb-2">¡Listo!</h3>
                    <p className="text-lg font-medium text-muted">{success}</p>
                </div>
            ) : (
                <div className="space-y-10 relative z-10">
                    {error && (
                        <div className="p-6 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold flex items-center gap-4 animate-shake">
                            <AlertCircle size={24} />
                            {error}
                        </div>
                    )}

                    <div className="animate-fade-up">
                        <div className="flex justify-between items-end mb-5">
                            <label className="text-sm font-black uppercase tracking-[0.2em] text-muted ml-1">
                                {caja ? 'Balance Real en Caja' : 'Monto de Apertura'}
                            </label>
                            <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">EFECTIVO COP</span>
                        </div>
                        
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/[0.02] border-2 border-white/10 rounded-[2.5rem] px-10 py-8 text-5xl font-black text-white focus:outline-none focus:border-primary focus:bg-white/[0.04] transition-all shadow-2xl tracking-tighter placeholder:text-white/5"
                                placeholder="0"
                                autoFocus
                            />
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end opacity-40">
                                <span className="text-xs font-black tracking-widest text-white">PESOS</span>
                                <span className="text-2xl font-black text-white">COL</span>
                            </div>
                        </div>

                        {caja && (
                            <div className="mt-10 p-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Clock size={48} />
                                </div>
                                <p className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4">Información de Operación</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-muted">Apertura</span>
                                        <span className="text-sm font-black text-white px-3 py-1 bg-white/5 rounded-lg">{new Date(caja.fecha_apertura).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-muted leading-relaxed">
                                        El sistema realizará el cuadre automático comparando el monto reportado con las ventas registradas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={caja ? handleCerrar : handleAbrir}
                        className="group relative w-full overflow-hidden rounded-[2rem] p-[2px] transition-all hover:scale-[1.01] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x"></div>
                        <div className="relative flex items-center justify-center gap-3 bg-neutral-950 rounded-[1.9rem] py-6 px-8 transition-all group-hover:bg-transparent">
                            <span className="text-xl font-black tracking-widest text-white">
                                {caja ? 'PROCESAR CIERRE DE CAJA' : 'INICIAR TURNO DE CAJA'}
                            </span>
                            <CheckCircle2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
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
