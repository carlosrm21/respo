import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

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
    mostrarLogo: false,
    logoDataUrl: '',
};

const TICKET_CONFIG_MAP = {
    nombreNegocio: 'ticket_nombre_negocio',
    nit: 'ticket_nit',
    direccion: 'ticket_direccion',
    telefono: 'ticket_telefono',
    mensajePie: 'ticket_mensaje_pie',
    anchoPapel: 'ticket_ancho_papel',
    ivaPorcentaje: 'ticket_iva_porcentaje',
    mostrarDIAN: 'ticket_mostrar_dian',
    mostrarLogo: 'ticket_mostrar_logo',
    logoDataUrl: 'ticket_logo_data_url',
} as const;

type TicketConfig = typeof DEFAULT_CONFIG;

function normalizeLogoDataUrl(value: unknown) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) return '';
    if (!text.startsWith('data:image/')) return '';

    // Prevent oversized config files from very large images.
    const maxChars = 1_500_000;
    if (text.length > maxChars) return '';
    return text;
}

function ensureDir() {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseBoolean(value: string | null | undefined, fallback: boolean) {
    if (value === null || value === undefined || value === '') return fallback;
    return value === 'true';
}

function parseNumber(value: string | null | undefined, fallback: number) {
    if (value === null || value === undefined || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

async function getConfigFromSupabase(): Promise<TicketConfig> {
    const supabase = getSupabaseAdmin();
    const keys = Object.values(TICKET_CONFIG_MAP);
    const { data, error } = await supabase
        .from('configuracion_restaurante')
        .select('clave, valor')
        .in('clave', keys as string[]);

    if (error) throw new Error(error.message);

    const byKey = new Map((data || []).map((row: any) => [row.clave, row.valor]));
    return {
        nombreNegocio: byKey.get(TICKET_CONFIG_MAP.nombreNegocio) || DEFAULT_CONFIG.nombreNegocio,
        nit: byKey.get(TICKET_CONFIG_MAP.nit) || '',
        direccion: byKey.get(TICKET_CONFIG_MAP.direccion) || '',
        telefono: byKey.get(TICKET_CONFIG_MAP.telefono) || '',
        mensajePie: byKey.get(TICKET_CONFIG_MAP.mensajePie) ?? DEFAULT_CONFIG.mensajePie,
        anchoPapel: (byKey.get(TICKET_CONFIG_MAP.anchoPapel) as '58mm' | '80mm') || DEFAULT_CONFIG.anchoPapel,
        ivaPorcentaje: parseNumber(byKey.get(TICKET_CONFIG_MAP.ivaPorcentaje), DEFAULT_CONFIG.ivaPorcentaje),
        mostrarDIAN: parseBoolean(byKey.get(TICKET_CONFIG_MAP.mostrarDIAN), DEFAULT_CONFIG.mostrarDIAN),
        mostrarLogo: parseBoolean(byKey.get(TICKET_CONFIG_MAP.mostrarLogo), DEFAULT_CONFIG.mostrarLogo),
        logoDataUrl: normalizeLogoDataUrl(byKey.get(TICKET_CONFIG_MAP.logoDataUrl)),
    };
}

async function saveConfigToSupabase(config: TicketConfig) {
    const supabase = getSupabaseAdmin();
    const rows = [
        { clave: TICKET_CONFIG_MAP.nombreNegocio, valor: config.nombreNegocio },
        { clave: TICKET_CONFIG_MAP.nit, valor: config.nit },
        { clave: TICKET_CONFIG_MAP.direccion, valor: config.direccion },
        { clave: TICKET_CONFIG_MAP.telefono, valor: config.telefono },
        { clave: TICKET_CONFIG_MAP.mensajePie, valor: config.mensajePie },
        { clave: TICKET_CONFIG_MAP.anchoPapel, valor: config.anchoPapel },
        { clave: TICKET_CONFIG_MAP.ivaPorcentaje, valor: String(config.ivaPorcentaje) },
        { clave: TICKET_CONFIG_MAP.mostrarDIAN, valor: String(config.mostrarDIAN) },
        { clave: TICKET_CONFIG_MAP.mostrarLogo, valor: String(config.mostrarLogo) },
        { clave: TICKET_CONFIG_MAP.logoDataUrl, valor: config.logoDataUrl },
    ];

    const { error } = await supabase
        .from('configuracion_restaurante')
        .upsert(rows, { onConflict: 'clave' });

    if (error) throw new Error(error.message);
}

function getConfigFromFile() {
    ensureDir();
    if (!fs.existsSync(CONFIG_PATH)) {
        return DEFAULT_CONFIG;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    return { ...DEFAULT_CONFIG, ...config, logoDataUrl: normalizeLogoDataUrl(config?.logoDataUrl) };
}

function saveConfigToFile(config: TicketConfig) {
    ensureDir();
    fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2)
    );
}

export async function GET() {
    try {
        if (isSupabaseConfigured) {
            const config = await getConfigFromSupabase();
            return NextResponse.json({ success: true, data: config, source: 'supabase' });
        }

        const config = getConfigFromFile();
        return NextResponse.json({ success: true, data: config, source: 'file' });
    } catch {
        return NextResponse.json({ success: false, error: 'Error loading ticket config' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const config: TicketConfig = {
            nombreNegocio: body.nombreNegocio || DEFAULT_CONFIG.nombreNegocio,
            nit: body.nit || '',
            direccion: body.direccion || '',
            telefono: body.telefono || '',
            mensajePie: body.mensajePie ?? DEFAULT_CONFIG.mensajePie,
            anchoPapel: body.anchoPapel || DEFAULT_CONFIG.anchoPapel,
            ivaPorcentaje: typeof body.ivaPorcentaje === 'number' ? body.ivaPorcentaje : DEFAULT_CONFIG.ivaPorcentaje,
            mostrarDIAN: body.mostrarDIAN ?? DEFAULT_CONFIG.mostrarDIAN,
            mostrarLogo: Boolean(body.mostrarLogo),
            logoDataUrl: normalizeLogoDataUrl(body.logoDataUrl),
        };

        if (isSupabaseConfigured) {
            await saveConfigToSupabase(config);
            return NextResponse.json({ success: true, source: 'supabase' });
        }

        saveConfigToFile(config);
        return NextResponse.json({ success: true, source: 'file' });
    } catch {
        return NextResponse.json({ success: false, error: 'Error saving ticket config' }, { status: 500 });
    }
}
