import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { getOverview } from "@/lib/vocab";
import { countDue, countNew } from "@/lib/practice";

export default function HomePage() {
  const overview = getOverview();
  const due = countDue();
  const newCards = countNew();
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
