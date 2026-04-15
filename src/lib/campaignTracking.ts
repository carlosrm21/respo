const STORAGE_KEY = 'restopos_campaign_tracking';
const TRACKING_API_URL = (process.env.NEXT_PUBLIC_TRACKING_API_URL || '').trim();

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid'
] as const;

type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

type CampaignTracking = {
  session_id?: string;
  first_touch?: Attribution;
  last_touch?: Attribution;
  first_landing_path?: string;
  initial_referrer?: string;
  first_seen_at?: string;
  last_seen_at?: string;
};

const readTracking = (): CampaignTracking | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeTracking = (value: CampaignTracking) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getAttributionFromSearch = () => {
  if (typeof window === 'undefined') return {} as Attribution;
  const params = new URLSearchParams(window.location.search);
  const picked: Attribution = {};

  ATTRIBUTION_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) picked[key] = value;
  });

  return picked;
};

export const captureCampaignTracking = () => {
  if (typeof window === 'undefined') return null;

  const existing = readTracking() || {};
  const attr = getAttributionFromSearch();
  const hasAttr = Object.keys(attr).length > 0;
  const now = nowIso();

  const tracking: CampaignTracking = {
    ...existing,
    session_id: existing.session_id || createSessionId(),
    first_seen_at: existing.first_seen_at || now,
    last_seen_at: now,
    first_landing_path: existing.first_landing_path || `${window.location.pathname}${window.location.search}`,
    initial_referrer: existing.initial_referrer || document.referrer || undefined
  };

  if (hasAttr) {
    if (!tracking.first_touch) {
      tracking.first_touch = attr;
    }
    tracking.last_touch = attr;
  }

  writeTracking(tracking);
  return tracking;
};

export const getCampaignTracking = () => readTracking();

export const trackCampaignEvent = (event: string, metadata?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !TRACKING_API_URL) return;

  const tracking = getCampaignTracking() || {};
  const attribution = tracking.last_touch || tracking.first_touch;
  if (!tracking.session_id) return;

  const payload = {
    session_id: tracking.session_id,
    event,
    page_path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || undefined,
    source_app: 'restaurante-web-next',
    attribution,
    metadata
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(TRACKING_API_URL, blob);
    return;
  }

  fetch(TRACKING_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  }).catch(() => {
    // Ignore tracking failures to avoid impacting UX.
  });
};

export const appendTrackingToUrl = (url: string) => {
  if (typeof window === 'undefined') return url;
  const tracking = getCampaignTracking();
  const source = tracking?.last_touch || tracking?.first_touch;
  if (!source) return url;

  const parsed = new URL(url);
  ATTRIBUTION_KEYS.forEach((key) => {
    const value = source[key];
    if (value && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, value);
    }
  });

  if (tracking?.session_id && !parsed.searchParams.has('session_id')) {
    parsed.searchParams.set('session_id', tracking.session_id);
  }

  return parsed.toString();
};
