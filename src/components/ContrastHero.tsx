import { useEffect, useRef, useState } from "react";
import { getContrastRatio, getWcagGrade } from "@/lib/contrastUtils";

type Props = {
  bg: string;
  text: string;
};

function useAnimatedNumber(value: number, duration = 450) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<number | null>(null);
  const fromRef = useRef(value);
  const startRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(fromRef.current + (value - fromRef.current) * eased);
      if (k < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

function Row({
  label,
  hint,
  pass,
}: {
  label: string;
  hint: string;
  pass: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-b-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="font-mono text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <span className={`badge-cut ${pass ? "is-pass" : "is-fail"}`}>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: pass ? "var(--success)" : "var(--destructive)",
            boxShadow: `0 0 10px ${pass ? "var(--success)" : "var(--destructive)"}`,
          }}
        />
        {pass ? "Pass" : "Fail"}
      </span>
    </div>
  );
}

export function ContrastHero({ bg, text }: Props) {
  const ratio = getContrastRatio(bg, text);
  const animated = useAnimatedNumber(ratio);
  const grade = getWcagGrade(ratio);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    setPulse((p) => p + 1);
  }, [bg, text]);

  return (
    <section className="glass relative overflow-hidden rounded-[24px] p-5 sm:rounded-[28px] sm:p-7 md:p-10">
      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr] md:gap-8">
        {/* Big ratio */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="eyebrow">Contrast Ratio</span>
            <span
              className={`badge-cut ${
                grade === "AAA"
                  ? "is-pass"
                  : grade === "AA"
                    ? "is-pass"
                    : grade === "AA Large"
                      ? ""
                      : "is-fail"
              }`}
            >
              WCAG · {grade}
            </span>
          </div>

          <div
            key={pulse}
            className="ratio-pop ratio-num leading-[0.85]"
            style={{ fontSize: "clamp(3.25rem, 13vw, 8.5rem)" }}
          >
            <span className="align-baseline">{animated.toFixed(2)}</span>
            <span className="align-baseline ml-1 text-[0.32em] text-muted-foreground">:1</span>
          </div>

          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Real-time WCAG 2.1 luminance ratio between your background and text. Higher means more
            legible.
          </p>
        </div>

        {/* Color blocks + rows */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="color-tween flex h-28 flex-col justify-between overflow-hidden rounded-2xl border border-border p-3"
              style={{ background: bg, color: text }}
            >
              <span className="font-mono text-[10px] opacity-70">BACKGROUND</span>
              <span className="font-mono truncate text-xs">{bg}</span>
            </div>
            <div
              className="color-tween flex h-28 flex-col justify-between overflow-hidden rounded-2xl border border-border p-3"
              style={{ background: text, color: bg }}
            >
              <span className="font-mono text-[10px] opacity-70">TEXT</span>
              <span className="font-mono truncate text-xs">{text}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 px-4">
            <Row
              label="AA · Normal text"
              hint="Required ≥ 4.5 : 1"
              pass={ratio >= 4.5}
            />
            <Row
              label="AA · Large / Bold"
              hint="Required ≥ 3 : 1"
              pass={ratio >= 3}
            />
            <Row label="AAA · Enhanced" hint="Required ≥ 7 : 1" pass={ratio >= 7} />
          </div>
        </div>
      </div>
    </section>
  );
}
