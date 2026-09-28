import { useState } from "react";
import { Wand2, Shuffle, Loader2 } from "lucide-react";
import { autoFix, randomAccessiblePair } from "@/lib/contrastUtils";
import { showToast } from "./Toast";

type Props = {
  bg: string;
  text: string;
  onApply: (next: { bg?: string; text?: string }) => void;
};

export function ActionBar({ bg, onApply }: Props) {
  const [fixing, setFixing] = useState(false);

  const handleAutoFix = () => {
    if (fixing) return;
    setFixing(true);
    setTimeout(() => {
      const result = autoFix(bg);
      onApply({ text: result.hex });
      showToast(`Auto Fix · ${result.hex} (${result.ratio.toFixed(2)}:1)`);
      setFixing(false);
    }, 480);
  };

  const handleRandom = () => {
    const pair = randomAccessiblePair();
    onApply({ bg: pair.bg, text: pair.text });
    showToast(`New pair · ${pair.ratio.toFixed(2)}:1`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAutoFix}
        disabled={fixing}
        className={`btn-cta flex-1 h-11 px-4 text-sm ${fixing ? "is-loading" : ""}`}
        aria-label="Auto fix text color for accessibility"
      >
        <span className="cta-spark">
          {fixing ? <Loader2 size={14} /> : <Wand2 size={14} />}
        </span>
        <span>{fixing ? "Fixing…" : "Auto Fix"}</span>
      </button>

      <button
        onClick={handleRandom}
        className="btn-soft flex-1 h-11 px-4 text-sm"
        aria-label="Generate a random accessible pair"
      >
        <Shuffle size={14} />
        <span>Random</span>
      </button>
    </div>
  );
}
