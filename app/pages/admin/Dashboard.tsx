"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Package } from "lucide-react";

type HourlySale = { hour: string; sales: number; orders: number };
type TopSelling = { name: string; sold: number; percentage: number };
type RecentSale = {
  id: string;
  createdAt: string;
  source: string;
  itemsCount: number;
  amount: number;
};

type DashboardData = {
  stats: {
    todaySales: number;
    todayOrders: number;
    avgPerOrder: number;
    monthSales: number;
    monthOrders: number;
    latestAt: string | null;
  };
  hourlySales: HourlySale[];
  topSelling: TopSelling[];
  recentSales: RecentSale[];
};

const emptyHourly = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  sales: 0,
  orders: 0,
}));

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/dashboard")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "load_failed");
        }
        return res.json() as Promise<DashboardData>;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = data?.stats ?? {
    todaySales: 0,
    todayOrders: 0,
    avgPerOrder: 0,
    monthSales: 0,
    monthOrders: 0,
    latestAt: null,
  };

  const hourlySales = data?.hourlySales ?? emptyHourly;
  const topSelling = data?.topSelling ?? [];
  const recentSales = data?.recentSales ?? [];

  const latestLabel = useMemo(() => {
    if (!stats.latestAt) return "ยังไม่มีข้อมูล";
    const dt = new Date(stats.latestAt);
    if (Number.isNaN(dt.getTime())) return "ยังไม่มีข้อมูล";
    return `${dt.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" })} | ข้อมูลล่าสุด ${dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
  }, [stats.latestAt]);

  const statCards = [
    { label: "ยอดขายวันนี้", value: `${stats.todaySales.toLocaleString()} ฿`, icon: DollarSign, color: "#778873" },
    { label: "จำนวนรายการ", value: `${stats.todayOrders} รายการ`, icon: ShoppingBag, color: "#A1BC98" },
    { label: "เฉลี่ย/รายการ", value: `${stats.avgPerOrder} ฿`, icon: TrendingUp, color: "#D2DCB6" },
    { label: "ยอดขายเดือนนี้", value: `${stats.monthSales.toLocaleString()} ฿`, icon: Package, color: "#F1F3E0" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: "#4a5c44" }}>แดชบอร์ด</h1>
        <p className="text-sm" style={{ color: "#9ca3af" }}>{latestLabel}</p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#E8EED4] bg-white p-4 text-sm" style={{ color: "#9ca3af" }}>
          กำลังโหลดข้อมูล...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#f8d7da] bg-[#fef2f2] p-4 text-sm" style={{ color: "#721c24" }}>
          โหลดข้อมูลไม่สำเร็จ: {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: color }}>
              <Icon size={18} style={{ color: color === "#F1F3E0" ? "#778873" : "white" }} />
            </div>
            <p className="text-sm" style={{ color: "#9ca3af" }}>{label}</p>
            <p className="font-semibold text-lg" style={{ color: "#4a5c44" }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <h3 className="mb-4" style={{ color: "#4a5c44" }}>ยอดขายรายชั่วโมง</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlySales} barSize={32}>
              <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v} ฿`, "ยอดขาย"]}
              />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                {hourlySales.map((_, i) => (
                  <Cell key={i} fill={i === 2 ? "#778873" : "#D2DCB6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <h3 className="mb-4" style={{ color: "#4a5c44" }}>ช่องทางขายเด่นวันนี้</h3>
          <div className="space-y-3">
            {topSelling.length === 0 && (
              <div className="text-sm" style={{ color: "#9ca3af" }}>ยังไม่มีข้อมูลเมนูขายดี</div>
            )}
            {topSelling.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#4a5c44" }}>{item.name}</span>
                  <span style={{ color: "#778873" }}>{item.sold} ชิ้น</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "#F1F3E0" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%`, backgroundColor: i === 0 ? "#778873" : "#A1BC98" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E8EED4" }}>
          <h3 style={{ color: "#4a5c44" }}>รายการขายล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F1F3E0" }}>
                {["เวลา", "ช่องทาง", "จำนวนชิ้น", "ยอดขาย"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-sm" style={{ color: "#9ca3af" }}>
                    ยังไม่มีข้อมูลรายการขาย
                  </td>
                </tr>
              )}
              {recentSales.map((sale) => {
                const createdAt = new Date(sale.createdAt);
                const timeLabel = Number.isNaN(createdAt.getTime())
                  ? "-"
                  : createdAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={sale.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3 text-sm" style={{ color: "#9ca3af" }}>{timeLabel}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#4a5c44" }}>{sale.source}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#6b7280" }}>{sale.itemsCount}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#778873" }}>{sale.amount.toLocaleString()} ฿</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
