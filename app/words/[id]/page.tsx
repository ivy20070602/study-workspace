import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { getWordById } from "@/lib/vocab";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-5">
      <Link
        href="/words"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to browse
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {word.article && word.part_of_speech === "Nomen"
              ? `${word.article} ${word.lemma}`
              : word.lemma}
          </h1>
          <div className="mt-1 text-gray-600 dark:text-gray-400">
            {word.part_of_speech}
          </div>
        </div>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {word.cefr_level}
        </span>
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
    </div>
  );
}
