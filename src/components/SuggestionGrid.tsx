import { useMemo } from "react";
import {
  suggestBackgrounds,
  suggestTextColors,
  getWcagGrade,
} from "@/lib/contrastUtils";
import { showToast } from "./Toast";

type Direction = "bg" | "text";

type Props = {
  direction: Direction; // "bg" => suggest backgrounds for given text; "text" => suggest text for given bg
  anchorHex: string; // the fixed color (text or bg)
  pairHex: string; // the moving color (used only for preview chip)
  onPick: (hex: string) => void;
};

export function SuggestionGrid({ direction, anchorHex, pairHex, onPick }: Props) {
  const suggestions = useMemo(() => {
    return direction === "bg"
      ? suggestBackgrounds(anchorHex, 10)
      : suggestTextColors(anchorHex, 10);
  }, [direction, anchorHex]);

  const titleEyebrow =
    direction === "bg" ? "Backgrounds for this text" : "Text colors for this background";
  const headline =
    direction === "bg"
      ? "Surfaces that hold your type."
      : "Type that lives on your surface.";

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="eyebrow">{titleEyebrow}</div>
          <h3 className="font-display text-2xl">{headline}</h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          10 PICKS · MIN 4.5 : 1
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {suggestions.map((s) => {
          const grade = getWcagGrade(s.ratio);
          // For "bg" direction: suggested color is bg, anchor (text) sits on it.
          // For "text" direction: suggested color is text, anchor (bg) is the surface.
          const previewBg = direction === "bg" ? s.hex : anchorHex;
          const previewText = direction === "bg" ? anchorHex : s.hex;
          return (
            <button
              key={s.hex}
              onClick={() => onPick(s.hex)}
              onMouseDown={(e) => {
                if (e.button === 1) {
                  navigator.clipboard.writeText(s.hex);
                  showToast(`Copied ${s.hex}`);
                }
              }}
              onDoubleClick={() => {
                navigator.clipboard.writeText(s.hex);
                showToast(`Copied ${s.hex}`);
              }}
              className="glass group flex flex-col overflow-hidden rounded-2xl text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="color-tween flex h-24 items-center justify-center"
                style={{ background: previewBg, color: previewText }}
              >
                <span className="font-display text-3xl">Aa</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-3">
                <div>
                  <div className="font-mono text-[11px]">{s.hex}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {s.ratio.toFixed(2)} : 1
                  </div>
                </div>
                <span
                  className={`badge-cut ${
                    grade === "AAA"
                      ? "is-pass"
                      : grade === "AA"
                        ? "is-pass"
                        : "is-mute"
                  }`}
                >
                  {grade === "Fail" ? "—" : grade}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
