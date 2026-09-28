import { useMemo } from "react";
import chroma from "chroma-js";
import { Layers } from "lucide-react";
import { getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

function clampHsl(h: number, s: number, l: number) {
  return chroma.hsl(isNaN(h) ? 0 : h, isNaN(s) ? 0 : s, l).hex().toUpperCase();
}

export function MonoPreviewCard({
  hex,
  onApply,
}: {
  hex: string;
  onApply: (next: { bg: string; text: string }) => void;
}) {
  const { lightBg, deepText, deepBg, lightText } = useMemo(() => {
    let c: chroma.Color;
    try {
      c = chroma(hex);
    } catch {
      c = chroma("#3B2C7A");
    }
    const [h, s] = c.hsl();
    const safeS = Math.max(0.2, Math.min(isNaN(s) ? 0.4 : s, 0.85));
    return {
      lightBg: clampHsl(h, safeS * 0.35, 0.95),
      deepText: clampHsl(h, safeS, 0.14),
      deepBg: clampHsl(h, safeS, 0.12),
      lightText: clampHsl(h, safeS * 0.4, 0.94),
    };
  }, [hex]);

  const variants: { bg: string; text: string; label: string; tone: string }[] = [
    { bg: lightBg, text: deepText, label: "Light surface · Deep type", tone: "Tint → Shade" },
    { bg: deepBg, text: lightText, label: "Deep surface · Light type", tone: "Shade → Tint" },
  ];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Layers size={12} /> Single-hue preview
          </div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Same color, two roles.
          </h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
            Generated from your current background hue. The light tint becomes a surface; the deep
            shade becomes type — a quiet, monochromatic system.
          </p>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">BASE · {hex}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {variants.map((v) => {
          const ratio = getContrastRatio(v.bg, v.text);
          const grade = getWcagGrade(ratio);
          return (
            <button
              key={v.label}
              onClick={() => {
                onApply({ bg: v.bg, text: v.text });
                showToast(`Applied · ${v.label}`);
              }}
              className="glass overflow-hidden rounded-2xl text-left transition hover:-translate-y-0.5"
            >
              <div
                className="color-tween px-5 py-7"
                style={{ background: v.bg, color: v.text }}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                  {v.tone}
                </span>
                <div className="font-display mt-2 text-2xl leading-tight">
                  Designed in one hue.
                </div>
                <p className="mt-2 text-sm opacity-85">
                  Calm, cohesive typography on a tonal surface — perfect for editorial layouts.
                </p>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{v.label}</div>
                  <div className="font-mono truncate text-[10px] text-muted-foreground">
                    {v.bg} / {v.text}
                  </div>
                </div>
                <span className={`badge-cut ${grade === "Fail" ? "is-fail" : "is-pass"}`}>
                  {grade} · {ratio.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
