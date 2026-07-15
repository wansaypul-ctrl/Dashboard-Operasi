import { NextResponse } from "next/server";
import { isSupabaseConfigured, testSupabaseConnection } from "@/lib/supabase";

// GET /api/supabase-status
// Reports whether Supabase env vars are set and whether the live Supabase
// project responds to an authenticated (anon key) SELECT against tbl_program.
// Use this to confirm the schema.sql + seed.sql have been run successfully.
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        configured: false,
        connected: false,
        message:
          "Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY to .env",
      },
      { status: 200 },
    );
  }

  const result = await testSupabaseConnection();

  return NextResponse.json({
    configured: true,
    connected: result.ok,
    programsCount: result.count,
    message: result.ok
      ? `Supabase berhubung. ${result.count} rekod program dijumpai.`
      : `Supabase dikonfigurasi tetapi sambungan gagal: ${result.error}`,
    hint: result.ok
      ? undefined
      : "Pastikan schema.sql dan seed.sql telah dilaksanakan di Supabase SQL Editor.",
  });
}
