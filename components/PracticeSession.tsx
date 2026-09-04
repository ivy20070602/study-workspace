"use client";

import { useState } from "react";
import type { PracticeCard } from "@/lib/practice";
import { Rating } from "ts-fsrs";

const GRADES = [
  { rating: Rating.Again, label: "Again", cls: "bg-red-600 hover:bg-red-700" },
  { rating: Rating.Hard, label: "Hard", cls: "bg-amber-500 hover:bg-amber-600" },
  { rating: Rating.Good, label: "Good", cls: "bg-blue-600 hover:bg-blue-700" },
  { rating: Rating.Easy, label: "Easy", cls: "bg-emerald-600 hover:bg-emerald-700" },
];

export function PracticeSession({
  cards: initial,
  totalDue,
}: {
  cards: PracticeCard[];
  totalDue: number;
}) {
  const [queue, setQueue] = useState<PracticeCard[]>(initial);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const current = queue[0];

  async function loadMore() {
    try {
      const res = await fetch("/api/practice");
      const data = (await res.json()) as { cards: PracticeCard[] };
      if (data.cards.length === 0) {
        setDone((d) => d);
        setQueue([]);
      } else {
        setQueue((q) => [...q, ...data.cards]);
      }
    } catch {
      setError("Could not load more cards.");
    }
  }

  async function rate(rating: Rating) {
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
      const remaining = queue.slice(1);
      if (remaining.length === 0) {
        await loadMore();
      } else {
        setQueue(remaining);
      }
    } catch {
      setError("Could not save your rating. Try again.");
    } finally {
      setBusy(false);
    }
  }

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
        <div className="text-center text-3xl font-bold">{displayLemma}</div>

        {!revealed ? (
          <div className="mt-8 text-center">
            <button
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Show answer
            </button>
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
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white ${g.cls} disabled:opacity-50`}
                >
                  {g.label}
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
