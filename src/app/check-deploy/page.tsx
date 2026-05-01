'use client';
export default function CheckDeploy() {
  return (
    <div style={{ padding: 100, textAlign: 'center', background: '#000', color: '#fff' }}>
      <h1>DESPLIEGUE EXITOSO</h1>
      <p>Fecha/Hora: {new Date().toLocaleString()}</p>
      <p>ID: {Math.random().toString(36).substring(7)}</p>
    </div>
  );
}
