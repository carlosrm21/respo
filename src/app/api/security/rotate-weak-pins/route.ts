export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { runPinMaintenance } from '@/lib/pinMaintenance';

export async function POST(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    const result = await runPinMaintenance();

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'No fue posible rotar PINs débiles.' }, { status: 500 });
  }
}
