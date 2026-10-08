"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icons } from "./icons";
import { useTheme } from "./ThemeProvider";
import Piggy from "./Piggy";

const links = [
  { href: "/", label: "首页" },
  { href: "/schedule", label: "课表" },
  { href: "/courses", label: "课程" },
  { href: "/todos", label: "待办" },
  { href: "/journal", label: "日记" },
  { href: "/deadlines", label: "截止日期" },
  { href: "/search", label: "搜索" },
  { href: "/settings", label: "设置" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sticky top-0 z-40 border-b-2 border-ink/70 bg-cream/85 backdrop-blur-md dark:border-ink/20 dark:bg-night-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="animate-bob drop-shadow-[0_2px_0_var(--color-ink)]">
            <Piggy className="h-10 w-10 transition-transform group-hover:scale-110" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-wide">
              飞猪多
              <span className="ml-1.5 align-middle text-[10px] font-black uppercase tracking-widest text-ink/50 dark:text-ink/40">
                workspace
              </span>
            </span>
            <span className="block text-[11px] font-semibold text-ink/50 dark:text-ink/40">
              每天醒来的第一页 ☀️
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-all ${
                isActive(l.href)
                  ? "border-ink bg-gradient-to-r from-candy-500 to-peachy-400 text-white shadow-[2px_2px_0_0_var(--color-ink)] -translate-y-0.5"
                  : "border-transparent text-ink/70 hover:-translate-y-0.5 hover:bg-candy-100 hover:text-ink dark:text-ink/60 dark:hover:bg-night-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink/70 text-ink/70 transition hover:-translate-y-0.5 hover:border-sunny-400 hover:text-sunny-500 dark:border-ink/30 dark:hover:border-sunny-500"
            aria-label="切换主题"
          >
            {theme === "dark" ? Icons.sun : Icons.moon}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink/70 text-ink/70 transition hover:-translate-y-0.5 dark:border-ink/30 md:hidden"
            aria-label="菜单"
          >
            {open ? Icons.close : Icons.menu}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t-2 border-ink/20 bg-card px-4 py-3 md:hidden dark:border-ink/10">
          <div className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl border-2 px-3 py-2 text-sm font-bold transition ${
                  isActive(l.href)
                    ? "border-ink bg-gradient-to-r from-candy-500 to-peachy-400 text-white shadow-[2px_2px_0_0_var(--color-ink)]"
                    : "border-ink/40 text-ink/70"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}