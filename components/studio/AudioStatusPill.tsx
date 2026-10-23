"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { keySound, type KeySoundStatus } from "@/lib/key-sound";

const COPY: Record<
  KeySoundStatus,
  { label: string; dot: string; text: string }
> = {
  idle: {
    label: "Audio engine ready",
    dot: "bg-emerald-400",
    text: "text-zinc-400",
  },
  loading: {
    label: "Loading sound sample",
    dot: "bg-amber-400",
    text: "text-zinc-400",
  },
  ready: {
    label: "Audio engine ready",
    dot: "bg-emerald-400",
    text: "text-zinc-400",
  },
  unavailable: {
    label: "Audio unavailable",
    dot: "bg-amber-400",
    text: "text-amber-200/80",
  },
};

export default function AudioStatusPill() {
  const [status, setStatus] = useState<KeySoundStatus>(() =>
    keySound.getStatus(),
  );

  useEffect(() => keySound.subscribeStatus(setStatus), []);

  const copy = COPY[status];

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2"
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", copy.dot)} />
      <span className={cn("text-xs", copy.text)}>{copy.label}</span>
    </div>
  );
}
