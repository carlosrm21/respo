import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('tenant_id')?.value;

    if (!tenantId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://restopos.movilcomts.com';
    const webhookUrl = `${baseUrl}/api/delivery?tenant_id=${tenantId}`;

    return NextResponse.json({ success: true, webhookUrl });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
