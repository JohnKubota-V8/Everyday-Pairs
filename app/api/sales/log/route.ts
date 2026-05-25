import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type SaleLogBody = {
  amount?: unknown;
  itemsCount?: unknown;
  source?: unknown;
  orderId?: unknown;
  menu?: unknown;
  qty?: unknown;
  price?: unknown;
  createdAt?: unknown;
};

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function toPositiveInt(value: unknown) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function toNonNegativeNumber(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function toIsoTimestamp(value: unknown) {
  if (value == null || value === "") return new Date().toISOString();
  const dt = new Date(String(value));
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as SaleLogBody | null;
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const source = String(body.source ?? body.menu ?? "pos").trim() || "pos";
  const itemsCount = toPositiveInt(body.itemsCount ?? body.qty ?? 1);
  const amountDirect = toNonNegativeNumber(body.amount);
  const price = toNonNegativeNumber(body.price);
  const createdAt = toIsoTimestamp(body.createdAt);
  const orderId = body.orderId == null ? null : String(body.orderId).trim();

  const amount = amountDirect ?? (itemsCount != null && price != null ? Number((itemsCount * price).toFixed(2)) : null);

  if (itemsCount == null) return NextResponse.json({ error: "invalid_items_count", message: "itemsCount must be a positive integer" }, { status: 400 });
  if (amount == null) return NextResponse.json({ error: "invalid_amount", message: "amount is required (or qty x price)" }, { status: 400 });
  if (!createdAt) return NextResponse.json({ error: "invalid_created_at", message: "createdAt must be a valid date" }, { status: 400 });

  const { data, error } = await supabase
    .from("sales_logs")
    .insert({
      order_id: orderId || null,
      amount,
      items_count: itemsCount,
      source,
      created_at: createdAt,
    })
    .select("id, order_id, created_at, amount, items_count, source")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "sale_log_create_failed", message: error?.message ?? "" },
      { status: 500 },
    );
  }

  return NextResponse.json({ sale: data }, { status: 201 });
}
