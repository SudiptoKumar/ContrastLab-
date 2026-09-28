import { PALETTES } from "@/lib/contrastUtils";
import { showToast } from "./Toast";
import { MonoStrip } from "./MonoStrip";

export function PaletteGallery({ onPick }: { onPick: (hex: string) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="eyebrow">Curated Palettes</div>
          <h3 className="font-display text-2xl">A library, hand-mixed.</h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {PALETTES.length} SETS
        </span>
      </div>

      <div className="scroll-x flex gap-4 pb-3">
        {PALETTES.map((p) => (
          <div
            key={p.name}
            className="glass flex-shrink-0 rounded-2xl p-4"
            style={{ width: 280 }}
          >
            <div className="flex h-20 w-full overflow-hidden rounded-xl border border-border">
              {p.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onPick(c);
                    showToast(`Applied ${c} as background`);
                  }}
                  className="flex-1 transition hover:scale-y-110"
                  style={{ background: c }}
                  aria-label={`Apply ${c}`}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-medium">{p.name}</div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {p.colors.length} TONES
              </span>
            </div>
            <div className="mt-3">
              <MonoStrip
                hex={p.colors[Math.floor(p.colors.length / 2)]}
                label="Mono palette"
                onApply={(n) => n.bg && onPick(n.bg)}
                compact
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
