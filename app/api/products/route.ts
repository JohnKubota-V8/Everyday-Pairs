import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { mapProductRowToProduct, type ProductRow } from "../../_lib/products";

export const runtime = "nodejs";

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_config_missing" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, original_price, category, description, material, is_new, is_featured, bg_color, sock_color, stock, sizes")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "products_fetch_failed", message: error.message }, { status: 500 });
  }

  const products = (data ?? []).map((row) => mapProductRowToProduct(row as ProductRow));
  return NextResponse.json({ products });
}
