import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { getOverview } from "@/lib/vocab";

export default function HomePage() {
  const overview = getOverview();
  const levelColors: Record<string, string> = {
    A1: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    A2: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    B1: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    B2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    C1: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    C2: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">German Vocabulary</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          A focused, German-only word bank aligned to the CEFR ladder.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">Words</div>
            <div className="text-3xl font-bold">{overview.totalWords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">Senses</div>
            <div className="text-3xl font-bold">{overview.totalSenses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-gray-500 dark:text-gray-400">Part of speech</div>
            <div className="mt-1 flex flex-wrap gap-1">
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

      <Card>
        <CardContent>
          <h2 className="mb-3 text-base font-semibold">Words by CEFR level</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {overview.byCefr.map((c) => (
              <Link
                key={c.cefr_level}
                href={`/words?cefr=${c.cefr_level}`}
                className="rounded-lg border border-gray-200 p-3 transition hover:border-gray-300 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                      levelColors[c.cefr_level] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {c.cefr_level}
                  </span>
                  <span className="text-lg font-bold">{c.count}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
