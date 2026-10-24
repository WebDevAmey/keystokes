import Link from "next/link";
import SiteHeader from "@/components/site-header";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import { Keyboard as KeyboardIcon, Music4, Sparkles } from "lucide-react";

const EXPERIENCES = [
  {
    href: "/test",
    title: "Type Test",
    description:
      "Race the clock against a stream of words. Track your WPM and accuracy while every keystroke clicks in your chosen sound.",
    icon: KeyboardIcon,
    cta: "Start typing",
  },
  {
    href: "/studio",
    title: "Sound Studio",
    description:
      "Map musical notes, percussion, and SoundCN effects onto individual keys — then play your keyboard like an instrument.",
    icon: Music4,
    cta: "Open the studio",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader right={<AudioStatusPill />} />

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
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
            Two ways to play: race the clock in a minimalist typing test, or
            turn your keyboard into an instrument in the sound studio.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-5 md:grid-cols-2">
          {EXPERIENCES.map((experience) => (
            <Link
              key={experience.href}
              href={experience.href}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-violet-400/30 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                <experience.icon className="h-5 w-5 text-violet-300" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {experience.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">
                {experience.description}
              </p>
              <span className="mt-6 text-sm font-medium text-violet-300 transition group-hover:text-violet-200">
                {experience.cta} →
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-zinc-600">
          <span>KEYWAVE STUDIO · EARLY BUILD</span>
          <span>Built for the love of sound.</span>
        </footer>
      </div>
    </main>
  );
}
