"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { readCollection } from "@/lib/store";
import type { PomodoroLog, RoutineLog } from "@/lib/schema";

const WEEKDAY = ["一", "二", "三", "四", "五", "六", "日"];

function localDay(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const HEAT = {
  none: "bg-ink/10 dark:bg-ink/10",
  low: "bg-sky-300/70",
  mid: "bg-mint-300",
  high: "bg-sunny-300",
  peak: "bg-candy-400",
} as const;

function heatClass(min: number): string {
  if (min <= 0) return HEAT.none;
  if (min < 30) return HEAT.low;
  if (min < 60) return HEAT.mid;
  if (min < 90) return HEAT.high;
  return HEAT.peak;
}

interface Stats {
  totalMin: number;
  sessions: number;
  todayMin: number;
  longestStreak: number;
  activeDays: number;
  routineDays: number;
  daily: Array<{ date: string; min: number }>;
  heat: Array<{ date: string; min: number }>;
}

function compute(): Stats {
  const logs = readCollection<PomodoroLog>("pomodoro_logs");
  const routineLogs = readCollection<RoutineLog>("routineLogs");

  const byDay = new Map<string, number>();
  for (const l of logs) {
    const key = localDay(l.started_at);
    byDay.set(key, (byDay.get(key) ?? 0) + (Number(l.duration_min) || 0));
  }

  const totalMin = Math.round([...byDay.values()].reduce((a, b) => a + b, 0));
  const todayMin = byDay.get(localDay(new Date().toISOString())) ?? 0;
  const sessions = logs.length;

  let best = 0;
  let run = 0;
  for (let i = 0; i < 400; i++) {
    const key = new Date();
    key.setDate(key.getDate() - i);
    const has = (byDay.get(localDay(key.toISOString())) ?? 0) > 0;
    if (has) run++;
    else {
      best = Math.max(best, run);
      run = 0;
    }
  }
  best = Math.max(best, run);

  const daily: Array<{ date: string; min: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const key = new Date();
    key.setDate(key.getDate() - i);
    const date = localDay(key.toISOString());
    daily.push({ date, min: byDay.get(date) ?? 0 });
  }

  const heat: Array<{ date: string; min: number }> = [];
  for (let i = 97; i >= 0; i--) {
    const key = new Date();
    key.setDate(key.getDate() - i);
    const date = localDay(key.toISOString());
    heat.push({ date, min: byDay.get(date) ?? 0 });
  }

  const activeDays = heat.filter((h) => h.min > 0).length;
  const routineDays = new Set(routineLogs.map((r) => r.date)).size;

  return { totalMin, sessions, todayMin, longestStreak: best, activeDays, routineDays, daily, heat };
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(compute());
  }, []);

  const maxDay = useMemo(() => Math.max(...(stats?.daily.map((d) => d.min) ?? [1]), 1), [stats]);

  if (!stats) return null;

  const chips = [
    { emoji: "🍅", label: "累计专注", value: `${stats.totalMin} 分` },
    { emoji: "🧩", label: "专注次数", value: `${stats.sessions} 次` },
    { emoji: "🌈", label: "今日专注", value: `${stats.todayMin} 分` },
    { emoji: "🔥", label: "最长连续", value: `${stats.longestStreak} 天` },
    { emoji: "🌊", label: "活跃天数", value: `${stats.activeDays} 天` },
    { emoji: "🐷", label: "例行记录", value: `${stats.routineDays} 天` },
  ];

  return (
    <div className="animate-pop-in space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-ink bg-gradient-to-tr from-candy-400 to-sunny-300 text-2xl shadow-[2px_2px_0_0_var(--color-ink)]">
          📊
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">学习小数据</h1>
          <p className="text-sm font-semibold text-ink/50 dark:text-ink/40">
            全靠自己积累，一点一滴都算数 ✨
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {chips.map((c) => (
          <Card key={c.label} className="text-center">
            <div className="text-2xl">{c.emoji}</div>
            <div className="mt-1 text-xl font-extrabold leading-none">{c.value}</div>
            <div className="mt-1 text-[11px] font-bold text-ink/45 dark:text-ink/35">{c.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-extrabold">最近 7 天专注</h2>
        <div className="mt-4 flex h-44 items-end gap-2 sm:gap-3">
          {stats.daily.map((d, i) => {
            const day = new Date(d.date + "T00:00:00");
            const isToday = i === stats.daily.length - 1;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-extrabold">{d.min > 0 ? `${d.min}′` : ""}</span>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={`w-full rounded-t-xl border-2 border-b-0 border-ink transition-all duration-500 ${
                      isToday
                        ? "bg-gradient-to-t from-candy-500 to-sunny-300"
                        : "bg-gradient-to-t from-sky-400 to-mint-300"
                    }`}
                    style={{
                      height: `${Math.max(6, (d.min / maxDay) * 100)}%`,
                      minHeight: d.min > 0 ? 6 : 4,
                      opacity: d.min > 0 ? 1 : 0.35,
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-black ${isToday ? "text-candy-500 dark:text-sunny-300" : "text-ink/40 dark:text-ink/30"}`}
                >
                  {isToday ? "今" : WEEKDAY[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold">最近 98 天活跃热力图</h2>
        <p className="mt-0.5 text-xs font-semibold text-ink/45 dark:text-ink/35">
          格子越亮，当天专注越多；灰色=没开番茄。
        </p>
        <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
          {stats.heat.map((h) => (
            <div
              key={h.date}
              title={`${h.date} · ${h.min} 分钟`}
              className={`h-4 w-4 rounded-[5px] border border-transparent transition-transform hover:scale-150 ${heatClass(h.min)}`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-ink/40 dark:text-ink/30">
          <span>少</span>
          {Object.values(HEAT).map((c) => (
            <span key={c} className={`h-3 w-3 rounded-[4px] border border-ink/20 ${c}`} />
          ))}
          <span>多</span>
        </div>
      </Card>
    </div>
  );
}