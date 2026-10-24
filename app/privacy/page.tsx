import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy · Keywave",
};

const REPO = "https://github.com/WebDevAmey/keystokes";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: October 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-zinc-400">
          <section>
            <h2 className="text-base font-medium text-white">The short version</h2>
            <p className="mt-2">
              Keywave has no accounts, no analytics, no cookies, and no backend.
              Everything it remembers stays in your browser. Your typed text never
              leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white">What is stored, and where</h2>
            <p className="mt-2">
              Two values in your browser&apos;s localStorage, both on your device
              only:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <code className="text-zinc-300">keywave.prefs.v1</code>: your chosen
                keyboard style, sound on/off, volume level, and keystroke sound
                profile.
              </li>
              <li>
                <code className="text-zinc-300">keywave.mappings.v1</code>: which
                sound you assigned to which key in the studio.
              </li>
            </ul>
            <p className="mt-2">
              Clearing your browser data removes both. Nothing else is written.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white">What is not collected</h2>
            <p className="mt-2">
              No email, no name, no account identifier, no keystroke logs, no
              location, no cookies, no third-party analytics or ads. The typing test
              processes your text in the page and discards it when you restart.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white">Third parties</h2>
            <p className="mt-2">
              The app is static files. Fonts (Geist) are self-hosted with the app, so
              your browser makes no font requests to Google. Sound effects ship with
              the app: the switch sample plus SoundCN sounds (mostly CC0; see each
              file&apos;s license field in the repo). GitHub hosts the source code
              and, if you open an issue, receives whatever you write in it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-white">Contact</h2>
            <p className="mt-2">
              To ask about or delete anything:{" "}
              <a
                href={`${REPO}/issues`}
                className="text-violet-300 underline decoration-white/20 underline-offset-2"
              >
                open an issue on GitHub
              </a>
              . This page is a good-faith draft by the maker and should get a
              lawyer&apos;s review before a public release.
            </p>
          </section>
        </div>
      </article>
      <div className="mx-auto max-w-2xl px-5 pb-10 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}
