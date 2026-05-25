"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Product } from "../data/mockData";

function SockIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z"
        fill={color}
        stroke="#ccc"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AddToCartModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart } = useApp();
  const [size, setSize] = useState(product.sizes[0]);

  const handleAdd = () => {
    addToCart(product, size);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
        style={{ border: "1px solid #D2DCB6" }}
      >
        <div className="h-32 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: product.bgColor }}>
          <SockIcon color={product.sockColor} size={72} />
        </div>
        <h3 className="mb-1" style={{ color: "#4a5c44" }}>
          {product.name}
        </h3>
        <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>
          {product.material}
        </p>
        <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
          {product.description}
        </p>

        <div className="mb-4">
          <p className="text-sm mb-2" style={{ color: "#4a5c44" }}>
            เลือกขนาด
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={{
                  borderColor: size === s ? "#778873" : "#D2DCB6",
                  backgroundColor: size === s ? "#778873" : "transparent",
                  color: size === s ? "white" : "#6b7280",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-semibold" style={{ color: "#778873" }}>
              {product.price} ฿
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through ml-2" style={{ color: "#9ca3af" }}>
                {product.originalPrice} ฿
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: "#A1BC98" }}>
            คงเหลือ {product.stock} คู่
          </span>
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#778873" }}
        >
          <ShoppingCart size={16} /> เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}
