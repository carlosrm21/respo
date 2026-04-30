import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

// Migrar de sistema de archivos a Supabase (compatible con Vercel serverless)
async function getTenantId() {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get('tenant_id')?.value;
  if (!tenantId) throw new Error('TENANT_MISSING');
  return tenantId;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, data: null });
    }
    const tenantId = await getTenantId();
    const supabase = getSupabaseAdmin();

    const fields = ['fe_provider', 'fe_api_url', 'fe_api_key', 'fe_nit', 'fe_razon_social', 'fe_regimen', 'fe_test_mode'];
    const { data } = await supabase
      .from('configuracion_restaurante')
      .select('clave, valor')
      .eq('restaurante_id', tenantId)
      .in('clave', fields);

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const config: Record<string, string> = {};
    for (const row of data) {
      config[row.clave.replace('fe_', '')] = row.valor;
    }

    // Enmascarar la API key por seguridad
    if (config.api_key && config.api_key.length > 8) {
      config.api_key = config.api_key.slice(0, 4) + '••••••••' + config.api_key.slice(-4);
    }

    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    if (err.message === 'TENANT_MISSING') {
      return NextResponse.json({ success: false, error: 'Sin sesión activa.' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Error cargando configuración.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
    }
    const tenantId = await getTenantId();
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    // Obtener config existente para preservar API key si viene enmascarada
    const { data: existingRows } = await supabase
      .from('configuracion_restaurante')
      .select('clave, valor')
      .eq('restaurante_id', tenantId)
      .eq('clave', 'fe_api_key');

    const existingApiKey = existingRows?.[0]?.valor || '';
    const rawApiKey = body.apiKey?.includes('••') ? existingApiKey : (body.apiKey || '');

    const rows = [
      { restaurante_id: tenantId, clave: 'fe_provider',     valor: body.provider      || '' },
      { restaurante_id: tenantId, clave: 'fe_api_url',      valor: body.apiUrl        || '' },
      { restaurante_id: tenantId, clave: 'fe_api_key',      valor: rawApiKey },
      { restaurante_id: tenantId, clave: 'fe_nit',          valor: body.nit           || '' },
      { restaurante_id: tenantId, clave: 'fe_razon_social', valor: body.razonSocial   || '' },
      { restaurante_id: tenantId, clave: 'fe_regimen',      valor: body.regimen       || 'simplificado' },
      { restaurante_id: tenantId, clave: 'fe_test_mode',    valor: body.testMode === false ? 'false' : 'true' },
    ];

    const { error } = await supabase
      .from('configuracion_restaurante')
      .upsert(rows, { onConflict: 'restaurante_id, clave' });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === 'TENANT_MISSING') {
      return NextResponse.json({ success: false, error: 'Sin sesión activa.' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: err.message || 'Error guardando configuración.' }, { status: 500 });
  }
}
