import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

export type ToastMsg = { id: number; text: string };

let listener: ((msg: string) => void) | null = null;
export function showToast(text: string) {
  listener?.(text);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const idRef = useRef(0);

  const push = useCallback((text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2400);
  }, []);

  useEffect(() => {
    listener = push;
    return () => {
      listener = null;
    };
  }, [push]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in glass-strong pointer-events-auto flex w-fit min-w-[180px] max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full px-4 py-2.5 text-center font-mono text-xs"
        >
          <CheckCircle2 size={14} className="flex-shrink-0 text-[var(--success)]" />
          <span className="truncate">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
