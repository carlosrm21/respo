'use client';
import { useState, useEffect } from 'react';
import { Save, TestTube, ExternalLink, CheckCircle, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';

const PROVIDERS = [
    {
        id: 'siigo',
        name: 'Siigo',
        desc: 'Proveedor líder en Colombia',
        docsUrl: 'https://siigodoc.online/api-facturacion-electronica',
        apiUrlDefault: 'https://api.siigo.com/v1',
    },
    {
        id: 'alegra',
        name: 'Alegra',
        desc: 'Software contable y facturación',
        docsUrl: 'https://developer.alegra.com',
        apiUrlDefault: 'https://api.alegra.com/api/v1',
    },
    {
        id: 'factus',
        name: 'Factus (DIAN)',
        desc: 'Proveedor tecnológico DIAN',
        docsUrl: 'https://factus.com.co/docs',
        apiUrlDefault: 'https://api.factus.com.co/v1',
    },
    {
        id: 'heifactura',
        name: 'Heifactura',
        desc: 'Facturación electrónica DIAN',
        docsUrl: 'https://heifactura.co',
        apiUrlDefault: 'https://api.heifactura.co/v1',
    },
    {
        id: 'custom',
        name: 'Personalizado',
        desc: 'Ingresa tu propio proveedor',
        docsUrl: '',
        apiUrlDefault: '',
    },
];

export default function FacturacionElectronica() {
    const [config, setConfig] = useState({
        provider: '',
        apiUrl: '',
        apiKey: '',
        nit: '',
        razonSocial: '',
        regimen: 'simplificado',
        testMode: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasConfig, setHasConfig] = useState(false);

    useEffect(() => {
        fetch('/api/fe-config')
            .then(r => r.json())
            .then(r => {
                if (r.success && r.data) {
                    setConfig({ ...config, ...r.data });
                    setHasConfig(true);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const selectedProvider = PROVIDERS.find(p => p.id === config.provider);

    const handleProviderSelect = (p: typeof PROVIDERS[0]) => {
        setConfig(c => ({ ...c, provider: p.id, apiUrl: p.apiUrlDefault || c.apiUrl }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await fetch('/api/fe-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            setSaved(true);
            setHasConfig(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTestStatus('testing');
        // Simulate an API connectivity test
        await new Promise(r => setTimeout(r, 1500));
        // Try to reach the configured URL
        try {
            const res = await fetch('/api/fe-config/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiUrl: config.apiUrl, apiKey: config.apiKey }),
            });
            const data = await res.json();
            setTestStatus(data.success ? 'ok' : 'error');
        } catch {
            setTestStatus('error');
        }
        setTimeout(() => setTestStatus('idle'), 5000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Facturación Electrónica</h2>
                    <p style={{ fontSize: 13.5, color: 'var(--text-3)' }}>Configura la integración con tu proveedor de FE autorizado por la DIAN</p>
                </div>
                {hasConfig && (
                    <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <CheckCircle size={12} />
                        Configuración activa
                    </span>
                )}
            </div>

            {/* Info card */}
            <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>¿Cómo funciona?</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
                        Selecciona tu proveedor de Facturación Electrónica habilitado por la DIAN, ingresa tus credenciales de API y activa la integración. Las facturas generadas en RestoPOS se enviarán automáticamente a la DIAN a través de tu proveedor. Puedes usar el <strong>modo prueba</strong> antes de activar en producción.
                    </p>
                </div>
            </div>

            {/* Step 1: Provider */}
            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                    Selecciona tu proveedor
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                    {PROVIDERS.map(p => (
                        <button key={p.id} onClick={() => handleProviderSelect(p)}
                            style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${config.provider === p.id ? 'var(--accent)' : 'var(--border)'}`, background: config.provider === p.id ? 'var(--accent-muted)' : 'var(--surface-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 100ms' }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: config.provider === p.id ? 'var(--accent-hover)' : 'var(--text)' }}>{p.name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{p.desc}</div>
                            {p.docsUrl && (
                                <a href={p.docsUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                    style={{ fontSize: 11, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 8 }}>
                                    <ExternalLink size={10} /> Ver docs
                                </a>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Credentials */}
            <div className="card" style={{ padding: 24, opacity: config.provider ? 1 : 0.5, pointerEvents: config.provider ? 'all' : 'none' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: config.provider ? 'var(--accent)' : 'var(--surface-2)', color: config.provider ? '#fff' : 'var(--text-3)', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                    Credenciales de API
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {/* API URL */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>URL del API</label>
                        <input value={config.apiUrl} onChange={e => setConfig(c => ({ ...c, apiUrl: e.target.value }))}
                            placeholder="https://api.proveedor.com/v1"
                            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* API Key */}
                    <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>API Key / Token</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showKey ? 'text' : 'password'} value={config.apiKey} onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))}
                                placeholder="Tu clave secreta de API"
                                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 42px 10px 14px', fontSize: 13.5, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                            <button onClick={() => setShowKey(s => !s)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* NIT */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>NIT del emisor</label>
                        <input value={config.nit} onChange={e => setConfig(c => ({ ...c, nit: e.target.value }))}
                            placeholder="900123456-1"
                            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* Razón Social */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Razón Social</label>
                        <input value={config.razonSocial} onChange={e => setConfig(c => ({ ...c, razonSocial: e.target.value }))}
                            placeholder="Mi Restaurante S.A.S."
                            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    {/* Régimen */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 6 }}>Régimen tributario</label>
                        <select value={config.regimen} onChange={e => setConfig(c => ({ ...c, regimen: e.target.value }))}
                            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                            <option value="simplificado">Régimen Simplificado</option>
                            <option value="comun">Responsable de IVA</option>
                            <option value="gran_contribuyente">Gran Contribuyente</option>
                        </select>
                    </div>

                    {/* Test mode toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => setConfig(c => ({ ...c, testMode: !c.testMode }))}
                            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: config.testMode ? 'var(--amber)' : 'var(--green)', cursor: 'pointer', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
                            <span style={{ position: 'absolute', top: 3, left: config.testMode ? 3 : 'auto', right: config.testMode ? 'auto' : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'all 200ms', display: 'block' }} />
                        </button>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>Modo {config.testMode ? 'Prueba' : 'Producción'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{config.testMode ? 'No envía a DIAN real' : 'Activo en DIAN'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 3: Actions */}
            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={handleSave} disabled={saving || !config.provider}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14, opacity: !config.provider ? 0.4 : 1 }}>
                    {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                    {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar configuración'}
                </button>

                <button onClick={handleTest} disabled={testStatus === 'testing' || !config.apiUrl || !config.apiKey}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, opacity: (!config.apiUrl || !config.apiKey) ? 0.4 : 1 }}>
                    <TestTube size={16} />
                    {testStatus === 'testing' ? 'Probando...' : 'Probar conexión'}
                </button>

                {testStatus === 'ok' && (
                    <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <CheckCircle size={12} /> Conexión exitosa
                    </span>
                )}
                {testStatus === 'error' && (
                    <span className="badge badge-red" style={{ padding: '6px 12px', fontSize: 12 }}>
                        <AlertCircle size={12} /> Error de conexión — verifica tus credenciales
                    </span>
                )}
            </div>

            {/* Current config summary */}
            {hasConfig && (
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--text-3)' }}>CONFIGURACIÓN ACTIVA</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                        {[
                            { label: 'Proveedor', value: selectedProvider?.name || config.provider },
                            { label: 'NIT', value: config.nit || '—' },
                            { label: 'Razón Social', value: config.razonSocial || '—' },
                            { label: 'Régimen', value: config.regimen === 'simplificado' ? 'Régimen Simplificado' : config.regimen === 'comun' ? 'Responsable de IVA' : 'Gran Contribuyente' },
                            { label: 'Entorno', value: config.testMode ? '🧪 Modo Prueba' : '✅ Producción' },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
