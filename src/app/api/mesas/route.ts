import { NextResponse } from 'next/server';
import { getMesasData, seedSupabaseOperationalData } from '@/lib/opsData';
import { isSupabaseConfigured } from '@/lib/supabaseAdmin';

export async function GET() {
    try {
        if (!isSupabaseConfigured) {
            return NextResponse.json({ success: false, error: 'Supabase no configurado.' }, { status: 500 });
        }

        let mesas = await getMesasData();

        // If the tenant has no seed data yet, provision base operational records.
        if (!mesas || mesas.length === 0) {
            await seedSupabaseOperationalData();
            mesas = await getMesasData();
        }

        return NextResponse.json({ success: true, data: mesas });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: 'Failed to fetch mesas' }, { status: 500 });
    }
}
