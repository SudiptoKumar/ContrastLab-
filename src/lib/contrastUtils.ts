import chroma from "chroma-js";

export function normalizeHex(hex: string): string {
  try {
    return chroma(hex).hex().toUpperCase();
  } catch {
    return "#000000";
  }
}

export function isValidHex(hex: string): boolean {
  try {
    chroma(hex);
    return true;
  } catch {
    return false;
  }
}

export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    return chroma.contrast(hex1, hex2);
  } catch {
    return 1;
  }
}

export type WcagGrade = "AAA" | "AA" | "AA Large" | "Fail";

export function getWcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

/** Generate exactly N shades from darkest to lightest, anchored on the input hue. */
export function generateShades(hex: string, count = 10): string[] {
  const base = chroma(hex);
  const [h, s] = base.hsl();
  const safeH = isNaN(h) ? 0 : h;
  const safeS = isNaN(s) ? 0 : Math.min(s, 0.85);

  // Build endpoints in HSL: very dark -> very light, preserving hue
  const dark = chroma.hsl(safeH, safeS * 0.9, 0.06);
  const mid = chroma.hsl(safeH, safeS, 0.5);
  const light = chroma.hsl(safeH, safeS * 0.6, 0.96);

  const scale = chroma.scale([dark, mid, light]).mode("oklch").colors(count);
  return scale.map((c) => chroma(c).hex().toUpperCase());
}

/** Suggest N background colors that have ≥ minRatio against the given text. */
export function suggestBackgrounds(
  textHex: string,
  count = 10,
  minRatio = 4.5,
): { hex: string; ratio: number }[] {
  return suggestAgainst(textHex, count, minRatio);
}

/** Suggest N text colors that have ≥ minRatio against the given background. */
export function suggestTextColors(
  bgHex: string,
  count = 10,
  minRatio = 4.5,
): { hex: string; ratio: number }[] {
  const list = suggestAgainst(bgHex, count - 2, minRatio);
  // Try to ensure black/white inclusion
  const ensure = ["#000000", "#FFFFFF"]
    .map((h) => ({ hex: h, ratio: getContrastRatio(h, bgHex) }))
    .filter((c) => c.ratio >= minRatio && !list.find((x) => x.hex === c.hex));
  return [...ensure, ...list].slice(0, count);
}

function suggestAgainst(
  anchorHex: string,
  count: number,
  minRatio: number,
): { hex: string; ratio: number }[] {
  const candidates: { hex: string; ratio: number }[] = [];
  const seen = new Set<string>();

  // Sweep hues + lightness
  for (let h = 0; h < 360; h += 18) {
    for (let l = 0.06; l <= 0.96; l += 0.06) {
      for (const s of [0.0, 0.25, 0.55, 0.85]) {
        const hex = chroma.hsl(h, s, l).hex().toUpperCase();
        if (seen.has(hex)) continue;
        seen.add(hex);
        const r = getContrastRatio(hex, anchorHex);
        if (r >= minRatio) candidates.push({ hex, ratio: r });
      }
    }
  }

  // Pick a diverse spread: sort by ratio desc then dedupe by hue buckets
  candidates.sort((a, b) => b.ratio - a.ratio);
  const buckets = new Map<string, { hex: string; ratio: number }>();
  for (const c of candidates) {
    const col = chroma(c.hex);
    const [h, , l] = col.hsl();
    const hueBucket = Math.round((isNaN(h) ? 0 : h) / 30);
    const lightBucket = Math.round(l * 4);
    const key = `${hueBucket}-${lightBucket}`;
    if (!buckets.has(key)) buckets.set(key, c);
    if (buckets.size >= count * 2) break;
  }
  const diverse = Array.from(buckets.values())
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, count);
  return diverse;
}

/** Find the highest-contrast accessible text color for a given background. */
export function autoFix(bgHex: string): { hex: string; ratio: number } {
  let best = { hex: "#FFFFFF", ratio: getContrastRatio("#FFFFFF", bgHex) };
  for (let h = 0; h < 360; h += 10) {
    for (let l = 0.02; l <= 0.98; l += 0.04) {
      for (const s of [0.0, 0.3, 0.6, 0.9]) {
        const hex = chroma.hsl(h, s, l).hex();
        const r = getContrastRatio(hex, bgHex);
        if (r > best.ratio) best = { hex: hex.toUpperCase(), ratio: r };
      }
    }
  }
  return best;
}

