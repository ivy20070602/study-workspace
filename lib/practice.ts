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

export function countDue(now: Date = new Date()): number {
  const db = getDb();
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM cards WHERE due <= ?`)
    .get(now.toISOString()) as { c: number };
  return Number(row.c);
}

export function countNew(): number {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM words w
       WHERE NOT EXISTS (SELECT 1 FROM cards c WHERE c.word_id = w.id)
       AND EXISTS (SELECT 1 FROM word_senses s WHERE s.word_id = w.id)`
    )
    .get() as { c: number };
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

export function getNextSession(dueLimit: number, newLimit: number, now: Date = new Date()): PracticeCard[] {
  const db = getDb();
  const session: PracticeCard[] = [];

  const dueRows = db
    .prepare(
      `SELECT w.id, w.lemma, w.article, w.part_of_speech, w.cefr_level
       FROM words w JOIN cards c ON c.word_id = w.id
       WHERE c.due <= ?
       ORDER BY c.due ASC
       LIMIT ?`
    )
    .all(now.toISOString(), dueLimit) as WordRow[];
  session.push(...toPracticeCards(dueRows));

  if (session.length < dueLimit) {
    const remaining = dueLimit - session.length;
    const newRows = db
      .prepare(
        `SELECT w.id, w.lemma, w.article, w.part_of_speech, w.cefr_level
         FROM words w
         WHERE NOT EXISTS (SELECT 1 FROM cards c WHERE c.word_id = w.id)
         AND EXISTS (SELECT 1 FROM word_senses s WHERE s.word_id = w.id)
         ORDER BY w.id
         LIMIT ?`
      )
      .all(Math.min(remaining, newLimit)) as WordRow[];
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
    nextDue: countDue(now),
    nextNew: countNew(),
  };
}

export interface PracticeOverview {
  due: number;
  newCards: number;
  dueNew: number;
  reviewsDone: number;
}

export function getPracticeOverview(): PracticeOverview {
  const db = getDb();
  const reviewsDone = (
    db.prepare("SELECT COUNT(*) AS c FROM review_logs").get() as { c: number }
  ).c;
  return {
    due: countDue(),
    newCards: countNew(),
    dueNew: countDue() + countNew(),
    reviewsDone: Number(reviewsDone),
  };
}
