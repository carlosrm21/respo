import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

// Proveedores DIAN conocidos y sus endpoints de prueba de conectividad
const KNOWN_PROVIDERS: Record<string, { testEndpoint: string; name: string }> = {
  siigo: {
    name: 'Siigo',
    testEndpoint: 'https://api.siigo.com/auth/token',
  },
  alegra: {
    name: 'Alegra',
    testEndpoint: 'https://app.alegra.com/api/v1/company',
  },
  loggro: {
    name: 'Loggro',
    testEndpoint: 'https://api.loggro.com/v1',
  },
  factus: {
    name: 'Factus',
    testEndpoint: 'https://api.factus.com.co/v1',
  },
  custom: {
    name: 'Personalizado',
    testEndpoint: '',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiUrl, apiKey, provider } = body;

    if (!apiUrl) {
      return NextResponse.json({ success: false, error: 'URL de API requerida.' });
    }

    // Validar que la URL tenga formato correcto
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(apiUrl);
    } catch {
      return NextResponse.json({ success: false, error: 'URL inválida. Ejemplo: https://api.proveedor.com/v1' });
    }

    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ success: false, error: 'La URL debe usar HTTPS.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let connectionOk = false;
    let authOk = false;
    let latencyMs = 0;
    let serverInfo = '';

    // 1. Test de conectividad básica
    const startTime = Date.now();
    try {
      const headRes = await fetch(parsedUrl.origin, {
        method: 'HEAD',
        signal: controller.signal,
      });
      latencyMs = Date.now() - startTime;
      connectionOk = true;
      serverInfo = headRes.headers.get('server') || 'Servidor remoto alcanzado';
    } catch (connErr: any) {
      clearTimeout(timeout);
      if (connErr.name === 'AbortError') {
        return NextResponse.json({ success: false, error: `Timeout: el servidor no respondió en 8 segundos. Verifica la URL.` });
      }
      return NextResponse.json({ success: false, error: `No se pudo conectar: ${connErr.message}` });
    }
    clearTimeout(timeout);

    // 2. Test de autenticación si hay API key
    if (apiKey && !apiKey.includes('••')) {
      try {
        const authController = new AbortController();
        const authTimeout = setTimeout(() => authController.abort(), 6000);

        const authRes = await fetch(`${parsedUrl.origin}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ grant_type: 'client_credentials' }),
          signal: authController.signal,
        });

        clearTimeout(authTimeout);
        // Si no da 401 o 403, consideramos que las credenciales son válidas
        authOk = ![401, 403].includes(authRes.status);
      } catch {
        // Si falla el auth test, no es crítico — la conexión base funciona
        authOk = false;
      }
    }

    // 3. Guardar resultado del test en Supabase (opcional, para historial)
    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies();
        const tenantId = cookieStore.get('tenant_id')?.value;
        if (tenantId) {
          const supabase = getSupabaseAdmin();
          await supabase.from('configuracion_restaurante').upsert([
            {
              restaurante_id: tenantId,
              clave: 'fe_last_test_at',
              valor: new Date().toISOString(),
            },
            {
              restaurante_id: tenantId,
              clave: 'fe_last_test_result',
              valor: connectionOk ? 'ok' : 'error',
            },
          ], { onConflict: 'restaurante_id, clave' });
        }
      } catch {
        // No crítico
      }
    }

    const providerName = KNOWN_PROVIDERS[provider]?.name || provider || 'Proveedor';

    return NextResponse.json({
      success: true,
      connectionOk,
      authOk: apiKey ? authOk : null,
      latencyMs,
      serverInfo,
      message: connectionOk
        ? `✅ Conexión con ${providerName} establecida. Latencia: ${latencyMs}ms${authOk ? ' · Credenciales verificadas.' : apiKey ? ' · Verifica tus credenciales manualmente.' : ''}`
        : `❌ No se pudo conectar con ${providerName}.`,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