/** Generate a random accessible (≥4.5) bg/text pair. */
export function randomAccessiblePair(min = 4.5): {
  bg: string;
  text: string;
  ratio: number;
} {
  for (let i = 0; i < 200; i++) {
    const bg = chroma
      .hsl(Math.random() * 360, Math.random() * 0.9, Math.random())
      .hex()
      .toUpperCase();
    const text = chroma
      .hsl(Math.random() * 360, Math.random() * 0.9, Math.random())
      .hex()
      .toUpperCase();
    const ratio = getContrastRatio(bg, text);
    if (ratio >= min) return { bg, text, ratio };
  }
  // Guaranteed fallback
  return { bg: "#0B0B0F", text: "#D4FF3A", ratio: getContrastRatio("#0B0B0F", "#D4FF3A") };
}

export const PALETTES: { name: string; colors: string[] }[] = [
  { name: "Sunset Bloom", colors: ["#FFE5EC", "#FFC2D1", "#FFB3C6", "#FF8FAB", "#FB6F92"] },
  { name: "Ocean Breeze", colors: ["#CAF0F8", "#90E0EF", "#00B4D8", "#0077B6", "#03045E"] },
  { name: "Olive Garden", colors: ["#F2E9D0", "#C9D69E", "#7A9F3F", "#3F6B1F", "#1B2A0E"] },
  { name: "Pastel Dreams", colors: ["#FFD6E0", "#FFEFCF", "#D0F4DE", "#A9DEF9", "#E4C1F9"] },
  { name: "Golden Hour", colors: ["#FFF6D6", "#F2D680", "#D9A441", "#A0612A", "#3E2C1C"] },
  { name: "Midnight Ink", colors: ["#F0ECE5", "#B6BBC4", "#31304D", "#161A30", "#0A0A14"] },
  { name: "Berry Smoothie", colors: ["#FFF0F3", "#FFCCD5", "#C9184A", "#800F2F", "#590D22"] },
  { name: "Forest Mist", colors: ["#EDF6F9", "#83C5BE", "#006D77", "#264653", "#1B2A2F"] },
];

/* ===== Color analysis & harmonies ===== */

export type ColorInfo = {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  luminance: number;
  name: string;
  temperature: "Warm" | "Cool" | "Neutral";
};

const NAMED: { hex: string; name: string }[] = [
  { hex: "#FF0000", name: "Red" }, { hex: "#FFA500", name: "Orange" },
  { hex: "#FFFF00", name: "Yellow" }, { hex: "#00FF00", name: "Green" },
  { hex: "#00FFFF", name: "Cyan" }, { hex: "#0000FF", name: "Blue" },
  { hex: "#800080", name: "Purple" }, { hex: "#FFC0CB", name: "Pink" },
  { hex: "#A52A2A", name: "Brown" }, { hex: "#808080", name: "Gray" },
  { hex: "#000000", name: "Black" }, { hex: "#FFFFFF", name: "White" },
  { hex: "#F5F5DC", name: "Beige" }, { hex: "#40E0D0", name: "Turquoise" },
  { hex: "#FFD700", name: "Gold" }, { hex: "#C0C0C0", name: "Silver" },
];

function nearestName(hex: string): string {
  const c = chroma(hex);
  let best = NAMED[0]; let bestD = Infinity;
  for (const n of NAMED) {
    const d = chroma.deltaE(c, n.hex);
    if (d < bestD) { bestD = d; best = n; }
  }
  return best.name;
}

export function getColorInfo(hex: string): ColorInfo {
  const c = chroma(hex);
  const [r, g, b] = c.rgb();
  const [h, s, l] = c.hsl();
  const [hv, sv, v] = c.hsv();
  const [cy, m, y, k] = c.cmyk();
  const safeH = isNaN(h) ? 0 : h;
  const temp: ColorInfo["temperature"] =
    isNaN(h) ? "Neutral"
      : safeH < 70 || safeH > 290 ? "Warm"
      : safeH > 130 && safeH < 270 ? "Cool" : "Neutral";
  return {
    hex: c.hex().toUpperCase(),
    rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
    hsl: { h: Math.round(safeH), s: Math.round((isNaN(s) ? 0 : s) * 100), l: Math.round(l * 100) },
    hsv: { h: Math.round(isNaN(hv) ? 0 : hv), s: Math.round((isNaN(sv) ? 0 : sv) * 100), v: Math.round(v * 100) },
    cmyk: {
      c: Math.round((isNaN(cy) ? 0 : cy) * 100),
      m: Math.round((isNaN(m) ? 0 : m) * 100),
      y: Math.round((isNaN(y) ? 0 : y) * 100),
      k: Math.round((isNaN(k) ? 0 : k) * 100),
    },
    luminance: c.luminance(),
    name: nearestName(hex),
    temperature: temp,
  };
}

