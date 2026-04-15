# SEO Playbook RestoPOS

## Objetivo
Mejorar posicionamiento organico para busquedas transaccionales y de investigacion relacionadas con software POS para restaurantes en Colombia.

## SEO On-Page Implementado
- Metadata tecnica: title, description, Open Graph, Twitter, robots, canonical por pagina clave.
- Sitemap y robots optimizados para indexar contenido comercial y excluir rutas operativas.
- Structured data (JSON-LD): SoftwareApplication, Organization, WebSite y FAQPage.
- Enlazado interno: home hacia /dian-docs, /terms y /refund-policy.
- Control de indexacion: /pos, /cocina y /menu/[id] en noindex.

## SEO On-Page Recomendado (Contenido)
- Keyword principal por URL:
  - /: software POS para restaurantes, sistema POS Colombia, facturacion DIAN.
  - /dian-docs: integracion DIAN, API facturacion electronica.
  - /terms, /refund-policy: legal/compliance trust signals.
- Mantener una intencion por pagina (evitar canibalizacion).
- Crear cluster de contenido adicional:
  - /blog/software-pos-restaurantes
  - /blog/facturacion-electronica-dian-restaurantes
  - /blog/control-inventario-restaurantes

## SEO Off-Page (Plan 90 dias)
1. Citaciones y perfiles:
- Google Business Profile (si aplica marca local).
- Directorios B2B/SaaS en espanol y Colombia.
- Perfiles en redes con enlace canonico al dominio principal.

2. Link building tematico:
- Guest posts en blogs de gastronomia, tecnologia y pymes.
- Casos de exito de clientes con enlace dofollow a la home.
- Alianzas con consultoras contables/DIAN para enlaces de referencia.

3. PR digital:
- Nota de lanzamiento y actualizaciones de producto.
- Publicacion de reportes (ej. tendencias de tickets/promedio en restaurantes).

4. Autoridad de marca:
- Recolectar y publicar testimonios verificables.
- Conseguir menciones de marca en medios del sector Horeca.

## KPIs
- Impresiones organicas (GSC).
- CTR por query principal.
- Posicion media para keywords comerciales.
- Sesiones organicas y conversion rate a demo/pago.
- Backlinks nuevos por mes y dominios de referencia.

## Google Search Console (Activacion)
1. Crear propiedad tipo URL-prefix en Search Console con el dominio canonico.
2. Copiar el valor del metodo HTML Meta Tag.
3. Configurar variable de entorno:
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=tu_codigo_de_verificacion`
4. Desplegar el sitio y validar que el meta tag aparezca en el head.
5. Verificar la propiedad en Search Console.
6. Enviar `https://restopos.movilcomts.com/sitemap.xml`.

## Plan de Medicion 30 Dias
- Semana 1: revisar cobertura/indexacion y corregir URLs excluidas no deseadas.
- Semana 2: analizar CTR por consulta y optimizar title/description en pages top impresiones.
- Semana 3: comparar posicion media por cluster (POS, DIAN, inventario).
- Semana 4: evaluar conversion organica (sesion organica -> registro/pago) y decidir nuevas piezas de contenido.

## Checklist Tecnico Mensual
- Validar Search Console (cobertura/indexacion).
- Revisar errores de rastreo y Core Web Vitals.
- Actualizar sitemap y comprobar URLs canonicas.
- Auditar enlaces rotos internos/externos.
- Evaluar oportunidades de snippets enriquecidos (FAQ, SoftwareApplication).
