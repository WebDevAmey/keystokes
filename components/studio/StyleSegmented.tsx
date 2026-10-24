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
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-kw-border bg-kw-surface/60 p-1",
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
              "cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text",
              isActive
                ? "bg-kw-text text-kw-bg"
                : "text-kw-subtle hover:text-kw-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
