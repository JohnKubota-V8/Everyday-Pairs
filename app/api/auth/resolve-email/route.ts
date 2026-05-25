import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as null | { username?: unknown };
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  if (!username) {
    return NextResponse.json({ error: "missing_username" }, { status: 400 });
  }

  // Use a SECURITY DEFINER SQL function to resolve email by username.
  // No service role secret needed in the Next.js app.
  const supabase = createClient(await cookies());
  const { data } = await supabase.rpc("resolve_email_by_username", { p_username: username });
  const email = typeof data === "string" ? data : "";
  if (!email) {
    // Avoid hinting whether username exists.
    return NextResponse.json({ error: "invalid_login" }, { status: 400 });
  }

  return NextResponse.json({ email });
}
