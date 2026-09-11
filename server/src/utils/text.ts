/**
 * Bengali has a handful of nukta letters (RRA, RHA, YYA) that can be typed either as a
 * single precomposed codepoint or as the base letter + combining nukta (U+09BC).
 * Both render identically but are NOT canonically equivalent per Unicode, so
 * standard NFC/NFD normalization does not unify them. Different input methods
 * (browsers, editors, shells) disagree on which form they produce, which silently
 * breaks exact-match taxonomy lookups. Normalize explicitly to the precomposed form.
 */
export function normalizeBengaliText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/ড়/g, "ড়") // DA + NUKTA -> RRA (ড়)
    .replace(/ঢ়/g, "ঢ়") // DDHA + NUKTA -> RHA (ঢ়)
    .replace(/য়/g, "য়") // YA + NUKTA -> YYA (য়)
    .trim();
}

/**
 * Recursively applies normalizeBengaliText to every string value in a JSON-like
 * structure (objects, arrays, nested combinations). Used to sanitize LLM output
 * before persisting it, so downstream exact/substring matching stays reliable.
 */
export function normalizeDeep<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeBengaliText(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = normalizeDeep(val);
    }
    return result as T;
  }
  return value;
}
