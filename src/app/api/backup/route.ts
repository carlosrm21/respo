import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

const BACKUP_TABLES = [
  'configuracion_restaurante',
  'licencia_estado',
  'meseros',
  'mesas',
  'categorias',
  'productos',
  'pedidos',
  'detalles_pedido',
  'facturas',
  'caja',
  'inventario',
  'reservas',
  'turnos',
  'combos',
  'combo_items',
  'pedidos_delivery',
  'audit_log'
] as const;

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const snapshot: Record<string, unknown[]> = {};

    for (const table of BACKUP_TABLES) {
      const { data, error } = await supabase.from(table).select('*');
      if (!error) {
        snapshot[table] = data || [];
      }
    }

    const payload = {
      generated_at: new Date().toISOString(),
      source: 'supabase',
      tables: snapshot
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="restaurante_backup_${new Date().toISOString().slice(0, 10)}.json"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
