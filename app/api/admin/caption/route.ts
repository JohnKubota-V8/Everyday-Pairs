import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

import {
  generateWithGemini,
  getApiKey,
  getModelCandidates,
  isRateLimitOrQuota,
  stripCodeFences,
} from "../../_lib/gemini";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false as const, status: 401 as const };

  const { data: adminRow, error: adminErr } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr || !adminRow) return { ok: false as const, status: 403 as const };
  return { ok: true as const };
}

function ensurePriceInCaptionOutput(text: string, price: string): string {
  const p = String(price ?? "").trim();
  if (!p) return text;
  const digits = (p.match(/\d+(?:\.\d+)?/) ?? [])[0] ?? "";
  const priceToken = /^\d+(?:\.\d+)?$/.test(p) ? `${p} บาท` : p;

  const lines = text.split("\n").map((l) => l.trimEnd());
  if (lines.length !== 3) return text;

  const hasPrice = (line: string) => line.includes(priceToken) || (!!digits && line.includes(digits));

  const updated = lines.map((line) => {
    let out = line.trim();
    if (!out) out = "";
    if (!hasPrice(out)) out = `${out} ${priceToken}`.trim();
    return out;
  });

  return updated.join("\n");
}

function buildCaptionPrompt(menuName: string, price: string): string {
  // Concept from backend/caption.py, but tuned for Everyday-Pairs.
  return [
    "You write Instagram captions for Everyday-Pairs, a cozy Thai online sock shop known for cute, quality socks at friendly prices.",
    "Always output EXACTLY 3 labeled lines in this order. No preamble. No extra lines.",
    "Each caption should be 2–3 sentences long.",
    "CUTE 🧦 — warm, conversational Thai like a friend texting; ใจดี ชวนซื้อ น่ารักนิดๆ; include price + 1–2 emojis",
    "MINIMAL ✦ — clean, punchy; Thai or English; confident, no fluff; include price + 1 emoji",
    "GEN-Z 💀 — ภาษาไทยสไตล์ Twitter/TikTok; เฉยๆ เท่ๆ ตลกนิดหน่อย ไม่ดูพยายาม; slang/abbreviations welcome; include price",
    `Product: ${menuName}`,
    `Price: ${price}`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: auth.status });

  const body = (await request.json().catch(() => null)) as null | {
    menuName?: unknown;
    price?: unknown;
  };

  const menuName = typeof body?.menuName === "string" ? body.menuName.trim() : "";
  const price = typeof body?.price === "string" ? body.price.trim() : typeof body?.price === "number" ? String(body.price) : "";
  if (!menuName) return NextResponse.json({ error: "missing_menuName" }, { status: 400 });

  const prompt = buildCaptionPrompt(menuName, price);
  const contents = [{ role: "user", parts: [{ text: prompt }] }];

  const apiKey = getApiKey();
  let lastRateLimitErr: unknown = null;
  for (const model of getModelCandidates()) {
    try {
      const raw = await generateWithGemini(apiKey, model, contents);
      const ensured = ensurePriceInCaptionOutput(stripCodeFences(raw), price);
      return NextResponse.json({ text: ensured, model });
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