export type Harmony = {
  type: "Complementary" | "Analogous" | "Triadic" | "Tetradic" | "Split-Complementary" | "Monochromatic";
  colors: string[];
};

export function getHarmonies(hex: string): Harmony[] {
  const c = chroma(hex);
  const [h, s, l] = c.hsl();
  const H = isNaN(h) ? 0 : h;
  const S = isNaN(s) ? 0.5 : s;
  const L = isNaN(l) ? 0.5 : l;
  const at = (deg: number, ss = S, ll = L) =>
    chroma.hsl((H + deg + 360) % 360, ss, ll).hex().toUpperCase();
  const self = c.hex().toUpperCase();
  return [
    { type: "Complementary", colors: [self, at(180)] },
    { type: "Analogous", colors: [at(-30), self, at(30)] },
    { type: "Triadic", colors: [self, at(120), at(240)] },
    { type: "Tetradic", colors: [self, at(90), at(180), at(270)] },
    { type: "Split-Complementary", colors: [self, at(150), at(210)] },
    {
      type: "Monochromatic",
      colors: [
        chroma.hsl(H, S, Math.max(0.1, L - 0.3)).hex().toUpperCase(),
        chroma.hsl(H, S, Math.max(0.2, L - 0.15)).hex().toUpperCase(),
        self,
        chroma.hsl(H, S, Math.min(0.9, L + 0.15)).hex().toUpperCase(),
        chroma.hsl(H, S, Math.min(0.95, L + 0.3)).hex().toUpperCase(),
      ],
    },
  ];
}

/** Curated text-on-background combinations */
export type ComboCategory =
  | "Editorial"
  | "Tech"
  | "Luxury"
  | "Warm"
  | "Cool"
  | "High Contrast";

export const COMBOS: {
  name: string;
  bg: string;
  text: string;
  vibe: string;
  category: ComboCategory;
}[] = [
  // Editorial
  { name: "Cream & Ink", bg: "#FAF7F2", text: "#1A1A1A", vibe: "Minimal", category: "Editorial" },
  { name: "Paper Slate", bg: "#F1EDE4", text: "#2B2A26", vibe: "Magazine", category: "Editorial" },
  { name: "Midnight Lime", bg: "#0B0B0F", text: "#D4FF3A", vibe: "Bold", category: "Editorial" },
  { name: "Bone Plum", bg: "#EFEAE2", text: "#3D1A4A", vibe: "Refined", category: "Editorial" },

  // Tech
  { name: "Mint Charcoal", bg: "#1F2937", text: "#A7F3D0", vibe: "SaaS", category: "Tech" },
  { name: "Indigo Glass", bg: "#0F1A2E", text: "#9EC8FF", vibe: "Product", category: "Tech" },
  { name: "Terminal", bg: "#0A0F0D", text: "#7CFFB2", vibe: "Code", category: "Tech" },
  { name: "Cobalt UI", bg: "#101522", text: "#E6EEFF", vibe: "Dashboard", category: "Tech" },

  // Luxury
  { name: "Royal Sand", bg: "#F4E9D8", text: "#3B2C7A", vibe: "Heritage", category: "Luxury" },
  { name: "Slate Gold", bg: "#243447", text: "#F2C66D", vibe: "Premium", category: "Luxury" },
  { name: "Velvet Ivory", bg: "#FBF6EC", text: "#5B1A2E", vibe: "Couture", category: "Luxury" },
  { name: "Onyx Gilt", bg: "#0F0E0C", text: "#D9B66A", vibe: "Boutique", category: "Luxury" },

  // Warm
  { name: "Coral Blush", bg: "#FFE5DC", text: "#8B2C0F", vibe: "Friendly", category: "Warm" },
  { name: "Mocha Cream", bg: "#F5EDE3", text: "#5B3A1F", vibe: "Cozy", category: "Warm" },
  { name: "Sunset Sky", bg: "#FFE3B3", text: "#7A1F3D", vibe: "Vibrant", category: "Warm" },
  { name: "Rose Noir", bg: "#1B0E14", text: "#FFB7C2", vibe: "Romantic", category: "Warm" },

  // Cool
  { name: "Arctic Steel", bg: "#E6F0F5", text: "#0B3D5C", vibe: "Calm", category: "Cool" },
  { name: "Forest Note", bg: "#0E2A1D", text: "#E8F5C8", vibe: "Organic", category: "Cool" },
  { name: "Ultraviolet", bg: "#1A0B2E", text: "#F2C5FF", vibe: "Futuristic", category: "Cool" },
  { name: "Sea Glass", bg: "#E4F2EE", text: "#0E3B3A", vibe: "Spa", category: "Cool" },

  // High Contrast
  { name: "Pure Mono", bg: "#FFFFFF", text: "#000000", vibe: "Maximum", category: "High Contrast" },
  { name: "Inverse Mono", bg: "#000000", text: "#FFFFFF", vibe: "Maximum", category: "High Contrast" },
  { name: "Lemon Ink", bg: "#FFEC3D", text: "#0A0A0A", vibe: "Punch", category: "High Contrast" },
  { name: "Cyan Black", bg: "#000000", text: "#3DF0FF", vibe: "Neon", category: "High Contrast" },
];

