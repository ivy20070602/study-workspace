import { getDb } from "./db";
import { GRADES, applyRating, type StoredCard } from "./fsrs";
import type { Grade, Rating } from "ts-fsrs";

export interface PracticeWord {
  word_id: number;
  lemma: string;
  article: string | null;
  part_of_speech: string;
  cefr_level: string;
  definition: string;
  examples: string[];
}

export interface PracticeCard {
  word: PracticeWord;
  card: StoredCard | null;
}

function toPracticeWord(row: {
  id: number;
  lemma: string;
  article: string | null;
  part_of_speech: string;
  cefr_level: string;
}): PracticeWord {
  const db = getDb();
  const senses = db
    .prepare("SELECT definition FROM word_senses WHERE word_id = ? ORDER BY sense_number LIMIT 3")
    .all(row.id) as { definition: string }[];
  const examples = db
    .prepare(
      `SELECT e.sentence FROM word_examples e
       JOIN word_senses s ON s.id = e.word_sense_id
       WHERE s.word_id = ? ORDER BY e.sort_order LIMIT 3`
    )
    .all(row.id) as { sentence: string }[];
  return {
    word_id: row.id,
    lemma: row.lemma,
    article: row.article,
    part_of_speech: row.part_of_speech,
    cefr_level: row.cefr_level,
    definition: senses.map((s) => s.definition).join("; "),
    examples: examples.map((e) => e.sentence),
  };
}

interface WordRow {
  id: number;
  lemma: string;
  article: string | null;
  part_of_speech: string;
  cefr_level: string;
}

function bookmarkFilter(bookmarked?: boolean): string {
  return bookmarked
    ? "AND w.normalized_lemma IN (SELECT normalized_lemma FROM bookmarks)"
    : "";
}

export function countDue(level?: string, now: Date = new Date(), bookmarked = false): number {
  const db = getDb();
  const levelWhere = level ? "AND w.cefr_level = ?" : "";
  const params = [now.toISOString(), ...(level ? [level] : [])];
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM cards c JOIN words w ON w.id = c.word_id WHERE c.due <= ? ${levelWhere} ${bookmarkFilter(bookmarked)}`)
    .get(...params) as { c: number };
  return Number(row.c);
}

export function countNew(level?: string, bookmarked = false): number {
  const db = getDb();
  const levelWhere = level ? "AND w.cefr_level = ?" : "";
  const params = level ? [level] : [];
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM words w
       WHERE NOT EXISTS (SELECT 1 FROM cards c WHERE c.word_id = w.id)
       AND EXISTS (SELECT 1 FROM word_senses s WHERE s.word_id = w.id)
       ${levelWhere} ${bookmarkFilter(bookmarked)}`
    )
    .get(...params) as { c: number };
  return Number(row.c);
}

function toPracticeCards(rows: WordRow[]): PracticeCard[] {
  const db = getDb();
  return rows.map((r) => {
    const card = db
      .prepare(
        `SELECT word_id, state, due, stability, difficulty, reps, lapses, last_review
         FROM cards WHERE word_id = ?`
      )
      .get(r.id) as StoredCard | undefined;
    return { word: toPracticeWord(r), card: card ?? null };
  });
}

export function getNextSession(dueLimit: number, newLimit: number, level?: string, now: Date = new Date(), bookmarked = false): PracticeCard[] {
  const db = getDb();
  const session: PracticeCard[] = [];
  const levelWhere = level ? "AND w.cefr_level = ?" : "";
  const levelParams = level ? [level] : [];

  const dueRows = db
    .prepare(
      `SELECT w.id, w.lemma, w.article, w.part_of_speech, w.cefr_level
       FROM words w JOIN cards c ON c.word_id = w.id
       WHERE c.due <= ? ${levelWhere} ${bookmarkFilter(bookmarked)}
       ORDER BY c.due ASC
       LIMIT ?`
    )
    .all(now.toISOString(), ...levelParams, dueLimit) as WordRow[];
  session.push(...toPracticeCards(dueRows));

  if (session.length < dueLimit) {
    const remaining = dueLimit - session.length;
    const newRows = db
      .prepare(
        `SELECT w.id, w.lemma, w.article, w.part_of_speech, w.cefr_level
         FROM words w
         WHERE NOT EXISTS (SELECT 1 FROM cards c WHERE c.word_id = w.id)
         AND EXISTS (SELECT 1 FROM word_senses s WHERE s.word_id = w.id)
         ${levelWhere} ${bookmarkFilter(bookmarked)}
         ORDER BY w.id
         LIMIT ?`
      )
      .all(...levelParams, Math.min(remaining, newLimit)) as WordRow[];
    session.push(...toPracticeCards(newRows));
  }

  return session;
}

export function getCurrentCard(wordId: number): StoredCard | null {
  const db = getDb();
  const card = db
    .prepare(
      `SELECT word_id, state, due, stability, difficulty, reps, lapses, last_review
       FROM cards WHERE word_id = ?`
    )
    .get(wordId) as StoredCard | undefined;
  return card ?? null;
}

function gradeForRating(rating: number): Grade {
  const g = GRADES.find((x) => x === rating);
  return (g ?? 3) as Grade;
}

export interface SubmitResult {
  word_id: number;
  due: string;
  answer: number;
  scheduled_days: number;
  state: number;
  nextDue: number;
  nextNew: number;
}

