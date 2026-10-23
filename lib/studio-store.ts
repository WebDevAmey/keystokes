"use client";

import { useSyncExternalStore } from "react";
import { keySound } from "@/lib/key-sound";
import type { KeyboardThemeName } from "@/components/ui/keyboard";

export type KeyboardStyle = "mac" | "keychron" | "3d";

export const KEYBOARD_STYLE_LABELS: Record<KeyboardStyle, string> = {
  mac: "MacBook",
  keychron: "Keychron K2",
  "3d": "3D preview",
};

export interface StudioState {
  style: KeyboardStyle;
  soundEnabled: boolean;
  /** 0–1 master volume shared by every keyboard. */
  volume: number;
  keychronTheme: KeyboardThemeName;
}

const initialState: StudioState = {
  style: "mac",
  soundEnabled: true,
  volume: 0.6,
  keychronTheme: "classic",
};

let state: StudioState = initialState;
const listeners = new Set<() => void>();

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
  for (const listener of listeners) {
    listener();
  }
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

export function setKeychronTheme(keychronTheme: KeyboardThemeName): void {
  setState({ keychronTheme });
}

export function useStudio(): StudioState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
