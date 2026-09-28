import { useMemo, useState } from "react";
import { Tags } from "lucide-react";
import {
  COMBOS,
  type ComboCategory,
  getContrastRatio,
  getWcagGrade,
} from "@/lib/contrastUtils";
import { showToast } from "./Toast";
import { MonoStrip } from "./MonoStrip";

const CATEGORIES: ComboCategory[] = [
  "Editorial",
  "Tech",
  "Luxury",
  "Warm",
  "Cool",
  "High Contrast",
];

export function CategoryCombos({
  onApply,
}: {
  onApply: (next: { bg: string; text: string }) => void;
}) {
  const [active, setActive] = useState<ComboCategory>("Editorial");
  const filtered = useMemo(
    () => COMBOS.filter((c) => c.category === active),
    [active],
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5">
            <Tags size={12} /> Curated by category
          </div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Combinations for every brand mood.
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {COMBOS.length} PAIRS
        </span>
      </div>

      <div className="scroll-x mb-4 flex gap-2 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              active === cat
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => {
          const ratio = getContrastRatio(c.bg, c.text);
          const grade = getWcagGrade(ratio);
          return (
            <button
              key={c.name}
              onClick={() => {
                onApply({ bg: c.bg, text: c.text });
                showToast(`Applied "${c.name}"`);
              }}
              className="combo-card glass overflow-hidden rounded-2xl text-left"
            >
              <div
                className="color-tween relative flex h-36 flex-col justify-between p-4"
                style={{ background: c.bg, color: c.text }}
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ opacity: 0.7 }}
                >
                  {c.vibe}
                </span>
                <div>
                  <div className="font-display text-2xl font-semibold leading-tight">
                    Aa
                  </div>
                  <div className="mt-1 text-xs" style={{ opacity: 0.85 }}>
                    The quick brown fox
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="font-mono truncate text-[10px] text-muted-foreground">
                    {c.bg} / {c.text}
                  </div>
                </div>
                <span className={`badge-cut ${grade === "Fail" ? "is-fail" : "is-pass"}`}>
                  {grade === "Fail" ? "—" : grade} · {ratio.toFixed(1)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filtered[0] && (
        <div className="mt-4">
          <MonoStrip
            hex={filtered[0].bg}
            label={`${active} · mono palette`}
            onApply={(n) => onApply({ bg: n.bg ?? filtered[0].bg, text: n.text ?? filtered[0].text })}
          />
        </div>
      )}
    </section>
  );
}
