"use client";

import { useEffect, useState } from "react";
import { readCollection } from "@/lib/store";
import type { PomodoroLog, RoutineLog } from "@/lib/schema";

const LEVELS = [
  { at: 0, emoji: "🥚", title: "猪崽" },
  { at: 20, emoji: "🐷", title: "小粉猪" },
  { at: 60, emoji: "🐽", title: "扑腾小猪" },
  { at: 120, emoji: "🐷🚀", title: "飞飞猪" },
  { at: 220, emoji: "🌈🐷", title: "云上飞猪" },
  { at: 360, emoji: "🌠", title: "飞猪大师" },
  { at: 560, emoji: "🦸", title: "飞猪侠" },
  { at: 820, emoji: "👑", title: "飞猪王" },
];

interface PiggyState {
  xp: number;
  level: number;
  next: number;
  progress: number;
  emoji: string;
  title: string;
}

function compute(): PiggyState {
  const minutes = readCollection<PomodoroLog>("pomodoro_logs").reduce(
    (sum, l) => sum + (Number(l.duration_min) || 0),
    0
  );
  const checks = readCollection<RoutineLog>("routineLogs").length;
  const xp = Math.round(minutes) + checks;
  let level = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].at) level = i;
  const cur = LEVELS[level];
  const next = LEVELS[level + 1];
  const progress = next
    ? Math.min(1, (xp - cur.at) / (next.at - cur.at))
    : 1;
  return { xp, level, next: next?.at ?? cur.at, progress, emoji: cur.emoji, title: cur.title };
}

export default function PiggyLevel() {
  const [state, setState] = useState<PiggyState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(compute());
  }, []);

  if (!state) return null;

  return (
    <div className="animate-pop-in rounded-2xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_0_var(--color-ink)]">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{state.emoji}</span>
        <div>
          <div className="text-sm font-extrabold leading-tight">{state.title}</div>
          <div className="text-[10px] font-black text-ink/45 dark:text-ink/35">
            LV.{state.level + 1} · {state.xp} XP
          </div>
        </div>
      </div>
      <div className="mt-2 h-2.5 w-36 overflow-hidden rounded-full border-2 border-ink/40 bg-cream dark:bg-night-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint-400 via-sunny-300 to-candy-400 transition-all duration-700"
          style={{ width: `${Math.round(state.progress * 100)}%` }}
        />
      </div>
      {state.progress < 1 && (
        <div className="mt-1 text-right text-[10px] font-bold text-ink/40 dark:text-ink/30">
          还差 {state.next - state.xp} XP 升级
        </div>
      )}
    </div>
  );
}