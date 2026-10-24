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
    text: "text-kw-subtle",
  },
  loading: {
    label: "Loading sound sample",
    dot: "bg-amber-400",
    text: "text-kw-subtle",
  },
  ready: {
    label: "Audio engine ready",
    dot: "bg-emerald-400",
    text: "text-kw-subtle",
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
      className="flex items-center gap-2 rounded-full border border-kw-border px-3 py-1.5"
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", copy.dot)} />
      <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", copy.text)}>
        {copy.label}
      </span>
    </div>
  );
}
