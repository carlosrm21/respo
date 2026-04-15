export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { getMaintenanceAuditById } from '@/lib/maintenanceAudit';

export async function GET(req: NextRequest, context: { params: Promise<{ auditId: string }> }) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const { auditId } = await context.params;
    const numericId = Number.parseInt(auditId, 10);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return NextResponse.json({ error: 'ID de auditoría inválido.' }, { status: 400 });
    }

    const log = await getMaintenanceAuditById(numericId);
    return NextResponse.json({ log });
  } catch (error: any) {
    if (String(error.message || '').toLowerCase().includes('multiple (or no) rows')) {
      return NextResponse.json({ error: 'Registro de auditoría no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ error: error.message || 'Error obteniendo detalle de auditoría.' }, { status: 500 });
  }
}
