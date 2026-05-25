"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: { productId: string; name: string; quantity: number; price: number; size: string }[];
  total: number;
  shippingFee: number;
  grandTotal: number;
  address: string;
  note: string;
  status: OrderStatus;
  createdAt: string;
  time: string;
  paymentMethod: string;
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fff3cd", text: "#856404", label: "รอยืนยัน" },
  confirmed: { bg: "#D2DCB6", text: "#4a5c44", label: "ยืนยันแล้ว" },
  shipped: { bg: "#cce5ff", text: "#004085", label: "จัดส่งแล้ว" },
  delivered: { bg: "#d4edda", text: "#155724", label: "ส่งถึงแล้ว" },
  cancelled: { bg: "#f8d7da", text: "#721c24", label: "ยกเลิก" },
};

const statusOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอยืนยัน" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "shipped", label: "จัดส่งแล้ว" },
  { key: "delivered", label: "ส่งถึงแล้ว" },
];

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const s = statusColors[order.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-xl" style={{ border: "1px solid #D2DCB6" }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 style={{ color: "#4a5c44" }}>{order.orderNumber}</h3>
            <p className="text-xs" style={{ color: "#9ca3af" }}>{order.createdAt} {order.time}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#F1F3E0]">
            <X size={16} />
          </button>
        </div>

        <div className="p-3 rounded-xl mb-4 space-y-1" style={{ backgroundColor: "#F1F3E0" }}>
          <p className="text-sm font-medium" style={{ color: "#4a5c44" }}>{order.customer}</p>
          <p className="text-xs" style={{ color: "#6b7280" }}>📞 {order.phone}</p>
          <p className="text-xs" style={{ color: "#6b7280" }}>📍 {order.address}</p>
          {order.note && <p className="text-xs" style={{ color: "#6b7280" }}>📝 {order.note}</p>}
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span style={{ color: "#4a5c44" }}>{item.name} ({item.size}) x{item.quantity}</span>
              <span style={{ color: "#778873" }}>{item.price * item.quantity} ฿</span>
            </div>
          ))}
        </div>

        <div className="pt-3 space-y-1" style={{ borderTop: "1px solid #E8EED4" }}>
          <div className="flex justify-between text-sm" style={{ color: "#9ca3af" }}>
            <span>ค่าจัดส่ง</span>
            <span>{order.shippingFee} ฿</span>
          </div>
          <div className="flex justify-between font-semibold" style={{ color: "#4a5c44" }}>
            <span>รวม</span>
            <span style={{ color: "#778873" }}>{order.total + order.shippingFee} ฿</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>อัปเดตสถานะในหน้านี้</span>
        </div>
      </div>
    </div>
  );
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "load_failed");
        }
        return res.json() as Promise<{ orders: Order[] }>;
      })
      .then((payload) => {
        if (!active) return;
        setOrders(payload.orders ?? []);
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

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const matchStatus = filter === "all" || o.status === filter;
        const q = search.trim().toLowerCase();
        const matchSearch = !q || o.customer.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q);
        return matchStatus && matchSearch;
      }),
    [orders, filter, search],
  );

  const updateStatus = (id: string, status: Order["status"]) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).then(async (res) => {
      if (!res.ok) {
        setOrders(previous);
      }
    }).catch(() => {
      setOrders(previous);
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ color: "#4a5c44" }}>ออเดอร์ทั้งหมด</h1>
        <p className="text-sm" style={{ color: "#9ca3af" }}>รายการสั่งซื้อทั้งหมด {filtered.length} รายการ</p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[#E8EED4] bg-white p-4 text-sm" style={{ color: "#9ca3af" }}>
          กำลังโหลดออเดอร์...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#f8d7da] bg-[#fef2f2] p-4 text-sm" style={{ color: "#721c24" }}>
          โหลดออเดอร์ไม่สำเร็จ: {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อลูกค้า หรือ เลขออเดอร์..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white border"
            style={{ borderColor: "#D2DCB6" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-2 rounded-xl text-xs border transition-all"
              style={{
                backgroundColor: filter === key ? "#778873" : "white",
                color: filter === key ? "white" : "#6b7280",
                borderColor: filter === key ? "#778873" : "#D2DCB6",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#F1F3E0" }}>
                {["ออเดอร์", "ลูกค้า", "เบอร์โทร", "รายการ", "ราคา", "สถานะ", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
              {filtered.map((order) => {
                const s = statusColors[order.status];
                return (
                  <tr key={order.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#4a5c44" }}>{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#4a5c44" }}>{order.customer}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#6b7280" }}>{order.phone}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>{order.items.length} รายการ</td>
                     <td className="px-4 py-3 text-sm font-medium" style={{ color: "#778873" }}>{order.grandTotal} ฿</td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs px-2 py-1 rounded-lg outline-none border"
                        style={{ backgroundColor: s.bg, color: s.text, borderColor: "transparent" }}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                      >
                        {Object.entries(statusColors).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(order)} className="p-1.5 rounded-lg hover:bg-[#F1F3E0]">
                        <Eye size={15} style={{ color: "#778873" }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "#9ca3af" }}>ไม่พบออเดอร์</div>
        )}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
