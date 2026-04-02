import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'restaurante.db');
    const file = readFileSync(dbPath);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="restaurante_backup_${new Date().toISOString().slice(0,10)}.db"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
