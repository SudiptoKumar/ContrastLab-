import { COMBOS, getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

export function CombinationCards({
  onApply,
}: {
  onApply: (next: { bg: string; text: string }) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Designer Combinations</div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Ready-made text-on-background pairs.
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {COMBOS.length} CARDS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COMBOS.map((c) => {
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
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ opacity: 0.7 }}>
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
                  <div className="font-mono text-[10px] text-muted-foreground">
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
    </section>
  );
}
