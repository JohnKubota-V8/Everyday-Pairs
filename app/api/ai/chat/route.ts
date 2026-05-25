import { NextResponse, type NextRequest } from "next/server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  generateWithGemini,
  getApiKey,
  getModelCandidates,
  isRateLimitOrQuota,
  stripCodeFences,
} from "../../_lib/gemini";

export const runtime = "nodejs";

let cachedKnowledge: string | null = null;
let cachedKnowledgeAt = 0;
const KNOWLEDGE_CACHE_TTL_MS = 60_000;

type Mode = "customer" | "admin";
type HistoryItem = { role: "user" | "bot"; text: string };
type ProductRow = {
  name: string;
  price: number | string;
  category: string;
  stock: number | null;
  is_new: boolean;
  is_featured: boolean;
  sizes: string[] | null;
};

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function summarizeProducts(products: ProductRow[]): string {
  if (!products.length) return "ยังไม่มีข้อมูลสินค้าใน Supabase";

  const categoryCounts = new Map<string, number>();
  let featuredCount = 0;
  let newCount = 0;

  for (const product of products) {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
    if (product.is_featured) featuredCount += 1;
    if (product.is_new) newCount += 1;
  }

  const lines = [
    "ข้อมูลสินค้าใน Supabase:",
    `- สินค้าทั้งหมด ${products.length} รายการ`,
    `- หมวดสินค้า ${categoryCounts.size} หมวด: ${[...categoryCounts.keys()].join(", ")}`,
    `- สินค้าใหม่ ${newCount} รายการ`,
    `- สินค้าแนะนำ ${featuredCount} รายการ`,
    "รายการสินค้า:",
    ...products.slice(0, 20).map((product) => {
      const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes.join(", ") : "-";
      return `- ${product.name} | ราคา ${product.price} บาท | stock ${product.stock ?? 0} | หมวด ${product.category} | sizes ${sizes}`;
    }),
  ];

  return lines.join("\n");
}

async function getCatalogSummary(): Promise<string> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return "";

  const { data, error } = await supabase
    .from("products")
    .select("name, price, category, stock, is_new, is_featured, sizes")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) return "";
  return summarizeProducts(data as ProductRow[]);
}

async function getKnowledgeText(): Promise<string> {
  const now = Date.now();
  if (cachedKnowledge != null && now - cachedKnowledgeAt < KNOWLEDGE_CACHE_TTL_MS) {
    return cachedKnowledge;
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    cachedKnowledge = "";
    cachedKnowledgeAt = now;
    return cachedKnowledge;
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "customer_knowledge")
    .maybeSingle();

  if (error || !data) {
    cachedKnowledge = "";
    cachedKnowledgeAt = now;
    return cachedKnowledge;
  }

  cachedKnowledge = typeof data.value === "string" ? data.value : "";
  cachedKnowledgeAt = now;
  return cachedKnowledge;
}

function buildSystemInstruction(mode: Mode, catalogSummary: string): string {
  const catalogBlock = catalogSummary ? `\n\n${catalogSummary}` : "";

  if (mode === "admin") {
    return (
      "คุณคือ John ผู้ช่วย AI ของร้าน Everyday-Pairs\n" +
      "หน้าที่ของนักศึกษาคือแปลงคำสั่งภาษาไทยเป็น JSON action\n" +
      "ตอบกลับเป็น JSON เท่านั้น ในรูปแบบ:\n" +
      '{"action": "log_sale", "args": {"menu": "...", "quantity": N, "price": N}}\n' +
      "ถ้าคำสั่งไม่ใช่การบันทึกยอดขาย ตอบ: {\"action\": \"unknown\", \"args\": {}}" +
      catalogBlock
    );
  }

  const knowledge = "__KNOWLEDGE__";
  return (
    "คุณคือ John ผู้ช่วย AI ของร้าน Everyday-Pairs\n" +
    "ตอบเป็นภาษาไทย สุภาพ กระชับ และอ้างอิงจากข้อมูลร้านด้านล่างเท่านั้น\n" +
    "ถ้าไม่พบข้อมูล ให้บอกว่าไม่ทราบ และแนะนำให้ลูกค้าถามในรูปแบบอื่น อย่าแต่งข้อมูลเอง\n\n" +
    `ข้อมูลร้าน:\n${knowledge}` +
    catalogBlock
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as null | {
    message?: unknown;
    mode?: unknown;
    history?: unknown;
  };

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const mode = (body?.mode === "admin" ? "admin" : "customer") as Mode;
  const history = Array.isArray(body?.history) ? (body?.history as HistoryItem[]) : [];

  if (!message) return NextResponse.json({ error: "missing_message" }, { status: 400 });

  const apiKey = getApiKey();
  const catalogSummary = await getCatalogSummary();
  const knowledge = mode === "customer" ? await getKnowledgeText() : "";
  const systemInstruction = buildSystemInstruction(mode, catalogSummary).replace("__KNOWLEDGE__", knowledge);
  const trimmedHistory = history.slice(-12).map((m) => ({
    role: m?.role === "user" ? "user" : "model",
    parts: [{ text: String(m?.text ?? "") }],
  }));

  // We pass system instruction as the first turn to keep behavior consistent across models.
  const contents = [
    { role: "user", parts: [{ text: systemInstruction }] },
    ...trimmedHistory,
    { role: "user", parts: [{ text: message }] },
  ];

  let lastRateLimitErr: unknown = null;
  for (const model of getModelCandidates()) {
    try {
      const raw = await generateWithGemini(apiKey, model, contents);
      return NextResponse.json({ text: stripCodeFences(raw), model });
    } catch (e: unknown) {
      const status = typeof (e as { status?: unknown } | null)?.status === "number" ? (e as { status: number }).status : 0;
      const msg = String((e as { message?: unknown } | null)?.message ?? e);
      if (isRateLimitOrQuota(status, msg)) {
        lastRateLimitErr = e;
        continue;
      }
      return NextResponse.json({ error: "gemini_error", message: msg }, { status: 500 });
    }
  }

  return NextResponse.json(
    {
      error: "rate_limited",
      message:
        "All configured Gemini models are rate-limited or have no quota right now." +
        (lastRateLimitErr ? ` (${String((lastRateLimitErr as Error).message ?? lastRateLimitErr)})` : ""),
    },
    { status: 503 }
  );
}
