export const dynamic = 'force-dynamic';
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { listMaintenanceAuditsForExport } from '@/lib/maintenanceAudit';

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const csvEscape = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toCsv = (rows: Awaited<ReturnType<typeof listMaintenanceAuditsForExport>>) => {
  const headers = [
    'id',
    'trigger',
    'started_at',
    'finished_at',
    'retention_days',
    'rotated_count',
    'hardened_existing_pins',
    'purged_tenants_count',
    'error_message',
    'created_at'
  ];

  const lines = [headers.join(',')];

  for (const row of rows) {
    const cells = [
      row.id,
      row.trigger,
      row.started_at,
      row.finished_at,
      row.retention_days,
      row.rotated_count,
      row.hardened_existing_pins,
      row.purged_tenants_count,
      row.error_message,
      row.created_at
    ];
    lines.push(cells.map(csvEscape).join(','));
  }

  return lines.join('\n');
};

const monthRange = (year?: number, month?: number) => {
  const now = new Date();
  const safeYear = Number.isInteger(year) ? Math.min(Math.max(year as number, 2020), 2100) : now.getUTCFullYear();
  const safeMonth = Number.isInteger(month) ? Math.min(Math.max(month as number, 1), 12) : now.getUTCMonth() + 1;

  const from = new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(safeYear, safeMonth, 0, 23, 59, 59, 999));

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    year: safeYear,
    month: safeMonth
  };
};

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') === 'json' ? 'json' : 'csv';
    const year = Number.parseInt(searchParams.get('year') || '', 10);
    const month = Number.parseInt(searchParams.get('month') || '', 10);
    const range = monthRange(Number.isFinite(year) ? year : undefined, Number.isFinite(month) ? month : undefined);

    const logs = await listMaintenanceAuditsForExport({
      limit: 5000,
      from: range.from,
      to: range.to
    });

    const generatedAt = new Date().toISOString();

    if (format === 'csv') {
      const csv = toCsv(logs);
      const hash = sha256(csv);
      const filename = `maintenance-logs-${range.year}-${String(range.month).padStart(2, '0')}.csv`;

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Export-SHA256': hash,
          'X-Export-Generated-At': generatedAt
        }
      });
    }

    const payload = {
      exported_at: generatedAt,
      period: {
        from: range.from,
        to: range.to
      },
      total: logs.length,
      logs
    };

    return NextResponse.json({
      ...payload,
      sha256: sha256(JSON.stringify(payload))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error exportando logs mensuales.' }, { status: 500 });
  }
}
