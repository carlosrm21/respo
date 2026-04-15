const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export default function Head() {
  const canonical = `${siteUrl}/refund-policy`;

  return (
    <>
      <title>Politica de Reembolsos y Devoluciones | RestoPOS</title>
      <meta
        name="description"
        content="Revisa la politica de devoluciones y reembolsos de RestoPOS para Colombia: retracto legal, condiciones y proceso de solicitud."
      />
      <meta name="keywords" content="politica de reembolso software, retracto ley 1480, devoluciones SaaS Colombia" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content="Politica de Reembolsos y Devoluciones | RestoPOS" />
      <meta property="og:description" content="Conoce el proceso y condiciones para solicitar devoluciones y reembolsos en RestoPOS." />
      <meta property="og:url" content={canonical} />
    </>
  );
}
