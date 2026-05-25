"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

export function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, clearCart, user } = useApp();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<"promptpay" | "transfer" | "cod">("promptpay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = 50;
  const grandTotal = cartTotal + shippingFee;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim() || !name.trim()) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      customerName: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
      paymentMethod: payment,
      subtotal: cartTotal,
      shippingFee,
      total: grandTotal,
      userId: user?.id ?? null,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json().catch(() => ({}))) as { order?: { orderNumber?: string }; error?: string };
      if (!res.ok || !body.order?.orderNumber) {
        throw new Error(body.error ?? "order_create_failed");
      }

      clearCart();
      router.push(`/order-success?orderNumber=${encodeURIComponent(body.order.orderNumber)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "order_create_failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="mb-2" style={{ color: "#4a5c44" }}>ตะกร้าสินค้าว่างเปล่า</h2>
        <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>ยังไม่มีสินค้าในตะกร้า ไปเลือกสินค้ากันเลย!</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: "#778873" }}
        >
          <ShoppingBag size={15} /> เลือกสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm mb-6" style={{ color: "#778873" }}>
        <ArrowLeft size={15} /> เลือกสินค้าต่อ
      </Link>

      <h1 className="mb-6" style={{ color: "#4a5c44" }}>ตะกร้าสินค้า</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-3">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.size}`} className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ border: "1px solid #E8EED4" }}>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.product.bgColor }}>
                <svg width={44} height={44} viewBox="0 0 48 48" fill="none">
                  <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={item.product.sockColor} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#4a5c44" }}>{item.product.name}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>ขนาด: {item.size}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#778873" }}>{item.product.price} ฿</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center border"
                  style={{ borderColor: "#D2DCB6" }}
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm" style={{ color: "#4a5c44" }}>{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center border"
                  style={{ borderColor: "#D2DCB6" }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-sm font-semibold" style={{ color: "#4a5c44" }}>{item.product.price * item.quantity} ฿</p>
                <button
                  onClick={() => removeFromCart(item.product.id, item.size)}
                  className="mt-1 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-80 space-y-4">
          <form onSubmit={handleOrder} className="bg-white rounded-2xl p-5 space-y-4" style={{ border: "1px solid #E8EED4" }}>
            <h3 style={{ color: "#4a5c44" }}>ข้อมูลการจัดส่ง</h3>

            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ชื่อผู้รับ</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                placeholder="ชื่อ-นามสกุล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>เบอร์โทร</label>
              <input
                type="tel"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                placeholder="08X-XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ที่อยู่จัดส่ง</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border resize-none"
                style={{ borderColor: "#D2DCB6" }}
                placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>หมายเหตุ (ไม่บังคับ)</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                placeholder="หมายเหตุเพิ่มเติม"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: "#6b7280" }}>วิธีชำระเงิน</label>
              <div className="space-y-2">
                {([
                  { key: "promptpay", label: "💳 พร้อมเพย์" },
                  { key: "transfer", label: "🏦 โอนธนาคาร" },
                  { key: "cod", label: "💵 เก็บเงินปลายทาง" },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all" style={{ borderColor: payment === key ? "#778873" : "#D2DCB6", backgroundColor: payment === key ? "#F1F3E0" : "transparent" }}>
                    <input type="radio" name="payment" value={key} checked={payment === key} onChange={() => setPayment(key)} className="accent-[#778873]" />
                    <span className="text-sm" style={{ color: "#4a5c44" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid #E8EED4" }}>
              <div className="flex justify-between text-sm" style={{ color: "#6b7280" }}>
                <span>ยอดสินค้า</span>
                <span>{cartTotal} ฿</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: "#6b7280" }}>
                <span>ค่าจัดส่ง</span>
                <span>{shippingFee} ฿</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1" style={{ color: "#4a5c44", borderTop: "1px solid #E8EED4" }}>
                <span>รวมทั้งหมด</span>
                <span style={{ color: "#778873" }}>{grandTotal} ฿</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#778873", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "กำลังบันทึกคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
            </button>

            {error && (
              <p className="text-xs" style={{ color: "#b91c1c" }}>
                ไม่สามารถสร้างคำสั่งซื้อได้: {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
