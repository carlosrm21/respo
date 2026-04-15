import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';

const REQUIRED_TABLES = ['productos', 'pedidos', 'turnos', 'pedidos_delivery'] as const;

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
    }

    const supabase = getSupabaseAdmin();
    const status: Record<string, boolean> = {};

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });
      status[table] = !error;
    }

    return NextResponse.json({
      success: true,
      mode: 'supabase',
      message: 'Supabase schema check 2 completed.',
      status
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
