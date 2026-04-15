import { NextRequest } from 'next/server';

export function getRequiredSetupKey() {
  if (process.env.NODE_ENV !== 'production') {
    return (process.env.DB_SETUP_KEY || 'dev-only-setup-key').trim();
  }

  return process.env.DB_SETUP_KEY ? process.env.DB_SETUP_KEY.trim() : null;
}

export function authorizeSetupRequest(req: NextRequest) {
  const requiredKey = getRequiredSetupKey();

  if (!requiredKey) {
    return {
      authorized: false,
      reason: 'DB_SETUP_KEY no configurada en producción.'
    };
  }

  const authHeader = req.headers.get('x-setup-key')?.trim();
  if (authHeader !== requiredKey) {
    return {
      authorized: false,
      reason: 'No autorizado.'
    };
  }

  return { authorized: true };
}
