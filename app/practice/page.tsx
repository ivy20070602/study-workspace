import { getNextSession, getPracticeOverview } from "@/lib/practice";
import { PracticeSession } from "@/components/PracticeSession";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  const overview = getPracticeOverview();
  const session = getNextSession(20, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Space repetition with FSRS. Rate honestly — the schedule adapts to you.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Due" value={overview.due} />
        <Stat label="New" value={overview.newCards} />
        <Stat label="To review" value={overview.dueNew} />
        <Stat label="Reviews done" value={overview.reviewsDone} />
      </div>

      <PracticeSession cards={session} totalDue={overview.dueNew} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
