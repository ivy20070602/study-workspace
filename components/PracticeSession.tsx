"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { PracticeCard } from "@/lib/practice";
import { Rating } from "ts-fsrs";

const GRADES = [
  { rating: Rating.Again, label: "Again", key: "1", cls: "bg-red-600 hover:bg-red-700" },
  { rating: Rating.Hard, label: "Hard", key: "2", cls: "bg-amber-500 hover:bg-amber-600" },
  { rating: Rating.Good, label: "Good", key: "3", cls: "bg-blue-600 hover:bg-blue-700" },
  { rating: Rating.Easy, label: "Easy", key: "4", cls: "bg-emerald-600 hover:bg-emerald-700" },
];

// Cards that have lapsed many times are flagged as "stubborn" — a gentle
// signal to pay extra attention, not a punishment.
const STUBBORN_THRESHOLD = 3;

export function PracticeSession({
  cards: initial,
  totalDue,
  level,
}: {
  cards: PracticeCard[];
  totalDue: number;
  level?: string;
}) {
  const [queue, setQueue] = useState<PracticeCard[]>(initial);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const current = queue[0];

  const loadMore = useCallback(async () => {
    try {
      const url = level ? `/api/practice?level=${level}` : "/api/practice";
      const res = await fetch(url);
      const data = (await res.json()) as { cards: PracticeCard[] };
      if (data.cards.length === 0) {
        setQueue([]);
      } else {
        setQueue((q) => [...q, ...data.cards]);
      }
    } catch {
      setError("Could not load more cards.");
    }
  }, [level]);

  const rate = useCallback(
    async (rating: Rating) => {
      if (!current || busy) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word_id: current.word.word_id, rating }),
        });
        if (!res.ok) throw new Error("submit failed");
        setDone((d) => d + 1);
        setRevealed(false);
        setQueue((q) => {
          const remaining = q.slice(1);
          if (remaining.length === 0) {
            loadMore();
          }
          return remaining;
        });
      } catch {
        setError("Could not save your rating. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [current, busy, loadMore]
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (busy || !current) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) setRevealed(true);
        return;
      }
      if (revealed) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) {
          e.preventDefault();
          rate(g.rating);
        }
      }
    },
    [busy, current, revealed, rate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!current) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="text-2xl font-bold">
          {done > 0 ? "Session complete" : "Nothing to review"}
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {done > 0
            ? `You reviewed ${done} card${done === 1 ? "" : "s"} this session.`
            : "There are no cards due right now."}
        </p>
        {totalDue > 0 && (
          <button
            onClick={() => loadMore()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Load next batch
          </button>
        )}
      </div>
    );
  }

  const displayLemma = current.word.article ? `${current.word.article} ${current.word.lemma}` : current.word.lemma;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {done} reviewed · {queue.length} in queue
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
          {current.word.cefr_level} · {current.word.part_of_speech}
        </span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-center gap-3">
          <Link
            href={`/words/${current.word.word_id}`}
            className="text-center text-3xl font-bold hover:text-blue-600 dark:hover:text-blue-400"
            title="View full entry"
          >
            {displayLemma}
          </Link>
          {current.card && current.card.lapses >= STUBBORN_THRESHOLD && (
            <span className="mt-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              stubborn
            </span>
          )}
        </div>

        {current.card && (
          <div className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
            {current.card.reps > 0 && `${current.card.reps} reviews`}
            {current.card.lapses > 0 && ` · ${current.card.lapses} lapses`}
            {current.card.stability > 0 &&
              ` · stability ${current.card.stability.toFixed(1)}d`}
          </div>
        )}

        {!revealed ? (
          <div className="mt-8 text-center">
            <button
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Show answer
            </button>
            <p className="mt-2 text-xs text-gray-400">or press Space</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-center text-lg text-gray-800 dark:text-gray-200">
              {current.word.definition}
            </p>
            {current.word.examples.length > 0 && (
              <ul className="mx-auto max-w-xl space-y-1">
                {current.word.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="border-l-2 border-gray-200 pl-3 text-sm italic text-gray-500 dark:border-gray-700 dark:text-gray-400"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {GRADES.map((g) => (
                <button
                  key={g.rating}
                  onClick={() => rate(g.rating)}
                  disabled={busy}
                  className={`flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white ${g.cls} disabled:opacity-50`}
                >
                  {g.label}
                  <kbd className="rounded bg-white/20 px-1 py-0.5 text-xs">{g.key}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
