import { useMemo } from "react";
import { generateShades, getContrastRatio } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

type Props = {
  baseHex: string;
  activeHex: string;
  pairHex?: string; // for hover ratio
  label: string;
  onPick: (hex: string) => void;
  showRatio?: boolean;
};

export function ShadeStrip({
  baseHex,
  activeHex,
  pairHex,
  label,
  onPick,
  showRatio = false,
}: Props) {
  const shades = useMemo(() => generateShades(baseHex, 10), [baseHex]);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">{label}</div>
          <div className="font-mono text-xs text-muted-foreground">
            Current · {activeHex}
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          10 SHADES
        </span>
      </div>

      <div className="scroll-x flex gap-2 pb-3">
        {shades.map((hex) => {
          const isActive = hex === activeHex;
          const ratio = pairHex ? getContrastRatio(hex, pairHex) : null;
          return (
            <div key={hex} className="has-tip relative flex-shrink-0">
              <button
                onClick={() => onPick(hex)}
                onDoubleClick={() => {
                  navigator.clipboard.writeText(hex);
                  showToast(`Copied ${hex}`);
                }}
                aria-label={`Apply ${hex}`}
                data-active={isActive}
                className="swatch color-tween h-20 w-20 md:h-24 md:w-24"
                style={{ background: hex }}
              />
              <div className="tip">
                {hex}
                {showRatio && ratio !== null ? ` · ${ratio.toFixed(2)}:1` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
