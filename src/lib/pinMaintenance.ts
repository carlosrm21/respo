import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabaseAdmin';
import { generateStrongPin, hashPin, isHashedPin, isWeakPin } from '@/lib/pinSecurity';

export type PinRotationResult = {
  id: number;
  nombre: string;
  rol: string;
  newPin: string;
};

export type PinMaintenanceResult = {
  rotatedCount: number;
  hardenedExistingPins: number;
  rotated: PinRotationResult[];
};

export async function runPinMaintenance(): Promise<PinMaintenanceResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado para rotación de PINs.');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('meseros')
    .select('id, nombre, rol, pin, activo')
    .not('pin', 'is', null)
    .order('rol', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []).filter((row) => Boolean(row.pin)) as Array<{
    id: number;
    nombre: string;
    rol: string;
    pin: string;
    activo: number;
  }>;

  const usedPins = new Set(
    rows
      .map((row) => row.pin)
      .filter((value) => Boolean(value) && !isHashedPin(value as string)) as string[]
  );

  const rotated: PinRotationResult[] = [];
  let hardenedExistingPins = 0;

  for (const row of rows) {
    const currentPin = row.pin;
    if (!currentPin) continue;

    if (isHashedPin(currentPin)) continue;

    if (isWeakPin(currentPin)) {
      const newPin = generateStrongPin(usedPins);
      const hashed = await hashPin(newPin);
      const { error: updateError } = await supabase
        .from('meseros')
        .update({ pin: hashed })
        .eq('id', row.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      rotated.push({
        id: row.id,
        nombre: row.nombre,
        rol: row.rol,
        newPin
      });
      continue;
    }

    const hashed = await hashPin(currentPin);
    const { error: hardenError } = await supabase
      .from('meseros')
      .update({ pin: hashed })
      .eq('id', row.id);

    if (hardenError) {
      throw new Error(hardenError.message);
    }

    hardenedExistingPins += 1;
  }

  return {
    rotatedCount: rotated.length,
    hardenedExistingPins,
    rotated
  };
}
