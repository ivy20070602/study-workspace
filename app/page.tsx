"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TodayOverview from "@/components/dashboard/TodayOverview";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import RoutinePanel from "@/components/wakeup/RoutinePanel";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import Piggy from "@/components/layout/Piggy";

const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const PUNCHLINES = [
  "今天也要元气满满呀！",
  "慢慢来，比较快 🐷",
  "先完成，再完美！",
  "按时吃饭，记得喝水～",
  "你今天真好看 ✨",
  "小步子，也能走到很远的远方。",
  "爱笑的人，运气不会太差 😄",
  "把今天过好，就是最好的未来。",
];

const quickLinks = [
  { href: "/schedule", label: "课表", desc: "看看今天的课", icon: "📅", grad: "from-sky-400 to-grape-400" },
  { href: "/courses", label: "课程", desc: "笔记 · 课件 · 练习", icon: "📚", grad: "from-candy-500 to-peachy-400" },
  { href: "/todos", label: "待办", desc: "要完成的小事", icon: "✅", grad: "from-sunny-400 to-peachy-400" },
  { href: "/deadlines", label: "截止日期", desc: "作业 · 考试提醒", icon: "⏰", grad: "from-grape-400 to-candy-500" },
  { href: "/journal", label: "日记", desc: "记录今天的学习", icon: "📓", grad: "from-mint-400 to-sky-400" },
  { href: "/search", label: "全局搜索", desc: "一搜即达", icon: "🔍", grad: "from-peachy-400 to-sunny-300" },
];

function greetingFor(hour: number): string {
  if (hour < 5) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  const scrollRail = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="animate-pop-in space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border-2 border-ink bg-gradient-to-br from-sunny-200 via-candy-100 to-peachy-200 p-6 shadow-[5px_5px_0_0_var(--color-ink)] dark:from-night-700 dark:via-night-800 dark:to-night-700">
        <div className="pointer-events-none absolute -right-6 -top-10 text-7xl opacity-40">☁️</div>
        <div className="pointer-events-none absolute right-24 bottom-4 animate-sparkle text-2xl">✨</div>

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-3 py-1 text-sm font-black shadow-[2px_2px_0_0_var(--color-ink)]">
              <span className="animate-wiggle">☀️</span>
              Wake-Up
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              {greetingFor(now?.getHours() ?? 9)}，飞猪多！
            </h1>
            <p className="mt-2 text-base font-bold text-ink/60 dark:text-ink/50">
              {now
                ? `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${WEEK[now.getDay()]} · ${
                    PUNCHLINES[now.getDate() % PUNCHLINES.length]
                  }`
                : PUNCHLINES[1]}
            </p>
          </div>

          <div className="shrink-0 group">
            <Piggy className="h-36 w-36 animate-bob drop-shadow-[3px_5px_0_var(--color-ink)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 sm:h-44 sm:w-44" />
          </div>
        </div>
      </section>

      <Reveal>
        <RoutinePanel />
      </Reveal>

      <Reveal variant="left">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">模块滑梯</h2>
              <p className="text-xs font-semibold text-ink/50 dark:text-ink/40">
                左右滑动（可吸附），滑到哪进哪 🛝
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollRail(-1)}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-card text-lg font-black shadow-[2px_2px_0_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:border-sky-400"
                aria-label="向左滑动"
              >
                ←
              </button>
              <button
                onClick={() => scrollRail(1)}
                className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-card text-lg font-black shadow-[2px_2px_0_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:border-candy-400"
                aria-label="向右滑动"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {quickLinks.map((q, i) => (
              <Link key={q.href} href={q.href} className="shrink-0 snap-start">
                <Reveal delay={i * 70} variant="up">
                  <div
                    className={`group w-64 rounded-3xl border-2 border-ink bg-gradient-to-br ${q.grad} p-5 text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-all duration-200 hover:-translate-y-1.5 hover:rotate-1 hover:shadow-[6px_6px_0_0_var(--color-ink)]`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="inline-block text-4xl transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6">
                        {q.icon}
                      </div>
                      <span className="rounded-full border-2 border-ink/30 bg-white/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        tap
                      </span>
                    </div>
                    <div className="mt-3 text-xl font-extrabold drop-shadow-[0_1.5px_0_rgba(43,26,63,0.55)]">
                      {q.label}
                    </div>
                    <div className="text-xs font-semibold text-white/85">{q.desc}</div>
                  </div>
                </Reveal>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Reveal delay={80}>
          <TodayOverview />
        </Reveal>
        <Reveal delay={160} variant="right">
          <PomodoroTimer />
        </Reveal>
      </div>

      <Reveal variant="zoom">
        <Card className="mt-4 text-center">
          <p className="animate-wiggle text-2xl">💛</p>
          <p className="mt-1 text-sm font-bold text-ink/60 dark:text-ink/50">
            万物皆有裂痕，那是光照进来的地方
          </p>
        </Card>
      </Reveal>
    </div>
  );
}