import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type OrderItemInput = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
};

type CreateOrderBody = {
  customerName?: unknown;
  phone?: unknown;
  address?: unknown;
  note?: unknown;
  paymentMethod?: unknown;
  subtotal?: unknown;
  shippingFee?: unknown;
  total?: unknown;
  items?: unknown;
  userId?: unknown;
};

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function toNonNegativeNumber(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Number(n.toFixed(2));
}

function toPositiveInt(value: unknown) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function normalizeItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows: OrderItemInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const productId = String(row.productId ?? "").trim();
    const name = String(row.name ?? "").trim();
    const size = String(row.size ?? "").trim();
    const quantity = toPositiveInt(row.quantity);
    const price = toNonNegativeNumber(row.price);
    if (!productId || !name || !size || quantity == null || price == null) return null;
    rows.push({ productId, name, size, quantity, price });
  }
  return rows;
}

function makeOrderNumber(id: string) {
  const seed = id.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `EP-${seed.padStart(8, "0")}`;
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as CreateOrderBody | null;
  if (!body) return NextResponse.json({ error: "invalid_json" }, { status: 400 });

  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const note = String(body.note ?? "").trim();
  const paymentMethod = String(body.paymentMethod ?? "promptpay").trim() || "promptpay";
  const userId = body.userId == null ? null : String(body.userId).trim() || null;

  const subtotal = toNonNegativeNumber(body.subtotal);
  const shippingFee = toNonNegativeNumber(body.shippingFee);
  const total = toNonNegativeNumber(body.total);
  const items = normalizeItems(body.items);

  if (!customerName) return NextResponse.json({ error: "missing_customer_name" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "missing_phone" }, { status: 400 });
  if (!address) return NextResponse.json({ error: "missing_address" }, { status: 400 });
  if (!items) return NextResponse.json({ error: "invalid_items" }, { status: 400 });
  if (subtotal == null || shippingFee == null || total == null) {
    return NextResponse.json({ error: "invalid_totals" }, { status: 400 });
  }

  const calcSubtotal = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  if (Math.abs(calcSubtotal - subtotal) > 0.01) {
    return NextResponse.json({ error: "subtotal_mismatch" }, { status: 400 });
  }

  const calcTotal = Number((calcSubtotal + shippingFee).toFixed(2));
  if (Math.abs(calcTotal - total) > 0.01) {
    return NextResponse.json({ error: "total_mismatch" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { data: inserted, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      phone,
      address,
      note,
      payment_method: paymentMethod,
      status: "pending",
      subtotal,
      shipping_fee: shippingFee,
      total,
      items,
      user_id: userId,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (orderErr || !inserted) {
    return NextResponse.json({ error: "order_create_failed", message: orderErr?.message ?? "" }, { status: 500 });
  }

  const orderNumber = makeOrderNumber(inserted.id);
  const { error: numberErr } = await supabase.from("orders").update({ order_number: orderNumber }).eq("id", inserted.id);
  if (numberErr) {
    return NextResponse.json({ error: "order_number_update_failed", message: numberErr.message }, { status: 500 });
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  await supabase.from("sales_logs").insert({
    order_id: inserted.id,
    amount: total,
    items_count: itemCount,
    source: "online",
    created_at: now,
  });

  return NextResponse.json(
    {
      order: {
        id: inserted.id,
        orderNumber,
        customer: customerName,
        phone,
        address,
        note,
        subtotal,
        shippingFee,
        total,
        status: "pending",
        paymentMethod,
      },
    },
    { status: 201 },
  );
}
