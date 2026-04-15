import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

export type MaintenanceTrigger = 'auto' | 'manual' | 'script';

export type MaintenanceAuditRecord = {
  id: number;
  trigger: MaintenanceTrigger;
  started_at: string;
  finished_at: string;
  retention_days: number;
  rotated_count: number;
  hardened_existing_pins: number;
  purged_tenants_count: number;
  details: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
};

export async function createMaintenanceAudit(input: {
  trigger: MaintenanceTrigger;
  retentionDays: number;
  startedAtIso: string;
  finishedAtIso: string;
  rotatedCount: number;
  hardenedExistingPins: number;
  purgedTenantsCount: number;
  details?: Record<string, unknown> | null;
  errorMessage?: string | null;
}) {
  if (!isSupabaseConfigured) {
    return { persisted: false as const, auditId: null as number | null, reason: 'supabase-not-configured' };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('maintenance_audit')
    .insert({
      trigger: input.trigger,
      started_at: input.startedAtIso,
      finished_at: input.finishedAtIso,
      retention_days: input.retentionDays,
      rotated_count: input.rotatedCount,
      hardened_existing_pins: input.hardenedExistingPins,
      purged_tenants_count: input.purgedTenantsCount,
      details: input.details || null,
      error_message: input.errorMessage || null
    })
    .select('id')
    .single();

  if (error) {
    return { persisted: false as const, auditId: null as number | null, reason: error.message };
  }

  return { persisted: true as const, auditId: data?.id || null, reason: null as string | null };
}

export async function getMaintenanceAuditById(auditId: number) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado.');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('maintenance_audit')
    .select('*')
    .eq('id', auditId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MaintenanceAuditRecord;
}

export async function listMaintenanceAudits(params: {
  page: number;
  limit: number;
  trigger?: MaintenanceTrigger;
  from?: string;
  to?: string;
}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado.');
  }

  const supabase = getSupabaseAdmin();
  const fromIndex = (params.page - 1) * params.limit;
  const toIndex = fromIndex + params.limit - 1;

  let query = supabase
    .from('maintenance_audit')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(fromIndex, toIndex);

  if (params.trigger) {
    query = query.eq('trigger', params.trigger);
  }

  if (params.from) {
    query = query.gte('created_at', params.from);
  }

  if (params.to) {
    query = query.lte('created_at', params.to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    logs: (data || []) as MaintenanceAuditRecord[],
    total: count || 0
  };
}

export async function listMaintenanceAuditsForExport(params: {
  limit: number;
  trigger?: MaintenanceTrigger;
  from?: string;
  to?: string;
}) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado.');
  }

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('maintenance_audit')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit);

  if (params.trigger) {
    query = query.eq('trigger', params.trigger);
  }

  if (params.from) {
    query = query.gte('created_at', params.from);
  }

  if (params.to) {
    query = query.lte('created_at', params.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as MaintenanceAuditRecord[];
}
