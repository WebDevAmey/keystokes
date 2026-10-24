import Link from "next/link";

const REPO = "https://github.com/WebDevAmey/keystokes";

export default function SiteFooter() {
  return (
    <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-kw-border pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-kw-subtle">
      <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span>keywave studio · early build</span>
        <Link href="/terms" className="transition-colors hover:text-kw-muted">
          Terms
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-kw-muted">
          Privacy
        </Link>
      </span>
      <span className="flex items-center gap-x-5 gap-y-2">
        <a
          href={`${REPO}/issues`}
          className="transition-colors hover:text-kw-muted"
        >
          Open an issue
        </a>
      </span>
    </footer>
  );
}
