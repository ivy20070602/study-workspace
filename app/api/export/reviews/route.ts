import { NextResponse } from "next/server";
import { getReviewHistory } from "@/lib/practice";

export const dynamic = "force-dynamic";

const RATING_LABEL: Record<number, string> = {
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
};

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const rows = getReviewHistory();

  const header = ["lemma", "part_of_speech", "cefr_level", "rating", "interval_days", "reviewed_at"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.lemma),
        csvEscape(r.part_of_speech),
        csvEscape(r.cefr_level),
        (RATING_LABEL[r.rating] ?? String(r.rating)) + `_${r.rating}`,
        String(r.scheduled_days),
        r.reviewed_at,
      ].join(",")
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="review_history_${date}.csv"`,
    },
  });
}