/** Curated, designer-grade 5-color palettes — coolors-style. */
const CURATED_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Sorbet", colors: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"] },
  { name: "Bloom", colors: ["#1D3557", "#457B9D", "#A8DADC", "#F1FAEE", "#E63946"] },
  { name: "Mulberry", colors: ["#22223B", "#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"] },
  { name: "Citrus Grove", colors: ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"] },
  { name: "Tide", colors: ["#03045E", "#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"] },
  { name: "Sunset Drive", colors: ["#000000", "#14213D", "#FCA311", "#E5E5E5", "#FFFFFF"] },
  { name: "Botanical", colors: ["#CB997E", "#DDBEA9", "#FFE8D6", "#B7B7A4", "#6B705C"] },
  { name: "Nordic", colors: ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"] },
  { name: "Plumberry", colors: ["#5F0F40", "#9A031E", "#FB8B24", "#E36414", "#0F4C5C"] },
  { name: "Cocoa", colors: ["#3A0CA3", "#7209B7", "#F72585", "#4361EE", "#4CC9F0"] },
  { name: "Jade Bloom", colors: ["#264653", "#287271", "#2A9D8F", "#8AB17D", "#E9C46A"] },
  { name: "Powder", colors: ["#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF"] },
  { name: "Berry Wine", colors: ["#5E1136", "#822659", "#B0457E", "#E0AED0", "#FFF3F8"] },
  { name: "Mojave", colors: ["#582F0E", "#7F4F24", "#936639", "#A68A64", "#C2A878"] },
  { name: "Tropic", colors: ["#006D77", "#83C5BE", "#EDF6F9", "#FFDDD2", "#E29578"] },
  { name: "Slate Pop", colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#E0E1DD"] },
  { name: "Honey Dew", colors: ["#FFB703", "#FB8500", "#023047", "#219EBC", "#8ECAE6"] },
  { name: "Rose Quartz", colors: ["#FFCAD4", "#F4ACB7", "#9D8189", "#D8E2DC", "#FFE5D9"] },
];

function roleFor(idx: number): "Deep" | "Mid" | "Soft" | "Light" | "Accent" {
  return (["Deep", "Mid", "Accent", "Soft", "Light"] as const)[idx] ?? "Mid";
}

/** Pick a beautiful curated 5-color palette, sorted by lightness for visual flow. */
export function generatePalette(seedHue?: number): {
  hex: string;
  role: "Deep" | "Mid" | "Soft" | "Light" | "Accent";
  name?: string;
}[] {
  // Ignore seedHue — return a beautiful curated palette instead of algorithmic noise.
  void seedHue;
  const pick = CURATED_PALETTES[Math.floor(Math.random() * CURATED_PALETTES.length)];
  // Sort dark → light so the strip reads like a tonal flow
  const sorted = [...pick.colors].sort(
    (a, b) => chroma(a).get("hsl.l") - chroma(b).get("hsl.l"),
  );
  return sorted.map((hex, i) => ({
    hex: hex.toUpperCase(),
    role: roleFor(i),
    name: pick.name,
  }));
}

