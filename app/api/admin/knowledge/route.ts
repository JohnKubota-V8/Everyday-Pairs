import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false as const, status: 401 as const };

  const { data: adminRow, error: adminErr } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr || !adminRow) return { ok: false as const, status: 403 as const };
  return { ok: true as const };
}

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ error: "missing_supabase_config" }, { status: 500 });

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "customer_knowledge")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "load_failed", message: error.message }, { status: 500 });

  const text = typeof data?.value === "string" ? data.value : "";
  return NextResponse.json({ text });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const body = (await request.json().catch(() => null)) as null | { text?: unknown };
  const text = typeof body?.text === "string" ? body.text : null;
  if (text == null) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ error: "missing_supabase_config" }, { status: 500 });

  const { error } = await supabase.from("app_settings").upsert(
    {
      key: "customer_knowledge",
      value: text,
    },
    { onConflict: "key" }
  );

  if (error) return NextResponse.json({ error: "save_failed", message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
