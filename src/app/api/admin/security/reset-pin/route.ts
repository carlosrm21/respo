export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeSetupRequest } from '@/lib/setupSecurity';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { hashPin, isWeakPin } from '@/lib/pinSecurity';

type AllowedRole = 'admin' | 'waiter' | 'kitchen';

function isAllowedRole(value: string): value is AllowedRole {
  return value === 'admin' || value === 'waiter' || value === 'kitchen';
}

export async function POST(req: NextRequest) {
  try {
    const auth = authorizeSetupRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.reason }, { status: 401 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const role = String(body?.role || 'admin').trim();
    const pin = String(body?.pin || '').trim();

    if (!isAllowedRole(role)) {
      return NextResponse.json({ error: 'Rol no valido. Usa admin, waiter o kitchen.' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'El PIN debe tener exactamente 4 digitos numericos.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: users, error: usersError } = await supabase
      .from('meseros')
      .select('id, rol, activo')
      .eq('rol', role)
      .eq('activo', 1)
      .order('id', { ascending: true })
      .limit(1);

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: `No hay un usuario activo para el rol ${role}.` }, { status: 404 });
    }

    const hashed = await hashPin(pin);
    const targetId = users[0].id;

    const { error: updateError } = await supabase
      .from('meseros')
      .update({ pin: hashed })
      .eq('id', targetId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      role,
      userId: targetId,
      weakPinWarning: isWeakPin(pin),
      message: isWeakPin(pin)
        ? 'PIN actualizado, pero es debil. Cambialo por uno mas fuerte lo antes posible.'
        : 'PIN actualizado correctamente.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'No fue posible restablecer el PIN.' }, { status: 500 });
  }
}
