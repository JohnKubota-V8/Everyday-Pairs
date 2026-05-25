import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

import { products } from "../app/data/mockData";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const toSlug = (category: string, id: string) => `${category}-${id}`.toLowerCase();

  const rows = products.map((product) => ({
    slug: toSlug(product.category, product.id),
    name: product.name,
    price: product.price,
    original_price: product.originalPrice ?? null,
    category: product.category,
    description: product.description,
    material: product.material,
    is_new: product.isNew,
    is_featured: product.isFeatured,
    bg_color: product.bgColor,
    sock_color: product.sockColor,
    stock: product.stock,
    sizes: product.sizes,
  }));

  const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
  if (error) throw error;

  console.log(`Seeded ${rows.length} products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
