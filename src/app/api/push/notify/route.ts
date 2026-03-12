import { NextRequest, NextResponse } from 'next/server';
import { configurePush } from '@/lib/vapid';
import path from 'path';
import fs from 'fs';

const subsPath = path.join(process.cwd(), 'data', 'push-subscriptions.json');

function loadSubs(): any[] {
    if (!fs.existsSync(subsPath)) return [];
    try { return JSON.parse(fs.readFileSync(subsPath, 'utf-8')); } catch { return []; }
}

function saveSubs(subs: any[]) {
    fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
}

export async function POST(req: NextRequest) {
    const { title, body, icon } = await req.json();
    const webpush = configurePush();
    const subs = loadSubs();

    if (subs.length === 0) {
        return NextResponse.json({ ok: true, sent: 0, message: 'No hay suscriptores' });
    }

    const payload = JSON.stringify({
        title: title || 'RestoPOS',
        body: body || '',
        icon: icon || '/icon-192.png',
        badge: '/icon-192.png',
    });

    const invalidSubs: string[] = [];
    const results = await Promise.allSettled(
        subs.map(sub => webpush.sendNotification(sub, payload))
    );

    results.forEach((r, i) => {
        if (r.status === 'rejected') {
            const err = r.reason as any;
            // 410 Gone = subscription expired/invalid
            if (err?.statusCode === 410 || err?.statusCode === 404) {
                invalidSubs.push(subs[i].endpoint);
            }
        }
    });

    // Clean up invalid subscriptions
    if (invalidSubs.length > 0) {
        saveSubs(subs.filter(s => !invalidSubs.includes(s.endpoint)));
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;
    return NextResponse.json({ ok: true, sent });
}
