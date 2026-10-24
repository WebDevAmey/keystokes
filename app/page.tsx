import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import KeyboardSwitcher from "@/components/studio/KeyboardSwitcher";
import { Keyboard as KeyboardIcon, Music4 } from "lucide-react";

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
      "Map musical notes, percussion, and SoundCN effects onto individual keys, then play your keyboard like an instrument.",
    icon: Music4,
    cta: "Open the studio",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader right={<AudioStatusPill />} />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Make every
            <br />
            keystroke <span className="text-violet-300">sound.</span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-zinc-400 sm:text-base">
            Three keyboards that mirror your physical one, real switch samples
            under every cap. Press a key below, then pick your way to play:
            a typing test, or a studio that maps notes to keys.
          </p>
        </div>

        {/* The product, in the first screen: a live keyboard. */}
        <section aria-label="Live keyboard" className="mt-10">
          <KeyboardSwitcher />
        </section>

        <section aria-label="Where to go next" className="mt-14 grid items-stretch gap-5 md:grid-cols-2">
          {EXPERIENCES.map((experience) => (
            <Link
              key={experience.href}
              href={experience.href}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:border-violet-400/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:p-8"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
                <experience.icon className="h-5 w-5 text-violet-300" aria-hidden />
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
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
