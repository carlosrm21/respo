import { getMesas } from '../actions/mesas';
import { getProductos } from '../actions/pedido';
import HomeClient from '../HomeClient';
import type { Metadata } from 'next';
import { getLicenseStatus } from '@/lib/license';
import { getRestaurantSetting } from '@/lib/opsData';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function PosPage() {
  try {
    const mesasResult = await getMesas();
    const productosResult = await getProductos();

    const mesas = mesasResult.success ? mesasResult.data as any[] : [];
    const productos = productosResult.success ? productosResult.data as any[] : [];

    let restaurantName = '';
    try {
      restaurantName = (await getRestaurantSetting('restaurant_name')) || '';
    } catch (e) {
      // Ignorar
    }

    let license: any = null;
    try {
      license = await getLicenseStatus();
    } catch (e) {
      // Login bloqueará
    }

    return <HomeClient mesas={mesas} productos={productos} license={license} />;
  } catch (err: any) {
    if (err.message === 'TENANT_MISSING') {
      redirect('/');
    }
    throw err;
  }
}
