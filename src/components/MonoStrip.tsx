import chroma from "chroma-js";
import { showToast } from "./Toast";

function safeHsl(hex: string): [number, number] {
  try {
    const [h, s] = chroma(hex).hsl();
    return [isNaN(h) ? 250 : h, isNaN(s) ? 0.5 : Math.max(0.2, Math.min(s, 0.85))];
  } catch {
    return [250, 0.5];
  }
}

export function monoBackgroundTints(hex: string, n = 5): string[] {
  const [h, s] = safeHsl(hex);
  // Light tints: very light → medium light
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1); // 0..1
    const l = 0.97 - t * 0.18; // 0.97 → 0.79
    const sat = s * (0.25 + t * 0.25);
    return chroma.hsl(h, sat, l).hex().toUpperCase();
  });
}

export function monoTextShades(hex: string, n = 5): string[] {
  const [h, s] = safeHsl(hex);
  // Deep shades: very dark → medium dark
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const l = 0.08 + t * 0.18; // 0.08 → 0.26
    return chroma.hsl(h, s, l).hex().toUpperCase();
  });
}

type Props = {
  hex: string;
  label?: string;
  onApply?: (next: { bg?: string; text?: string }) => void;
  compact?: boolean;
};

/**
 * Tonal mono palette strip — 5 background tints + 5 text shades from one hue.
 */
export function MonoStrip({ hex, label = "Mono palette", onApply, compact }: Props) {
  const tints = monoBackgroundTints(hex, 5);
  const shades = monoTextShades(hex, 5);

  const Row = ({
    title,
    colors,
    role,
  }: {
    title: string;
    colors: string[];
    role: "bg" | "text";
  }) => (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className={`flex gap-1.5 ${compact ? "h-8" : "h-10"}`}>
        {colors.map((c) => (
          <button
            key={role + c}
            onClick={() => {
              navigator.clipboard.writeText(c);
              if (onApply) {
                if (role === "bg") onApply({ bg: c });
                else onApply({ text: c });
                showToast(`Applied ${c} as ${role === "bg" ? "background" : "text"}`);
              } else {
                showToast(`Copied ${c}`);
              }
            }}
            className="group relative flex-1 overflow-hidden rounded-lg border border-border-strong/40 transition hover:flex-[1.5]"
            style={{ background: c }}
            aria-label={`${role === "bg" ? "Apply" : "Apply text"} ${c}`}
            title={c}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`rounded-2xl border border-border bg-surface/60 ${compact ? "p-2.5" : "p-3 sm:p-4"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-[9px] text-muted-foreground">FROM {hex}</span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Row title="Background tints" colors={tints} role="bg" />
        <Row title="Text shades" colors={shades} role="text" />
      </div>
    </div>
  );
}
