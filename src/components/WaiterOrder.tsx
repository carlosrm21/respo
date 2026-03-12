'use client';

import { useState, useMemo } from 'react';
import { Coffee, UtensilsCrossed, Plus, Minus, Send, Search, X, ShoppingBag, MessageSquare, ArrowLeft, ChevronUp } from 'lucide-react';
import { formatCOP } from '@/lib/format';

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    categoria_id: number;
    categoria_nombre?: string;
}

interface OrderItem extends Producto {
    cantidad: number;
    notas?: string;
}

interface WaiterOrderProps {
    mesaId: number;
    mesaNumero: number;
    productos: Producto[];
    combos?: any[];
    onOrderSubmit: (mesaId: number, items: OrderItem[]) => Promise<void>;
    onClose: () => void;
    inline?: boolean;
}

export default function WaiterOrder({ mesaId, mesaNumero, productos, combos = [], onOrderSubmit, onClose, inline = false }: WaiterOrderProps) {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'menu' | 'combos' | 'pedido'>('menu');
    const [editingNota, setEditingNota] = useState<number | null>(null);

    const categories = useMemo(() => {
        const cats: { id: number; nombre: string }[] = [];
        productos.forEach(p => {
            if (!cats.find(c => c.id === p.categoria_id)) {
                cats.push({ id: p.categoria_id, nombre: p.categoria_nombre || 'Categoría' });
            }
        });
        return cats;
    }, [productos]);

    const filteredProductos = useMemo(() => {
        return productos.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === null || p.categoria_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [productos, searchQuery, selectedCategory]);

    const addItem = (producto: Producto) => {
        setOrderItems(current => {
            const existing = current.find(item => item.id === producto.id);
            if (existing) {
                return current.map(item =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...current, { ...producto, cantidad: 1, notas: '' }];
        });
    };

    const addCombo = (combo: any) => {
        combo.items.forEach((ci: any) => {
            addItem({ id: ci.producto_id, nombre: ci.nombre, precio: ci.precio, categoria_id: ci.categoria_id || 0 });
        });
    };

    const updateNota = (productoId: number, notas: string) => {
        setOrderItems(current => current.map(item => item.id === productoId ? { ...item, notas } : item));
    };

    const removeItem = (productoId: number) => {
        setOrderItems(current => {
            const existing = current.find(item => item.id === productoId);
            if (existing && existing.cantidad > 1) {
                return current.map(item =>
                    item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item
                );
            }
            return current.filter(item => item.id !== productoId);
        });
    };

    const total = orderItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalItems = orderItems.reduce((sum, item) => sum + item.cantidad, 0);

    const handleSubmit = async () => {
        if (orderItems.length === 0) return;
        setIsSubmitting(true);
        try {
            await onOrderSubmit(mesaId, orderItems);
            onClose();
        } catch (error) {
            console.error('Error submitting order', error);
            setIsSubmitting(false);
        }
    };

    // ─── Product grid (shared between mobile menu tab and desktop left panel) ───
    const MenuGrid = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} size={18} />
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px 12px 42px', fontSize: 15, color: 'inherit', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
            </div>
            {/* Categories */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
                <button onClick={() => setSelectedCategory(null)}
                    style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', background: selectedCategory === null ? 'var(--accent)' : 'var(--surface-2)', color: selectedCategory === null ? '#fff' : 'var(--text-2)' }}>
                    Todos
                </button>
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', background: selectedCategory === cat.id ? 'var(--accent)' : 'var(--surface-2)', color: selectedCategory === cat.id ? '#fff' : 'var(--text-2)' }}>
                        {cat.nombre}
                    </button>
                ))}
            </div>
            {/* Combos tab toggle */}
            {combos.length > 0 && (
                <button onClick={() => setActiveTab(activeTab === 'combos' ? 'menu' : 'combos')}
                    style={{ padding: '9px 16px', borderRadius: 12, border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: 'transparent', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                    ⚡ {activeTab === 'combos' ? 'Ver Menú' : `Combos (${combos.length})`}
                </button>
            )}
            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                {activeTab === 'combos' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                        {combos.map((combo: any) => (
                            <button key={combo.id} onClick={() => addCombo(combo)}
                                style={{ padding: '16px 14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'left', cursor: 'pointer', transition: 'all 120ms', fontFamily: 'inherit', minHeight: 80 }}>
                                <div style={{ fontSize: 20, marginBottom: 6 }}>⚡</div>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{combo.nombre}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{combo.items?.map((i: any) => i.nombre).join(' + ')}</div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                        {filteredProductos.map(prod => {
                            const inOrder = orderItems.find(i => i.id === prod.id);
                            return (
                                <button key={prod.id} onClick={() => addItem(prod)}
                                    style={{ position: 'relative', padding: '14px 12px', background: inOrder ? 'rgba(99,102,241,0.1)' : 'var(--surface-2)', border: `2px solid ${inOrder ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 16, textAlign: 'left', cursor: 'pointer', transition: 'all 120ms', fontFamily: 'inherit', minHeight: 90, WebkitTapHighlightColor: 'transparent' }}>
                                    {inOrder && (
                                        <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {inOrder.cantidad}
                                        </div>
                                    )}
                                    <div style={{ width: 36, height: 36, background: 'var(--surface)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                        {prod.categoria_id === 1 ? <Coffee size={18} color="var(--accent)" /> : <UtensilsCrossed size={18} color="var(--accent)" />}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.2, paddingRight: inOrder ? 24 : 0 }}>{prod.nombre}</div>
                                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent)' }}>{formatCOP(prod.precio)}</div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    // ─── Order summary panel (shared) ───
    const OrderSummary = ({ compact = false }: { compact?: boolean }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: compact ? '12px 16px' : '16px 20px', WebkitOverflowScrolling: 'touch' }}>
                {orderItems.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center', padding: 40 }}>
                        <ShoppingBag size={40} style={{ marginBottom: 12 }} />
                        <p style={{ fontWeight: 600, fontSize: 14 }}>Aún no hay productos</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Toca los productos del menú para agregarlos</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {orderItems.map(item => (
                            <div key={item.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ flex: 1, marginRight: 8 }}>
                                        <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{item.nombre}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{formatCOP(item.precio)} c/u</p>
                                    </div>
                                    <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)', flexShrink: 0 }}>{formatCOP(item.precio * item.cantidad)}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderRadius: 10, padding: '3px' }}>
                                        <button onClick={() => removeItem(item.id)}
                                            style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontSize: 18 }}>
                                            <Minus size={16} />
                                        </button>
                                        <span style={{ fontWeight: 800, fontSize: 15, minWidth: 28, textAlign: 'center' }}>{item.cantidad}</span>
                                        <button onClick={() => addItem(item)}
                                            style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button onClick={() => setOrderItems(curr => curr.filter(i => i.id !== item.id))}
                                        style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                                        Quitar
                                    </button>
                                </div>
                                {/* Note */}
                                {editingNota === item.id ? (
                                    <textarea
                                        autoFocus
                                        value={item.notas || ''}
                                        onChange={e => updateNota(item.id, e.target.value)}
                                        onBlur={() => setEditingNota(null)}
                                        placeholder="Ej: sin cebolla, extra salsa..."
                                        style={{ marginTop: 8, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'inherit', resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                                        rows={2}
                                    />
                                ) : (
                                    <button onClick={() => setEditingNota(item.id)}
                                        style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: item.notas ? 'var(--amber)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                                        <MessageSquare size={11} />
                                        {item.notas || 'Agregar nota...'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Submit */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em' }}>{formatCOP(total)}</span>
                </div>
                <button onClick={handleSubmit} disabled={orderItems.length === 0 || isSubmitting}
                    style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: orderItems.length === 0 ? 'var(--surface-2)' : 'var(--accent)', color: orderItems.length === 0 ? 'var(--text-3)' : '#fff', fontSize: 16, fontWeight: 800, cursor: orderItems.length === 0 ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 120ms', WebkitTapHighlightColor: 'transparent' }}>
                    <Send size={18} />
                    {isSubmitting ? 'Procesando...' : 'Enviar a Cocina'}
                </button>
            </div>
        </div>
    );

    // ─── Inline (desktop split-screen) mode ───
    if (inline) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Tomar Pedido</h2>
                        <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Mesa {mesaNumero}</p>
                    </div>
                    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
                        <X size={18} />
                    </button>
                </div>
                {/* Body: left=menu, right=order */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <MenuGrid />
                    </div>
                    <div style={{ width: 340, borderLeft: '1px solid var(--border)', flexShrink: 0 }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShoppingBag size={16} color="var(--accent)" />
                            <span style={{ fontWeight: 700, fontSize: 14 }}>Tu Pedido</span>
                            {totalItems > 0 && (
                                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{totalItems}</span>
                            )}
                        </div>
                        <div style={{ height: 'calc(100% - 49px)' }}>
                            <OrderSummary />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Mobile / modal mode: full screen with bottom tabs ───
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 70, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button onClick={onClose}
                    style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', flexShrink: 0 }}>
                    <ArrowLeft size={22} />
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Mesa {mesaNumero}</h2>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Tomar Pedido</p>
                </div>
                {totalItems > 0 && activeTab !== 'pedido' && (
                    <button onClick={() => setActiveTab('pedido')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, WebkitTapHighlightColor: 'transparent' }}>
                        <ShoppingBag size={16} />
                        {totalItems} · {formatCOP(total)}
                    </button>
                )}
            </div>

            {/* Content area */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab !== 'pedido' ? (
                    <div style={{ flex: 1, padding: '12px 14px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <MenuGrid />
                    </div>
                ) : (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <OrderSummary compact />
                    </div>
                )}
            </div>

            {/* Bottom tab bar */}
            <div style={{ display: 'flex', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <button onClick={() => setActiveTab('menu')}
                    style={{ flex: 1, padding: '14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: activeTab === 'menu' ? 'var(--accent)' : 'var(--text-3)', borderTop: `3px solid ${activeTab === 'menu' ? 'var(--accent)' : 'transparent'}`, WebkitTapHighlightColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <UtensilsCrossed size={20} />
                    Menú
                </button>
                {combos.length > 0 && (
                    <button onClick={() => setActiveTab('combos')}
                        style={{ flex: 1, padding: '14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: activeTab === 'combos' ? 'var(--accent)' : 'var(--text-3)', borderTop: `3px solid ${activeTab === 'combos' ? 'var(--accent)' : 'transparent'}`, WebkitTapHighlightColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        ⚡
                        Combos
                    </button>
                )}
                <button onClick={() => setActiveTab('pedido')}
                    style={{ flex: 1, padding: '14px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: activeTab === 'pedido' ? 'var(--accent)' : 'var(--text-3)', borderTop: `3px solid ${activeTab === 'pedido' ? 'var(--accent)' : 'transparent'}`, WebkitTapHighlightColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                    <ShoppingBag size={20} />
                    Pedido
                    {totalItems > 0 && (
                        <span style={{ position: 'absolute', top: 10, right: '50%', transform: 'translateX(12px)', background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{totalItems}</span>
                    )}
                </button>
            </div>
        </div>
    );
}
