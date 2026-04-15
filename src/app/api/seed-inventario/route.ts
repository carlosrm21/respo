import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { seedInventarioData } from '@/lib/opsBackofficeData';

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const result = await seedInventarioData();
    if (result.alreadySeeded) {
      return NextResponse.json({ message: `Already seeded: ${result.count} items`, count: result.count });
    }

    return NextResponse.json({ message: `Seeded ${result.inserted} inventory items`, count: result.inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
