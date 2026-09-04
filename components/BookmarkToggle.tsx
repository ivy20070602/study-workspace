"use client";

import { useState } from "react";

interface BookmarkToggleProps {
  lemma: string;
  initial: boolean;
}

export function BookmarkToggle({ lemma, initial }: BookmarkToggleProps) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lemma, on: next }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      title={on ? "Remove bookmark" : "Bookmark this word"}
      aria-pressed={on}
      aria-label={`${on ? "Remove" : "Add"} bookmark for ${lemma}`}
      className={`inline-flex items-center justify-center rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 ${
        on ? "text-amber-500" : "text-gray-400 dark:text-gray-500"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0z"
        />
      </svg>
    </button>
  );
}