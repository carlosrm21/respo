import webpush from 'web-push';
import path from 'path';
import fs from 'fs';

/**
 * Obtiene las VAPID keys desde variables de entorno (preferido en producción/Vercel)
 * o desde el filesystem como fallback para desarrollo local.
 *
 * En Vercel, configura en Settings → Environment Variables:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *
 * Para generar nuevas claves, ejecuta una vez:
 *   node -e "const wp = require('web-push'); const k = wp.generateVAPIDKeys(); console.log(JSON.stringify(k, null, 2));"
 */

const keysPath = path.join(process.cwd(), 'data', 'vapid-keys.json');

function loadOrGenerateKeysFromFilesystem(): { publicKey: string; privateKey: string } {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (fs.existsSync(keysPath)) {
    return JSON.parse(fs.readFileSync(keysPath, 'utf-8'));
  }
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
  console.log('[VAPID] Claves generadas y guardadas en:', keysPath);
  console.log('[VAPID] ⚠️  Copia estas claves a las variables de entorno VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY para producción.');
  return keys;
}

let _keys: { publicKey: string; privateKey: string } | null = null;

export function getVapidKeys(): { publicKey: string; privateKey: string } {
  if (_keys) return _keys;

  // ✅ Preferencia: variables de entorno (seguro en Vercel — no se pierden en deploy)
  const envPublic = process.env.VAPID_PUBLIC_KEY?.trim();
  const envPrivate = process.env.VAPID_PRIVATE_KEY?.trim();

  if (envPublic && envPrivate) {
    _keys = { publicKey: envPublic, privateKey: envPrivate };
    return _keys;
  }

  // Fallback: filesystem (solo funciona en desarrollo local, se pierde en Vercel)
  if (process.env.NODE_ENV === 'production') {
    console.error('[VAPID] ❌ VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY no están configuradas en Vercel. Las notificaciones push no funcionarán.');
  }

  _keys = loadOrGenerateKeysFromFilesystem();
  return _keys;
}

export function configurePush(): typeof webpush {
  const keys = getVapidKeys();
  webpush.setVapidDetails('mailto:admin@restopos.app', keys.publicKey, keys.privateKey);
  return webpush;
}
