import { NextResponse } from "next/server";
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
  status: OrderStatus | null;
  subtotal: number | null;
  shipping_fee: number | null;
  total: number | null;
  items: OrderItemRow[] | null;
  created_at: string;
};

type SaleLogRow = {
  created_at: string;
  amount: number | null;
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

function monthLabel(date: Date) {
  return date.toLocaleDateString("th-TH", { month: "short" });
}

function isoDateOnly(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  const labels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  return labels[date.getDay()] ?? "-";
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 4, 1);
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);

  const [{ data: salesLogs, error: salesErr }, { data: orders, error: ordersErr }] = await Promise.all([
    supabase
      .from("sales_logs")
      .select("created_at, amount")
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, subtotal, shipping_fee, total, items, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (salesErr || ordersErr) {
    return NextResponse.json(
      {
        error: "reports_fetch_failed",
        message: salesErr?.message ?? ordersErr?.message ?? "",
      },
      { status: 500 },
    );
  }

  const logRows = (salesLogs ?? []) as SaleLogRow[];
  const orderRows = (orders ?? []) as OrderRow[];

  const monthMap = new Map<string, { month: string; sales: number; orders: number }>();
  for (let i = 4; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, { month: monthLabel(d), sales: 0, orders: 0 });
  }

  const weekMap = new Map<string, { day: string; sales: number; orders: number }>();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekMap.set(isoDateOnly(d), { day: dayLabel(d), sales: 0, orders: 0 });
  }

  for (const row of logRows) {
    const dt = new Date(row.created_at);
    if (Number.isNaN(dt.getTime())) continue;
    const amount = Number(row.amount ?? 0);

    const monthKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const monthBucket = monthMap.get(monthKey);
    if (monthBucket) {
      monthBucket.sales += amount;
      monthBucket.orders += 1;
    }

    const dayKey = isoDateOnly(dt);
    const weekBucket = weekMap.get(dayKey);
    if (weekBucket) {
      weekBucket.sales += amount;
      weekBucket.orders += 1;
    }
  }

  const topSellingMap = new Map<string, number>();
  for (const order of orderRows) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const name = String(item?.name ?? "-").trim() || "-";
      const qty = Number(item?.quantity ?? 0);
      if (qty > 0) topSellingMap.set(name, (topSellingMap.get(name) ?? 0) + qty);
    }
  }

  const maxTopQty = Math.max(0, ...Array.from(topSellingMap.values()));
  const topSelling = Array.from(topSellingMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sold]) => ({
      name,
      sold,
      percentage: maxTopQty ? Math.round((sold / maxTopQty) * 100) : 0,
    }));

  const monthlySales = Array.from(monthMap.values()).map((row) => ({
    month: row.month,
    sales: Math.round(row.sales),
    orders: row.orders,
  }));

  const weeklySales = Array.from(weekMap.values()).map((row) => ({
    day: row.day,
    sales: Math.round(row.sales),
    orders: row.orders,
  }));

  const totalMonth = monthlySales.reduce((sum, row) => sum + row.sales, 0);
  const totalOrders = monthlySales.reduce((sum, row) => sum + row.orders, 0);

  const recentOrders = orderRows.slice(0, 20).map((row) => {
    const dt = new Date(row.created_at);
    const createdAt = Number.isNaN(dt.getTime()) ? row.created_at : dt.toISOString().slice(0, 10);
    return {
      id: row.id,
      orderNumber: row.order_number ?? `EP-${row.id.slice(-8).toUpperCase()}`,
      customer: row.customer_name ?? "-",
      items: (Array.isArray(row.items) ? row.items : []).map((item) => ({
        name: String(item?.name ?? "-"),
        quantity: Number(item?.quantity ?? 0),
      })),
      total: Number(row.subtotal ?? row.total ?? 0),
      shippingFee: Number(row.shipping_fee ?? 0),
      status: (row.status ?? "pending") as OrderStatus,
      createdAt,
    };
  });

  return NextResponse.json({
    meta: {
      startMonth: monthlySales[0]?.month ?? "-",
      endMonth: monthlySales[monthlySales.length - 1]?.month ?? "-",
    },
    summary: {
      totalMonth,
      totalOrders,
      avgPerMonth: monthlySales.length ? Math.round(totalMonth / monthlySales.length) : 0,
      newCustomersThisMonth: 0,
    },
    monthlySales,
    weeklySales,
    topSelling,
    recentOrders,
  });
}
