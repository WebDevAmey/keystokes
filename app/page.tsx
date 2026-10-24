import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import GlyphBand from "@/components/site/glyph-band";
import ThemeChips from "@/components/site/theme-chips";
import SoundDemoButton from "@/components/site/sound-demo-button";
import KeyboardSwitcher from "@/components/studio/KeyboardSwitcher";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import {
  SoundProfileSelect,
  SoundToggle,
  VolumeSlider,
} from "@/components/studio/sound-controls";

const PHILOSOPHY = [
  {
    label: "Input",
    text: "One window-level listener mirrors your keyboard and skips text fields, so typing stays typing. Pointer, touch, and hardware keys resolve into the same key states, and browser shortcuts like ⌘R and ⌘W pass through untouched.",
  },
  {
    label: "Audio",
    text: "A single Web Audio context, created only after a real press. Samples load lazily, volume and mute reflect the live engine, and a failed load leaves the keyboard fully playable.",
  },
  {
    label: "States",
    text: "Keys track down and up across click, touch, and hardware input, then release on blur or tab switch so nothing sticks. The same states drive the sound, the highlight, and the badge.",
  },
] as const;

function SectionHeading({
  index,
  label,
  title,
  copy,
}: {
  index: string;
  label: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
      <p className="kw-eyebrow pt-2">
        {index} / {label}
      </p>
      <div>
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-kw-text">
          {title}
        </h2>
        {copy && (
          <p className="mt-4 max-w-[58ch] text-sm leading-6 text-kw-muted">
            {copy}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader right={<AudioStatusPill />} />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-10 sm:px-8 sm:pt-24 sm:pb-14 lg:pt-28">
          <h1 className="font-display text-[clamp(3.25rem,7vw,7rem)] leading-[0.98] tracking-[-0.045em] text-kw-text">
            Press a key.
            <br />
            Hear it answer.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[15px] leading-7 text-kw-muted">
            Keywave mirrors your physical keyboard key for key, puts real
            switch sounds under every cap, and lets you remap the board with
            notes and samples. Take a timed typing test, or open the studio and
            play it like an instrument.
          </p>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <a href="#experience" className="kw-btn kw-btn-primary">
                Try the keyboard
                <span aria-hidden>→</span>
              </a>
              <Link href="/studio" className="kw-btn kw-btn-secondary">
                Open the studio
              </Link>
            </div>
            <p className="kw-eyebrow sm:text-right">
              • ⌘R and ⌘W pass through
            </p>
          </div>
        </section>

        {/* Signature glyph texture */}
        <GlyphBand />

        {/* 01 — The experience */}
        <section
          id="experience"
          className="mx-auto max-w-6xl scroll-mt-14 px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-24"
        >
          <SectionHeading
            index="01"
            label="experience"
            title="Three boards, one keystroke away."
            copy="MacBook, Keychron, or the registry layout: pick a board and it follows every key you press. Click a cap, type on your real keyboard, and watch both move in step."
          />
          <div className="mt-10">
            <KeyboardSwitcher />
          </div>
        </section>

        {/* 02 — Sound and tactility */}
        <section
          id="sounds"
          className="mx-auto max-w-6xl scroll-mt-14 border-t border-kw-border px-5 py-16 sm:px-8 sm:py-24"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <p className="kw-eyebrow">02 / sound</p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-kw-text">
                Real switches, under every cap.
              </h2>
              <p className="mt-4 max-w-[54ch] text-sm leading-6 text-kw-muted">
                Every key plays a recorded switch sample, loaded once and
                shared by the whole app. Sound wakes on your first press, then
                stays in your hands: mute it, set the level, pick a profile. In
                the studio, mapped keys carry a badge showing what they will
                play.
              </p>
              <SoundDemoButton className="mt-7" />
            </div>

            <div className="rounded-xl border border-kw-border bg-kw-surface/50 p-5">
              <SoundToggle />
              <VolumeSlider className="mt-4" />
              <SoundProfileSelect className="mt-4" />
              <p className="mt-5 border-t border-kw-border pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-kw-subtle">
                samples from soundcn · one shared engine
              </p>
            </div>
          </div>
        </section>

        {/* 03 — Customisation */}
        <section
          id="customise"
          className="mx-auto max-w-6xl scroll-mt-14 border-t border-kw-border px-5 py-16 sm:px-8 sm:py-24"
        >
          <SectionHeading
            index="03"
            label="customise"
            title="Colourways and per-key maps."
            copy="Six Keychron colourways: choosing one switches the board above and applies the set. Layout and sound controls sit with the keyboard; per-key note and sample mapping lives in the studio."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10">
            <span aria-hidden className="hidden md:block" />
            <div>
              <ThemeChips />
            </div>
          </div>
        </section>

        {/* 04 — Technical philosophy */}
        <section
          id="about"
          className="mx-auto max-w-6xl scroll-mt-14 border-t border-kw-border px-5 py-16 sm:px-8 sm:py-24"
        >
          <p className="kw-eyebrow">04 / about</p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-kw-text">
            Built like an instrument.
          </h2>

          <dl className="mt-10 border-y border-kw-border">
            {PHILOSOPHY.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 border-t border-kw-border py-6 first:border-t-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10"
              >
                <dt className="kw-eyebrow pt-1">{row.label}</dt>
                <dd className="max-w-[62ch] text-sm leading-6 text-kw-muted">
                  {row.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Closing */}
        <section className="border-t border-kw-border px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1] tracking-[-0.03em] text-kw-text">
              Press something.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="kw-btn kw-btn-primary">
                Open the studio
              </Link>
              <Link href="/test" className="kw-btn kw-btn-secondary">
                Take the type test
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
