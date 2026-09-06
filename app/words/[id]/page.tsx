import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { BookmarkToggle } from "@/components/BookmarkToggle";
import { SpeakButton } from "@/components/SpeakButton";
import { WordNavKeys } from "@/components/WordNavKeys";
import { getWordById, getAdjacentWords } from "@/lib/vocab";
import { isBookmarked } from "@/lib/bookmarks";
import { getWordReviewHistory } from "@/lib/practice";

export const dynamic = "force-dynamic";

const RATING_LABEL: Record<number, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
const RATING_COLOR: Record<number, string> = {
  1: "text-red-600",
  2: "text-amber-600",
  3: "text-blue-600",
  4: "text-emerald-600",
};

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const word = getWordById(Number(id));
  if (!word) {
    notFound();
  }

  const { prev, next } = getAdjacentWords(word.id, word.cefr_level);
  const bookmarked = isBookmarked(word.normalized_lemma);
  const history = getWordReviewHistory(word.id);

  return (
    <div className="space-y-5">
      <WordNavKeys prevId={prev?.id ?? null} nextId={next?.id ?? null} />
      <Link
        href="/words"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to browse
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            {word.article && word.part_of_speech === "Nomen"
              ? `${word.article} ${word.lemma}`
              : word.lemma}
            <SpeakButton
              text={word.lemma}
              className="-ml-1"
            />
            <BookmarkToggle lemma={word.normalized_lemma} initial={bookmarked} />
          </h1>
          <div className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>{word.part_of_speech}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span>{word.sense_count} sense{word.sense_count === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Link
            href={`/words?cefr=${word.cefr_level}`}
            className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            {word.cefr_level}
          </Link>
          <span className="text-xs text-gray-400">
            {word.article && word.part_of_speech === "Nomen" ? "Noun" : word.part_of_speech}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {word.senses.map((sense) => (
          <Card key={sense.id}>
            <CardContent>
              <div className="flex gap-3">
                <span className="text-sm font-semibold text-gray-400">
                  {sense.sense_number}.
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-900 dark:text-gray-100">
                    {sense.definition}
                  </p>
                  {sense.examples.length > 0 && (
                    <ul className="space-y-1 pl-2">
                      {sense.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="border-l-2 border-gray-200 pl-3 text-sm italic text-gray-600 dark:border-gray-700 dark:text-gray-400"
                        >
                          {ex.sentence}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="mb-3 text-base font-semibold">Practice history</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <th className="pb-2 font-medium">Rating</th>
                    <th className="pb-2 font-medium">Interval</th>
                    <th className="pb-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td className={`py-1.5 font-medium ${RATING_COLOR[h.rating] ?? ""}`}>
                        {RATING_LABEL[h.rating] ?? h.rating}
                      </td>
                      <td className="py-1.5 text-gray-500 dark:text-gray-400">
                        {h.scheduled_days === 0 ? "<1d" : `${h.scheduled_days}d`}
                      </td>
                      <td className="py-1.5 text-gray-500 dark:text-gray-400">
                        {new Date(h.reviewed_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-2">
        {prev ? (
          <Link
            href={`/words/${prev.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            ← {prev.lemma}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/words/${next.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            {next.lemma} →
          </Link>
        ) : (
          <span />
        )}
      </div>
      <p className="text-center text-xs text-gray-400">
        Use ← → arrow keys to navigate within this level
      </p>
    </div>
  );
}
