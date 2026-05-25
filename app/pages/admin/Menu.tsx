"use client";

import { useState } from "react";
import { products as initialProducts, Product } from "../../data/mockData";
import { Plus, Pencil, Trash2, X, Check, LayoutGrid, List, Sparkles, Copy } from "lucide-react";
import { useProductsFeed } from "../../_hooks/useProductsFeed";

const categoryLabels: Record<string, string> = {
  student: "ถุงเท้านักเรียน",
  white: "ถุงเท้าขาว",
  black: "ถุงเท้าดำ",
  other: "ถุงเท้าลาย",
};

function SockBadge({ color }: { color: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F1F3E0" }}>
      <svg width={28} height={28} viewBox="0 0 48 48" fill="none">
        <path d="M18 6 L18 28 C18 36 26 42 32 38 L38 34 C42 30 40 24 36 26 L30 29 L30 6 Z" fill={color} stroke="#ccc" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ProductFormModal({
  product,
  onSave,
  onClose,
}: {
  product: Partial<Product>;
  onSave: (p: Product) => Promise<void> | void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    category: "student",
    description: "",
    material: "Cotton 100%",
    isNew: false,
    isFeatured: false,
    sockColor: "#f5f5f5",
    bgColor: "#F1F3E0",
    stock: 100,
    sizes: ["S", "M", "L"],
    ...product,
  });

  const handleSave = () => {
    if (!form.name || !form.price) return;
    void onSave({
      id: product.id || "",
      name: form.name!,
      price: form.price!,
      category: form.category as Product["category"],
      description: form.description || "",
      material: form.material || "Cotton 100%",
      isNew: form.isNew || false,
      isFeatured: form.isFeatured || false,
      sockColor: form.sockColor || "#f5f5f5",
      bgColor: form.bgColor || "#F1F3E0",
      stock: form.stock || 0,
      sizes: form.sizes || ["M"],
      originalPrice: form.originalPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-4 w-full max-w-sm shadow-xl overflow-y-auto max-h-[90vh]" style={{ border: "1px solid #D2DCB6" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ color: "#4a5c44" }}>{product.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ชื่อสินค้า</label>
            <input
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
              style={{ borderColor: "#D2DCB6" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ราคา (฿)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: +e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ราคาเดิม (ถ้ามี)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.originalPrice || ""}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? +e.target.value : undefined })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>หมวดหมู่</label>
            <select
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border bg-white"
              style={{ borderColor: "#D2DCB6" }}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
            >
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>คำอธิบาย</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg text-sm outline-none border resize-none"
              style={{ borderColor: "#D2DCB6" }}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>วัสดุ</label>
              <input
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>สต็อก (คู่)</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                style={{ borderColor: "#D2DCB6" }}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: +e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>สีพื้นหลัง</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-10 rounded-lg border bg-white p-1"
                  style={{ borderColor: "#D2DCB6" }}
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                />
                <input
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border uppercase"
                  style={{ borderColor: "#D2DCB6" }}
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>สีถุงเท้า</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-9 w-10 rounded-lg border bg-white p-1"
                  style={{ borderColor: "#D2DCB6" }}
                  value={form.sockColor}
                  onChange={(e) => setForm({ ...form, sockColor: e.target.value })}
                />
                <input
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border uppercase"
                  style={{ borderColor: "#D2DCB6" }}
                  value={form.sockColor}
                  onChange={(e) => setForm({ ...form, sockColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#4a5c44" }}>
              <input type="checkbox" className="accent-[#778873]" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
              สินค้าใหม่
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#4a5c44" }}>
              <input type="checkbox" className="accent-[#778873]" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              สินค้าแนะนำ
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-4 py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#778873" }}
        >
          <Check size={16} /> บันทึก
        </button>
      </div>
    </div>
  );
}

export function Menu() {
  const [modalProduct, setModalProduct] = useState<Partial<Product> | null>(null);

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [captionOpen, setCaptionOpen] = useState(false);
  const [captionMenuName, setCaptionMenuName] = useState("");
  const [captionPrice, setCaptionPrice] = useState<string>("");
  const [captionResult, setCaptionResult] = useState<string>("");
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionError, setCaptionError] = useState<string | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { products: items, loading: itemsLoading, error: itemsError, refresh: refreshItems } = useProductsFeed({
    endpoint: "/api/admin/products",
    fallbackProducts: initialProducts,
    pollingMs: 30000,
  });

  const handleSave = async (p: Product) => {
    const exists = p.id ? items.some((i) => i.id === p.id) : false;
    const method = exists ? "PATCH" : "POST";
    try {
      setMutationError(null);
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const json = (await res.json().catch(() => null)) as null | { product?: Product; message?: string };
      if (!res.ok) throw new Error(json?.message || "บันทึกสินค้าไม่สำเร็จ");
      const saved = json?.product;
      if (!saved) throw new Error("บันทึกสินค้าไม่สำเร็จ");

      setModalProduct(null);
      await refreshItems(true);
    } catch (error) {
      setMutationError(String((error as { message?: unknown } | null)?.message ?? error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันลบสินค้านี้?")) return;
    try {
      setMutationError(null);
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบสินค้าไม่สำเร็จ");
      await refreshItems(true);
    } catch (error) {
      setMutationError(String((error as { message?: unknown } | null)?.message ?? error));
    }
  };

  const openCaptionForProduct = (p: Product) => {
    setCaptionMenuName(p.name);
    setCaptionPrice(String(p.price ?? ""));
    setCaptionResult("");
    setCaptionError(null);
    setCaptionCopied(false);
    setCaptionOpen(true);
  };

  const closeCaption = () => {
    setCaptionOpen(false);
    setCaptionLoading(false);
    setCaptionError(null);
    setCaptionCopied(false);
  };

  const generateCaption = async () => {
    if (captionLoading) return;
    const menuName = captionMenuName.trim();
    const price = captionPrice.trim();
    if (!menuName) {
      setCaptionError("กรอกชื่อสินค้า/เมนูก่อน");
      return;
    }

    setCaptionLoading(true);
    setCaptionError(null);
    setCaptionCopied(false);
    try {
      const res = await fetch("/api/admin/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuName, price }),
      });
      const json = (await res.json().catch(() => null)) as null | { text?: unknown; message?: unknown };
      if (!res.ok) {
        const msg = typeof json?.message === "string" ? json.message : "สร้างแคปชันไม่สำเร็จ";
        throw new Error(msg);
      }
      const text = typeof json?.text === "string" ? json.text : "";
      setCaptionResult(text);
    } catch (e: unknown) {
      setCaptionError(String((e as { message?: unknown } | null)?.message ?? e));
    } finally {
      setCaptionLoading(false);
    }
  };

  const copyCaption = async () => {
    const text = captionResult.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 style={{ color: "#4a5c44" }}>จัดการสินค้า</h1>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            {itemsLoading ? "กำลังโหลดสินค้า..." : `ทั้งหมด ${items.length} รายการ`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode((v) => (v === "table" ? "cards" : "table"))}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: "#F1F3E0", color: "#4a5c44", border: "1px solid #E8EED4" }}
            title={viewMode === "table" ? "สลับเป็นแบบการ์ด" : "สลับเป็นแบบตาราง"}
          >
            {viewMode === "table" ? <LayoutGrid size={16} /> : <List size={16} />}
            {viewMode === "table" ? "แบบการ์ด" : "แบบตาราง"}
          </button>

          <button
            onClick={() => setModalProduct({})}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#778873" }}
          >
            <Plus size={15} /> เพิ่มสินค้า
          </button>
        </div>
      </div>

      {(itemsError || mutationError) && (
        <p className="text-sm" style={{ color: "#b91c1c" }}>{mutationError || itemsError}</p>
      )}

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #E8EED4" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#F1F3E0" }}>
                  {["สินค้า", "หมวดหมู่", "ราคา", "สต็อก", "สถานะ", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-medium" style={{ color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#E8EED4" }}>
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fafafa]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <SockBadge color={p.sockColor} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#4a5c44" }}>{p.name}</p>
                          <p className="text-xs" style={{ color: "#9ca3af" }}>{p.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm" style={{ color: "#6b7280" }}>{categoryLabels[p.category]}</td>
                    <td className="px-3 py-2.5 text-sm font-medium" style={{ color: "#778873" }}>{p.price} ฿</td>
                    <td className="px-3 py-2.5 text-sm" style={{ color: p.stock < 50 ? "#ef4444" : "#4a5c44" }}>
                      {p.stock} คู่ {p.stock < 50 && <span className="text-xs">⚠️</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        {p.isNew && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>ใหม่</span>
                        )}
                        {p.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#F1F3E0", color: "#778873" }}>แนะนำ</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openCaptionForProduct(p)}
                          className="p-1.5 rounded-lg hover:bg-[#F1F3E0]"
                          title="สร้างแคปชัน"
                        >
                          <Sparkles size={14} style={{ color: "#778873" }} />
                        </button>
                        <button onClick={() => setModalProduct(p)} className="p-1.5 rounded-lg hover:bg-[#F1F3E0]" title="แก้ไข">
                          <Pencil size={14} style={{ color: "#778873" }} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="ลบ">
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4" style={{ border: "1px solid #E8EED4" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <SockBadge color={p.sockColor} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#4a5c44" }}>{p.name}</p>
                    <p className="text-xs truncate" style={{ color: "#9ca3af" }}>{categoryLabels[p.category]} · {p.material}</p>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openCaptionForProduct(p)}
                    className="p-1.5 rounded-lg hover:bg-[#F1F3E0]"
                    title="สร้างแคปชัน"
                  >
                    <Sparkles size={15} style={{ color: "#778873" }} />
                  </button>
                  <button onClick={() => setModalProduct(p)} className="p-1.5 rounded-lg hover:bg-[#F1F3E0]" title="แก้ไข">
                    <Pencil size={15} style={{ color: "#778873" }} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="ลบ">
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>ราคา</p>
                  <p className="text-sm font-semibold" style={{ color: "#778873" }}>{p.price} ฿</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#9ca3af" }}>สต็อก</p>
                  <p className="text-sm" style={{ color: p.stock < 50 ? "#ef4444" : "#4a5c44" }}>
                    {p.stock} คู่ {p.stock < 50 && <span className="text-xs">⚠️</span>}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                {p.isNew && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#D2DCB6", color: "#4a5c44" }}>ใหม่</span>
                )}
                {p.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#F1F3E0", color: "#778873" }}>แนะนำ</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalProduct !== null && (
        <ProductFormModal product={modalProduct} onSave={handleSave} onClose={() => setModalProduct(null)} />
      )}

      {captionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeCaption} />
          <div className="relative bg-white rounded-2xl p-4 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]" style={{ border: "1px solid #D2DCB6" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 style={{ color: "#4a5c44" }}>Caption Generator</h3>
                <p className="text-xs" style={{ color: "#9ca3af" }}>สร้าง 3 สไตล์ (Cute/Minimal/Gen-Z) สำหรับโพสต์</p>
              </div>
              <button onClick={closeCaption} title="ปิด"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ชื่อสินค้า/เมนู</label>
                <input
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                  style={{ borderColor: "#D2DCB6" }}
                  value={captionMenuName}
                  onChange={(e) => setCaptionMenuName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ราคา</label>
                <input
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                  style={{ borderColor: "#D2DCB6" }}
                  value={captionPrice}
                  onChange={(e) => setCaptionPrice(e.target.value)}
                  placeholder="เช่น 65 หรือ 65 บาท"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateCaption}
                  disabled={captionLoading}
                  className="flex-1 py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: captionLoading ? "#A1BC98" : "#778873" }}
                >
                  <Sparkles size={16} /> {captionLoading ? "กำลังสร้าง..." : "Generate"}
                </button>
                <button
                  onClick={copyCaption}
                  disabled={!captionResult.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "#F1F3E0", color: "#4a5c44", border: "1px solid #E8EED4" }}
                  title="คัดลอกทั้งหมด"
                >
                  <Copy size={16} /> {captionCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {captionError && (
                <p className="text-xs" style={{ color: "#b91c1c" }}>{captionError}</p>
              )}

              <div>
                <label className="block text-xs mb-1" style={{ color: "#6b7280" }}>ผลลัพธ์</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border resize-y whitespace-pre-wrap"
                  style={{ borderColor: "#D2DCB6" }}
                  rows={6}
                  value={captionResult}
                  onChange={(e) => setCaptionResult(e.target.value)}
                  placeholder="กด Generate เพื่อสร้างแคปชัน..."
                />
                <p className="mt-2 text-xs" style={{ color: "#9ca3af" }}>ระบบจะพยายามบังคับให้มี “ราคา + อีโมจิ” ทุกบรรทัด</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
