import Link from "next/link";
import KeyboardSwitcher from "@/components/studio/KeyboardSwitcher";
import SoundLab from "@/components/studio/SoundLab";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import { AudioLines, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
              <AudioLines className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">
                keywave
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                studio
              </span>
            </div>
          </Link>

          <AudioStatusPill />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Your keyboard, your sound
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Make every
            <br />
            keystroke <span className="text-violet-300">sound.</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-zinc-400 sm:text-base">
            Explore sounds, feel every press, and turn your keyboard into
            your own little instrument.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <KeyboardSwitcher />
          <SoundLab />
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-zinc-600">
          <span>KEYWAVE STUDIO · EARLY BUILD</span>
          <span>Built for the love of sound.</span>
        </footer>
      </div>
    </main>
  );
}
