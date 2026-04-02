import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { apiUrl, apiKey } = await req.json();
        if (!apiUrl) {
            return NextResponse.json({ success: false, error: 'API URL requerida' });
        }
        // Simple connectivity check — just validate the URL format and try a HEAD request
        const url = new URL(apiUrl);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            await fetch(url.origin, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeout);
            return NextResponse.json({ success: true, message: 'Conexión establecida' });
        } catch {
            clearTimeout(timeout);
            return NextResponse.json({ success: false, error: 'No se pudo conectar al servidor' });
        }
    } catch {
        return NextResponse.json({ success: false, error: 'URL inválida' });
    }
}
