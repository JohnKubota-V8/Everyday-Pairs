import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { mapProductRowToProduct, type ProductRow } from "../../../_lib/products";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

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

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return base || "product";
}

function toRow(body: Record<string, unknown>, existingSlug?: string) {
  const name = String(body.name ?? "").trim();
  const category = String(body.category ?? "other").trim();

  return {
    name,
    price: Number(body.price ?? 0),
    original_price: body.originalPrice == null || body.originalPrice === "" ? null : Number(body.originalPrice),
    category,
    description: String(body.description ?? ""),
    material: String(body.material ?? ""),
    is_new: Boolean(body.isNew),
    is_featured: Boolean(body.isFeatured),
    bg_color: String(body.bgColor ?? ""),
    sock_color: String(body.sockColor ?? ""),
    stock: Number(body.stock ?? 0),
    sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : ["Free Size"],
    slug: existingSlug ?? `${slugify(category)}-${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`,
  };
}

async function fetchProductById(supabase: ReturnType<typeof getServiceClient>, id: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, price, original_price, category, description, material, is_new, is_featured, bg_color, sock_color, stock, sizes")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProductRow;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, original_price, category, description, material, is_new, is_featured, bg_color, sock_color, stock, sizes")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "products_fetch_failed", message: error.message }, { status: 500 });
  return NextResponse.json({ products: (data ?? []).map((row) => mapProductRowToProduct(row as ProductRow)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as null | Record<string, unknown>;
  if (!body?.name) return NextResponse.json({ error: "missing_name" }, { status: 400 });

  const row = toRow(body);
  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select("id, name, price, original_price, category, description, material, is_new, is_featured, bg_color, sock_color, stock, sizes")
    .single();

  if (error || !data) return NextResponse.json({ error: "product_create_failed", message: error?.message ?? "" }, { status: 500 });
  return NextResponse.json({ product: mapProductRowToProduct(data as ProductRow) });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as null | Record<string, unknown>;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const existing = await fetchProductById(supabase, id);
  if (!existing) return NextResponse.json({ error: "product_not_found" }, { status: 404 });

  const row = toRow(body ?? {}, existing.slug ?? undefined);
  const { data, error } = await supabase
    .from("products")
    .update(row)
    .eq("id", id)
    .select("id, name, price, original_price, category, description, material, is_new, is_featured, bg_color, sock_color, stock, sizes")
    .single();

  if (error || !data) return NextResponse.json({ error: "product_update_failed", message: error?.message ?? "" }, { status: 500 });
  return NextResponse.json({ product: mapProductRowToProduct(data as ProductRow) });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const id = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "product_delete_failed", message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
