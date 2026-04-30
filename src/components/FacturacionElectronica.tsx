'use client';
import { useState, useEffect } from 'react';
import { Save, TestTube, ExternalLink, CheckCircle, AlertCircle, Eye, EyeOff, Info, ShieldCheck, AlertTriangle } from 'lucide-react';

const PROVIDERS = [
  { id: 'factus',     name: 'Factus',      desc: 'PTH habilitado DIAN · Pymes',        docsUrl: 'https://factus.com.co/docs',                    apiUrlDefault: 'https://api.factus.com.co/v1' },
  { id: 'siigo',      name: 'Siigo',       desc: 'Contabilidad + FE · Líder Colombia',  docsUrl: 'https://siigodoc.online/api-facturacion',       apiUrlDefault: 'https://api.siigo.com/v1' },
  { id: 'alegra',     name: 'Alegra',      desc: 'Software contable · Pymes',           docsUrl: 'https://developer.alegra.com',                  apiUrlDefault: 'https://api.alegra.com/api/v1' },
  { id: 'loggro',     name: 'Loggro',      desc: 'ERP + FE · Líder Colombia',           docsUrl: 'https://loggro.com',                            apiUrlDefault: 'https://api.loggro.com/v1' },
  { id: 'custom',     name: 'Otro PTH',    desc: 'Ingresa tu propio proveedor DIAN',    docsUrl: 'https://www.dian.gov.co/facturae/facturae/Paginas/Proveedores-Tecnol%C3%B3gicos.aspx', apiUrlDefault: '' },
];

const PREREQUISITOS = [
  { id: 'rut',      label: 'RUT activo con actividad económica CIIU 5611 (restaurantes)',          link: 'https://www.dian.gov.co/tramitesservicios/Paginas/Registro-Unico-Tributario-RUT.aspx' },
  { id: 'pth',      label: 'Contrato vigente con un Proveedor Tecnológico Habilitado (PTH) DIAN', link: 'https://www.dian.gov.co/facturae/facturae/Paginas/Proveedores-Tecnol%C3%B3gicos.aspx' },
  { id: 'rango',    label: 'Rango de numeración autorizado por DIAN para su prefijo',             link: 'https://muisca.dian.gov.co/WebArquitectaRecaudos/DefAutorizacionNumeracion.faces' },
  { id: 'habilitado', label: 'Empresa habilitada como facturador electrónico ante la DIAN',       link: 'https://catalogo-vpfe.dian.gov.co/User/Login' },
];

