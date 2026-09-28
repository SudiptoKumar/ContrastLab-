import { getHarmonies } from "@/lib/contrastUtils";
import { showToast } from "./Toast";
import { MonoStrip } from "./MonoStrip";

export function HarmonyShowcase({ hex, onPick }: { hex: string; onPick: (h: string) => void }) {
  const harmonies = getHarmonies(hex);
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Color Harmonies</div>
          <h3 className="font-display text-xl font-semibold sm:text-2xl">
            Theory-driven combinations.
          </h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          BASED ON {hex}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {harmonies.map((h) => (
          <div key={h.type} className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{h.type}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {h.colors.length} TONES
              </span>
            </div>
            <div className="flex h-16 overflow-hidden rounded-xl border border-border">
              {h.colors.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => {
                    onPick(c);
                    showToast(`Applied ${c}`);
                  }}
                  className="group relative flex-1 transition hover:flex-[2]"
                  style={{ background: c }}
                  aria-label={`Apply ${c}`}
                >
                  <span className="absolute inset-x-0 bottom-1 hidden text-center font-mono text-[9px] text-white mix-blend-difference group-hover:block">
                    {c}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {h.colors.map((c, i) => (
                <span key={`${c}-tag-${i}`} className="font-mono text-[10px] text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <MonoStrip hex={hex} label="Mono palette · from this hue" onApply={(n) => n.bg && onPick(n.bg)} />
      </div>
    </section>
  );
}
