import { NextRequest, NextResponse } from 'next/server';
import { getVapidKeys } from '@/lib/vapid';
import path from 'path';
import fs from 'fs';

const subsPath = path.join(process.cwd(), 'data', 'push-subscriptions.json');

function loadSubs(): any[] {
    if (!fs.existsSync(subsPath)) return [];
    try { return JSON.parse(fs.readFileSync(subsPath, 'utf-8')); } catch { return []; }
}

function saveSubs(subs: any[]) {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
}

// GET — return public VAPID key so client can subscribe
export async function GET() {
    const { publicKey } = getVapidKeys();
    return NextResponse.json({ publicKey });
}

// POST — save a push subscription
export async function POST(req: NextRequest) {
    const subscription = await req.json();
    const subs = loadSubs();
    const exists = subs.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
        subs.push(subscription);
        saveSubs(subs);
    }
    return NextResponse.json({ ok: true });
}

// DELETE — remove a subscription
export async function DELETE(req: NextRequest) {
    const { endpoint } = await req.json();
    const subs = loadSubs().filter(s => s.endpoint !== endpoint);
    saveSubs(subs);
    return NextResponse.json({ ok: true });
}