export function submitRating(wordId: number, rating: Rating, now: Date = new Date()): SubmitResult {
  const db = getDb();
  const current = getCurrentCard(wordId);
  const grade = gradeForRating(rating);
  const applied = applyRating(current, grade, now);

  db.prepare(
    `INSERT INTO cards (word_id, state, due, stability, difficulty, reps, lapses, last_review, updated_at)
     VALUES (@word_id, @state, @due, @stability, @difficulty, @reps, @lapses, @last_review, datetime('now'))
     ON CONFLICT (word_id) DO UPDATE SET
       state = excluded.state,
       due = excluded.due,
       stability = excluded.stability,
       difficulty = excluded.difficulty,
       reps = excluded.reps,
       lapses = excluded.lapses,
       last_review = excluded.last_review,
       updated_at = datetime('now')`
  ).run({ ...applied.card, word_id: wordId, state: applied.state as number });

  db.prepare(
    `INSERT INTO review_logs (word_id, reviewed_at, rating, state, stability, difficulty, scheduled_days, due)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    wordId,
    now.toISOString(),
    applied.answer,
    applied.state,
    applied.card.stability,
    applied.card.difficulty,
    applied.scheduled_days,
    applied.card.due
  );

  return {
    word_id: wordId,
    due: applied.card.due,
    answer: applied.answer,
    scheduled_days: applied.scheduled_days,
    state: applied.state,
    nextDue: countDue(undefined, now),
    nextNew: countNew(),
  };
}

export interface PracticeOverview {
  due: number;
  newCards: number;
  dueNew: number;
  reviewsDone: number;
  retention: number | null;
}

export function getPracticeOverview(): PracticeOverview {
  const db = getDb();
  const reviewsDone = (
    db.prepare("SELECT COUNT(*) AS c FROM review_logs").get() as { c: number }
  ).c;

  // Honest retention: share of reviews rated Good or Easy (answered correctly).
  let retention: number | null = null;
  if (reviewsDone > 0) {
    const correct = (
      db
        .prepare("SELECT COUNT(*) AS c FROM review_logs WHERE rating >= 3")
        .get() as { c: number }
    ).c;
    retention = Math.round((correct / reviewsDone) * 1000) / 10;
  }

  return {
    due: countDue(),
    newCards: countNew(),
    dueNew: countDue() + countNew(),
    reviewsDone: Number(reviewsDone),
    retention,
  };
}

export interface ReviewLog {
  word_id: number;
  lemma: string;
  part_of_speech: string;
  cefr_level: string;
  rating: number;
  reviewed_at: string;
  scheduled_days: number;
}

export function getRecentReviews(limit = 20): ReviewLog[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.word_id, w.lemma, w.part_of_speech, w.cefr_level,
              r.rating, r.reviewed_at, r.scheduled_days
       FROM review_logs r
       JOIN words w ON w.id = r.word_id
       ORDER BY r.reviewed_at DESC
       LIMIT ?`
    )
    .all(limit) as ReviewLog[];
}

export function getReviewHistory(): ReviewLog[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.word_id, w.lemma, w.part_of_speech, w.cefr_level,
              r.rating, r.reviewed_at, r.scheduled_days
       FROM review_logs r
       JOIN words w ON w.id = r.word_id
       ORDER BY r.reviewed_at ASC`
    )
    .all() as ReviewLog[];
}

export interface UpcomingReview {
  word_id: number;
  lemma: string;
  cefr_level: string;
  due: string;
}

export function getUpcomingReviews(limit = 5, now: Date = new Date()): UpcomingReview[] {
  const db = getDb();
  const horizon = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
  return db
    .prepare(
      `SELECT w.id AS word_id, w.lemma, w.cefr_level, c.due
       FROM cards c JOIN words w ON w.id = c.word_id
       WHERE c.due <= ?
       ORDER BY c.due ASC
       LIMIT ?`
    )
    .all(horizon, limit) as UpcomingReview[];
}

export function getWordReviewHistory(wordId: number): ReviewLog[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.word_id, w.lemma, w.part_of_speech, w.cefr_level,
              r.rating, r.reviewed_at, r.scheduled_days
       FROM review_logs r
       JOIN words w ON w.id = r.word_id
       WHERE r.word_id = ?
       ORDER BY r.reviewed_at DESC`
    )
    .all(wordId) as ReviewLog[];
}

export interface LevelStats {
  cefr_level: string;
  total: number;
  reviewed: number;
  due: number;
}

export function getStatsByLevel(): LevelStats[] {
  const db = getDb();
  const now = new Date().toISOString();
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.map((level) => {
    const total = (
      db
        .prepare("SELECT COUNT(*) AS c FROM words WHERE cefr_level = ?")
        .get(level) as { c: number }
    ).c;
    const reviewed = (
      db
        .prepare(
          `SELECT COUNT(DISTINCT r.word_id) AS c FROM review_logs r
           JOIN words w ON w.id = r.word_id WHERE w.cefr_level = ?`
        )
        .get(level) as { c: number }
    ).c;
    const due = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM cards c
           JOIN words w ON w.id = c.word_id
           WHERE w.cefr_level = ? AND c.due <= ?`
        )
        .get(level, now) as { c: number }
    ).c;
    return { cefr_level: level, total: Number(total), reviewed: Number(reviewed), due: Number(due) };
  });
}
