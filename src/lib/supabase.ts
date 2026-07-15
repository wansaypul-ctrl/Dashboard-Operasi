import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (browser-safe) — uses the PUBLIC publishable/anon key.
 * Protected by Row Level Security (RLS) on every table (PRD §5.2).
 *
 * Environment variables (see .env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * NOTE: This client is safe to use on BOTH client and server. For privileged
 * operations (bypassing RLS, e.g. seeding/admin) use a server-only service
 * role client — never expose the service_role key to the browser.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env",
    );
  }
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  return _client;
}

/** True if Supabase env vars are configured (use to gate Supabase features). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Quick connectivity test — fetches one row from tbl_program via the anon key.
 *  Accurately detects: (a) network/auth failure, (b) missing tables (schema not run),
 *  (c) empty tables (seed not run). */
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("tbl_program")
      .select("*")
      .limit(1);
    if (error) {
      // PGRST205 = table missing → schema.sql not run yet
      return { ok: false, error: error.message };
    }
    return { ok: true, count: data?.length ?? 0 };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
