import Link from "next/link";
import { getNextSession, getPracticeOverview, getRecentReviews, getStatsByLevel, countDue, countNew } from "@/lib/practice";
import { PracticeSession } from "@/components/PracticeSession";

export const dynamic = "force-dynamic";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const RATING_LABEL: Record<number, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
};
const RATING_COLOR: Record<number, string> = {
  1: "text-red-600",
  2: "text-amber-600",
  3: "text-blue-600",
  4: "text-emerald-600",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const sp = await searchParams;
  const level = sp.level && LEVELS.includes(sp.level) ? sp.level : undefined;
  const overview = getPracticeOverview();
  const session = getNextSession(20, 10, level);
  const recent = getRecentReviews(15);
  const byLevel = getStatsByLevel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Space repetition with FSRS. Rate honestly — the schedule adapts to you.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/practice"
          className={`rounded-full px-3 py-1 text-xs ${
            !level
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          All levels
        </Link>
        {LEVELS.map((l) =>
          level === l ? (
            <span
              key={l}
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              {l}
            </span>
          ) : (
            <Link
              key={l}
              href={`/practice?level=${l}`}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              {l}
            </Link>
          )
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Due" value={level ? countDue(level) : overview.due} />
        <Stat label="New" value={level ? countNew(level) : overview.newCards} />
        <Stat label="To review" value={(level ? countDue(level) : overview.due) + (level ? countNew(level) : overview.newCards)} />
        <Stat
          label="Reviews done"
          value={overview.retention !== null ? `${overview.retention}%` : overview.reviewsDone}
          sub={overview.retention !== null ? `${overview.reviewsDone} total · retention` : undefined}
        />
      </div>

      <PracticeSession cards={session} totalDue={(level ? countDue(level) : overview.due) + (level ? countNew(level) : overview.newCards)} level={level} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-600 dark:text-gray-300">Shortcuts</span>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono dark:border-gray-700">Space</kbd> reveal answer</span>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono dark:border-gray-700">1</kbd><kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono dark:border-gray-700">2</kbd><kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono dark:border-gray-700">3</kbd><kbd className="rounded border border-gray-300 px-1.5 py-0.5 font-mono dark:border-gray-700">4</kbd> grade (Again/Hard/Good/Easy)</span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-base font-semibold">Progress by level</h2>
        <div className="space-y-2">
          {byLevel.map((s) => (
            <div key={s.cefr_level} className="flex items-center gap-3 text-sm">
              <span className="w-8 font-medium">{s.cefr_level}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: s.total ? `${(s.reviewed / s.total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-24 text-right text-gray-500 dark:text-gray-400">
                {s.reviewed}/{s.total}
              </span>
              {s.due > 0 && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  {s.due} due
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-base font-semibold">Recent reviews</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                  <th className="pb-2 font-medium">Word</th>
                  <th className="pb-2 font-medium">Level</th>
                  <th className="pb-2 font-medium">Rating</th>
                  <th className="pb-2 font-medium">Interval</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recent.map((r, i) => (
                  <tr key={i}>
                    <td className="py-1.5 font-medium">{r.lemma}</td>
                    <td className="py-1.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {r.cefr_level}
                      </span>
                    </td>
                    <td className={`py-1.5 font-medium ${RATING_COLOR[r.rating] ?? ""}`}>
                      {RATING_LABEL[r.rating] ?? r.rating}
                    </td>
                    <td className="py-1.5 text-gray-500 dark:text-gray-400">
                      {r.scheduled_days === 0
                        ? "<1d"
                        : r.scheduled_days === 1
                          ? "1d"
                          : `${r.scheduled_days}d`}
                    </td>
                    <td className="py-1.5 text-gray-500 dark:text-gray-400">
                      {new Date(r.reviewed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-gray-400">{sub}</div>}
    </div>
  );
}
