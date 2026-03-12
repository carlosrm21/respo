import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const mesas = db.prepare('SELECT * FROM mesas ORDER BY numero ASC').all();
        return NextResponse.json({ success: true, data: mesas });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch mesas' }, { status: 500 });
    }
}
