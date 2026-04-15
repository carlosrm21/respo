const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com';

export default function Head() {
  const canonical = `${siteUrl}/terms`;

  return (
    <>
      <title>Terminos y Condiciones del Software POS | RestoPOS</title>
      <meta
        name="description"
        content="Conoce los terminos y condiciones del software POS RestoPOS: licencia anual, responsabilidades, soporte y limitaciones."
      />
      <meta name="keywords" content="terminos y condiciones software POS, licencia software restaurante, RestoPOS legal" />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content="Terminos y Condiciones del Software POS | RestoPOS" />
      <meta property="og:description" content="Marco legal de uso del software POS para restaurantes RestoPOS." />
      <meta property="og:url" content={canonical} />
    </>
  );
}
