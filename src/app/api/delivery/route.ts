import { NextRequest, NextResponse } from 'next/server';
import { addAuditLog } from '@/app/actions/auditlog';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';
import {
  createDeliveryOrderData,
  listDeliveryOrdersData,
  updateDeliveryOrderEstadoData
} from '@/lib/opsBackofficeData';

// Rappi/iFood webhook receiver
export async function POST(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const body = await req.json();
    const plataforma = req.headers.get('x-platform') || 'rappi';

    const itemsJson = JSON.stringify(body.items || []);
    const total = body.total || body.items?.reduce((s: number, i: any) => s + (i.precio * i.cantidad), 0) || 0;

    await createDeliveryOrderData({
      plataforma,
      external_id: body.order_id || null,
      cliente_nombre: body.cliente || 'Cliente delivery',
      cliente_direccion: body.direccion || '',
      items_json: itemsJson,
      total,
      notas: body.notas || null
    });

    await addAuditLog('sistema', 'pedido delivery recibido', plataforma, `ID externo: ${body.order_id}`);

    return NextResponse.json({ success: true, message: 'Pedido recibido' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const data = await listDeliveryOrdersData();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const { id, estado } = await req.json();
    await updateDeliveryOrderEstadoData(id, estado);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
