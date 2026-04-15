import { getLatestLicenseRow, getRestaurantSetting, insertLicenseRow } from '@/lib/opsData';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';

const LEGACY_EXPIRATION_KEY = 'vencimiento_licencia';
export const DEFAULT_TRIAL_DAYS = 7;

type LicenseMode = 'trial' | 'paid';

export type LicenseStatus = {
  valid: boolean;
  status: LicenseMode;
  plan: string;
  startedAt: string;
  expiresAt: string;
  daysRemaining: number;
  trialDays: number;
  paymentRequired: boolean;
  message: string;
};

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado para licenciamiento.');
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIso(date: Date) {
  return date.toISOString();
}

function clampLegacyTrialExpiration(legacyValue: string | null, now: Date) {
  const defaultEnd = addDays(now, DEFAULT_TRIAL_DAYS);
  if (!legacyValue) return defaultEnd;

  const legacyDate = new Date(legacyValue);
  if (Number.isNaN(legacyDate.getTime())) return defaultEnd;
  return legacyDate.getTime() < defaultEnd.getTime() ? legacyDate : defaultEnd;
}

export async function ensureLicenseState() {
  requireSupabase();

  const currentLicense = await getLatestLicenseRow();

  if (currentLicense?.estado && currentLicense?.started_at && currentLicense?.expires_at) {
    return;
  }

  const now = new Date();
  const legacyExpiration = await getRestaurantSetting(LEGACY_EXPIRATION_KEY);
  const trialStart = toIso(now);
  const trialEnd = toIso(clampLegacyTrialExpiration(legacyExpiration, now));

  await insertLicenseRow({
    estado: 'trial',
    plan: 'trial-7-days',
    started_at: trialStart,
    expires_at: trialEnd,
    trial_days: DEFAULT_TRIAL_DAYS,
    payment_id: null
  });
}

export async function activatePaidLicense(paymentId?: string | null) {
  requireSupabase();

  const now = new Date();
  const expiresAt = addDays(now, 365);
  const startedAtIso = toIso(now);
  const expiresAtIso = toIso(expiresAt);

  await insertLicenseRow({
    estado: 'paid',
    plan: 'annual',
    started_at: startedAtIso,
    expires_at: expiresAtIso,
    trial_days: DEFAULT_TRIAL_DAYS,
    payment_id: paymentId || null
  });

  return {
    startedAt: startedAtIso,
    expiresAt: expiresAtIso
  };
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  requireSupabase();
  await ensureLicenseState();

  const currentLicense = await getLatestLicenseRow();
  const resolvedStatus = (currentLicense?.estado === 'paid' ? 'paid' : 'trial') as LicenseMode;
  const resolvedPlan = currentLicense?.plan || (resolvedStatus === 'paid' ? 'annual' : 'trial-7-days');
  const resolvedStartedAt = currentLicense?.started_at || toIso(new Date());
  const resolvedExpiresAt = currentLicense?.expires_at || toIso(addDays(new Date(), DEFAULT_TRIAL_DAYS));
  const trialDays = Number(currentLicense?.trial_days || DEFAULT_TRIAL_DAYS) || DEFAULT_TRIAL_DAYS;

  const expiresDate = new Date(resolvedExpiresAt);
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const valid = diffMs > 0;
  const paymentRequired = !valid;

  let message = '';
  if (valid && resolvedStatus === 'trial') {
    message = `Tu prueba gratuita de ${trialDays} dias sigue activa.`;
  } else if (valid) {
    message = 'Tu licencia anual de RestoPOS esta activa.';
  } else if (resolvedStatus === 'trial') {
    message = `Tu prueba gratuita de ${trialDays} dias ha finalizado. Debes realizar el pago para seguir usando RestoPOS.`;
  } else {
    message = 'Tu licencia anual de RestoPOS ha expirado. Debes realizar el pago para seguir usando el sistema.';
  }

  return {
    valid,
    status: resolvedStatus,
    plan: resolvedPlan,
    startedAt: resolvedStartedAt,
    expiresAt: resolvedExpiresAt,
    daysRemaining,
    trialDays,
    paymentRequired,
    message
  };
}
