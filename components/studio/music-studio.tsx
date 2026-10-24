"use client";

import { useCallback, useMemo, useState } from "react";
import { Eraser, Play, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import KeyboardSwitcher from "@/components/studio/KeyboardSwitcher";
import { SoundToggle, VolumeSlider } from "@/components/studio/sound-controls";
import { useStudio } from "@/lib/studio-store";
import { useKeyMappings } from "@/hooks/use-key-mappings";
import { keySound, GENERIC_DOWN, SOUND_DEFINES_DOWN } from "@/lib/key-sound";
import {
  ASSIGNABLE_GROUPS,
  assignableSoundLabel,
  isAssignableSound,
  playAssignable,
} from "@/lib/sound-profiles";

function prettyCode(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return code
    .replace(/Left$|Right$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function badgeLabel(soundId: string): string {
  const label = assignableSoundLabel(soundId);
  if (!label) return "♪";
  if (soundId.startsWith("perc-")) return label.toLowerCase();
  return label.replace(/ · SoundCN/, "");
}

export default function MusicStudio() {
  const { soundEnabled, volume } = useStudio();
  const { mappings, assign, remove, clearAll } = useKeyMappings();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [draftSound, setDraftSound] = useState("C4");

  const markers = useMemo(() => {
    const next: Record<string, string> = {};
    for (const [code, soundId] of Object.entries(mappings)) {
      next[code] = badgeLabel(soundId);
    }
    return next;
  }, [mappings]);

  const selectedSound = selectedCode ? mappings[selectedCode] : undefined;

  const selectKey = useCallback(
    (code: string) => {
      setSelectedCode(code);
      const mapped = mappings[code];
      if (mapped && isAssignableSound(mapped)) {
        setDraftSound(mapped);
      }
    },
    [mappings],
  );

  const playForCode = useCallback(
    (code: string) => {
      const mapped = mappings[code];
      if (mapped) {
        playAssignable(mapped, volume);
        return;
      }
      if (soundEnabled) {
        keySound.play(SOUND_DEFINES_DOWN[code] ?? GENERIC_DOWN);
      }
    },
    [mappings, volume, soundEnabled],
  );

  const handleKeyEvent = useCallback(
    (event: { code: string; phase: "down" | "up"; source: "physical" | "pointer" }) => {
      if (event.phase !== "down") return;
      if (event.source === "pointer") {
        selectKey(event.code);
      }
      playForCode(event.code);
    },
    [playForCode, selectKey],
  );

  const handleAssign = useCallback(() => {
    if (!selectedCode || !isAssignableSound(draftSound)) return;
    assign(selectedCode, draftSound);
  }, [selectedCode, draftSound, assign]);

  const handlePreview = useCallback(() => {
    playAssignable(draftSound, volume);
  }, [draftSound, volume]);

  const mappingEntries = useMemo(
    () =>
      Object.entries(mappings).sort(([a], [b]) => a.localeCompare(b)),
    [mappings],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Stage */}
        <div className="min-w-0">
          <KeyboardSwitcher
            enableSound={false}
            markers={markers}
            onKeyEvent={handleKeyEvent}
          />
          <p className="mt-3 text-center text-[11px] text-kw-subtle">
            {selectedCode
              ? `Selected: ${prettyCode(selectedCode)}${
                  selectedSound ? ` → ${badgeLabel(selectedSound)}` : " · unassigned"
                }`
              : "Click a key to select and hear it, or press it on your physical keyboard."}
          </p>
        </div>

        {/* Control panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-kw-border bg-white/[0.025] p-5">
            <p className="text-sm font-medium text-kw-text">Key assignment</p>
            <p className="mt-1 text-xs text-kw-subtle">
              Pick a key, choose a sound, assign it.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/20 p-3">
              <span className="text-xs text-kw-subtle">Selected key</span>
              <span className="text-xs font-medium text-kw-text">
                {selectedCode ? prettyCode(selectedCode) : "none yet"}
              </span>
            </div>

            <label htmlFor="studio-sound" className="mt-3 block">
              <span className="text-xs text-kw-muted">Sound</span>
              <select
                id="studio-sound"
                value={draftSound}
                onChange={(event) => setDraftSound(event.target.value)}
                className="mt-2 w-full cursor-pointer rounded-xl border border-kw-border bg-transparent px-3 py-2.5 text-xs text-kw-text transition hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
              >
                {ASSIGNABLE_GROUPS.map((group) => (
                  <optgroup
                    key={group.label}
                    label={group.label}
                    className="bg-kw-surface"
                  >
                    {group.items.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="bg-kw-surface"
                      >
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={!selectedCode}
                onClick={handleAssign}
                className="rounded-xl bg-kw-text px-3 py-2 text-xs font-medium text-kw-bg transition hover:bg-[#e3ded1] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-kw-border px-3 py-2 text-xs text-kw-muted transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
              >
                <Play className="h-3 w-3" />
                Preview
              </button>
              <button
                type="button"
                disabled={!selectedCode || !selectedSound}
                onClick={() => selectedCode && remove(selectedCode)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-kw-border px-3 py-2 text-xs text-kw-muted transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
              >
                <Eraser className="h-3 w-3" />
                Remove
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-kw-border bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-kw-text">Mappings</p>
              <button
                type="button"
                disabled={mappingEntries.length === 0}
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-kw-border px-2.5 py-1.5 text-[11px] text-kw-subtle transition hover:bg-white/5 hover:text-kw-text disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
            </div>

            {mappingEntries.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-kw-border p-4 text-center text-[11px] text-kw-subtle">
                No mappings yet. Unassigned keys play the switch sample.
              </p>
            ) : (
              <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
                {mappingEntries.map(([code, soundId]) => (
                  <li
                    key={code}
                    className={cn(
                      "flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2",
                      selectedCode === code && "border-kw-text/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => selectKey(code)}
                      className="flex min-w-0 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
                    >
                      <span className="text-xs font-medium text-kw-text">
                        {prettyCode(code)}
                      </span>
                      <span className="truncate text-[11px] text-kw-subtle">
                        {badgeLabel(soundId)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove mapping for ${prettyCode(code)}`}
                      onClick={() => remove(code)}
                      className="rounded p-1 text-kw-subtle transition hover:bg-white/5 hover:text-kw-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            <SoundToggle />
            <VolumeSlider />
          </div>
        </aside>
      </div>
    </div>
  );
}
