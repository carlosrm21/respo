export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { listMaintenanceAudits, type MaintenanceTrigger } from '@/lib/maintenanceAudit';

const toIsoOrUndefined = (value: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

export async function GET(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const triggerParam = searchParams.get('trigger');
    const trigger = (triggerParam === 'auto' || triggerParam === 'manual' || triggerParam === 'script')
      ? triggerParam as MaintenanceTrigger
      : undefined;

    const from = toIsoOrUndefined(searchParams.get('from'));
    const to = toIsoOrUndefined(searchParams.get('to'));

    const { logs, total } = await listMaintenanceAudits({
      page,
      limit,
      trigger,
      from,
      to
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error obteniendo logs de mantenimiento.' }, { status: 500 });
  }
}
