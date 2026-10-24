"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isAssignableSound } from "@/lib/sound-profiles";

const STORAGE_KEY = "keywave.mappings.v1";

export type KeyMappings = Record<string, string>;

const EMPTY: KeyMappings = {};

let mappings: KeyMappings = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): KeyMappings {
  if (!raw || typeof raw !== "object") {
    return EMPTY;
  }
  const clean: KeyMappings = {};
  for (const [code, soundId] of Object.entries(raw as Record<string, unknown>)) {
    if (
      typeof code === "string" &&
      code.length > 0 &&
      typeof soundId === "string" &&
      isAssignableSound(soundId)
    ) {
      clean[code] = soundId;
    }
  }
  return clean;
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") {
    return;
  }
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      mappings = sanitize(JSON.parse(raw));
    }
  } catch {
    // Corrupt or inaccessible storage → keep the empty default.
  }
}

function persist(next: KeyMappings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable; the session still works in memory.
  }
}

function setMappings(next: KeyMappings): void {
  mappings = next;
  persist(next);
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): KeyMappings {
  ensureHydrated();
  return mappings;
}

function getServerSnapshot(): KeyMappings {
  return EMPTY;
}

/** Key → sound assignments, persisted in localStorage with safe defaults. */
export function useKeyMappings(): {
  mappings: KeyMappings;
  assign: (code: string, soundId: string) => void;
  remove: (code: string) => void;
  clearAll: () => void;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const assign = useCallback((code: string, soundId: string) => {
    if (!isAssignableSound(soundId)) return;
    ensureHydrated();
    setMappings({ ...mappings, [code]: soundId });
  }, []);

  const remove = useCallback((code: string) => {
    ensureHydrated();
    if (!(code in mappings)) return;
    const next = { ...mappings };
    delete next[code];
    setMappings(next);
  }, []);

  const clearAll = useCallback(() => {
    setMappings(EMPTY);
  }, []);

  return { mappings: state, assign, remove, clearAll };
}
