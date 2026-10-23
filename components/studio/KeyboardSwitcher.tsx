"use client";

import { useEffect } from "react";
import MacKeyboard from "@/components/ui/mac-keyboard";
import Keyboard from "@/components/ui/keyboard";
import VirtualKeyboard from "@/components/studio/VirtualKeyboard";
import StyleSegmented from "@/components/studio/StyleSegmented";
import { keySound } from "@/lib/key-sound";
import { KEYBOARD_STYLE_LABELS, useStudio } from "@/lib/studio-store";

export default function KeyboardSwitcher() {
  const { style, soundEnabled, volume, keychronTheme } = useStudio();

  // Warm the shared sample before the first keystroke.
  useEffect(() => {
    keySound.prime();
  }, []);

  const title = KEYBOARD_STYLE_LABELS[style];

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Click any key or type on your physical keyboard — browser
            shortcuts stay untouched.
          </p>
        </div>

        <StyleSegmented />
      </div>

      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-4 sm:p-6">
        {style === "3d" ? (
          <VirtualKeyboard />
        ) : (
          <div className="flex min-w-min justify-center">
            {style === "mac" ? (
              <MacKeyboard className="shrink-0" enableSound={soundEnabled} />
            ) : (
              <Keyboard
                className="shrink-0"
                theme={keychronTheme}
                enableSound={soundEnabled}
              />
            )}
          </div>
        )}
      </div>

      {style !== "3d" && (
        <p className="mt-3 text-center text-[11px] text-zinc-600">
          {soundEnabled
            ? `Sound on · ${Math.round(volume * 100)}% volume · QWERTY`
            : "Muted · QWERTY"}
        </p>
      )}
    </section>
  );
}
