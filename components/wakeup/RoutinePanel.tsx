"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { nowIso, useRepo } from "@/lib/store";
import type { Routine } from "@/lib/schema";

const EMOJIS = ["📚", "🏃", "💪", "🍎", "💤", "🧘", "📖", "🎧", "🧠", "💊", "🌅", "🦷"];

const SUGGESTIONS: Array<[string, string]> = [
  ["💧", "喝水"],
  ["🏃", "运动"],
  ["📖", "背单词"],
  ["🎧", "练听力"],
  ["🧠", "复盘"],
  ["📓", "写日记"],
  ["🧘", "冥想"],
  ["🌅", "晨间散步"],
];

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dateWithOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function RoutinePanel() {
  const routines = useRepo<Routine>("routines");
  const logs = useRepo<{ id: number; routine_id: number; date: string }>("routineLogs");

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [hint, setHint] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [editLabel, setEditLabel] = useState("");
  const [editHint, setEditHint] = useState("");

  const today = todayStr();
  const sorted = useMemo(
    () => [...routines.items].sort((a, b) => a.order - b.order),
    [routines.items]
  );
  const doneIds = useMemo(() => {
    const set = new Set<number>();
    for (const l of logs.items) if (l.date === today) set.add(l.routine_id);
    return set;
  }, [logs.items, today]);

  const total = sorted.length;
  const done = sorted.filter((r) => doneIds.has(r.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  const weekDone = useMemo(() => {
    const out: boolean[] = [];
    for (let i = -6; i <= 0; i++) {
      const date = dateWithOffset(i);
      out.push(
        sorted.length > 0 && sorted.every((r) => logs.items.some((l) => l.routine_id === r.id && l.date === date))
      );
    }
    return out;
  }, [sorted, logs.items]);

  const toggle = (id: number) => {
    const existing = logs.items.find((l) => l.routine_id === id && l.date === today);
    if (existing) logs.remove(existing.id);
    else logs.add({ routine_id: id, date: today });
  };

  const addOne = (rLabel: string, rEmoji: string, rHint: string | null) => {
    const trimmed = rLabel.trim();
    if (!trimmed) return;
    routines.add({
      label: trimmed,
      emoji: rEmoji,
      hint: rHint?.trim() || null,
      order: routines.items.length,
      created_at: nowIso(),
    });
    setLabel("");
    setHint("");
    setEmoji("📚");
    setAdding(false);
  };

  const startEdit = (r: Routine) => {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditHint(r.hint ?? "");
  };

  const saveEdit = (r: Routine) => {
    routines.patch(r.id, { label: editLabel.trim() || r.label, hint: editHint.trim() || null });
    setEditingId(null);
  };

  const removeOne = (r: Routine) => {
    routines.remove(r.id);
    logs.removeWhere((l) => l.routine_id === r.id);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sunny-200/50 blur-2xl dark:bg-night-600/30" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-mint-200/50 blur-2xl dark:bg-night-600/30" />

      <div className="relative flex flex-wrap items-center gap-4">
        <div
          className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-ink"
          style={{
            background: `conic-gradient(var(--color-mint-400) ${pct}%, var(--color-ink) 0)`,
          }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-card text-xl font-extrabold">
            {allDone ? "🎉" : `${pct}%`}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold">今日例行</h2>
            <span className="rounded-full border-2 border-ink bg-sunny-300 px-2.5 py-0.5 text-xs font-black text-ink shadow-[1.5px_1.5px_0_0_var(--color-ink)]">
              {total === 0 ? "先定几条小事" : `${done}/${total} 已完成`}
            </span>
            {allDone && (
              <span className="animate-wiggle rounded-full border-2 border-ink bg-mint-300 px-2.5 py-0.5 text-xs font-black text-ink shadow-[1.5px_1.5px_0_0_var(--color-ink)]">
                全部完成 🎉
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-semibold text-ink/50 dark:text-ink/40">
            Wake-up 后一条条勾掉，小习惯会变成大改变 ✨
          </p>

          <div className="mt-2 flex items-center gap-1.5">
            {weekDone.map((d, i) => (
              <span
                key={i}
                title={i === 6 ? "今天" : "最近几天"}
                className={`h-3 w-3 rounded-full border border-ink/40 transition-transform ${
                  d ? "bg-mint-400 scale-110" : i === 6 ? "bg-sunny-300" : "bg-card"
                }`}
              />
            ))}
            <span className="ml-1 text-[11px] font-bold text-ink/40">最近 7 天</span>
          </div>
        </div>

        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border-2 border-ink bg-gradient-to-r from-grape-400 to-candy-400 px-4 py-2 text-sm font-bold text-white shadow-[2px_2px_0_0_var(--color-ink)] transition hover:-translate-y-0.5"
        >
          {adding ? "收起" : "＋ 新增例行"}
        </button>
      </div>

      {adding && (
        <div className="relative mt-4 animate-pop-in rounded-2xl border-2 border-ink/60 bg-cream p-3 dark:bg-night-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 text-lg transition ${
                    emoji === e
                      ? "border-ink bg-sunny-300 scale-110 shadow-[1.5px_1.5px_0_0_var(--color-ink)]"
                      : "border-ink/40 hover:border-candy-400"
                  }`}
                  aria-label={e}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOne(label, emoji, hint)}
              placeholder="要每天做的事…"
              className="min-w-40 flex-1 rounded-full border-2 border-ink/60 bg-card px-3.5 py-2 text-sm focus:border-candy-400 focus:outline-none"
            />
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOne(label, emoji, hint)}
              placeholder="可选：08:00 / 3 公里…"
              className="min-w-32 flex-1 rounded-full border-2 border-ink/60 bg-card px-3.5 py-2 text-sm focus:border-candy-400 focus:outline-none"
            />
            <button
              onClick={() => addOne(label, emoji, hint)}
              disabled={!label.trim()}
              className="rounded-full border-2 border-ink bg-gradient-to-r from-mint-400 to-sky-400 px-4 py-2 text-sm font-bold text-white shadow-[2px_2px_0_0_var(--color-ink)] transition hover:-translate-y-0.5 disabled:opacity-40"
            >
              加入
            </button>
          </div>
          {total === 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(([e, s]) => (
                <button
                  key={s}
                  onClick={() => addOne(s, e, null)}
                  className="rounded-full border-2 border-ink/50 bg-card px-2.5 py-1 text-xs font-bold text-ink/70 transition hover:-translate-y-0.5 hover:border-mint-400 hover:text-ink"
                >
                  {e} {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative mt-4 space-y-2">
        {total === 0 && !adding && (
          <p className="rounded-2xl border-2 border-dashed border-ink/40 px-4 py-8 text-center text-sm font-semibold text-ink/50">
            还没有每天的例行 🐷 点右上角「＋ 新增例行」，
            <br />
            或从下方小建议挑几条开始：
          </p>
        )}
        {total === 0 && !adding && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(([e, s]) => (
              <button
                key={s}
                onClick={() => addOne(s, e, null)}
                className="rounded-full border-2 border-ink/50 bg-card px-2.5 py-1 text-xs font-bold text-ink/70 transition hover:-translate-y-0.5 hover:border-candy-400 hover:text-ink"
              >
                {e} {s}
              </button>
            ))}
          </div>
        )}

        {sorted.map((r) => {
          const isDone = doneIds.has(r.id);
          const isEditing = editingId === r.id;
          return (
            <div
              key={r.id}
              className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 transition-all ${
                isDone
                  ? "border-mint-400/70 bg-mint-200/40 dark:bg-night-700/50"
                  : "border-ink/25 bg-card hover:border-candy-300"
              }`}
            >
              <button
                onClick={() => toggle(r.id)}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-sm transition-all ${
                  isDone
                    ? "border-mint-500 bg-mint-400 text-white"
                    : "border-ink/40 bg-card hover:scale-110 hover:border-mint-400"
                }`}
                aria-label={isDone ? "标记未完成" : "标记完成"}
              >
                {isDone ? "✓" : ""}
              </button>

              {isEditing ? (
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="min-w-24 flex-1 rounded-full border-2 border-candy-300 bg-card px-3 py-1 text-sm focus:outline-none"
                  />
                  <input
                    value={editHint}
                    onChange={(e) => setEditHint(e.target.value)}
                    placeholder="可选备注"
                    className="min-w-20 flex-1 rounded-full border-2 border-ink/40 bg-card px-3 py-1 text-xs focus:border-candy-300 focus:outline-none"
                  />
                  <button onClick={() => saveEdit(r)} className="rounded-full bg-mint-400 px-3 py-1 text-xs font-bold text-white">
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-full border-2 border-ink/40 px-3 py-1 text-xs font-bold text-ink/60"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <span
                    className={`flex items-center gap-2 font-bold ${
                      isDone ? "text-ink/50 line-through decoration-mint-500 decoration-2" : ""
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <span className="truncate">{r.label}</span>
                  </span>
                  {r.hint && (
                    <span className="mt-0.5 block pl-8 text-[11px] font-semibold text-ink/40 dark:text-ink/35">
                      {r.hint}
                    </span>
                  )}
                </div>
              )}

              {!isEditing && (
                <>
                  <button
                    onClick={() => startEdit(r)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink/30 text-ink/50 transition hover:-translate-y-0.5 hover:border-sky-400 hover:text-sky-500"
                    aria-label="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => removeOne(r)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink/30 text-ink/50 transition hover:-translate-y-0.5 hover:border-candy-400 hover:text-candy-500"
                    aria-label="删除"
                  >
                    🗑
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}