"use client";

import { useSyncExternalStore } from "react";
import { keySound } from "@/lib/key-sound";
import type { KeyboardThemeName } from "@/components/ui/keyboard";

export type KeyboardStyle = "mac" | "keychron" | "registry";

export const KEYBOARD_STYLE_LABELS: Record<KeyboardStyle, string> = {
  mac: "MacBook",
  keychron: "Keychron K2",
  registry: "mac-keyboard",
};

export interface StudioState {
  style: KeyboardStyle;
  soundEnabled: boolean;
  /** 0–1 master volume shared by every keyboard. */
  volume: number;
  /** Keystroke sound profile (switches sample or a SoundCN sound). */
  soundProfile: string;
  keychronTheme: KeyboardThemeName;
}

const initialState: StudioState = {
  style: "mac",
  soundEnabled: true,
  volume: 0.6,
  soundProfile: "switches",
  keychronTheme: "classic",
};

const STORAGE_KEY = "keywave.prefs.v1";

let state: StudioState = initialState;
const listeners = new Set<() => void>();
let hydrated = false;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StudioState {
  return state;
}

function getServerSnapshot(): StudioState {
  return initialState;
}

function setState(patch: Partial<StudioState>): void {
  state = { ...state, ...patch };
  if (typeof window !== "undefined") {
    persist(state);
  }
  for (const listener of listeners) {
    listener();
  }
}

function persist(next: StudioState): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        style: next.style,
        soundEnabled: next.soundEnabled,
        volume: next.volume,
        soundProfile: next.soundProfile,
      }),
    );
  } catch {
    // Storage can be unavailable (private mode, quota); defaults still work.
  }
}

function hydrate(): void {
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<StudioState>;
    const patch: Partial<StudioState> = {};
    if (saved.style === "mac" || saved.style === "keychron" || saved.style === "registry") {
      patch.style = saved.style;
    }
    if (typeof saved.soundEnabled === "boolean") {
      patch.soundEnabled = saved.soundEnabled;
    }
    if (typeof saved.volume === "number" && Number.isFinite(saved.volume)) {
      patch.volume = Math.min(1, Math.max(0, saved.volume));
    }
    if (typeof saved.soundProfile === "string" && saved.soundProfile) {
      patch.soundProfile = saved.soundProfile;
    }
    state = { ...state, ...patch };
  } catch {
    // Corrupt or inaccessible storage → keep defaults.
  }
  keySound.setEnabled(state.soundEnabled);
  keySound.setVolume(state.volume);
  for (const listener of listeners) {
    listener();
  }
}

/** Load persisted preferences once per page load (client only). */
export function hydrateStudioPrefs(): void {
  if (typeof window === "undefined" || hydrated) {
    return;
  }
  hydrate();
}

// Keep the shared player aligned with the store defaults.
keySound.setEnabled(initialState.soundEnabled);
keySound.setVolume(initialState.volume);

export function setStyle(style: KeyboardStyle): void {
  setState({ style });
}

export function setSoundEnabled(soundEnabled: boolean): void {
  keySound.setEnabled(soundEnabled);
  setState({ soundEnabled });
}

export function setVolume(volume: number): void {
  const next = Math.min(1, Math.max(0, volume));
  keySound.setVolume(next);
  setState({ volume: next });
}

export function setSoundProfile(soundProfile: string): void {
  setState({ soundProfile });
}

export function setKeychronTheme(keychronTheme: KeyboardThemeName): void {
  setState({ keychronTheme });
}

export function useStudio(): StudioState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
