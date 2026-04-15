export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { runPinMaintenance } from '@/lib/pinMaintenance';
import { createMaintenanceAudit } from '@/lib/maintenanceAudit';

const RETENTION_DAYS = Number(process.env.LICENSE_DATA_RETENTION_DAYS || 60);

export async function POST(req: NextRequest) {
  const startedAt = new Date().toISOString();

  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const triggerHeader = req.headers.get('x-maintenance-trigger')?.trim();
    const trigger = triggerHeader === 'auto' || triggerHeader === 'script' ? triggerHeader : 'manual';

    const pinResult = await runPinMaintenance();
    const finishedAt = new Date().toISOString();

    const audit = await createMaintenanceAudit({
      trigger,
      retentionDays: RETENTION_DAYS,
      startedAtIso: startedAt,
      finishedAtIso: finishedAt,
      rotatedCount: pinResult.rotatedCount,
      hardenedExistingPins: pinResult.hardenedExistingPins,
      purgedTenantsCount: 0,
      details: {
        maintenance: 'pin-hardening',
        rotated: pinResult.rotated
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Mantenimiento ejecutado exitosamente',
      result: {
        expiredUpdated: 0,
        purgedTenants: 0,
        purgedTenantsDetails: [],
        retentionDays: RETENTION_DAYS,
        rotatedCount: pinResult.rotatedCount,
        hardenedExistingPins: pinResult.hardenedExistingPins,
        rotated: pinResult.rotated,
        auditId: audit.auditId,
        auditPersisted: audit.persisted,
        auditReason: audit.reason
      }
    });
  } catch (error: any) {
    const finishedAt = new Date().toISOString();

    const audit = await createMaintenanceAudit({
      trigger: 'manual',
      retentionDays: RETENTION_DAYS,
      startedAtIso: startedAt,
      finishedAtIso: finishedAt,
      rotatedCount: 0,
      hardenedExistingPins: 0,
      purgedTenantsCount: 0,
      errorMessage: error.message || 'Error de mantenimiento.'
    });

    return NextResponse.json({
      error: error.message || 'Error ejecutando mantenimiento.',
      auditPersisted: audit.persisted,
      auditReason: audit.reason
    }, { status: 500 });
  }
}
