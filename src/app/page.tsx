import { getMesas } from './actions/mesas';
import { getProductos } from './actions/pedido';
import HomeClient from './HomeClient';

export default async function Home() {
  const mesasResult = await getMesas();
  const productosResult = await getProductos();

  const mesas = mesasResult.success ? mesasResult.data as any[] : [];
  const productos = productosResult.success ? productosResult.data as any[] : [];

  return <HomeClient mesas={mesas} productos={productos} />;
}
