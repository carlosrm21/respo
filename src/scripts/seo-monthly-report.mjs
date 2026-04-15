import fs from 'node:fs';
import path from 'node:path';

const siteUrl = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || 'https://restopos.movilcomts.com').replace(/\/$/, '');
const month = process.env.SEO_REPORT_MONTH || new Date().toISOString().slice(0, 7);

const KPI_FIELDS = [
  'impressions',
  'ctr',
  'avg_position',
  'organic_sessions',
  'organic_conversions',
  'backlinks_new',
  'referring_domains'
];

const REPORTS_DIR = path.resolve(process.cwd(), 'reports');

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function readEnvKpis() {
  return {
    impressions: process.env.SEO_GSC_IMPRESSIONS || '',
    ctr: process.env.SEO_GSC_CTR || '',
    avg_position: process.env.SEO_GSC_AVG_POSITION || '',
    organic_sessions: process.env.SEO_GA4_ORGANIC_SESSIONS || '',
    organic_conversions: process.env.SEO_GA4_ORGANIC_CONVERSIONS || '',
    backlinks_new: process.env.SEO_BACKLINKS_NEW || '',
    referring_domains: process.env.SEO_REFERRING_DOMAINS || ''
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'restopos-seo-monthly/1.0' }
  });
  const text = await response.text();
  return { response, text };
}

