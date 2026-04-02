import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'ticket-config.json');

const DEFAULT_CONFIG = {
    nombreNegocio: 'RestoPOS',
    nit: '',
    direccion: '',
    telefono: '',
    mensajePie: '¡Gracias por su visita!',
    anchoPapel: '80mm',
    ivaPorcentaje: 8,
    mostrarDIAN: true,
};

function ensureDir() {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function GET() {
    try {
        ensureDir();
        if (!fs.existsSync(CONFIG_PATH)) {
            return NextResponse.json({ success: true, data: DEFAULT_CONFIG });
        }
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        return NextResponse.json({ success: true, data: { ...DEFAULT_CONFIG, ...config } });
    } catch {
        return NextResponse.json({ success: false, error: 'Error loading ticket config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        ensureDir();
        const body = await req.json();
        const config = {
            nombreNegocio: body.nombreNegocio || DEFAULT_CONFIG.nombreNegocio,
            nit: body.nit || '',
            direccion: body.direccion || '',
            telefono: body.telefono || '',
            mensajePie: body.mensajePie ?? DEFAULT_CONFIG.mensajePie,
            anchoPapel: body.anchoPapel || DEFAULT_CONFIG.anchoPapel,
            ivaPorcentaje: typeof body.ivaPorcentaje === 'number' ? body.ivaPorcentaje : DEFAULT_CONFIG.ivaPorcentaje,
            mostrarDIAN: body.mostrarDIAN ?? DEFAULT_CONFIG.mostrarDIAN,
            updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: 'Error saving ticket config' }, { status: 500 });
    }
}
