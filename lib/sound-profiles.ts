import { keySound, GENERIC_DOWN, SOUND_DEFINES_DOWN, type KeySoundSegment } from "@/lib/key-sound";
import { playSound } from "@/lib/sound-engine";
import type { SoundAsset } from "@/lib/sound-types";
import { clickSoftSound } from "@/lib/click-soft";
import { click001Sound } from "@/lib/click-001";
import { click8bitSound } from "@/lib/click-8bit";
import { confirmation001Sound } from "@/lib/confirmation-001";
import { coinCollectSound } from "@/lib/coin-collect";
import { bellTollAllianceSound } from "@/lib/bell-toll-alliance";
import {
  isMusicSound,
  musicSoundLabel,
  MUSIC_SOUNDS,
  playMusicSound,
} from "@/lib/music-notes";

export interface SoundProfile {
  id: string;
  label: string;
}

const SOUNDCN_ASSETS: Record<string, SoundAsset> = {
  "click-soft": clickSoftSound,
  "click-001": click001Sound,
  "click-8bit": click8bitSound,
  "confirmation-001": confirmation001Sound,
  "coin-collect": coinCollectSound,
  "bell-toll": bellTollAllianceSound,
};

const SOUNDCN_PROFILES: SoundProfile[] = [
  { id: "click-soft", label: "Soft click · SoundCN" },
  { id: "click-001", label: "Mouse click · SoundCN" },
  { id: "click-8bit", label: "8-bit click · SoundCN" },
  { id: "confirmation-001", label: "Confirmation · SoundCN" },
  { id: "coin-collect", label: "Coin collect · SoundCN" },
  { id: "bell-toll", label: "Bell toll · SoundCN" },
];

/** Keystroke profiles offered on the typing test. */
export const SOUND_PROFILES: SoundProfile[] = [
  { id: "switches", label: "Switches (Keywave)" },
  ...SOUNDCN_PROFILES,
];

export function soundProfileLabel(id: string): string {
  return SOUND_PROFILES.find((profile) => profile.id === id)?.label ?? "Switches (Keywave)";
}

/** Map a typed character to a KeyboardEvent.code for per-key switch samples. */
export function charToKeyCode(char: string): string | undefined {
  if (char === " ") return "Space";
  if (/^[a-zA-Z]$/.test(char)) return `Key${char.toUpperCase()}`;
  if (/^[0-9]$/.test(char)) return `Digit${char}`;
  const symbolCodes: Record<string, string> = {
    "`": "Backquote",
    "-": "Minus",
    "=": "Equal",
    "[": "BracketLeft",
    "]": "BracketRight",
    "\\": "Backslash",
    ";": "Semicolon",
    "'": "Quote",
    ",": "Comma",
    ".": "Period",
    "/": "Slash",
  };
  return symbolCodes[char];
}

/** Play the selected keystroke profile (switches sample or a SoundCN sound). */
export function playProfile(id: string, code?: string, volume = 0.6): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const asset = SOUNDCN_ASSETS[id];
    if (asset) {
      void playSound(asset.dataUri, { volume }).catch(() => {});
      return;
    }

    const segment: KeySoundSegment = (code && SOUND_DEFINES_DOWN[code]) || GENERIC_DOWN;
    keySound.play(segment);
  } catch {
    // Sound stays optional.
  }
}

export interface AssignableGroup {
  label: string;
  items: SoundProfile[];
}

/** Full catalog of sounds that can be mapped to keys in the studio. */
export const ASSIGNABLE_GROUPS: AssignableGroup[] = [
  { label: "SoundCN", items: SOUNDCN_PROFILES },
  {
    label: "Musical notes",
    items: MUSIC_SOUNDS.filter((sound) => sound.group === "note"),
  },
  {
    label: "Percussion",
    items: MUSIC_SOUNDS.filter((sound) => sound.group === "percussion"),
  },
];

export function isAssignableSound(id: string): boolean {
  return Boolean(SOUNDCN_ASSETS[id]) || isMusicSound(id);
}

export function assignableSoundLabel(id: string): string | null {
  const soundcn = SOUNDCN_PROFILES.find((profile) => profile.id === id);
  if (soundcn) {
    return soundcn.label.replace(" · SoundCN", "");
  }
  return musicSoundLabel(id);
}

/** Play a mapped studio sound. Falls back to false when the id is unknown. */
export function playAssignable(id: string, volume: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (isMusicSound(id)) {
      return playMusicSound(id, volume);
    }
    const asset = SOUNDCN_ASSETS[id];
    if (asset) {
      void playSound(asset.dataUri, { volume }).catch(() => {});
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
