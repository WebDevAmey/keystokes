"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hydrateStudioPrefs } from "@/lib/studio-store";

const NAV = [
  { href: "/test", label: "Type test" },
  { href: "/studio", label: "Sound studio" },
  { href: "/#about", label: "About" },
] as const;

function Wordmark() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kw-text"
    >
      <AudioLines
        className="h-4 w-4 text-kw-subtle transition-colors group-hover:text-kw-text"
        aria-hidden
      />
      <span className="text-[15px] font-medium tracking-[-0.02em] text-kw-text">
        keywave
      </span>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-kw-subtle sm:inline">
        studio
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  active,
  className,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kw-text",
        active
          ? "text-kw-text"
          : "text-kw-subtle hover:text-kw-muted",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader({ right }: { right?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    hydrateStudioPrefs();
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-kw-border bg-kw-bg"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden lg:flex">{right}</span>
          <Link href="/studio" className="kw-btn kw-btn-primary hidden px-4 py-2 md:inline-flex">
            Open studio
          </Link>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-kw-border text-kw-muted transition-colors hover:text-kw-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kw-text md:hidden"
            aria-expanded={open}
            aria-controls="kw-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="h-4 w-4" aria-hidden />
            ) : (
              <Menu className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="kw-mobile-nav"
          aria-label="Primary mobile"
          className="border-t border-kw-border px-5 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={pathname === item.href}
                onClick={() => setOpen(false)}
                className="w-fit"
              />
            ))}
            {right}
            <Link
              href="/studio"
              className="kw-btn kw-btn-primary mt-1 w-full"
              onClick={() => setOpen(false)}
            >
              Open studio
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
