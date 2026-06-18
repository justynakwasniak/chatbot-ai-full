import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function getSupabaseKeyRole(key: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    const key = process.env.SUPABASE_KEY!;
    const role = getSupabaseKeyRole(key);

    if (role && role !== 'service_role') {
      console.error(
        `[Supabase] SUPABASE_KEY has role "${role}". Backend requires the service_role key from Project Settings → API Keys.`,
      );
    }

    client = createClient(process.env.SUPABASE_URL!, key);
  }
  return client;
}

export function isSupabaseServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_KEY;
  if (!key) return false;
  const role = getSupabaseKeyRole(key);
  return role === 'service_role';
}
