"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";
import { Download, TrendingUp, Calendar } from "lucide-react";

type ReportOrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type ReportsData = {
  meta: { startMonth: string; endMonth: string };
  summary: {
    totalMonth: number;
    totalOrders: number;
    avgPerMonth: number;
    newCustomersThisMonth: number;
  };
  monthlySales: { month: string; sales: number; orders: number }[];
  weeklySales: { day: string; sales: number; orders: number }[];
  topSelling: { name: string; sold: number; percentage: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    items: { name: string; quantity: number }[];
    total: number;
    shippingFee: number;
    status: ReportOrderStatus;
    createdAt: string;
  }[];
};

export function Reports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/reports")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "load_failed");
        }
        return res.json() as Promise<ReportsData>;
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

  const monthlySales = data?.monthlySales ?? [];
  const weeklyData = data?.weeklySales ?? [];
  const topSelling = data?.topSelling ?? [];
  const recentOrders = data?.recentOrders ?? [];
  const summary = data?.summary ?? { totalMonth: 0, totalOrders: 0, avgPerMonth: 0, newCustomersThisMonth: 0 };

  const monthRangeLabel = useMemo(() => {
    const start = data?.meta?.startMonth;
    const end = data?.meta?.endMonth;
    if (!start || !end) return "ยังไม่มีข้อมูล";
    return `ข้อมูลตั้งแต่ ${start} - ${end}`;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: "#4a5c44" }}>รายงานยอดขาย</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>{monthRangeLabel}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all hover:bg-[#F1F3E0]" style={{ borderColor: "#D2DCB6", color: "#6b7280" }}>
          <Download size={15} /> ดาวน์โหลด
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#E8EED4] bg-white p-4 text-sm" style={{ color: "#9ca3af" }}>
          กำลังโหลดข้อมูลรายงาน...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#f8d7da] bg-[#fef2f2] p-4 text-sm" style={{ color: "#721c24" }}>
          โหลดข้อมูลไม่สำเร็จ: {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "รายได้รวม (5 เดือน)", value: `${summary.totalMonth.toLocaleString()} ฿`, icon: "💰" },
          { label: "ออเดอร์รวม", value: `${summary.totalOrders} ออเดอร์`, icon: "📦" },
          { label: "เฉลี่ย/เดือน", value: `${summary.avgPerMonth.toLocaleString()} ฿`, icon: "📊" },
          { label: "ลูกค้าใหม่ (เดือนนี้)", value: `${summary.newCustomersThisMonth} คน`, icon: "👥" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-4" style={{ border: "1px solid #E8EED4" }}>
            <span className="text-xl">{item.icon}</span>
            <p className="text-xs mt-2 mb-0.5" style={{ color: "#9ca3af" }}>{item.label}</p>
            <p className="font-semibold text-base" style={{ color: "#4a5c44" }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} style={{ color: "#778873" }} />
            <h3 style={{ color: "#4a5c44" }}>ยอดขายรายเดือน</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySales} barSize={28}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v.toLocaleString()} ฿`, "ยอดขาย"]}
              />
              <Bar dataKey="sales" fill="#A1BC98" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: "#778873" }} />
            <h3 style={{ color: "#4a5c44" }}>แนวโน้มรายสัปดาห์</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3E0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="#778873" strokeWidth={2} dot={{ fill: "#778873", r: 4 }} name="ยอดขาย (฿)" />
              <Line type="monotone" dataKey="orders" stroke="#D2DCB6" strokeWidth={2} dot={{ fill: "#D2DCB6", r: 4 }} name="ออเดอร์" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E8EED4" }}>
          <h3 className="mb-4" style={{ color: "#4a5c44" }}>สินค้าขายดี (สะสม)</h3>
          <div className="space-y-3">
            {topSelling.length === 0 && (
              <p className="text-sm" style={{ color: "#9ca3af" }}>ยังไม่มีข้อมูลสินค้า</p>
            )}
            {topSelling.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-5 text-sm text-center font-semibold" style={{ color: i < 3 ? "#778873" : "#9ca3af" }}>
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: "#4a5c44" }}>{item.name}</span>
                  <span style={{ color: "#778873" }}>{item.sold * 5} คู่</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: "#F1F3E0" }}>
                  <div className="h-2 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: i === 0 ? "#778873" : i === 1 ? "#A1BC98" : "#D2DCB6" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid #E8EED4" }}>
          <h3 style={{ color: "#4a5c44" }}>รายการออเดอร์ทั้งหมด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F1F3E0" }}>
                {["วันที่", "ออเดอร์", "ลูกค้า", "สินค้า", "ยอด", "สถานะ"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafafa]">
                    <td className="px-5 py-3 text-xs" style={{ color: "#9ca3af" }}>{order.createdAt}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "#4a5c44" }}>{order.orderNumber}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "#4a5c44" }}>{order.customer}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "#6b7280" }}>
                    {order.items.map((i) => `${i.name.slice(0, 12)} x${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: "#778873" }}>{order.total + order.shippingFee} ฿</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs" style={{
                      backgroundColor: order.status === "delivered" ? "#d4edda" : order.status === "shipped" ? "#cce5ff" : order.status === "confirmed" ? "#D2DCB6" : "#fff3cd",
                      color: order.status === "delivered" ? "#155724" : order.status === "shipped" ? "#004085" : order.status === "confirmed" ? "#4a5c44" : "#856404",
                    }}>
                      {order.status === "delivered" ? "ส่งถึงแล้ว" : order.status === "shipped" ? "จัดส่งแล้ว" : order.status === "confirmed" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm" style={{ color: "#9ca3af" }}>
                    ยังไม่มีข้อมูลออเดอร์
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
