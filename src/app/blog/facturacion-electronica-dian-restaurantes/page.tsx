import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Facturacion Electronica DIAN para Restaurantes',
  description: 'Guia practica para implementar facturacion electronica DIAN en restaurantes, con pasos, errores comunes y recomendaciones.',
  alternates: {
    canonical: `${siteUrl}/blog/facturacion-electronica-dian-restaurantes`
  }
};

export default function DianPostPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <article style={{ maxWidth: 840, margin: '0 auto', padding: '56px 20px 80px', lineHeight: 1.75 }}>
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>CUMPLIMIENTO DIAN</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 0 }}>Facturacion electronica DIAN para restaurantes: guia rapida</h1>
        <p style={{ color: '#a1a1aa' }}>
          La facturacion electronica no es solo cumplimiento: tambien mejora control, trazabilidad y cierre diario cuando esta integrada al POS.
        </p>

        <h2>1. Define proveedor y esquema de integracion</h2>
        <p>Evalua soporte, estabilidad de API y tiempos de respuesta. Evita integraciones improvisadas que obliguen reprocesos manuales.</p>

        <h2>2. Estandariza datos fiscales</h2>
        <p>Antes de salir a produccion, valida NIT, resolucion y parametros de numeracion. Los errores de datos suelen generar la mayoria de rechazos.</p>

        <h2>3. Integra facturacion al cierre de venta</h2>
        <p>El mejor resultado se logra cuando cobro y emision se ejecutan en un mismo flujo, con trazabilidad desde pedido hasta factura.</p>

        <h2>4. Pruebas y monitoreo</h2>
        <p>Monitorea rechazos, latencia de emision y volumen por hora. Define alertas para evitar acumulacion de pendientes en hora pico.</p>

        <p style={{ marginTop: 30 }}>
          Ver tambien: <Link href="/dian-docs" style={{ color: '#a78bfa' }}>Documentacion tecnica DIAN de RestoPOS</Link>
        </p>
      </article>
    </main>
  );
}
