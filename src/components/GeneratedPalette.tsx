import { useState } from "react";
import { Copy, RefreshCw, Wand2, Check } from "lucide-react";
import chroma from "chroma-js";
import { generatePalette } from "@/lib/contrastUtils";
import { showToast } from "./Toast";
import { MonoStrip } from "./MonoStrip";

export function GeneratedPalette({
  onApply,
}: {
  onApply: (next: { bg?: string; text?: string }) => void;
}) {
  const [palette, setPalette] = useState(() => generatePalette());
  const [copied, setCopied] = useState<string | null>(null);

  const regen = () => setPalette(generatePalette());
  const copy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    showToast(`Copied ${hex}`);
    setTimeout(() => setCopied(null), 1100);
  };
  const copyAll = () => {
    navigator.clipboard.writeText(palette.map((p) => p.hex).join(", "));
    showToast(`Copied ${palette.length} colors`);
  };

  const name = palette[0]?.name ?? "Palette";

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Wand2 size={12} /> Curated palette
          </div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            {name} — a designer-grade palette.
          </h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
            Hand-picked five-color stories sorted dark to light. Tap any swatch to copy, or apply as background or text.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyAll} className="btn">
            <Copy size={14} /> Copy all
          </button>
          <button onClick={regen} className="btn-cta btn-cta--sm">
            <span className="cta-spark"><RefreshCw size={12} /></span>
            <span>New palette</span>
          </button>
        </div>
      </div>

      {/* Big rounded palette strip */}
      <div className="glass overflow-hidden rounded-3xl p-2 sm:p-3">
        <div className="flex h-44 gap-2 sm:h-56">
          {palette.map((p) => {
            const isDark = chroma(p.hex).luminance() < 0.45;
            const fg = isDark ? "#FFFFFF" : "#0A0A0A";
            return (
              <button
                key={p.hex + p.role}
                onClick={() => copy(p.hex)}
                className="color-tween group relative flex-1 overflow-hidden rounded-2xl text-left transition hover:flex-[1.25]"
                style={{ background: p.hex, color: fg }}
                aria-label={`Copy ${p.hex}`}
              >
                <span
                  className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)",
                    color: fg,
                  }}
                >
                  {p.role}
                </span>
                <span
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition group-hover:opacity-100"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.08)",
                  }}
                >
                  {copied === p.hex ? <Check size={12} /> : <Copy size={12} />}
                </span>
                <span
                  className="absolute inset-x-2 bottom-2 font-mono text-[10px] tracking-wider sm:text-[11px]"
                  style={{ color: fg }}
                >
                  {p.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {palette.map((p) => (
          <div
            key={"act-" + p.hex}
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface/60 p-2"
          >
            <span
              className="h-7 w-7 flex-shrink-0 rounded-lg border border-border"
              style={{ background: p.hex }}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-mono text-[10px] truncate">{p.hex}</span>
              <div className="mt-1 flex gap-1">
                <button
                  onClick={() => {
                    onApply({ bg: p.hex });
                    showToast(`Applied ${p.hex} as background`);
                  }}
                  className="flex-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider hover:bg-secondary"
                >
                  BG
                </button>
                <button
                  onClick={() => {
                    onApply({ text: p.hex });
                    showToast(`Applied ${p.hex} as text`);
                  }}
                  className="flex-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider hover:bg-secondary"
                >
                  Text
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <MonoStrip
          hex={palette[palette.length - 1]?.hex ?? "#3B2C7A"}
          label="Mono palette · from the deepest tone"
          onApply={onApply}
        />
      </div>
    </section>
  );
}
