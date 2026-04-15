import bcrypt from 'bcryptjs';

const PIN_REGEX = /^\d{4}$/;
const WEAK_PINS = new Set([
  '0000', '1111', '1234', '2222', '3333', '4444', '5555', '5678', '6666', '7777', '8888', '9999',
  '0123', '4321', '9876', '8765', '6543', '5432', '3210'
]);

const SEQUENTIAL_REGEX = /0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/;
const BCRYPT_REGEX = /^\$2[aby]\$/;

export function normalizePin(pin: string) {
  return pin.trim();
}

export function isPinFormatValid(pin: string) {
  return PIN_REGEX.test(pin);
}

export function isWeakPin(pin: string) {
  if (!isPinFormatValid(pin)) return true;
  if (WEAK_PINS.has(pin)) return true;
  if (/^(\d)\1{3}$/.test(pin)) return true;
  return SEQUENTIAL_REGEX.test(pin);
}

export function isHashedPin(value: string | null | undefined) {
  if (!value) return false;
  return BCRYPT_REGEX.test(value);
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(inputPin: string, storedPin: string | null | undefined) {
  if (!storedPin) return false;
  if (isHashedPin(storedPin)) {
    return bcrypt.compare(inputPin, storedPin);
  }
  return storedPin === inputPin;
}

export async function validateNewPin(rawPin: string) {
  const pin = normalizePin(rawPin);
  if (!isPinFormatValid(pin)) {
    return { ok: false, error: 'El PIN debe tener 4 dígitos numéricos.' };
  }
  if (isWeakPin(pin)) {
    return { ok: false, error: 'PIN débil. Usa un PIN de 4 dígitos que no sea secuencial ni repetido.' };
  }
  return { ok: true, pin };
}

export function generateStrongPin(usedPins: Set<string>) {
  for (let index = 0; index < 5000; index += 1) {
    const candidate = `${Math.floor(1000 + Math.random() * 9000)}`;
    if (usedPins.has(candidate)) continue;
    if (isWeakPin(candidate)) continue;
    usedPins.add(candidate);
    return candidate;
  }

  throw new Error('No fue posible generar un PIN seguro disponible.');
}
