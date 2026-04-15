import type { Metadata } from 'next';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export const metadata: Metadata = {
  title: 'Control de Inventario para Restaurantes',
  description: 'Mejora el margen de tu restaurante con control de inventario: mermas, rotacion, compras y estandarizacion de recetas.',
  alternates: {
    canonical: `${siteUrl}/blog/control-inventario-restaurantes`
  }
};

export default function InventoryPostPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <article style={{ maxWidth: 840, margin: '0 auto', padding: '56px 20px 80px', lineHeight: 1.75 }}>
        <p style={{ color: '#a78bfa', fontWeight: 700 }}>RENTABILIDAD</p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: 0 }}>Control de inventario para restaurantes sin perder margen</h1>
        <p style={{ color: '#a1a1aa' }}>
          Un restaurante puede vender mas y ganar menos si no controla inventario. Estas practicas ayudan a proteger margen y flujo de caja.
        </p>

        <h2>1. Recetas estandarizadas por producto</h2>
        <p>Cada venta debe descontar inventario real segun receta. Si no hay estandar, el dato operativo no sirve para tomar decisiones.</p>

        <h2>2. Minimos y alertas automatizadas</h2>
        <p>Configura umbrales por insumo critico. Comprar tarde o comprar de mas impacta costo y experiencia del cliente.</p>

        <h2>3. Mermas registradas por causa</h2>
        <p>No basta con contar faltantes: separa merma por caducidad, preparacion o desperdicio para atacar la raiz del problema.</p>

        <h2>4. Cruce inventario vs ventas</h2>
        <p>Compara consumo esperado con consumo real por periodo. Ese diferencial revela fugas, errores o procesos ineficientes.</p>

        <p style={{ marginTop: 30 }}>
          Siguiente paso: <Link href="/blog/software-pos-restaurantes" style={{ color: '#a78bfa' }}>ver checklist de software POS para restaurantes</Link>
        </p>
      </article>
    </main>
  );
}
