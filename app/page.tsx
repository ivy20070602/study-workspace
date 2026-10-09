"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TodayOverview from "@/components/dashboard/TodayOverview";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import RoutinePanel from "@/components/wakeup/RoutinePanel";
import PiggyLevel from "@/components/wakeup/PiggyLevel";
import SnapDots from "@/components/wakeup/SnapDots";
import Insights from "@/components/dashboard/Insights";
import ExamCountdown from "@/components/deadlines/ExamCountdown";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
  }, []);

  const goTo = (id: string) => {
    containerRef.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollRail = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div>
      <SnapDots containerRef={containerRef} />
      <div
        ref={containerRef}
        className="relative h-[calc(100dvh-7rem)] snap-y snap-mandatory space-y-8 overflow-y-auto overflow-x-hidden scroll-smooth pb-10 pr-2"
      >
        {/* ===== 封面 ===== */}
        <section
          id="cover"
          className="relative flex min-h-full snap-start flex-col items-center justify-center overflow-hidden rounded-[36px] border-2 border-ink bg-gradient-to-br from-sunny-200 via-candy-100 to-sky-200 px-4 py-12 text-center shadow-[6px_6px_0_0_var(--color-ink)] dark:from-night-700 dark:via-night-800 dark:to-night-600"
        >
          <div className="pointer-events-none absolute -left-16 top-12 h-44 w-44 animate-blob rounded-full bg-white/70 blur-2xl dark:bg-night-500/30" />
          <div className="pointer-events-none absolute -right-14 bottom-10 h-44 w-44 animate-blob rounded-full bg-white/60 blur-2xl [animation-delay:-6s] dark:bg-night-500/25" />
          <div className="pointer-events-none absolute right-[12%] top-[10%] animate-sparkle text-4xl opacity-60 sm:text-5xl">✨</div>
          <div className="pointer-events-none absolute left-[10%] top-[18%] animate-sparkle text-3xl opacity-40 [animation-delay:-0.9s] sm:text-4xl">⭐</div>
          <div className="pointer-events-none absolute left-[20%] bottom-[16%] animate-float-slow text-4xl opacity-50 sm:text-5xl">💖</div>
          <div className="absolute right-4 top-4 z-10">
            <PiggyLevel />
          </div>

          <div className="relative z-10 animate-pop-in rounded-full border-2 border-ink bg-card px-4 py-1.5 text-sm font-black shadow-[2px_2px_0_0_var(--color-ink)]">
            <span className="inline-block animate-wiggle">☀️</span>{" "}
            {now ? greetingFor(now.getHours()) : "早上好"} · Wake-Up
          </div>

          <Piggy className="relative z-10 mt-6 h-40 w-40 animate-bob drop-shadow-[4px_6px_0_var(--color-ink)] sm:h-52 sm:w-52" />

          <h1 className="relative z-10 mt-6 text-6xl font-black tracking-wide sm:text-7xl">
            {"飞猪多".split("").map((ch, i) => (
              <span
                key={i}
                className="inline-block animate-pop-in"
                style={{ animationDelay: `${120 + i * 130}ms` }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <p className="relative z-10 mt-1 text-xs font-black uppercase tracking-[0.4em] text-ink/50 dark:text-ink/40">
            Study Workspace
          </p>

          <p className="relative z-10 mt-5 max-w-md text-base font-bold text-ink/60 dark:text-ink/50">
            {now
              ? `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${WEEK[now.getDay()]} · ${
                  PUNCHLINES[now.getDate() % PUNCHLINES.length]
                }`
              : PUNCHLINES[1]}
          </p>

          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => goTo("routine")}
              className="rounded-full border-2 border-ink bg-gradient-to-r from-candy-500 to-peachy-400 px-7 py-3 text-lg font-black text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-y-1 active:shadow-none"
            >
              进入工作台 🚀
            </button>
            <button
              onClick={() => goTo("rail")}
              className="rounded-full border-2 border-ink bg-card px-6 py-3 text-lg font-black shadow-[3px_3px_0_0_var(--color-ink)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-y-1 active:shadow-none"
            >
              滑梯探险 🛝
            </button>
          </div>

          <button
            onClick={() => goTo("routine")}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-bounce text-2xl text-ink/60 transition hover:text-candy-500"
            aria-label="向下滑动"
          >
            ↓
          </button>
        </section>

        {/* ===== 今日例行 ===== */}
        <Reveal id="routine" className="snap-start scroll-mt-2">
          <RoutinePanel />
        </Reveal>

        {/* ===== 学习小数据 + 考试倒计时 ===== */}
        <Reveal id="insights" variant="up" className="snap-start scroll-mt-2">
          <div className="space-y-4">
            <ExamCountdown />
            <Insights />
          </div>
        </Reveal>

        {/* ===== 模块滑梯 ===== */}
        <Reveal id="rail" variant="left" className="snap-start scroll-mt-2">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
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

        {/* ===== 今日一览 ===== */}
        <div id="overview" className="grid snap-start gap-4 scroll-mt-2 lg:grid-cols-[1fr_320px]">
          <Reveal delay={80}>
            <TodayOverview />
          </Reveal>
          <Reveal delay={160} variant="right">
            <PomodoroTimer />
          </Reveal>
        </div>

        {/* ===== 一句鸡汤 ===== */}
        <Reveal id="quote" variant="zoom" className="snap-start scroll-mt-2">
          <Card className="text-center">
            <p className="animate-wiggle text-2xl">💛</p>
            <p className="mt-1 text-sm font-bold text-ink/60 dark:text-ink/50">
              万物皆有裂痕，那是光照进来的地方
            </p>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}