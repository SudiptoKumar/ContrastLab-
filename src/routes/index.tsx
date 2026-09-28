import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import chroma from "chroma-js";
import { ArrowLeftRight, ExternalLink, FlaskConical } from "lucide-react";
import { ColorWheelPicker } from "@/components/ColorWheelPicker";
import { ContrastHero } from "@/components/ContrastHero";
import { LivePreviewCard } from "@/components/LivePreviewCard";
import { ShadeStrip } from "@/components/ShadeStrip";
import { PaletteGallery } from "@/components/PaletteGallery";
import { SuggestionGrid } from "@/components/SuggestionGrid";
import { ActionBar } from "@/components/ActionBar";
import { ToastHost } from "@/components/Toast";

import { HarmonyShowcase } from "@/components/HarmonyShowcase";
import { CategoryCombos } from "@/components/CategoryCombos";
import { TonalPairing } from "@/components/TonalPairing";
import { SwipeAccessibleCards } from "@/components/SwipeAccessibleCards";
import { MonoPreviewCard } from "@/components/MonoPreviewCard";
import { MonoLivePreviewCard } from "@/components/MonoLivePreviewCard";
import { GeneratedPalette } from "@/components/GeneratedPalette";

export const Route = createFileRoute("/")({
  component: Index,
  staticData: { sitemap: true },
  head: () => {
    const title = "Contrast Lab — WCAG Color Contrast Checker";
    const description =
      "Check WCAG AA/AAA contrast in real time and get the best text and background color combinations, shades, harmonies and palettes.";
    const image =
      "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/f2f27e8b-de7b-4ce2-8684-5e625acea6c1";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://contrastlab.lovable.app/" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: "https://contrastlab.lovable.app/" }],
    };
  },
});

function Index() {
  const [bg, setBg] = useState("#FAF7F2");
  const [text, setText] = useState("#3B2C7A");

  useEffect(() => {
    const root = document.documentElement;
    try {
      const tint = chroma.mix(bg, text, 0.5, "oklch").hex();
      root.style.setProperty("--tint", tint);
    } catch { /* ignore */ }
  }, [bg, text]);

  const apply = useCallback((next: { bg?: string; text?: string }) => {
    if (next.bg) setBg(next.bg.toUpperCase());
    if (next.text) setText(next.text.toUpperCase());
  }, []);

  const swap = () => {
    setBg(text);
    setText(bg);
  };

  return (
    <div className="min-h-screen">
      <ToastHost />

      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-6 sm:pt-7 md:px-10">
        <div className="flex items-center gap-2.5">
          <div
            className="color-tween relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border-strong shadow-sm"
            style={{
              background: `conic-gradient(from 90deg, ${bg}, ${text}, ${bg})`,
            }}
          >
            <FlaskConical size={14} className="text-foreground/70 mix-blend-difference" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base font-semibold leading-tight sm:text-lg">
              Contrast Lab <span className="sr-only">— WCAG color contrast checker</span>
            </h1>
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground sm:text-[10px]">
              wcag · accessibility
            </div>
          </div>
        </div>
        <a
          className="btn btn-ghost text-xs sm:text-sm"
          href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
          target="_blank"
          rel="noreferrer"
        >
          WCAG 2.1 <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-20 sm:space-y-14 sm:px-6 md:px-10">
        {/* Pickers */}
        <section>
          <div className="glass rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <ColorWheelPicker label="Background" hex={bg} onChange={setBg} />
              <button
                onClick={swap}
                aria-label="Swap colors"
                title="Swap colors"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition hover:bg-surface-2 hover:scale-105 active:scale-95"
              >
                <ArrowLeftRight size={16} strokeWidth={2.25} />
              </button>
              <ColorWheelPicker
                label="Text"
                hex={text}
                onChange={setText}
                align="right"
              />
            </div>
            <div className="rule my-4" />
            <ActionBar bg={bg} text={text} onApply={apply} />
          </div>
        </section>

        {/* Hero */}
        <ContrastHero bg={bg} text={text} />

        {/* Live preview */}
        <LivePreviewCard bg={bg} text={text} onApply={apply} />

        {/* Monochromatic live preview — double tap to remix */}
        <MonoLivePreviewCard bg={bg} onApply={apply} />

        {/* Mono preview */}
        <MonoPreviewCard hex={bg} onApply={apply} />

        {/* Swipeable AA pairs */}
        <SwipeAccessibleCards onApply={apply} />

        {/* Category combos */}
        <CategoryCombos onApply={apply} />

        {/* Generated palette */}
        <GeneratedPalette onApply={apply} />

        {/* Shades */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ShadeStrip
            label="Background shades"
            baseHex={bg}
            activeHex={bg}
            pairHex={text}
            onPick={setBg}
            showRatio
          />
          <ShadeStrip
            label="Text shades"
            baseHex={text}
            activeHex={text}
            pairHex={bg}
            onPick={setText}
            showRatio
          />
        </div>

        {/* Tonal pairing */}
        <TonalPairing hex={bg} onApply={apply} />

        {/* Harmony showcase */}
        <HarmonyShowcase hex={bg} onPick={(c) => setText(c)} />

        {/* Curated palettes */}
        <PaletteGallery onPick={(c) => setBg(c.toUpperCase())} />

        {/* Suggestions */}
        <SuggestionGrid
          direction="bg"
          anchorHex={text}
          pairHex={bg}
          onPick={(c) => setBg(c)}
        />

        <footer className="pt-8 text-center">
          <div className="rule mx-auto max-w-md" />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:text-[11px]">
            Built for accessible design · {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
