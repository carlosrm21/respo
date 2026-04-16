import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\\r\\n/g, '')?.replace(/\r\n/g, '')?.trim() || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\r\\n/g, '')?.replace(/\r\n/g, '')?.trim() || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && serviceRoleKey);

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cachedClient;
}
