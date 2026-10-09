"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { readCollection } from "@/lib/store";
import type { Exercise, JournalEntry, Note, PomodoroLog, Todo } from "@/lib/schema";

function localDay(iso: string): string {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function offsetDay(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

interface Insights {
  weekMin: number;
  todayMin: number;
  streak: number;
  notes: number;
  exDone: number;
  exTotal: number;
  todoDone: number;
  todoTotal: number;
  journal: number;
}

function compute(): Insights {
  const logs = readCollection<PomodoroLog>("pomodoro_logs");
  const notes = readCollection<Note>("notes");
  const exercises = readCollection<Exercise>("exercises");
  const todos = readCollection<Todo>("todos");
  const journal = readCollection<JournalEntry>("journal");

  const byDay = new Map<string, number>();
  for (const l of logs) {
    const key = localDay(l.started_at);
    byDay.set(key, (byDay.get(key) ?? 0) + (Number(l.duration_min) || 0));
  }

  let weekMin = 0;
  for (let i = -6; i <= 0; i++) weekMin += byDay.get(offsetDay(i)) ?? 0;
  const todayMin = byDay.get(offsetDay(0)) ?? 0;

  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if ((byDay.get(offsetDay(-i)) ?? 0) > 0) streak++;
    else if (i > 0) break;
  }

  const exDone = exercises.filter((e) => e.is_done).length;
  const todoDone = todos.filter((t) => t.is_done).length;

  return {
    weekMin,
    todayMin,
    streak,
    notes: notes.length,
    exDone,
    exTotal: exercises.length,
    todoDone,
    todoTotal: todos.length,
    journal: journal.length,
  };
}

export default function Insights() {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(compute());
  }, []);

  if (!data) return null;

  const chips: Array<{ emoji: string; label: string; value: string; tint: string }> = [
    { emoji: "🍅", label: "今日专注", value: `${data.todayMin} 分钟`, tint: "border-candy-300 bg-candy-50 dark:bg-night-700" },
    { emoji: "📆", label: "本周专注", value: `${data.weekMin} 分钟`, tint: "border-sunny-300 bg-sunny-50 dark:bg-night-700" },
    { emoji: "🔥", label: "连续专注", value: `${data.streak} 天`, tint: "border-peachy-300 bg-peachy-200/40 dark:bg-night-700" },
    { emoji: "📝", label: "笔记", value: `${data.notes} 篇`, tint: "border-sky-300 bg-sky-200/40 dark:bg-night-700" },
    { emoji: "✍️", label: "练习", value: `${data.exDone}/${data.exTotal}`, tint: "border-grape-300 bg-grape-200/40 dark:bg-night-700" },
    { emoji: "✅", label: "待办", value: `${data.todoDone}/${data.todoTotal}`, tint: "border-mint-300 bg-mint-200/40 dark:bg-night-700" },
    { emoji: "📗", label: "日记", value: `${data.journal} 篇`, tint: "border-sunny-300 bg-sunny-200/40 dark:bg-night-700" },
  ];

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold">学习小数据</h2>
        <Link
          href="/stats"
          className="rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-black shadow-[1.5px_1.5px_0_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-sunny-200"
        >
          全部数据 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {chips.map((c) => (
          <div
            key={c.label}
            className={`flex flex-col items-center rounded-2xl border-2 border-ink/30 px-2 py-3 text-center transition hover:-translate-y-0.5 ${c.tint}`}
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="mt-0.5 text-base font-extrabold leading-none">{c.value}</span>
            <span className="mt-1 text-[10px] font-bold text-ink/45 dark:text-ink/35">{c.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}