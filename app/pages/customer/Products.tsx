"use client";

import { useState } from "react";
import type { Product } from "../../data/mockData";
import { ShoppingCart, Search } from "lucide-react";
import { AddToCartModal } from "../../components/AddToCartModal";
import { useProductsFeed } from "../../_hooks/useProductsFeed";

type Category = "all" | "student" | "white" | "black" | "other";

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "student", label: "ถุงเท้านักเรียน" },
  { key: "white", label: "ถุงเท้าขาว" },
  { key: "black", label: "ถุงเท้าดำ" },
  { key: "other", label: "ถุงเท้าลาย" },
];

function SockIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={color} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Products() {
  const { products, loading, error } = useProductsFeed({ endpoint: "/api/products", pollingMs: 60000 });
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="mb-2" style={{ color: "#4a5c44" }}>สินค้าทั้งหมด</h1>
      <p className="text-sm mb-6" style={{ color: "#9ca3af" }}>
        {loading ? "กำลังโหลดสินค้า..." : `พบสินค้า ${filtered.length} รายการ`}
      </p>

      {error && <p className="text-sm mb-4" style={{ color: "#ef4444" }}>{error}</p>}

      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-white border"
          style={{ borderColor: "#D2DCB6" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              backgroundColor: category === key ? "#778873" : "white",
              color: category === key ? "white" : "#6b7280",
              border: `1px solid ${category === key ? "#778873" : "#D2DCB6"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer transition-shadow hover:shadow-md"
            style={{ borderColor: "#E8EED4" }}
          >
            <div className="h-32 flex items-center justify-center relative" style={{ backgroundColor: p.bgColor }}>
              <SockIcon color={p.sockColor} size={64} />
              {p.isNew && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#A1BC98" }}>ใหม่</span>
              )}
              {p.originalPrice && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: "#ef4444" }}>
                  ลด {Math.round((1 - p.price / p.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium leading-tight mb-2" style={{ color: "#4a5c44" }}>{p.name}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold" style={{ color: "#778873" }}>{p.price} ฿</span>
                  {p.originalPrice && (
                    <span className="text-xs line-through ml-1" style={{ color: "#9ca3af" }}>{p.originalPrice}</span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                  className="p-1.5 rounded-full hover:opacity-80"
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

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🧦</p>
          <p className="text-sm" style={{ color: "#9ca3af" }}>ไม่พบสินค้าที่ค้นหา</p>
        </div>
      )}

      {selected && <AddToCartModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
