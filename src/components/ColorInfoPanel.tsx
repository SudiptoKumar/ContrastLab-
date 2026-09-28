import { getColorInfo } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

function Stat({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5 text-left transition hover:border-border-strong hover:bg-surface-2"
    >
      <span className="eyebrow">{label}</span>
      <span className="font-mono text-xs sm:text-sm">{value}</span>
    </button>
  );
}

export function ColorInfoPanel({ hex, label }: { hex: string; label: string }) {
  const info = getColorInfo(hex);
  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    showToast(`Copied ${v}`);
  };
  const rgb = `rgb(${info.rgb.r}, ${info.rgb.g}, ${info.rgb.b})`;
  const hsl = `hsl(${info.hsl.h}, ${info.hsl.s}%, ${info.hsl.l}%)`;
  const hsv = `${info.hsv.h}°, ${info.hsv.s}%, ${info.hsv.v}%`;
  const cmyk = `${info.cmyk.c}, ${info.cmyk.m}, ${info.cmyk.y}, ${info.cmyk.k}`;

  return (
    <section className="glass rounded-3xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className="color-tween h-12 w-12 flex-shrink-0 rounded-xl border border-border-strong sm:h-14 sm:w-14"
          style={{ background: hex }}
        />
        <div className="min-w-0 flex-1">
          <div className="eyebrow truncate">{label} · {info.name}</div>
          <div className="font-display truncate text-lg font-semibold sm:text-xl">{info.hex}</div>
        </div>
        <span className="badge-cut">{info.temperature}</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Stat label="HEX" value={info.hex} onClick={() => copy(info.hex)} />
        <Stat label="RGB" value={rgb} onClick={() => copy(rgb)} />
        <Stat label="HSL" value={hsl} onClick={() => copy(hsl)} />
        <Stat label="HSV" value={hsv} onClick={() => copy(hsv)} />
        <Stat label="CMYK" value={cmyk} onClick={() => copy(cmyk)} />
        <Stat label="Luminance" value={info.luminance.toFixed(3)} />
      </div>
    </section>
  );
}
