import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms · Keywave",
};

const REPO = "https://github.com/WebDevAmey/keystokes";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-kw-bg text-kw-text">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] font-normal leading-[1.05] tracking-[-0.02em] text-kw-text">Terms of Service</h1>
        <p className="mt-2 text-sm text-kw-subtle">Last updated: October 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-kw-muted">
          <section>
            <h2 className="text-base font-medium text-kw-text">1. What Keywave is</h2>
            <p className="mt-2">
              Keywave is a free, browser-based keyboard playground: a typing test and
              a sound studio. It is an early build of a personal project. You do not
              need an account, and there is nothing to buy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-kw-text">2. Use it as-is</h2>
            <p className="mt-2">
              The service is provided &quot;as is&quot; without warranties of any
              kind. Scores, sounds, and mappings are for fun and practice; do not
              rely on them for anything formal. We may change or remove features at
              any time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-kw-text">3. Your input</h2>
            <p className="mt-2">
              Keywave stores your preferences and key-to-sound mappings in your own
              browser&apos;s local storage. Nothing you type in the test is sent
              anywhere; there is no server that receives your keystrokes. See the{" "}
              <a href="/privacy" className="text-kw-text underline decoration-white/20 underline-offset-2">
                Privacy Policy
              </a>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-kw-text">4. Fair play</h2>
            <p className="mt-2">
              Don&apos;t attempt to disrupt the service, scrape it in a way that
              harms it, or use it for anything unlawful. That&apos;s the whole rule.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-kw-text">5. Contact</h2>
            <p className="mt-2">
              Questions or problems:{" "}
              <a
                href={`${REPO}/issues`}
                className="text-kw-text underline decoration-white/20 underline-offset-2"
              >
                open an issue on GitHub
              </a>
              . This page is a good-faith draft written by the maker, not legal
              advice; have a qualified lawyer review it before treating Keywave as a
              real release.
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
