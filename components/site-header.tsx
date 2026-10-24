"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { hydrateStudioPrefs } from "@/lib/studio-store";
import { useEffect } from "react";

const NAV = [
  { href: "/test", label: "Type Test" },
  { href: "/studio", label: "Sound Studio" },
] as const;

export default function SiteHeader({ right }: { right?: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    hydrateStudioPrefs();
  }, []);

  return (
    <header className="border-b border-white/[0.07]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">
            <AudioLines className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">keywave</span>
            <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              studio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/30 p-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                  active
                    ? "bg-violet-500 text-white shadow-[0_1px_6px_rgba(124,58,237,0.45)]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {right}
      </div>
    </header>
  );
}
