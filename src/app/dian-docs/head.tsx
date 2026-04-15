const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export default function Head() {
  const canonical = `${siteUrl}/dian-docs`;

  return (
    <>
      <title>Integracion DIAN para Restaurantes | RestoPOS</title>
      <meta
        name="description"
        content="Guia tecnica para integrar facturacion electronica DIAN en RestoPOS con proveedores como Siigo, Alegra y Factus."
      />
      <meta name="keywords" content="integracion DIAN, facturacion electronica DIAN, API SIIGO, API Alegra, software restaurante Colombia" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content="Integracion DIAN para Restaurantes | RestoPOS" />
      <meta property="og:description" content="Implementa facturacion electronica DIAN en tu restaurante con una guia paso a paso." />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content="Integracion DIAN para Restaurantes | RestoPOS" />
      <meta name="twitter:description" content="Guia de integracion DIAN para restaurantes en Colombia." />
    </>
  );
}
