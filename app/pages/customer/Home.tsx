"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { ShoppingCart, Star, Sparkles, ChevronRight } from "lucide-react";
import { AddToCartModal } from "../../components/AddToCartModal";
import { useProductsFeed } from "../../_hooks/useProductsFeed";

function SockIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={color} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Home() {
  const { addToCart } = useApp();
  const [selected, setSelected] = useState<Product | null>(null);
  const { products, loading, error } = useProductsFeed({ endpoint: "/api/products", pollingMs: 60000 });

  const featured = products.filter((p) => p.isFeatured);
  const newItems = products.filter((p) => p.isNew);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="rounded-3xl overflow-hidden mb-10 flex flex-col md:flex-row items-center gap-6 px-8 py-10" style={{ backgroundColor: "#D2DCB6" }}>
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs mb-3" style={{ backgroundColor: "#A1BC98", color: "white" }}>
            ร้านถุงเท้าออนไลน์
          </span>
          <h1 className="mb-3" style={{ color: "#3a4a35" }}>
            ถุงเท้าคุณภาพดี<br />ราคาเข้าถึงได้
          </h1>
          <p className="text-sm mb-5" style={{ color: "#5a6b55" }}>
            เลือกสรรถุงเท้าหลากหลายสไตล์ ตั้งแต่ถุงเท้านักเรียนไปจนถึงถุงเท้าลายน่ารัก<br />
            เปิดให้บริการทุกวัน 09:00 – 18:00 น.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#778873" }}>
            ดูสินค้าทั้งหมด <ChevronRight size={16} />
          </Link>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {["#f5f5f5", "#212121", "#f06292", "#3949ab"].map((c, i) => (
            <div key={i} className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: "rgba(255,255,255,0.5)" }}>
              <SockIcon color={c} size={52} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: "#778873" }} />
            <h2 style={{ color: "#4a5c44" }}>สินค้าใหม่</h2>
          </div>
          <Link href="/products" className="text-sm flex items-center gap-1" style={{ color: "#778873" }}>
            ดูทั้งหมด <ChevronRight size={14} />
          </Link>
        </div>

         {loading && <p className="text-sm" style={{ color: "#9ca3af" }}>กำลังโหลดสินค้า...</p>}
         {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
         {!loading && !error && (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
           {newItems.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border transition-shadow hover:shadow-md cursor-pointer"
              style={{ borderColor: "#E8EED4" }}
            >
              <div className="h-28 flex items-center justify-center" style={{ backgroundColor: p.bgColor }}>
                <SockIcon color={p.sockColor} size={56} />
              </div>
              <div className="p-3">
                <span className="inline-block px-2 py-0.5 rounded-full text-xs mb-1" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>ใหม่</span>
                <p className="text-sm font-medium leading-tight mb-1" style={{ color: "#4a5c44" }}>{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: "#778873" }}>{p.price} ฿</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.sizes.length > 1) setSelected(p);
                      else addToCart(p, p.sizes[0]);
                    }}
                    className="p-1.5 rounded-full transition-colors hover:opacity-80"
                    style={{ backgroundColor: "#F1F3E0" }}
                  >
                    <ShoppingCart size={14} style={{ color: "#778873" }} />
                  </button>
                </div>
              </div>
            </div>
           ))}
        </div>
        )}
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star size={18} style={{ color: "#778873" }} />
            <h2 style={{ color: "#4a5c44" }}>สินค้าแนะนำ</h2>
          </div>
          <Link href="/products" className="text-sm flex items-center gap-1" style={{ color: "#778873" }}>
            ดูทั้งหมด <ChevronRight size={14} />
          </Link>
        </div>

        {loading && <p className="text-sm" style={{ color: "#9ca3af" }}>กำลังโหลดสินค้า...</p>}
        {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
        {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col transition-shadow hover:shadow-md cursor-pointer"
              style={{ borderColor: "#E8EED4" }}
            >
              <div className="h-36 flex items-center justify-center relative" style={{ backgroundColor: p.bgColor }}>
                <SockIcon color={p.sockColor} size={72} />
                {p.isNew && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#A1BC98" }}>ใหม่</span>
                )}
                {p.originalPrice && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#ef4444" }}>
                    ลด {Math.round((1 - p.price / p.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm font-medium mb-1" style={{ color: "#4a5c44" }}>{p.name}</p>
                <p className="text-xs mb-3 flex-1" style={{ color: "#9ca3af" }}>{p.description.slice(0, 55)}...</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold" style={{ color: "#778873" }}>{p.price} ฿</span>
                    {p.originalPrice && (
                      <span className="text-xs line-through ml-1" style={{ color: "#9ca3af" }}>{p.originalPrice} ฿</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.sizes.length > 1) setSelected(p);
                      else addToCart(p, p.sizes[0]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#778873" }}
                  >
                    <ShoppingCart size={12} /> เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: "🚚", title: "จัดส่งทั่วประเทศ", desc: "Kerry & J&T ส่งด่วน" },
          { icon: "💳", title: "ชำระได้หลายช่องทาง", desc: "พร้อมเพย์ / โอน / COD" },
          { icon: "✅", title: "คุณภาพมาตรฐาน", desc: "Cotton 100% ทนทาน" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ border: "1px solid #E8EED4" }}>
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-sm font-medium" style={{ color: "#4a5c44" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {selected && <AddToCartModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