export default function FacturacionElectronica() {
  const [step, setStep] = useState<'prereq' | 'config'>('prereq');
  const [prereqChecked, setPrereqChecked] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState({
    provider: '', apiUrl: '', apiKey: '', nit: '', razonSocial: '',
    regimen: 'simplificado', testMode: true,
    // Campos legales DIAN
    direccion: '', ciudad: '', departamento: '', ciiu: '5611',
    emailDian: '', tipoContribuyente: 'persona_juridica',
    prefijo: '', rangoDesde: '1', rangoHasta: '1000',
    habilitadoDian: false,
  });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [showKey, setShowKey]     = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle'|'testing'|'ok'|'error'>('idle');
  const [testMsg, setTestMsg]     = useState('');

  useEffect(() => {
    fetch('/api/fe-config').then(r => r.json()).then(r => {
      if (r.success && r.data) { setConfig(c => ({ ...c, ...r.data })); setHasConfig(true); setStep('config'); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const allPrereqDone = PREREQUISITOS.every(p => prereqChecked[p.id]);
  const selectedProvider = PROVIDERS.find(p => p.id === config.provider);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await fetch('/api/fe-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false); setSaved(true); setHasConfig(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTestStatus('testing'); setTestMsg('');
    try {
      const res = await fetch('/api/fe-config/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiUrl: config.apiUrl, apiKey: config.apiKey, provider: config.provider }) });
      const data = await res.json();
      setTestStatus(data.success ? 'ok' : 'error');
      setTestMsg(data.message || (data.success ? 'Conexión exitosa' : data.error || 'Error de conexión'));
    } catch { setTestStatus('error'); setTestMsg('No se pudo conectar.'); }
    setTimeout(() => { setTestStatus('idle'); setTestMsg(''); }, 6000);
  };

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'inherit', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', ...extra });
  const lbl = (extra?: React.CSSProperties): React.CSSProperties => ({ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em', ...extra });

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}><div className="spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 3 }}>Facturación Electrónica DIAN</h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Integración con Proveedor Tecnológico Habilitado · Res. DIAN 000042/2020</p>
        </div>
        {hasConfig && <span className="badge badge-green" style={{ padding: '6px 12px', fontSize: 11 }}><CheckCircle size={11} /> Configuración activa</span>}
      </div>

      {/* Aviso legal */}
      <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <AlertTriangle size={15} color="#ca8a04" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-2)' }}>
          <strong>Aviso legal:</strong> RestoPOS es un software POS intermediario, <strong>no es un Proveedor Tecnológico Habilitado (PTH)</strong> ante la DIAN. 
          La responsabilidad de la emisión electrónica recae sobre el restaurante y su PTH contratado. 
          RestoPOS transmite los datos al PTH configurado; el PTH los valida y envía a la DIAN. 
          Consulta los <a href="/terms" style={{ color: 'var(--accent)' }}>Términos de Servicio</a> para más detalles.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[{ id: 'prereq', label: '① Prerequisitos legales' }, { id: 'config', label: '② Configuración PTH' }].map(t => (
          <button key={t.id} onClick={() => setStep(t.id as any)}
            style={{ padding: '8px 16px', fontSize: 12.5, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', color: step === t.id ? 'var(--accent)' : 'var(--text-3)', borderBottom: step === t.id ? '2px solid var(--accent)' : '2px solid transparent', marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PASO 1: PREREQUISITOS ── */}
      {step === 'prereq' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Antes de configurar, confirma que tienes:</h3>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>El restaurante debe cumplir estos requisitos legales ante la DIAN. Marca cada uno una vez verificado.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PREREQUISITOS.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!prereqChecked[p.id]} onChange={e => setPrereqChecked(c => ({ ...c, [p.id]: e.target.checked }))} style={{ marginTop: 2, width: 15, height: 15, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>
                    {p.label}{' '}
                    <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--accent)' }}>
                      <ExternalLink size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Ver en DIAN
                    </a>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Guía rápida */}
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Normativa aplicable</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
              {[
                { n: 'Resolución 000042/2020', d: 'Marco principal de facturación electrónica' },
                { n: 'Resolución 000165/2023', d: 'Actualización UBL 2.1 y requisitos técnicos' },
                { n: 'Decreto 358/2020',       d: 'Obligados a facturar electrónicamente' },
                { n: 'Art. 512-1 E.T.',        d: 'INC 8% impuesto al consumo restaurantes' },
                { n: 'Art. 616-1 E.T.',        d: 'Base legal de la factura electrónica' },
                { n: 'Art. 632 E.T.',          d: 'Conservación de documentos 5 años' },
              ].map(r => (
                <div key={r.n} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{r.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.d}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setStep('config')} disabled={!allPrereqDone}
            className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: allPrereqDone ? 1 : 0.4 }}>
            <ShieldCheck size={14} /> Continuar a configuración →
          </button>
          {!allPrereqDone && <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Marca todos los prerequisitos para continuar.</p>}
        </div>
      )}

      {/* ── PASO 2: CONFIGURACIÓN PTH ── */}
      {step === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selección de PTH */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              Selecciona tu PTH habilitado DIAN
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setConfig(c => ({ ...c, provider: p.id, apiUrl: p.apiUrlDefault || c.apiUrl }))}
                  style={{ padding: '12px 14px', borderRadius: 10, border: `2px solid ${config.provider === p.id ? 'var(--accent)' : 'var(--border)'}`, background: config.provider === p.id ? 'var(--accent-muted)' : 'var(--surface-2)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: config.provider === p.id ? 'var(--accent-hover)' : 'var(--text)', marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.desc}</div>
                  {p.docsUrl && <a href={p.docsUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 10, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 6 }}><ExternalLink size={9} /> Docs</a>}
                </button>
              ))}
            </div>
          </div>

          {/* Credenciales API */}
          <div className="card" style={{ padding: 20, opacity: config.provider ? 1 : 0.5, pointerEvents: config.provider ? 'all' : 'none' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              Credenciales del PTH
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl()}>URL del API del PTH</label>
                <input value={config.apiUrl} onChange={e => setConfig(c => ({ ...c, apiUrl: e.target.value }))} placeholder="https://api.proveedor.com/v1" style={inp()} />
              </div>
              <div style={{ gridColumn: '1/-1', position: 'relative' }}>
                <label style={lbl()}>API Key / Token del PTH</label>
                <input type={showKey ? 'text' : 'password'} value={config.apiKey} onChange={e => setConfig(c => ({ ...c, apiKey: e.target.value }))} placeholder="Token secreto del proveedor" style={inp({ paddingRight: 42 })} />
                <button onClick={() => setShowKey(s => !s)} style={{ position: 'absolute', right: 10, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div>
                <label style={lbl()}>Modo de operación</label>
                <button onClick={() => setConfig(c => ({ ...c, testMode: !c.testMode }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${config.testMode ? 'rgba(234,179,8,0.4)' : 'rgba(34,197,94,0.4)'}`, background: config.testMode ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, color: config.testMode ? '#ca8a04' : 'var(--green)' }}>
                  {config.testMode ? '🧪 Modo Prueba (no va a DIAN)' : '✅ Producción (DIAN real)'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={lbl()}>Prefijo DIAN autorizado</label>
                <input value={config.prefijo} onChange={e => setConfig(c => ({ ...c, prefijo: e.target.value }))} placeholder="ej: SETP" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Rango desde</label>
                <input type="number" value={config.rangoDesde} onChange={e => setConfig(c => ({ ...c, rangoDesde: e.target.value }))} placeholder="1" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Rango hasta</label>
                <input type="number" value={config.rangoHasta} onChange={e => setConfig(c => ({ ...c, rangoHasta: e.target.value }))} placeholder="1000" style={inp()} />
              </div>
            </div>
          </div>

          {/* Datos del emisor (legales) */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              Datos del emisor (obligatorios por DIAN)
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>Res. 000042/2020 — deben aparecer en cada factura electrónica emitida.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl()}>NIT con dígito de verificación</label>
                <input value={config.nit} onChange={e => setConfig(c => ({ ...c, nit: e.target.value }))} placeholder="900123456-1" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Razón Social</label>
                <input value={config.razonSocial} onChange={e => setConfig(c => ({ ...c, razonSocial: e.target.value }))} placeholder="Mi Restaurante S.A.S." style={inp()} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl()}>Dirección del establecimiento</label>
                <input value={config.direccion} onChange={e => setConfig(c => ({ ...c, direccion: e.target.value }))} placeholder="Calle 10 # 5-20 Local 3" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Ciudad</label>
                <input value={config.ciudad} onChange={e => setConfig(c => ({ ...c, ciudad: e.target.value }))} placeholder="Cali" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Departamento</label>
                <input value={config.departamento} onChange={e => setConfig(c => ({ ...c, departamento: e.target.value }))} placeholder="Valle del Cauca" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Correo electrónico DIAN</label>
                <input type="email" value={config.emailDian} onChange={e => setConfig(c => ({ ...c, emailDian: e.target.value }))} placeholder="facturacion@restaurante.com" style={inp()} />
              </div>
              <div>
                <label style={lbl()}>Código CIIU</label>
                <input value={config.ciiu} onChange={e => setConfig(c => ({ ...c, ciiu: e.target.value }))} placeholder="5611" style={inp()} />
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>5611 = Restaurantes y cafeterías</span>
              </div>
              <div>
                <label style={lbl()}>Régimen tributario</label>
                <select value={config.regimen} onChange={e => setConfig(c => ({ ...c, regimen: e.target.value }))} style={inp()}>
                  <option value="simplificado">No responsable de IVA (antes Simplificado)</option>
                  <option value="comun">Responsable de IVA (antes Régimen Común)</option>
                  <option value="gran_contribuyente">Gran Contribuyente</option>
                </select>
              </div>
              <div>
                <label style={lbl()}>Tipo de contribuyente</label>
                <select value={config.tipoContribuyente} onChange={e => setConfig(c => ({ ...c, tipoContribuyente: e.target.value }))} style={inp()}>
                  <option value="persona_juridica">Persona Jurídica</option>
                  <option value="persona_natural">Persona Natural</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleSave} disabled={saving || !config.provider} className="btn btn-primary" style={{ gap: 8, opacity: !config.provider ? 0.4 : 1 }}>
              {saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar configuración'}
            </button>
            <button onClick={handleTest} disabled={testStatus === 'testing' || !config.apiUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', fontSize: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              <TestTube size={14} />
              {testStatus === 'testing' ? 'Probando...' : 'Probar conexión'}
            </button>
            {testStatus === 'ok'    && <span className="badge badge-green" style={{ fontSize: 11 }}><CheckCircle size={11} /> {testMsg}</span>}
            {testStatus === 'error' && <span className="badge badge-red"   style={{ fontSize: 11 }}><AlertCircle size={11} /> {testMsg}</span>}
          </div>

          {/* Nota INC */}
          <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '11px 15px', display: 'flex', gap: 10 }}>
            <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              <strong>INC Restaurantes:</strong> El sistema aplica automáticamente el <strong>8% de Impuesto al Consumo (INC)</strong> según el Art. 512-1 del Estatuto Tributario. 
              Si el restaurante es <em>No Responsable de IVA</em>, el IVA se reporta en 0%. 
              Verifica con tu contador el régimen aplicable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
