import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { randomAccessiblePair, getWcagGrade } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

type Pair = { bg: string; text: string; ratio: number };

// Static deterministic seed for SSR — replaced on client mount
const SEED_PAIRS: Pair[] = [
  { bg: "#0B0B0F", text: "#D4FF3A", ratio: 14.2 },
  { bg: "#FAF7F2", text: "#3B2C7A", ratio: 10.5 },
  { bg: "#1F2937", text: "#A7F3D0", ratio: 9.8 },
  { bg: "#FFE5DC", text: "#8B2C0F", ratio: 8.4 },
  { bg: "#0F1A2E", text: "#9EC8FF", ratio: 9.1 },
  { bg: "#FBF6EC", text: "#5B1A2E", ratio: 11.2 },
  { bg: "#0E2A1D", text: "#E8F5C8", ratio: 12.6 },
  { bg: "#FFEC3D", text: "#0A0A0A", ratio: 16.4 },
  { bg: "#243447", text: "#F2C66D", ratio: 8.7 },
  { bg: "#E6F0F5", text: "#0B3D5C", ratio: 9.3 },
];

function makePairs(n = 10): Pair[] {
  return Array.from({ length: n }, () => randomAccessiblePair(4.5));
}

export function SwipeAccessibleCards({
  onApply,
}: {
  onApply: (next: { bg: string; text: string }) => void;
}) {
  const [pairs, setPairs] = useState<Pair[]>(SEED_PAIRS);
  const scroller = useRef<HTMLDivElement>(null);

  // Generate fresh random pairs only after hydration to avoid SSR mismatch
  useEffect(() => {
    setPairs(makePairs(10));
  }, []);

  const regenerate = () => setPairs(makePairs(10));

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Sparkles size={12} /> Fresh AA pairs
          </div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Swipe for accessible inspiration.
          </h3>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
            Every card is a freshly generated background + text combination scoring AA or higher.
            Tap a card to apply it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="btn btn-ghost hidden h-9 w-9 rounded-full px-0 sm:inline-flex"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="btn btn-ghost hidden h-9 w-9 rounded-full px-0 sm:inline-flex"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
          <button onClick={regenerate} className="btn">
            <RefreshCw size={14} /> Regenerate
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="scroll-x flex snap-x snap-mandatory gap-4 pb-3"
      >
        {pairs.map((p, i) => {
          const grade = getWcagGrade(p.ratio);
          return (
            <button
              key={`${p.bg}-${p.text}-${i}`}
              onClick={() => {
                onApply({ bg: p.bg, text: p.text });
                showToast(`Applied pair ${p.ratio.toFixed(2)}:1`);
              }}
              className="combo-card glass w-[82vw] max-w-[340px] flex-shrink-0 snap-center overflow-hidden rounded-2xl text-left sm:w-[340px]"
            >
              <div
                className="color-tween flex h-44 flex-col justify-between p-5"
                style={{ background: p.bg, color: p.text }}
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ opacity: 0.7 }}
                >
                  Pair · {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-display text-2xl leading-tight">
                    Beautiful, readable.
                  </div>
                  <div className="mt-2 text-xs opacity-85">
                    The quick brown fox jumps over the lazy dog.
                  </div>
                  <div
                    className="mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{ background: p.text, color: p.bg }}
                  >
                    Read more
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0 font-mono text-[10px] text-muted-foreground">
                  <span className="block truncate">{p.bg} · {p.text}</span>
                </div>
                <span className="badge-cut is-pass">
                  {grade} · {p.ratio.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
