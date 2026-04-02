import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { addAuditLog } from '@/app/actions/auditlog';

// Rappi/iFood webhook receiver
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plataforma = req.headers.get('x-platform') || 'rappi';

    const itemsJson = JSON.stringify(body.items || []);
    const total = body.total || body.items?.reduce((s: number, i: any) => s + (i.precio * i.cantidad), 0) || 0;

    await db.execute({ sql: `
      INSERT INTO pedidos_delivery (plataforma, external_id, cliente_nombre, cliente_direccion, items_json, total, notas)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, args: [plataforma, body.order_id || null, body.cliente || 'Cliente delivery', body.direccion || '', itemsJson, total, body.notas || null] });

    await addAuditLog('sistema', 'pedido delivery recibido', plataforma, `ID externo: ${body.order_id}`);

    return NextResponse.json({ success: true, message: 'Pedido recibido' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = (await db.execute('SELECT * FROM pedidos_delivery ORDER BY fecha_creacion DESC LIMIT 50')).rows;
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, estado } = await req.json();
    await db.execute({ sql: 'UPDATE pedidos_delivery SET estado = ? WHERE id = ?', args: [estado, id] });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
