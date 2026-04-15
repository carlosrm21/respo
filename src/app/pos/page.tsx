import { getMesas } from '../actions/mesas';
import { getProductos } from '../actions/pedido';
import HomeClient from '../HomeClient';
import type { Metadata } from 'next';
import { getLicenseStatus } from '@/lib/license';
import { getRestaurantSetting } from '@/lib/opsData';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function PosPage() {
  const mesasResult = await getMesas();
  const productosResult = await getProductos();

  const mesas = mesasResult.success ? mesasResult.data as any[] : [];
  const productos = productosResult.success ? productosResult.data as any[] : [];

  let restaurantName = '';
  try {
    restaurantName = (await getRestaurantSetting('restaurant_name')) || '';
  } catch (e) {
    // Si la tabla no existe o hay error, asume vacío
  }

  try {
    await getLicenseStatus();
  } catch (e) {
    // Si hay un error de lectura, el bloqueo final ocurre en el login por PIN.
  }

  return <HomeClient mesas={mesas} productos={productos} />;
}
