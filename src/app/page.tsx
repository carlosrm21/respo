import LandingUI from '@/components/LandingUI';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Software POS para Restaurantes — RestoPOS SaaS",
  description: "Sistema premium de punto de venta, toma de pedidos para meseros, comandas en cocina y facturación electrónica.",
};

export default function Home() {
  return <LandingUI />;
}
