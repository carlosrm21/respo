import { getMesas } from '../actions/mesas';
import { getProductos } from '../actions/pedido';
import HomeClient from '../HomeClient';
import db from '@/lib/db';

export default async function PosPage() {
  const mesasResult = await getMesas();
  const productosResult = await getProductos();

  const mesas = mesasResult.success ? mesasResult.data as any[] : [];
  const productos = productosResult.success ? productosResult.data as any[] : [];

  let restaurantName = '';
  try {
    const configResult = await db.execute(`SELECT valor FROM configuracion_restaurante WHERE clave = 'restaurant_name'`);
    if (configResult.rows && configResult.rows[0]) {
      restaurantName = configResult.rows[0].valor as string;
    }
  } catch (e) {
    // Si la tabla no existe o hay error, asume vacío
  }

  let isExpired = false;
  let daysRemaining = 365;
  try {
    const licResult = await db.execute(`SELECT expiracion FROM sistema_licencia WHERE estado = 'activa' ORDER BY id DESC LIMIT 1`);
    if (licResult.rows && licResult.rows.length > 0) {
      const expiracion = licResult.rows[0].expiracion as string; // ej. 2027-04-02
      if (expiracion) {
        const expDate = new Date(expiracion);
        const diffMs = expDate.getTime() - new Date().getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) {
          isExpired = true;
          daysRemaining = 0;
        }
      }
    } else {
      // Si la tabla existe pero no hay licencia activa, bloquear
      isExpired = true;
      daysRemaining = 0;
    }
  } catch (e) {
    // Si la tabla no existe significa que es instalación fresca o modo dev, pasamos un periodo trial de gracia
    daysRemaining = 14; 
  }

  return <HomeClient mesas={mesas} productos={productos} restaurantName={restaurantName} isExpired={isExpired} daysRemaining={daysRemaining} />;
}
