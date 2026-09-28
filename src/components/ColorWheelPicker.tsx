import { useEffect, useRef, useState } from "react";
import { HslColorPicker } from "react-colorful";
import chroma from "chroma-js";
import { isValidHex, normalizeHex } from "@/lib/contrastUtils";

type Props = {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
  align?: "left" | "right";
};

function hexToHsl(hex: string) {
  const [h, s, l] = chroma(hex).hsl();
  return {
    h: isNaN(h) ? 0 : h,
    s: (isNaN(s) ? 0 : s) * 100,
    l: l * 100,
  };
}

export function ColorWheelPicker({ label, hex, onChange, align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(hex);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(hex);
  }, [hex]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const submitText = (v: string) => {
    setText(v);
    if (isValidHex(v)) onChange(normalizeHex(v));
  };

  return (
    <div ref={wrap} className="relative min-w-0">
      <span className="eyebrow mb-2 block text-[10px]">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Pick ${label} color`}
          className="swatch color-tween h-10 w-10 flex-shrink-0 rounded-xl"
          style={{ background: hex }}
          data-active={open}
        />
        <input
          value={text}
          onChange={(e) => submitText(e.target.value)}
          onBlur={() => setText(hex)}
          spellCheck={false}
          className="font-mono h-10 w-full min-w-0 rounded-lg border border-border bg-surface/60 px-2.5 text-xs font-medium tracking-wider outline-none transition focus:border-[var(--primary)] focus:bg-surface sm:text-sm"
        />
      </div>

      {open && (
        <div
          className={`lovable-wheel glass-strong absolute z-40 mt-3 w-[min(280px,calc(100vw-2rem))] rounded-3xl p-4 sm:p-5 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <HslColorPicker
            color={hexToHsl(hex)}
            onChange={(c) =>
              onChange(chroma.hsl(c.h, c.s / 100, c.l / 100).hex().toUpperCase())
            }
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="eyebrow">{label}</span>
            <span className="font-mono text-xs">{hex}</span>
          </div>
        </div>
      )}
    </div>
  );
}
