'use server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPin, validateNewPin } from '@/lib/pinSecurity';

export async function getMeseros() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('meseros')
      .select('id, nombre, rol, activo, pin')
      .order('nombre', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function addMesero(nombre: string, pin: string) {
  try {
    const validation = await validateNewPin(pin);
    if (!validation.ok || !validation.pin) {
      return { success: false, error: validation.error };
    }

    const hashedPin = await hashPin(validation.pin);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('meseros')
      .insert({ nombre, pin: hashedPin, activo: 1, rol: 'waiter' })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true, id: data?.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateMesero(id: number, nombre: string, activo: number, pin?: string) {
  try {
    let hashedPin: string | undefined;
    if (pin && pin.trim()) {
      const validation = await validateNewPin(pin);
      if (!validation.ok || !validation.pin) {
        return { success: false, error: validation.error };
      }
      hashedPin = await hashPin(validation.pin);
    }

    const supabase = getSupabaseAdmin();
    const payload: { nombre: string; activo: number; pin?: string } = { nombre, activo };
    if (hashedPin) payload.pin = hashedPin;

    const { error } = await supabase
      .from('meseros')
      .update(payload)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteMesero(id: number) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('meseros')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
