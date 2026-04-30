'use server';

import { createFacturaAndClosePedidoData, getPedidoFacturaData, requireTenant } from '@/lib/opsData';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

interface DianCredentials {
  apiUrl: string;
  apiKey: string;
  nit: string;
  razonSocial: string;
  regimen: string;
  testMode: boolean;
  provider: string;
}

async function getDianCredentials(): Promise<DianCredentials | null> {
  if (!isSupabaseConfigured) return null;
  const tenantId = await requireTenant();
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('configuracion_restaurante')
    .select('clave, valor')
    .eq('restaurante_id', tenantId)
    .in('clave', ['fe_provider', 'fe_api_url', 'fe_api_key', 'fe_nit', 'fe_razon_social', 'fe_regimen', 'fe_test_mode']);

  if (!data || data.length === 0) return null;

  const cfg: Record<string, string> = {};
  for (const row of data) cfg[row.clave.replace('fe_', '')] = row.valor;

  if (!cfg.api_url || !cfg.api_key) return null;

  return {
    apiUrl: cfg.api_url,
    apiKey: cfg.api_key,
    nit: cfg.nit || '',
    razonSocial: cfg.razon_social || '',
    regimen: cfg.regimen || 'simplificado',
    testMode: cfg.test_mode !== 'false',
    provider: cfg.provider || 'custom',
  };
}

interface PayloadFactura {
  cliente: {
    tipo_documento: string; // CC, NIT, CE, PP
    numero_documento: string;
    nombres: string;
    apellidos?: string;
    correo?: string;
  };
  metodo_pago: string;
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    impuestos: Array<{
      tipo: string; // IVA, INC
      porcentaje: number;
    }>;
  }>;
}

export async function emitirFacturaElectronica(
  pedidoId: number,
  datosCliente: PayloadFactura['cliente'],
  metodoPago: string
) {
  try {
    // 1. Obtener datos del pedido
    const supabaseData = await getPedidoFacturaData(pedidoId);
    const pedido = supabaseData?.pedido;
    if (!pedido) throw new Error('Pedido no encontrado');
    const detalles = supabaseData?.detalles || [];

    // 2. Construir payload según estándar DIAN
    const payload: PayloadFactura = {
      cliente: datosCliente,
      metodo_pago: metodoPago,
      items: detalles.map(d => ({
        codigo: d.producto_id.toString(),
        descripcion: d.nombre,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        impuestos: [
          { tipo: 'INC', porcentaje: 8 } // Impuesto al Consumo restaurantes Colombia
        ]
      }))
    };

    const subtotal = payload.items.reduce((s, i) => s + (i.cantidad * i.precio_unitario), 0);
    const inc = subtotal * 0.08;
    const total = subtotal + inc;

    // 3. Intentar con credenciales reales si están configuradas
    const creds = await getDianCredentials().catch(() => null);

    let cufe: string;
    let numero_dian: string;

    if (creds) {
      // ── MODO REAL ──────────────────────────────────────────────────
      console.log(`[DIAN] Enviando factura a ${creds.provider} (testMode: ${creds.testMode})`);

      const endpoint = `${creds.apiUrl}/invoices`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${creds.apiKey}`,
          'X-Test-Mode': creds.testMode ? 'true' : 'false',
        },
        body: JSON.stringify({
          ...payload,
          emisor: {
            nit: creds.nit,
            razon_social: creds.razonSocial,
            regimen: creds.regimen,
          }
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[DIAN] Error del proveedor (${response.status}):`, errBody);
        throw new Error(`Error del proveedor DIAN: ${response.status} - ${response.statusText}`);
      }

      const apiResult = await response.json();
      cufe = apiResult.cufe || apiResult.uuid || apiResult.id || 'SIN-CUFE';
      numero_dian = apiResult.number || apiResult.numero || apiResult.invoice_number || `FACT-${Date.now()}`;

      console.log(`[DIAN] ✅ Factura emitida. CUFE: ${cufe}, Número: ${numero_dian}`);
    } else {
      // ── MODO SIMULADO (sin credenciales configuradas) ────────────
      console.log('[DIAN] Modo SIMULADO — configura las credenciales en Facturación Electrónica');
      cufe = 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      numero_dian = 'SIM-' + Math.floor(Math.random() * 100000);
    }

    // 4. Guardar referencia en la base de datos
    await createFacturaAndClosePedidoData(pedidoId, total, metodoPago, numero_dian, cufe);

    return {
      success: true,
      cufe,
      numero_dian,
      simulado: !creds,
      total,
    };

  } catch (error: any) {
    console.error('[DIAN] Error emitiendo factura:', error);
    return { success: false, error: error.message };
  }
}
