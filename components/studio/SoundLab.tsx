"use client";

import { useEffect, useState } from "react";
import {
  Info,
  Keyboard as KeyboardIcon,
  Settings2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StyleSegmented from "@/components/studio/StyleSegmented";
import {
  KEYBOARD_STYLE_LABELS,
  setKeychronTheme,
  setSoundEnabled,
  setVolume,
  useStudio,
} from "@/lib/studio-store";
import {
  keyboardThemeAccent,
  type KeyboardThemeName,
} from "@/components/ui/keyboard";
import { keySound, type KeySoundStatus } from "@/lib/key-sound";

const KEYCAP_THEMES: KeyboardThemeName[] = [
  "classic",
  "mint",
  "royal",
  "dolch",
  "sand",
  "scarlet",
];

export default function SoundLab() {
  const { style, soundEnabled, volume, keychronTheme } = useStudio();
  const [audioStatus, setAudioStatus] = useState<KeySoundStatus>(() =>
    keySound.getStatus(),
  );

  useEffect(() => keySound.subscribeStatus(setAudioStatus), []);

  const selectedLabel = KEYBOARD_STYLE_LABELS[style];
  const volumePercent = Math.round(volume * 100);

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <KeyboardIcon className="h-4 w-4 text-violet-300" />
          Keyboard setup
        </div>
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Pick a board, pick a layout — both styles mirror your physical
          keyboard.
        </p>

        <div className="mt-4">
          <StyleSegmented className="w-full justify-center" label="Keyboard style" />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3">
          <span className="text-xs text-zinc-300">Layout</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-200">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet-300" />
            QWERTY
            <span className="text-violet-300/70">active</span>
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3">
          <span className="text-xs text-zinc-300">Selected</span>
          <span className="text-xs text-zinc-500">{selectedLabel}</span>
        </div>

        {style === "keychron" && (
          <div className="mt-4">
            <p className="text-xs text-zinc-400">Keycaps</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {KEYCAP_THEMES.map((theme) => {
                const isActive = keychronTheme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setKeychronTheme(theme)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                      isActive
                        ? "border-violet-400/50 bg-violet-400/10 text-white"
                        : "border-white/[0.08] text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                    )}
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: keyboardThemeAccent(theme) }}
                    />
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="h-4 w-4 text-violet-300" />
          Your sound lab
        </div>
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Every change applies instantly across both keyboards.
        </p>

        <button
          type="button"
          role="switch"
          aria-checked={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3 text-left transition hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
        >
          <span className="flex items-center gap-2 text-xs text-zinc-300">
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-violet-300" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
            )}
            Sound
          </span>
          <span
            aria-hidden
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              soundEnabled ? "bg-violet-500" : "bg-white/10",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                soundEnabled ? "left-[18px]" : "left-0.5",
              )}
            />
          </span>
        </button>

        <label htmlFor="keywave-volume" className="mt-4 block">
          <span className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Volume</span>
            <span className="tabular-nums text-zinc-500">{volumePercent}%</span>
          </span>
          <input
            id="keywave-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumePercent}
            disabled={!soundEnabled}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="mt-2 w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </label>

        {audioStatus === "unavailable" && (
          <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[11px] leading-4 text-amber-200/80">
            The sound sample couldn&apos;t load — keys stay silent, everything
            else keeps working.
          </p>
        )}

        <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-white/10 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300/80" />
          <p className="text-[11px] leading-4 text-zinc-500">
            Click keys or type on your physical keyboard. Browser shortcuts
            like ⌘R and ⌘W are never intercepted.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-violet-300" />
          Custom mappings
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-zinc-600" />
          <p className="mt-2 text-xs text-zinc-400">
            Give individual keys their own samples
          </p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Coming in the next stage
          </p>
        </div>
      </div>
    </aside>
  );
}
