import type { Product } from "../data/mockData";

type ProductCategory = Product["category"];

export type ProductRow = {
  id: string;
  slug?: string | null;
  name: string;
  price: number | string;
  original_price: number | string | null;
  category: string;
  description: string | null;
  material: string | null;
  is_new: boolean | null;
  is_featured: boolean | null;
  bg_color?: string | null;
  sock_color?: string | null;
  stock: number | null;
  sizes: string[] | null;
};

const categoryColors: Record<ProductCategory, { bgColor: string; sockColor: string }> = {
  student: { bgColor: "#EEF0DC", sockColor: "#f5f5f5" },
  white: { bgColor: "#F1F3E0", sockColor: "#ffffff" },
  black: { bgColor: "#f5f5f5", sockColor: "#212121" },
  other: { bgColor: "#fce4ec", sockColor: "#f06292" },
};

function normalizeCategory(raw: string): ProductCategory {
  if (raw === "student" || raw === "white" || raw === "black" || raw === "other") return raw;
  return "other";
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function mapProductRowToProduct(row: ProductRow): Product {
  const category = normalizeCategory(row.category);
  const colors = categoryColors[category];
  const originalPrice = row.original_price == null ? undefined : toNumber(row.original_price);
  const bgColor = row.bg_color ?? colors.bgColor;
  const sockColor = row.sock_color ?? colors.sockColor;

  return {
    id: row.id,
    name: row.name,
    price: toNumber(row.price),
    originalPrice,
    category,
    description: row.description ?? "",
    material: row.material ?? "",
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    bgColor,
    sockColor,
    stock: row.stock ?? 0,
    sizes: Array.isArray(row.sizes) && row.sizes.length ? row.sizes : ["Free Size"],
  };
}
