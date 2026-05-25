export function getApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");
  return apiKey;
}

export function getGeminiEndpoint(): { baseUrl: string; apiVersion: string } {
  const baseUrl = process.env.GEMINI_API_BASE_URL;
  const apiVersion = process.env.GEMINI_API_VERSION;

  // Always require explicit endpoint/version to avoid silently hitting defaults.
  if (!baseUrl) throw new Error("Missing GEMINI_API_BASE_URL");
  if (!apiVersion) throw new Error("Missing GEMINI_API_VERSION");

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiVersion: apiVersion.replace(/^\//, ""),
  };
}

export function getModelCandidates(): string[] {
  const raw = process.env.GEMINI_MODELS;

  if (!raw || !raw.trim()) throw new Error("Missing GEMINI_MODELS");

  const parsed = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parsed.length) throw new Error("GEMINI_MODELS is empty");
  return parsed;
}

export function stripCodeFences(text: string): string {
  let t = text.trim();
  if (!t.includes("```")) return t;
  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Common: Gemini wraps JSON in ```json
  t = t.replace(/^```json\n/, "");
  if (t.startsWith("```")) {
    const idx = t.indexOf("\n");
    t = idx === -1 ? "" : t.slice(idx + 1);
  }
  if (t.endsWith("```")) t = t.slice(0, -3);
  return t.trim();
}

export function isRateLimitOrQuota(status: number, message: string): boolean {
  const m = message.toUpperCase();
  return (
    status === 429 ||
    status === 503 ||
    m.includes("RESOURCE_EXHAUSTED") ||
    m.includes("QUOTA") ||
    m.includes("RATE LIMIT") ||
    m.includes("HIGH DEMAND") ||
    m.includes("UNAVAILABLE")
  );
}

export async function generateWithGemini(apiKey: string, model: string, contents: unknown) {
  const { baseUrl, apiVersion } = getGeminiEndpoint();
  const url = `${baseUrl}/${apiVersion}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (() => {
      if (typeof json === "string") return json;
      if (!json || typeof json !== "object") return "Gemini request failed";
      const j = json as Record<string, unknown>;
      const err = j.error;
      if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") return e.message;
      }
      if (typeof j.message === "string") return j.message;
      return "Gemini request failed";
    })();
    const err = new Error(message);
    (err as unknown as { status?: number }).status = res.status;
    throw err;
  }

  const text = (() => {
    if (!json || typeof json !== "object") return "";
    const j = json as Record<string, unknown>;
    const candidates = j.candidates;
    if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") {
      return typeof j.text === "string" ? j.text : "";
    }
    const c0 = candidates[0] as Record<string, unknown>;
    const content = c0.content;
    if (!content || typeof content !== "object") return "";
    const parts = (content as Record<string, unknown>).parts;
    if (!Array.isArray(parts)) return "";
    const joined = parts
      .map((p) => (p && typeof p === "object" ? (p as Record<string, unknown>).text : undefined))
      .filter((t): t is string => typeof t === "string")
      .join("");
    return joined;
  })();
  if (!text || typeof text !== "string") throw new Error("Gemini returned an empty response");
  return text as string;
}
