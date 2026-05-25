import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { createClient as createServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type SaleLogRow = {
  created_at: string;
  amount: number | null;
  items_count: number | null;
  source: string | null;
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

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatHourLabel(hour: number) {
  const pad = hour.toString().padStart(2, "0");
  return `${pad}:00`;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [{ data: todayRows, error: todayErr }, { data: monthRows, error: monthErr }, { data: recentRows, error: recentErr }] =
    await Promise.all([
      supabase
        .from("sales_logs")
        .select("created_at, amount, items_count, source")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("sales_logs")
        .select("created_at, amount, items_count")
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("sales_logs")
        .select("created_at, amount, items_count, source")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (todayErr || monthErr || recentErr) {
    return NextResponse.json(
      {
        error: "sales_logs_fetch_failed",
        message: todayErr?.message ?? monthErr?.message ?? recentErr?.message ?? "",
      },
      { status: 500 },
    );
  }

  const todayLogs = (todayRows ?? []) as SaleLogRow[];
  const monthLogs = (monthRows ?? []) as SaleLogRow[];
  const recentLogs = (recentRows ?? []) as SaleLogRow[];

  let todaySales = 0;
  let todayOrders = 0;
  const hourlySales = Array.from({ length: 24 }, (_, i) => ({
    hour: formatHourLabel(i),
    sales: 0,
    orders: 0,
  }));

  const sourceQty = new Map<string, number>();
  for (const row of todayLogs) {
    const amount = Number(row.amount ?? 0);
    const itemsCount = Number(row.items_count ?? 0);
    todaySales += amount;
    todayOrders += 1;

    const hour = new Date(row.created_at).getHours();
    if (hourlySales[hour]) {
      hourlySales[hour].sales += amount;
      hourlySales[hour].orders += 1;
    }

    const source = (row.source ?? "ไม่ระบุช่องทาง").trim() || "ไม่ระบุช่องทาง";
    sourceQty.set(source, (sourceQty.get(source) ?? 0) + (itemsCount || 1));
  }

  const totalQty = Array.from(sourceQty.values()).reduce((sum, qty) => sum + qty, 0);
  const topSelling = Array.from(sourceQty.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sold]) => ({
      name,
      sold,
      percentage: totalQty ? Math.round((sold / totalQty) * 100) : 0,
    }));

  const monthSales = monthLogs.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const monthOrders = monthLogs.length;

  const avgPerOrder = todayOrders ? Math.round(todaySales / todayOrders) : 0;
  const latestAt = recentLogs[0]?.created_at ?? null;

  return NextResponse.json({
    stats: {
      todaySales,
      todayOrders,
      avgPerOrder,
      monthSales,
      monthOrders,
      latestAt,
    },
    hourlySales,
    topSelling,
    recentSales: recentLogs.map((row, index) => ({
      id: `${row.created_at}-${index}`,
      createdAt: row.created_at,
      source: (row.source ?? "ไม่ระบุช่องทาง").trim() || "ไม่ระบุช่องทาง",
      itemsCount: Number(row.items_count ?? 0),
      amount: Number(row.amount ?? 0),
    })),
  });
}
