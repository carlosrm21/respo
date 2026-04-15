import React, { useState, useEffect } from 'react';
import { generate2FASecret, verifyAndEnable2FA, check2FAStatus, disable2FA } from '@/app/actions/adminAuth';
import { Loader2, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

export default function SecurityModule({ adminUsername }: { adminUsername: string }) {
  const [loading, setLoading] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    check2FAStatus(adminUsername).then(res => {
      if (res.success) {
        setIs2FAEnabled(!!res.enabled);
      }
      setLoading(false);
    });
  }, [adminUsername]);

  const startSetup = async () => {
    setActionLoading(true);
    const res = await generate2FASecret(adminUsername);
    if (res.success) {
      setTotpSecret(res.secret as string);
      setQrCodeData(res.qrCodeUrl as string);
      setSetupMode(true);
    } else {
      setError('Error generando QR. Intente de nuevo.');
    }
    setActionLoading(false);
  };

  const handleVerify = async () => {
    if (verifyCode.length < 6) return;
    setActionLoading(true);
    setError('');
    const res = await verifyAndEnable2FA(adminUsername, verifyCode, totpSecret);
    if (res.success) {
      setIs2FAEnabled(true);
      setSetupMode(false);
    } else {
      setError(res.error || 'Código inválido');
    }
    setActionLoading(false);
  };

  const handleDisable = async () => {
    const code = window.prompt('Para desactivar la seguridad avanzada, debes ingresar el código actual de tu Autenticador:');
    if (!code) return;
    
    setActionLoading(true);
    setError('');
    const res = await disable2FA(adminUsername, code);
    if (res.success) {
      setIs2FAEnabled(false);
      setTotpSecret('');
      setQrCodeData('');
      window.alert('Seguridad Avanzada (2FA) desactivada.');
    } else {
      setError(res.error || 'Código incorrecto. No se pudo desactivar.');
    }
    setActionLoading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header Panel */}
      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: is2FAEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${is2FAEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
            {is2FAEnabled ? <ShieldCheck size={32} color="var(--green)" /> : <ShieldAlert size={32} color="var(--red)" />}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Autenticación en 2 Pasos (2FA)</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
              La verificación en dos pasos añade una capa extra de defensa a tu cuenta administrativa. Cuando intentes iniciar sesión en tu sistema RestoPOS, además de tu contraseña maestra deberás proveer un código aleatorio generado en tu teléfono móvil.
            </p>

            {error && (
              <div style={{ padding: '12px 16px', background: 'var(--red-muted)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}

            {!is2FAEnabled && !setupMode && (
              <button onClick={startSetup} disabled={actionLoading} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <KeyRound size={16} /> Configurar 2FA ahora
              </button>
            )}

            {is2FAEnabled && !setupMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ padding: '6px 12px', background: 'var(--green-muted)', color: 'var(--green)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Activo Proteger</span>
                <button onClick={handleDisable} disabled={actionLoading} className="btn btn-ghost" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Desactivar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {setupMode && (
         <div className="card anim-fade-up" style={{ padding: 32, border: '1px solid var(--border-active)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Configuración de 3 Pasos</h3>
            
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <ol style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <li>Descarga la aplicación <strong>Google Authenticator</strong> o <strong>Authy</strong> en tu teléfono.</li>
                  <li>Añade una nueva cuenta escaneando el código QR que ves en pantalla.</li>
                  <li>Ingresa el código numérico de 6 dígitos generado por tu aplicación para verificar la sincronización antes de guardarlo definitivamente.</li>
                </ol>
                <div style={{ marginTop: 24 }}>
                   <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Código de Verificación Actual:</label>
                   <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                     <input 
                       autoFocus
                       type="text" 
                       maxLength={6} 
                       value={verifyCode}
                       onChange={e => setVerifyCode(e.target.value)}
                       placeholder="Ej. 123456" 
                       className="input" 
                       style={{ maxWidth: 160, fontSize: 18, letterSpacing: '4px', textAlign: 'center' }} 
                     />
                     <button onClick={handleVerify} disabled={actionLoading || verifyCode.length < 6} className="btn btn-primary" style={{ flexShrink: 0, padding: '0 24px' }}>
                       {actionLoading ? 'Procesando...' : 'Confirmar Sincronización'}
                     </button>
                   </div>
                </div>
                <button onClick={() => setSetupMode(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, marginTop: 20, cursor: 'pointer', textDecoration: 'underline' }}>
                   Cancelar Configuración
                </button>
              </div>
              <div style={{ width: 140, height: 140, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid var(--border)' }}>
                 {qrCodeData && <img src={qrCodeData} alt="QR Code" style={{ width: '100%', height: '100%' }} />}
              </div>
            </div>
         </div>
      )}
    </div>
  );
}
