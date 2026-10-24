"use client";

import { cn } from "@/lib/utils";
import { keyboardThemeAccent, type KeyboardThemeName } from "@/components/ui/keyboard";
import { setKeychronTheme, setStyle, useStudio } from "@/lib/studio-store";

const THEMES: { id: KeyboardThemeName; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "mint", label: "Mint" },
  { id: "royal", label: "Royal" },
  { id: "dolch", label: "Dolch" },
  { id: "sand", label: "Sand" },
  { id: "scarlet", label: "Scarlet" },
];

export default function ThemeChips() {
  const { keychronTheme, style } = useStudio();

  return (
    <div
      role="group"
      aria-label="Keychron colourway"
      className="flex flex-wrap gap-2"
    >
      {THEMES.map((theme) => {
        const active = style === "keychron" && keychronTheme === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              setKeychronTheme(theme.id);
              setStyle("keychron");
            }}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text",
              active
                ? "border-kw-text/60 bg-kw-surface text-kw-text"
                : "border-kw-border text-kw-muted hover:border-white/30 hover:text-kw-text",
            )}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: keyboardThemeAccent(theme.id) }}
            />
            {theme.label}
          </button>
        );
      })}
    </div>
  );
}
