import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Software POS para Restaurantes en 2026',
  description: 'Aprende que debe tener un software POS para restaurantes: pedidos, mesas, KDS, inventario, analiticas y cumplimiento DIAN.',
  alternates: {
    canonical: `${siteUrl}/blog/software-pos-restaurantes`
  }
};

export default function PosPostPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <article style={{ maxWidth: 840, margin: '0 auto', padding: '56px 20px 80px', lineHeight: 1.75 }}>
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>GUIA POS</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 0 }}>Software POS para restaurantes: que debe tener en 2026</h1>
        <p style={{ color: '#a1a1aa' }}>
          Elegir un buen software POS impacta tiempos de servicio, ticket promedio y control operativo. Este checklist resume lo esencial para restaurantes en Colombia.
        </p>

        <h2>1. Flujo completo de pedidos y mesas</h2>
        <p>El sistema debe cubrir mesa, para llevar y delivery sin fricciones. Tambien debe mostrar estado en tiempo real para evitar errores entre salon y cocina.</p>

        <h2>2. Cocina KDS y tiempos de preparacion</h2>
        <p>Un KDS bien implementado reduce comandas perdidas y mejora el throughput en horas pico. Busca alertas de pedidos atrasados y estados por etapa.</p>

        <h2>3. Facturacion electronica DIAN integrada</h2>
        <p>Evita soluciones aisladas. Lo ideal es emitir factura desde el mismo flujo de cobro y sincronizar datos fiscales sin doble digitacion.</p>

        <h2>4. Inventario y mermas</h2>
        <p>Controla ingredientes por receta, consumo por venta y alertas de minimo. Sin inventario, el margen se erosiona incluso con buenas ventas.</p>

        <h2>5. Analiticas y decisiones</h2>
        <p>Mide ticket promedio, hora pico, productos mas rentables y desempeno por turno. Sin datos, no hay mejora sostenible.</p>

        <p style={{ marginTop: 30 }}>
          Siguiente lectura: <Link href="/blog/facturacion-electronica-dian-restaurantes" style={{ color: '#a78bfa' }}>Facturacion electronica DIAN para restaurantes</Link>
        </p>
      </article>
    </main>
  );
}
