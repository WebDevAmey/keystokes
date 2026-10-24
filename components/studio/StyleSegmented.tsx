"use client";

import { cn } from "@/lib/utils";
import { setStyle, useStudio, type KeyboardStyle } from "@/lib/studio-store";

const OPTIONS: { id: KeyboardStyle; label: string }[] = [
  { id: "mac", label: "MacBook" },
  { id: "keychron", label: "Keychron" },
  { id: "registry", label: "mac-keyboard" },
];

interface StyleSegmentedProps {
  className?: string;
  label?: string;
}

export default function StyleSegmented({
  className,
  label = "Keyboard style",
}: StyleSegmentedProps) {
  const { style } = useStudio();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-white/[0.08] bg-black/30 p-1",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const isActive = style === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setStyle(option.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
              isActive
                ? "bg-violet-500 text-white shadow-[0_1px_6px_rgba(124,58,237,0.45)]"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
