"use client";

import { useEffect } from "react";
import MacKeyboard, { type MacKeyEvent } from "@/components/ui/mac-keyboard";
import Keyboard, { type KeyboardInteractionEvent } from "@/components/ui/keyboard";
import {
  RegistryMacKeyboard,
  type KeyEvent as RegistryKeyEvent,
} from "@/components/ui/registry-mac-keyboard";import StyleSegmented from "@/components/studio/StyleSegmented";
import {
  GENERIC_DOWN,
  GENERIC_UP,
  keySound,
  SOUND_DEFINES_DOWN,
  SOUND_DEFINES_UP,
} from "@/lib/key-sound";
import { KEYBOARD_STYLE_LABELS, useStudio } from "@/lib/studio-store";

export type StageKeyEvent = {
  code: string;
  phase: "down" | "up";
  source: "physical" | "pointer";
};

interface KeyboardSwitcherProps {
  /** Internal keyboard sound; set false when the page plays its own sounds. */
  enableSound?: boolean;
  /** KeyboardEvent.code → short badge label shown on mapped keys. */
  markers?: Record<string, string>;
  onKeyEvent?: (event: StageKeyEvent) => void;
}

function fromMac(event: MacKeyEvent): StageKeyEvent {
  return event;
}

function fromKeychron(event: KeyboardInteractionEvent): StageKeyEvent {
  return { code: event.code, phase: event.phase, source: event.source };
}

function fromRegistry(event: RegistryKeyEvent): StageKeyEvent {
  return event;
}

export default function KeyboardSwitcher({
  enableSound,
  markers,
  onKeyEvent,
}: KeyboardSwitcherProps) {
  const { style, soundEnabled, volume, keychronTheme } = useStudio();

  // Warm the shared sample before the first keystroke.
  useEffect(() => {
    keySound.prime();
  }, []);

  const title = KEYBOARD_STYLE_LABELS[style];
  const playInternalSound = enableSound ?? soundEnabled;

  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-xs text-zinc-400">
            Click any key or type on your physical keyboard. Browser shortcuts
            like ⌘R and ⌘W are never intercepted.
          </p>
        </div>

        <StyleSegmented />
      </div>

      <div className="overflow-x-auto overscroll-x-contain rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent p-4 sm:p-6">
        <div className="flex min-w-min justify-center">
          {style === "mac" && (
            <MacKeyboard
              className="shrink-0"
              enableSound={playInternalSound}
              markers={markers}
              onKeyEvent={(event) => onKeyEvent?.(fromMac(event))}
            />
          )}
          {style === "keychron" && (
            <Keyboard
              className="shrink-0"
              theme={keychronTheme}
              enableSound={playInternalSound}
              markers={markers}
              onKeyEvent={(event) => onKeyEvent?.(fromKeychron(event))}
            />
          )}
          {style === "registry" && (
            <RegistryMacKeyboard
              className="shrink-0"
              soundSrc=""
              markers={markers}
              onKeyEvent={(event) => {
                // The registry keyboard ships no usable sample; route its
                // presses through the shared switch engine when enabled.
                if (playInternalSound) {
                  keySound.play(
                    event.phase === "down"
                      ? SOUND_DEFINES_DOWN[event.code] ?? GENERIC_DOWN
                      : SOUND_DEFINES_UP[event.code] ?? GENERIC_UP,
                  );
                }
                onKeyEvent?.(fromRegistry(event));
              }}
            />
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-zinc-400">
        {playInternalSound
          ? `Sound on · ${Math.round(volume * 100)}% volume · QWERTY`
          : "Muted · QWERTY"}
      </p>
    </section>
  );
}
