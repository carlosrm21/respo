import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'fe-config.json');

function ensureDir() {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function GET() {
    try {
        ensureDir();
        if (!fs.existsSync(CONFIG_PATH)) {
            return NextResponse.json({ success: true, data: null });
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        // Mask the API key for security
        if (config.apiKey) config.apiKey = config.apiKey.slice(0, 4) + '••••••••' + config.apiKey.slice(-4);
        return NextResponse.json({ success: true, data: config });
    } catch {
        return NextResponse.json({ success: false, error: 'Error loading config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        ensureDir();
        const body = await req.json();
        // If the API key is masked (not changed), preserve original
        let existing: any = {};
        if (fs.existsSync(CONFIG_PATH)) {
            existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        }
        const config = {
            provider: body.provider || '',
            apiUrl: body.apiUrl || '',
            apiKey: body.apiKey?.includes('••') ? existing.apiKey || '' : body.apiKey || '',
            nit: body.nit || '',
            razonSocial: body.razonSocial || '',
            regimen: body.regimen || 'simplificado',
            testMode: body.testMode ?? true,
            updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: 'Error saving config' }, { status: 500 });
    }
}
