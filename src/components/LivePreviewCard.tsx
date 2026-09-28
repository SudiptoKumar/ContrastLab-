import { useState } from "react";
import { getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";
import chroma from "chroma-js";
import { MonoStrip } from "./MonoStrip";

type Mode = "normal" | "large" | "gradient";

export function LivePreviewCard({
  bg,
  text,
  onApply,
}: {
  bg: string;
  text: string;
  onApply?: (next: { bg?: string; text?: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>("normal");
  const ratio = getContrastRatio(bg, text);
  const grade = getWcagGrade(ratio);

  const accent = chroma(text).set("hsl.h", "+30").hex();
  const headingStyle: React.CSSProperties =
    mode === "gradient"
      ? {
          backgroundImage: `linear-gradient(120deg, ${text}, ${accent})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }
      : { color: text };

  const sizeClass =
    mode === "large" ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl";

  return (
    <section className="glass relative overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow">Live preview</span>
          <span
            className={`badge-cut ${
              grade === "Fail" ? "is-fail" : "is-pass"
            }`}
          >
            {grade} · {ratio.toFixed(2)}:1
          </span>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-surface/60 p-1">
          {(["normal", "large", "gradient"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition sm:px-3 ${
                mode === m
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div
        className="color-tween relative px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-14"
        style={{ background: bg, color: text }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em]"
          style={{ opacity: 0.65 }}
        >
          /// Issue 014 — Accessibility
        </span>

        <h2
          className={`font-display mt-3 leading-[0.95] ${sizeClass}`}
          style={headingStyle}
        >
          Designed to be read by everyone, everywhere.
        </h2>

        <p
          className="mt-5 max-w-xl text-base leading-relaxed"
          style={{ color: text, opacity: 0.85 }}
        >
          Body copy renders here using the exact color combination you've chosen.
          Adjust either picker to instantly preview legibility in a realistic
          editorial layout.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
            style={{ background: text, color: bg }}
          >
            Primary action
          </button>
          <button
            className="rounded-full border px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
            style={{ borderColor: text, color: text, background: "transparent" }}
          >
            Secondary
          </button>
          <span
            className="font-mono text-xs"
            style={{ color: text, opacity: 0.6 }}
          >
            {bg}  /  {text}
          </span>
        </div>
      </div>

      <div className="border-t border-border bg-surface/40 p-3 sm:p-4">
        <MonoStrip hex={bg} label="Mono palette · from current background" onApply={onApply} />
      </div>
    </section>
  );
}
