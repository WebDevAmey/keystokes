"use client";

import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setSoundEnabled,
  setSoundProfile,
  setVolume,
  useStudio,
} from "@/lib/studio-store";
import { SOUND_PROFILES } from "@/lib/sound-profiles";

export function SoundToggle({ className }: { className?: string }) {
  const { soundEnabled } = useStudio();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={soundEnabled}
      onClick={() => setSoundEnabled(!soundEnabled)}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3 text-left transition hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
        className,
      )}
    >
      <span className="flex items-center gap-2 text-xs text-zinc-300">
        {soundEnabled ? (
          <Volume2 className="h-3.5 w-3.5 text-violet-300" />
        ) : (
          <VolumeX className="h-3.5 w-3.5 text-zinc-400" />
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
  );
}

export function VolumeSlider({ className }: { className?: string }) {
  const { soundEnabled, volume } = useStudio();
  const volumePercent = Math.round(volume * 100);

  return (
    <label htmlFor="keywave-volume" className={cn("block", className)}>
      <span className="flex items-center justify-between text-xs">
        <span className="text-zinc-300">Volume</span>
        <span className="tabular-nums text-zinc-400">{volumePercent}%</span>
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
  );
}

export function SoundProfileSelect({ className }: { className?: string }) {
  const { soundProfile } = useStudio();

  return (
    <label htmlFor="keywave-sound-profile" className={cn("block", className)}>
      <span className="text-xs text-zinc-300">Keystroke sound</span>
      <select
        id="keywave-sound-profile"
        value={soundProfile}
        onChange={(event) => setSoundProfile(event.target.value)}
        className="mt-2 w-full cursor-pointer rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2.5 text-xs text-zinc-200 transition hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
      >
        {SOUND_PROFILES.map((profile) => (
          <option key={profile.id} value={profile.id} className="bg-zinc-900">
            {profile.label}
          </option>
        ))}
      </select>
    </label>
  );
}
