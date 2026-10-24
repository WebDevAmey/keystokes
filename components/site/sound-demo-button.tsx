"use client";

import { GENERIC_DOWN, keySound } from "@/lib/key-sound";

export default function SoundDemoButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        keySound.prime();
        keySound.play(GENERIC_DOWN);
      }}
      className={`kw-btn kw-btn-secondary ${className ?? ""}`}
    >
      Play a switch sample
    </button>
  );
}
