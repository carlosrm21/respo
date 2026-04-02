import webpush from 'web-push';
import path from 'path';
import fs from 'fs';

const keysPath = path.join(process.cwd(), 'data', 'vapid-keys.json');

function loadOrGenerateKeys(): { publicKey: string; privateKey: string } {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    if (fs.existsSync(keysPath)) {
        return JSON.parse(fs.readFileSync(keysPath, 'utf-8'));
    }
    const keys = webpush.generateVAPIDKeys();
    fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
    return keys;
}

let _keys: { publicKey: string; privateKey: string } | null = null;

export function getVapidKeys() {
    if (!_keys) _keys = loadOrGenerateKeys();
    return _keys;
}

export function configurePush() {
    const keys = getVapidKeys();
    webpush.setVapidDetails('mailto:admin@restopos.app', keys.publicKey, keys.privateKey);
    return webpush;
}
