import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { createClient as createServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type OrderItemRow = {
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
  size?: string;
};

type OrderRow = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  payment_method: string | null;
  status: OrderStatus | null;
  subtotal: number | null;
  shipping_fee: number | null;
  total: number | null;
  items: OrderItemRow[] | null;
  created_at: string;
};

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

function mapOrder(row: OrderRow) {
  const dt = new Date(row.created_at);
  const createdAt = Number.isNaN(dt.getTime()) ? row.created_at : dt.toISOString().slice(0, 10);
  const time = Number.isNaN(dt.getTime())
    ? "-"
    : dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

  return {
    id: row.id,
    orderNumber: row.order_number ?? `EP-${row.id.slice(-8).toUpperCase()}`,
    customer: row.customer_name ?? "-",
    phone: row.phone ?? "-",
    address: row.address ?? "",
    note: row.note ?? "",
    paymentMethod: row.payment_method ?? "-",
    status: (row.status ?? "pending") as OrderStatus,
    items: (row.items ?? []).map((item) => ({
      productId: String(item.productId ?? ""),
      name: String(item.name ?? "-"),
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
      size: String(item.size ?? ""),
    })),
    total: Number(row.subtotal ?? row.total ?? 0),
    shippingFee: Number(row.shipping_fee ?? 0),
    grandTotal: Number(row.total ?? 0),
    createdAt,
    time,
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, address, note, payment_method, status, subtotal, shipping_fee, total, items, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "orders_fetch_failed", message: error.message }, { status: 500 });

  return NextResponse.json({ orders: (data ?? []).map((row) => mapOrder(row as OrderRow)) });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { id?: unknown; status?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim() : "";
  const validStatuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  if (!validStatuses.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "order_update_failed", message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
