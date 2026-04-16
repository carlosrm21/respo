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
    autoPrintComandaMesero: true,
    printProfileName: 'POS / Cocina',
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
    autoPrintComandaMesero: 'ticket_auto_print_comanda_mesero',
    printProfileName: 'ticket_print_profile_name',
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
        autoPrintComandaMesero: parseBoolean(byKey.get(TICKET_CONFIG_MAP.autoPrintComandaMesero), DEFAULT_CONFIG.autoPrintComandaMesero),
        printProfileName: byKey.get(TICKET_CONFIG_MAP.printProfileName) || DEFAULT_CONFIG.printProfileName,
    };
}

async function getConfigFromMaintenanceFallback(): Promise<TicketConfig | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('maintenance_audit')
        .select('details')
        .eq('trigger', 'manual')
        .not('details', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    const details = data?.details as any;
    const payload = details?.ticketConfig;
    if (!payload || typeof payload !== 'object') return null;

    try {
        const parsed = payload;
        return {
            nombreNegocio: parsed.nombreNegocio || DEFAULT_CONFIG.nombreNegocio,
            nit: parsed.nit || '',
            direccion: parsed.direccion || '',
            telefono: parsed.telefono || '',
            mensajePie: parsed.mensajePie ?? DEFAULT_CONFIG.mensajePie,
            anchoPapel: parsed.anchoPapel === '58mm' ? '58mm' : '80mm',
            ivaPorcentaje: typeof parsed.ivaPorcentaje === 'number' ? parsed.ivaPorcentaje : DEFAULT_CONFIG.ivaPorcentaje,
            mostrarDIAN: typeof parsed.mostrarDIAN === 'boolean' ? parsed.mostrarDIAN : DEFAULT_CONFIG.mostrarDIAN,
            mostrarLogo: typeof parsed.mostrarLogo === 'boolean' ? parsed.mostrarLogo : DEFAULT_CONFIG.mostrarLogo,
            logoDataUrl: normalizeLogoDataUrl(parsed.logoDataUrl),
            autoPrintComandaMesero: typeof parsed.autoPrintComandaMesero === 'boolean' ? parsed.autoPrintComandaMesero : DEFAULT_CONFIG.autoPrintComandaMesero,
            printProfileName: typeof parsed.printProfileName === 'string' && parsed.printProfileName.trim() ? parsed.printProfileName.trim() : DEFAULT_CONFIG.printProfileName,
        };
    } catch {
        return null;
    }
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
        { clave: TICKET_CONFIG_MAP.autoPrintComandaMesero, valor: String(config.autoPrintComandaMesero) },
        { clave: TICKET_CONFIG_MAP.printProfileName, valor: config.printProfileName },
    ];

    const { error } = await supabase
        .from('configuracion_restaurante')
        .upsert(rows, { onConflict: 'clave' });

    if (error) throw new Error(error.message);
}

async function saveConfigToMaintenanceFallback(config: TicketConfig) {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const payload = {
        ticketConfig: {
            ...config,
            updatedAt: now
        }
    };

    const { error } = await supabase
        .from('maintenance_audit')
        .insert({
            trigger: 'manual',
            started_at: now,
            finished_at: now,
            details: payload,
        });

    if (error) throw new Error(error.message);
}

function isMissingConfigTableError(error: unknown) {
    const message = String((error as any)?.message || error || '').toLowerCase();
    return message.includes('configuracion_restaurante') && message.includes('schema cache');
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
            try {
                const config = await getConfigFromSupabase();
                return NextResponse.json({ success: true, data: config, source: 'supabase' });
            } catch (error) {
                if (!isMissingConfigTableError(error)) throw error;

                const fallbackConfig = await getConfigFromMaintenanceFallback();
                return NextResponse.json({
                    success: true,
                    data: fallbackConfig || DEFAULT_CONFIG,
                    source: fallbackConfig ? 'maintenance_audit_fallback' : 'default_fallback'
                });
            }
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
            autoPrintComandaMesero: typeof body.autoPrintComandaMesero === 'boolean' ? body.autoPrintComandaMesero : DEFAULT_CONFIG.autoPrintComandaMesero,
            printProfileName: typeof body.printProfileName === 'string' && body.printProfileName.trim() ? body.printProfileName.trim() : DEFAULT_CONFIG.printProfileName,
        };

        if (isSupabaseConfigured) {
            try {
                await saveConfigToSupabase(config);
                return NextResponse.json({ success: true, source: 'supabase' });
            } catch (error) {
                if (!isMissingConfigTableError(error)) throw error;
                await saveConfigToMaintenanceFallback(config);
                return NextResponse.json({ success: true, source: 'maintenance_audit_fallback' });
            }
        }

        saveConfigToFile(config);
        return NextResponse.json({ success: true, source: 'file' });
    } catch {
        return NextResponse.json({ success: false, error: 'Error saving ticket config' }, { status: 500 });
    }
}
