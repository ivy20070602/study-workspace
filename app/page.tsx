import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { getOverview, getRandomWordWithDefinition } from "@/lib/vocab";
import { countDue, countNew, getUpcomingReviews } from "@/lib/practice";

export const dynamic = "force-dynamic";

function dueLabel(due: string, now: number): string {
  const days = Math.round((new Date(due).getTime() - now) / 86_400_000);
  if (days <= 0) return "due now";
  return `in ${days}d`;
}

export default function HomePage() {
  const overview = getOverview();
  const due = countDue();
  const newCards = countNew();
  const randomWord = getRandomWordWithDefinition();
  const upcoming = getUpcomingReviews(5);
  const now = Date.now();
  const totalMax = Math.max(...overview.byCefr.map((c) => c.count), 1);
  const levelColors: Record<string, string> = {
    A1: "bg-emerald-500",
    A2: "bg-teal-500",
    B1: "bg-sky-500",
    B2: "bg-blue-500",
    C1: "bg-indigo-500",
    C2: "bg-purple-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">German Vocabulary</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          A focused, German-only word bank aligned to the CEFR ladder.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/words">
          <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent>
              <div className="text-sm text-gray-500 dark:text-gray-400">Browse</div>
              <div className="text-3xl font-bold">{overview.totalWords}</div>
              <div className="mt-1 text-xs text-gray-400">words · {overview.totalSenses} senses</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/practice">
          <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent>
              <div className="text-sm text-gray-500 dark:text-gray-400">Practice</div>
              <div className="text-3xl font-bold">{due + newCards}</div>
              <div className="mt-1 text-xs text-gray-400">
                {due} due · {newCards} new
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Up next</h2>
              <Link
                href="/practice"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Practice →
              </Link>
            </div>
            <ul className="divide-y divide-gray-50 dark:divide-gray-800">
              {upcoming.map((u) => (
                <li key={u.word_id}>
                  <Link
                    href={`/words/${u.word_id}`}
                    className="flex items-center justify-between py-1.5 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="font-medium">{u.lemma}</span>
                    <span className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {u.cefr_level}
                      </span>
                      <span className="w-14 text-right text-xs text-gray-400">
                        {dueLabel(u.due, now)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {randomWord && (
        <Link href={`/words/${randomWord.id}`}>
          <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Word of the moment</div>
                  <div className="mt-1 text-xl font-bold">
                    {randomWord.article && randomWord.part_of_speech === "Nomen"
                      ? `${randomWord.article} ${randomWord.lemma}`
                      : randomWord.lemma}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                    {randomWord.definition}
                  </div>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {randomWord.cefr_level}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <Card>
        <CardContent>
          <h2 className="mb-3 text-base font-semibold">Words by CEFR level</h2>
          <div className="space-y-2">
            {overview.byCefr.map((c) => (
              <Link
                key={c.cefr_level}
                href={`/words?cefr=${c.cefr_level}`}
                className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <span className="w-8 text-sm font-medium">{c.cefr_level}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-2.5 rounded-full ${levelColors[c.cefr_level] ?? "bg-gray-400"}`}
                    style={{ width: `${(c.count / totalMax) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold">{c.count}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-3 text-base font-semibold">Part of speech</h2>
          <div className="flex flex-wrap gap-1.5">
            {overview.byPos.map((p) => (
              <span
                key={p.part_of_speech}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {p.part_of_speech}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
