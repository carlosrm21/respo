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

## SEO On-Page (Checklist Editorial por Publicacion)
1. Definir keyword primaria y 3-5 keywords secundarias por URL.
2. Titulo SEO de 50-60 caracteres con keyword al inicio.
3. Meta description de 140-160 caracteres con propuesta de valor y CTA.
4. 1 solo H1 por pagina y subtitulos H2/H3 orientados a intencion de busqueda.
5. Incluir 2-4 enlaces internos hacia URLs del cluster (blog, home, /dian-docs).
6. Incluir 1-2 enlaces externos a fuentes confiables (DIAN, Google Search Central, etc.).
7. Agregar datos estructurados (Article + BreadcrumbList o FAQ cuando aplique).
8. Validar canonical, Open Graph, Twitter cards y indexabilidad.

## Mapa de Keywords por Intencion
- Comercial alta:
  - software POS para restaurantes
  - sistema POS Colombia
  - software para restaurantes con facturacion DIAN
- Informacional transaccional:
  - facturacion electronica DIAN restaurantes
  - control de inventario para restaurantes
  - como elegir software POS para restaurante
- Navegacional de marca:
  - RestoPOS
  - RestoPOS DIAN
  - RestoPOS blog

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

## Off-Page Operativo (Sprints)
- Sprint 1 (Semanas 1-2):
  - Crear listado de 40 dominios objetivo (Horeca, SaaS, contabilidad, pymes Colombia).
  - Publicar 3 piezas "linkable" (guia DIAN, benchmark inventario, checklist POS).
  - KPI: 5 backlinks nuevos, 10 menciones de marca.
- Sprint 2 (Semanas 3-6):
  - Ejecutar outreach con propuesta de guest post y casos de uso de clientes.
  - Cerrar 4 colaboraciones editoriales y 2 menciones en medios verticales.
  - KPI: +8 dominios de referencia, mejora de posicion media en keywords comerciales.
- Sprint 3 (Semanas 7-12):
  - Publicar estudio de datos propio (ej. ticket promedio y horas pico por tipo de restaurante).
  - Activar PR digital y redistribucion en comunidades/boletines del sector.
  - KPI: +12 dominios de referencia y aumento de sesiones organicas no-brand.

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

## Dashboard y Export Mensual (Automatizado)
- Comando unico con deploy + validacion + reporte SEO mensual:
  - `npm run deploy:prod:seo`
- Comando solo reporte mensual SEO:
  - `npm run seo:monthly`

Archivos generados automaticamente:
- `reports/seo-monthly-YYYY-MM.md` (score tecnico + checklist)
- `reports/seo-kpi-monthly.csv` (historico de KPIs por mes)

Variables opcionales para completar KPIs con datos reales de GSC/GA4:
- `SEO_GSC_IMPRESSIONS`
- `SEO_GSC_CTR`
- `SEO_GSC_AVG_POSITION`
- `SEO_GA4_ORGANIC_SESSIONS`
- `SEO_GA4_ORGANIC_CONVERSIONS`
- `SEO_BACKLINKS_NEW`
- `SEO_REFERRING_DOMAINS`
