import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { listWords, countWords } from "@/lib/vocab";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const POS_LIST = [
  "Verb",
  "Nomen",
  "Adjektiv",
  "Adverb",
  "Pronomen",
  "Präposition",
  "Konjunktion",
  "Numeral",
  "Interjection",
  "Partikel",
  "Phrase",
];

export const dynamic = "force-dynamic";

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/words${qs ? `?${qs}` : ""}`;
}

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ cefr?: string; pos?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const cefr = sp.cefr && LEVELS.includes(sp.cefr) ? sp.cefr : undefined;
  const pos = sp.pos && POS_LIST.includes(sp.pos) ? sp.pos : undefined;
  const q = sp.q?.trim() || undefined;

  const total = countWords({ cefr, pos, q });
  const words = listWords({ cefr, pos, q, limit: 200 });

  const filterParams = { cefr, pos };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Browse</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {total} words
          {cefr ? ` · level ${cefr}` : ""}
          {pos ? ` · ${pos}` : ""}
        </p>
      </div>

      <form action="/words" method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search for a word…"
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        {cefr ? <input type="hidden" name="cefr" value={cefr} /> : null}
        {pos ? <input type="hidden" name="pos" value={pos} /> : null}
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref({ q })}
          className={`rounded-full px-3 py-1 text-xs ${
            !cefr && !pos
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          All
        </Link>
        {LEVELS.map((l) =>
          cefr === l ? (
            <span
              key={l}
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              {l}
            </span>
          ) : (
            <Link
              key={l}
              href={buildHref({ ...filterParams, cefr: l })}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              {l}
            </Link>
          )
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {POS_LIST.map((p) =>
          pos === p ? (
            <span
              key={p}
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref({ ...filterParams, pos: p })}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              {p}
            </Link>
          )
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {words.map((w) => (
          <Link key={w.id} href={`/words/${w.id}`}>
            <Card className="h-full cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {w.article && w.part_of_speech === "Nomen"
                      ? `${w.article} ${w.lemma}`
                      : w.lemma}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {w.part_of_speech}
                  </div>
                </div>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {w.cefr_level}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {words.length === 0 && (
        <p className="py-10 text-center text-gray-500 dark:text-gray-400">
          No words found.
        </p>
      )}
    </div>
  );
}
