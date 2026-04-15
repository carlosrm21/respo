import { NextResponse } from 'next/server';
import { getMesasData } from '@/lib/opsData';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        if (!isSupabaseConfigured) {
            return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
        }

        const mesas = await getMesasData();
        return NextResponse.json({ success: true, data: mesas });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch mesas' }, { status: 500 });
    }
}
