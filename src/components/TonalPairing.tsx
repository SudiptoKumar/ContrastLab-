import { useMemo } from "react";
import chroma from "chroma-js";
import { getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

type Props = {
  hex: string;
  onApply: (next: { bg: string; text: string }) => void;
};

/**
 * Build monochromatic tint/shade pairs from a single hue.
 * Tint = color + white (lighter, used as background)
 * Shade = color + black (darker, used as text)
 */
function buildPairs(hex: string) {
  let base: chroma.Color;
  try {
    base = chroma(hex);
  } catch {
    base = chroma("#3B2C7A");
  }
  const [h, s] = base.hsl();
  const safeH = isNaN(h) ? 250 : h;
  const safeS = isNaN(s) ? 0.5 : Math.max(0.25, Math.min(s, 0.85));

  // 6 curated tint/shade pairs in the same hue family
  const recipes: { name: string; bgL: number; bgS: number; txL: number; txS: number }[] = [
    { name: "Whisper", bgL: 0.97, bgS: safeS * 0.35, txL: 0.16, txS: safeS },
    { name: "Cream",   bgL: 0.94, bgS: safeS * 0.45, txL: 0.20, txS: safeS },
    { name: "Veil",    bgL: 0.90, bgS: safeS * 0.55, txL: 0.14, txS: safeS },
    { name: "Linen",   bgL: 0.92, bgS: safeS * 0.30, txL: 0.10, txS: safeS * 0.9 },
    { name: "Mist",    bgL: 0.88, bgS: safeS * 0.40, txL: 0.22, txS: safeS },
    { name: "Pearl",   bgL: 0.96, bgS: safeS * 0.25, txL: 0.18, txS: safeS * 0.95 },
  ];

  return recipes.map((r) => {
    const bg = chroma.hsl(safeH, r.bgS, r.bgL).hex().toUpperCase();
    const text = chroma.hsl(safeH, r.txS, r.txL).hex().toUpperCase();
    const ratio = getContrastRatio(bg, text);
    return { name: r.name, bg, text, ratio };
  });
}

export function TonalPairing({ hex, onApply }: Props) {
  const pairs = useMemo(() => buildPairs(hex), [hex]);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Monochromatic · Single-hue</div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Tint &amp; shade pairings.
          </h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
            One color, two roles. Light <em>tints</em> (color + white) become surfaces;
            deep <em>shades</em> (color + black) become type. Calm, cohesive, accessible.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          BASED ON {hex}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map((p) => {
          const grade = getWcagGrade(p.ratio);
          return (
            <article
              key={p.name}
              className="glass overflow-hidden rounded-2xl"
            >
              <button
                onClick={() => {
                  onApply({ bg: p.bg, text: p.text });
                  showToast(`Applied ${p.name}`);
                }}
                className="block w-full text-left transition hover:opacity-95"
                style={{ background: p.bg, color: p.text }}
              >
                <div className="px-5 py-7">
                  <div className="font-display text-2xl leading-tight">
                    {p.name}
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    Aa — Bb — Cc — 123
                  </div>
                  <p className="mt-3 text-sm leading-snug">
                    Quiet harmony from a single hue.
                  </p>
                </div>
              </button>

              <div className="flex items-stretch border-t border-border">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.bg);
                    showToast(`Copied tint ${p.bg}`);
                  }}
                  className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40"
                >
                  <span
                    className="h-5 w-5 flex-shrink-0 rounded-full border border-border-strong"
                    style={{ background: p.bg }}
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Tint
                    </div>
                    <div className="font-mono text-[10px] truncate">{p.bg}</div>
                  </div>
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.text);
                    showToast(`Copied shade ${p.text}`);
                  }}
                  className="flex flex-1 items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40"
                >
                  <span
                    className="h-5 w-5 flex-shrink-0 rounded-full border border-border-strong"
                    style={{ background: p.text }}
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      Shade
                    </div>
                    <div className="font-mono text-[10px] truncate">{p.text}</div>
                  </div>
                </button>
                <div className="w-px bg-border" />
                <div className="flex items-center px-3">
                  <span
                    className={`badge-cut ${grade === "Fail" ? "is-mute" : "is-pass"}`}
                  >
                    {p.ratio.toFixed(1)}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
