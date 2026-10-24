import Link from "next/link";

const REPO = "https://github.com/WebDevAmey/keystokes";

export default function SiteFooter() {
  return (
    <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[11px] text-zinc-400">
      <span className="flex items-center gap-3">
        <span>KEYWAVE STUDIO · EARLY BUILD</span>
        <Link href="/terms" className="transition hover:text-zinc-300">
          Terms
        </Link>
        <Link href="/privacy" className="transition hover:text-zinc-300">
          Privacy
        </Link>
      </span>
      <span>
        Questions?{" "}
        <a
          href={`${REPO}/issues`}
          className="underline decoration-white/20 underline-offset-2 transition hover:text-zinc-300"
        >
          Open an issue
        </a>
      </span>
    </footer>
  );
}