function findMeta(content, name, attr = 'name') {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta[^>]*${attr}=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function findCanonical(content) {
  const match = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function countMatches(content, regex) {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function checklistLine(ok, label, details = '') {
  const status = ok ? 'PASS' : 'FAIL';
  const suffix = details ? ` - ${details}` : '';
  return `- [${ok ? 'x' : ' '}] ${status}: ${label}${suffix}`;
}

function upsertCsvRow(filePath, headers, rowObj) {
  const row = headers.map((key) => `${rowObj[key] ?? ''}`);
  if (!fs.existsSync(filePath)) {
    const initial = `${headers.join(',')}\n${row.join(',')}\n`;
    fs.writeFileSync(filePath, initial, 'utf8');
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    fs.writeFileSync(filePath, `${headers.join(',')}\n${row.join(',')}\n`, 'utf8');
    return;
  }

  const currentHeaders = lines[0].split(',');
  const sameHeader = currentHeaders.join(',') === headers.join(',');
  const normalizedLines = sameHeader ? lines : [`${headers.join(',')}`];

  const monthIndex = headers.indexOf('month');
  let updated = false;
  const body = normalizedLines.slice(1).map((line) => {
    const values = line.split(',');
    if (values[monthIndex] === rowObj.month) {
      updated = true;
      return row.join(',');
    }
    return line;
  });

  if (!updated) body.push(row.join(','));

  fs.writeFileSync(filePath, `${headers.join(',')}\n${body.join('\n')}\n`, 'utf8');
}

async function main() {
  ensureReportsDir();

  const home = await fetchText(siteUrl);
  const robots = await fetchText(`${siteUrl}/robots.txt`);
  const sitemap = await fetchText(`${siteUrl}/sitemap.xml`);

  const titleMatch = home.text.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const description = findMeta(home.text, 'description');
  const canonical = findCanonical(home.text);
  const ogTitle = findMeta(home.text, 'og:title', 'property');
  const ogDescription = findMeta(home.text, 'og:description', 'property');
  const ogUrl = findMeta(home.text, 'og:url', 'property');
  const twitterCard = findMeta(home.text, 'twitter:card');

  const checks = [
    { ok: home.response.ok, label: 'Homepage responds 200', details: `status=${home.response.status}` },
    { ok: title.length >= 40 && title.length <= 70, label: 'Title length optimized', details: `length=${title.length}` },
    { ok: description.length >= 120 && description.length <= 170, label: 'Meta description length optimized', details: `length=${description.length}` },
    { ok: canonical.startsWith(siteUrl), label: 'Canonical configured', details: canonical || 'missing' },
    { ok: Boolean(ogTitle && ogDescription && ogUrl), label: 'Open Graph core tags present' },
    { ok: Boolean(twitterCard), label: 'Twitter card configured', details: twitterCard || 'missing' },
    { ok: robots.response.ok && robots.text.includes('Sitemap:'), label: 'Robots includes sitemap', details: `status=${robots.response.status}` },
    { ok: sitemap.response.ok && sitemap.text.includes('<urlset'), label: 'Sitemap XML is reachable', details: `status=${sitemap.response.status}` },
    { ok: sitemap.text.includes(`${siteUrl}/blog`), label: 'Sitemap includes /blog' },
    { ok: sitemap.text.includes(`${siteUrl}/dian-docs`), label: 'Sitemap includes /dian-docs' },
    { ok: countMatches(home.text, /<h1\b/gi) === 1, label: 'Single H1 on homepage', details: `count=${countMatches(home.text, /<h1\b/gi)}` },
    { ok: countMatches(home.text, /application\/ld\+json/gi) >= 1, label: 'Structured data present', details: `count=${countMatches(home.text, /application\/ld\+json/gi)}` },
    { ok: home.text.includes('googletagmanager.com/gtag/js'), label: 'GA4 tag present' },
    { ok: Boolean(home.response.headers.get('content-security-policy')), label: 'CSP header present' },
    { ok: Boolean(home.response.headers.get('strict-transport-security')), label: 'HSTS header present' }
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  const kpis = readEnvKpis();
  const csvHeaders = ['month', ...KPI_FIELDS];
  upsertCsvRow(path.join(REPORTS_DIR, 'seo-kpi-monthly.csv'), csvHeaders, { month, ...kpis });

  const missingKpis = KPI_FIELDS.filter((k) => !kpis[k]);
  const reportName = `seo-monthly-${month}.md`;
  const reportPath = path.join(REPORTS_DIR, reportName);

  const content = [
    `# SEO Monthly Report - ${month}`,
    '',
    `- Site: ${siteUrl}`,
    `- Generated at: ${new Date().toISOString()}`,
    `- Technical SEO score: ${score}/100 (${passed}/${checks.length})`,
    '',
    '## Technical Checklist',
    ...checks.map((check) => checklistLine(check.ok, check.label, check.details)),
    '',
    '## KPI Export (CSV)',
    '- File: reports/seo-kpi-monthly.csv',
    `- Month row updated: ${month}`,
    '',
    '## KPI Values Used',
    `- impressions: ${kpis.impressions || '(pending)'}`,
    `- ctr: ${kpis.ctr || '(pending)'}`,
    `- avg_position: ${kpis.avg_position || '(pending)'}`,
    `- organic_sessions: ${kpis.organic_sessions || '(pending)'}`,
    `- organic_conversions: ${kpis.organic_conversions || '(pending)'}`,
    `- backlinks_new: ${kpis.backlinks_new || '(pending)'}`,
    `- referring_domains: ${kpis.referring_domains || '(pending)'}`,
    '',
    '## Action Items',
    '- Reemplazar KPI pendientes con datos de GSC y GA4 para cierre mensual.',
    '- Revisar pages con menor CTR y optimizar title/description.',
    '- Ejecutar outreach off-page del sprint vigente (backlinks y menciones).'
  ].join('\n');

  fs.writeFileSync(reportPath, content, 'utf8');

  console.log(`SEO monthly report generated: ${path.relative(process.cwd(), reportPath)}`);
  console.log(`KPI CSV updated: reports/seo-kpi-monthly.csv`);
  console.log(`Technical SEO score: ${score}/100`);

  if (missingKpis.length) {
    console.log(`Pending KPI fields: ${missingKpis.join(', ')}`);
    console.log('Tip: set env vars SEO_GSC_IMPRESSIONS, SEO_GSC_CTR, SEO_GSC_AVG_POSITION, SEO_GA4_ORGANIC_SESSIONS, SEO_GA4_ORGANIC_CONVERSIONS, SEO_BACKLINKS_NEW, SEO_REFERRING_DOMAINS.');
  }
}

main().catch((error) => {
  console.error(`Failed to generate SEO monthly report: ${error.message}`);
  process.exit(1);
});
