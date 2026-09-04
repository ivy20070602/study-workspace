import { NextResponse } from "next/server";
import { getWordById } from "@/lib/vocab";
import { getNextSession, submitRating } from "@/lib/practice";
import { Rating } from "ts-fsrs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = new Set([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]);
const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level");
  const bookmarked = url.searchParams.get("bookmarked") === "1";
  const cards = getNextSession(
    20,
    10,
    level && LEVELS.has(level) ? level : undefined,
    new Date(),
    bookmarked
  );
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  let body: { word_id?: number; rating?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const wordId = Number(body.word_id);
  const rating = Number(body.rating);
  if (!Number.isFinite(wordId) || !VALID.has(rating)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  if (!getWordById(wordId)) {
    return NextResponse.json({ error: "word not found" }, { status: 404 });
  }
  const result = submitRating(wordId, rating as Rating);
  return NextResponse.json(result);
}
