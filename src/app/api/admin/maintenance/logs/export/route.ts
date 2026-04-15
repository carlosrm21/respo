export const dynamic = 'force-dynamic';
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { listMaintenanceAuditsForExport, type MaintenanceTrigger } from '@/lib/maintenanceAudit';

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const csvEscape = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  const escaped = text.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const toIsoOrUndefined = (value: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
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

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') === 'csv' ? 'csv' : 'json';
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get('limit') || '500', 10), 1), 5000);
    const triggerParam = searchParams.get('trigger');
    const trigger = (triggerParam === 'auto' || triggerParam === 'manual' || triggerParam === 'script')
      ? triggerParam as MaintenanceTrigger
      : undefined;

    const from = toIsoOrUndefined(searchParams.get('from'));
    const to = toIsoOrUndefined(searchParams.get('to'));

    const logs = await listMaintenanceAuditsForExport({
      limit,
      trigger,
      from,
      to
    });

    const generatedAt = new Date().toISOString();

    if (format === 'csv') {
      const csv = toCsv(logs);
      const hash = sha256(csv);
      const filename = `maintenance-logs-${generatedAt.slice(0, 10)}.csv`;

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
      total: logs.length,
      logs
    };

    return NextResponse.json({
      ...payload,
      sha256: sha256(JSON.stringify(payload))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error exportando logs.' }, { status: 500 });
  }
}
