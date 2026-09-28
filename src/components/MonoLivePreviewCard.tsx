import { useEffect, useRef, useState } from "react";
import chroma from "chroma-js";
import { Layers, Sparkles, Hand } from "lucide-react";
import { getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";
import { MonoStrip } from "./MonoStrip";
import { showToast } from "./Toast";

function buildMono(hue: number, sat = 0.65) {
  const bg = chroma.hsl(hue, sat * 0.35, 0.95).hex().toUpperCase();
  const text = chroma.hsl(hue, sat, 0.14).hex().toUpperCase();
  return { hue, bg, text };
}

function fromHex(hex: string) {
  try {
    const [h] = chroma(hex).hsl();
    return buildMono(isNaN(h) ? 220 : h);
  } catch {
    return buildMono(220);
  }
}

export function MonoLivePreviewCard({
  bg: parentBg,
  onApply,
}: {
  bg: string;
  onApply: (next: { bg?: string; text?: string }) => void;
}) {
  const [state, setState] = useState(() => fromHex(parentBg));
  const lastTap = useRef(0);
  const initial = useRef(parentBg);

  useEffect(() => {
    if (parentBg !== initial.current) return; // only sync if parent reset to initial
  }, [parentBg]);

  const remix = () => {
    const nextHue = Math.random() * 360;
    const nextSat = 0.55 + Math.random() * 0.25;
    setState(buildMono(nextHue, nextSat));
    showToast("New monochromatic combination");
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      remix();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  const ratio = getContrastRatio(state.bg, state.text);
  const grade = getWcagGrade(ratio);

  return (
    <section className="glass relative overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow flex items-center gap-1.5">
            <Layers size={12} /> Monochromatic preview
          </span>
          <span className={`badge-cut ${grade === "Fail" ? "is-fail" : "is-pass"}`}>
            {grade} · {ratio.toFixed(2)}:1
          </span>
        </div>
        <button
          onClick={remix}
          className="btn-cta btn-cta--sm"
          aria-label="Generate new monochromatic combination"
        >
          <span className="cta-spark">
            <Sparkles size={13} />
          </span>
          <span>Remix Mono</span>
        </button>
      </div>

      <button
        onClick={handleTap}
        onDoubleClick={remix}
        className="color-tween relative block w-full select-none px-4 py-10 text-left sm:px-6 sm:py-14 md:px-10 md:py-16"
        style={{ background: state.bg, color: state.text }}
        aria-label="Double tap to generate new monochromatic combination"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ opacity: 0.65 }}>
          /// Single-hue · Tint &amp; Shade
        </span>

        <h2
          className="font-display mt-3 text-3xl leading-[0.95] md:text-5xl"
          style={{ color: state.text }}
        >
          One hue. Two perfect roles.
        </h2>

        <p className="mt-5 max-w-xl text-base leading-relaxed" style={{ opacity: 0.85 }}>
          A light tint becomes the surface; a deep shade becomes the type. Calm,
          cohesive, accessible — built from a single color family.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: state.text, color: state.bg }}
          >
            Primary action
          </span>
          <span
            className="rounded-full border px-4 py-2 text-sm font-medium"
            style={{ borderColor: state.text, color: state.text }}
          >
            Secondary
          </span>
          <span className="font-mono text-xs" style={{ opacity: 0.6 }}>
            {state.bg} / {state.text}
          </span>
        </div>

        <div
          className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px]"
          style={{
            background: chroma(state.text).alpha(0.08).css(),
            color: state.text,
          }}
        >
          <Hand size={12} /> Double tap to generate new monochromatic color combinations
        </div>
      </button>

      <div className="space-y-3 border-t border-border bg-surface/40 p-4 sm:p-5">
        <MonoStrip
          hex={state.bg}
          label="Backgrounds — tints of this hue"
          onApply={(n) => {
            if (n.bg) {
              setState((s) => ({ ...s, bg: n.bg!.toUpperCase() }));
              onApply({ bg: n.bg });
            }
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-mono text-[10px] text-muted-foreground">
            HUE · {Math.round(state.hue)}°
          </span>
          <button
            onClick={() => {
              onApply({ bg: state.bg, text: state.text });
              showToast("Applied to workbench");
            }}
            className="btn-cta btn-cta--sm"
          >
            <span className="cta-spark">
              <Sparkles size={12} />
            </span>
            <span>Apply to workbench</span>
          </button>
        </div>
      </div>
    </section>
  );
}
