"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

const DOTS = [
  { id: "cover", label: "封面" },
  { id: "routine", label: "今日例行" },
  { id: "rail", label: "模块滑梯" },
  { id: "overview", label: "今日一览" },
  { id: "quote", label: "一句鸡汤" },
];

export default function SnapDots({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const sections = DOTS.map((d) => c.querySelector<HTMLElement>(`#${d.id}`)).filter(
      (s): s is HTMLElement => s !== null
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = sections.findIndex((s) => s === e.target);
            if (idx >= 0) setActive(idx);
          }
        }
      },
      { root: c, threshold: 0.55 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [containerRef]);

  const go = (id: string) => {
    containerRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2.5">
      {DOTS.map((d, i) => (
        <button
          key={d.id}
          onClick={() => go(d.id)}
          title={d.label}
          aria-label={`跳到：${d.label}`}
          className={`rounded-full border-2 transition-all duration-300 ${
            active === i
              ? "h-8 w-3 border-ink bg-gradient-to-b from-candy-400 to-sunny-400 shadow-[1px_2px_0_0_var(--color-ink)]"
              : "h-3 w-3 border-ink/40 bg-card hover:scale-125 hover:border-candy-400"
          }`}
        />
      ))}
    </div>
  );
}