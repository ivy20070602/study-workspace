import { getDb } from "./db";

export interface WordSummary {
  id: number;
  lemma: string;
  normalized_lemma: string;
  part_of_speech: string;
  cefr_level: string;
  article: string | null;
  sense_count: number;
}

export interface SenseRow {
  id: number;
  sense_number: number;
  definition: string;
  examples: { sentence: string }[];
}

export interface WordDetail extends WordSummary {
  senses: SenseRow[];
}

const POS_ORDER: Record<string, number> = {
  Verb: 0,
  Nomen: 1,
  Adjektiv: 2,
  Adverb: 3,
  Pronomen: 4,
  Präposition: 5,
  Konjunktion: 6,
  Numeral: 7,
  Interjection: 8,
  Partikel: 9,
  Phrase: 10,
};

const BOOKMARK_FILTER = "EXISTS (SELECT 1 FROM bookmarks b WHERE b.normalized_lemma = w.normalized_lemma)";

export function posLabel(pos: string): string {
  return pos;
}

export function countWords(opts?: { cefr?: string; pos?: string; q?: string; exact?: boolean; bookmarked?: boolean }): number {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts?.q && opts?.exact) {
    where.push("w.normalized_lemma = ?");
    params.push(opts.q.toLowerCase());
  } else if (opts?.q) {
    const terms = opts.q.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase() + "*").join(" AND ");
    where.push("w.id IN (SELECT rowid FROM words_fts WHERE words_fts MATCH ?)");
    params.push(terms);
  }
  if (opts?.cefr) {
    where.push("w.cefr_level = ?");
    params.push(opts.cefr);
  }
  if (opts?.pos) {
    where.push("w.part_of_speech = ?");
    params.push(opts.pos);
  }
  if (opts?.bookmarked) {
    where.push(BOOKMARK_FILTER);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM words w ${whereSql}`)
    .get(...params) as { c: number };
  return Number(row.c);
}

export function listWords(opts?: {
  cefr?: string;
  pos?: string;
  q?: string;
  exact?: boolean;
  bookmarked?: boolean;
  limit?: number;
  offset?: number;
}): WordSummary[] {
  const db = getDb();
  const where: string[] = [];
  const params: unknown[] = [];

  if (opts?.q && opts?.exact) {
    where.push("w.normalized_lemma = ?");
    params.push(opts.q.toLowerCase());
  } else if (opts?.q) {
    const terms = opts.q.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase() + "*").join(" AND ");
    where.push("w.id IN (SELECT rowid FROM words_fts WHERE words_fts MATCH ?)");
    params.push(terms);
  }
  if (opts?.cefr) {
    where.push("w.cefr_level = ?");
    params.push(opts.cefr);
  }
  if (opts?.pos) {
    where.push("w.part_of_speech = ?");
    params.push(opts.pos);
  }
  if (opts?.bookmarked) {
    where.push(BOOKMARK_FILTER);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  params.push(limit, offset);

  const rows = db
    .prepare(
      `SELECT w.id, w.lemma, w.normalized_lemma, w.part_of_speech, w.cefr_level, w.article,
              (SELECT COUNT(*) FROM word_senses s WHERE s.word_id = w.id) AS sense_count
       FROM words w
       ${whereSql}
       ORDER BY w.normalized_lemma
       LIMIT ? OFFSET ?`
    )
    .all(...params) as Array<{
    id: number;
    lemma: string;
    normalized_lemma: string;
    part_of_speech: string;
    cefr_level: string;
    article: string | null;
    sense_count: number;
  }>;

  return rows.map((r) => ({
    ...r,
    sense_count: Number(r.sense_count),
  }));
}

export function getWordById(id: number): WordDetail | null {
  const db = getDb();
  const w = db
    .prepare(
      `SELECT w.id, w.lemma, w.normalized_lemma, w.part_of_speech, w.cefr_level, w.article,
              (SELECT COUNT(*) FROM word_senses s WHERE s.word_id = w.id) AS sense_count
       FROM words w WHERE w.id = ?`
    )
    .get(id) as
    | { id: number; lemma: string; normalized_lemma: string; part_of_speech: string; cefr_level: string; article: string | null; sense_count: number }
    | undefined;
  if (!w) return null;

  const senses = db
    .prepare(
      `SELECT id, sense_number, definition
       FROM word_senses WHERE word_id = ?
       ORDER BY sense_number`
    )
    .all(id) as { id: number; sense_number: number; definition: string }[];

  const senseRows: SenseRow[] = senses.map((s) => {
    const examples = db
      .prepare(
        `SELECT sentence FROM word_examples
         WHERE word_sense_id = ?
         ORDER BY sort_order`
      )
      .all(s.id) as { sentence: string }[];
    return { id: s.id, sense_number: s.sense_number, definition: s.definition, examples };
  });

  return { ...w, sense_count: Number(w.sense_count), senses: senseRows };
}

export interface AdjacentWord {
  id: number;
  lemma: string;
}

export function getAdjacentWords(id: number, cefr?: string): { prev: AdjacentWord | null; next: AdjacentWord | null } {
  const db = getDb();
  const where = cefr ? "AND w.cefr_level = ?" : "";

  const prev = db
    .prepare(
      `SELECT w.id, w.lemma FROM words w
       WHERE w.id < ? ${where}
       ORDER BY w.id DESC LIMIT 1`
    )
    .get(...(cefr ? [id, cefr] : [id])) as { id: number; lemma: string } | undefined;

  const next = db
    .prepare(
      `SELECT w.id, w.lemma FROM words w
       WHERE w.id > ? ${where}
       ORDER BY w.id ASC LIMIT 1`
    )
    .get(...(cefr ? [id, cefr] : [id])) as { id: number; lemma: string } | undefined;

  return { prev: prev ?? null, next: next ?? null };
}

export function getRandomWord(): WordSummary | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT w.id, w.lemma, w.normalized_lemma, w.part_of_speech, w.cefr_level, w.article,
              (SELECT COUNT(*) FROM word_senses s WHERE s.word_id = w.id) AS sense_count
       FROM words w
       ORDER BY RANDOM() LIMIT 1`
    )
    .get() as
    | { id: number; lemma: string; normalized_lemma: string; part_of_speech: string; cefr_level: string; article: string | null; sense_count: number }
    | undefined;
  return row ? { ...row, sense_count: Number(row.sense_count) } : null;
}

export function getRandomWordWithDefinition(): (WordSummary & { definition: string }) | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT w.id, w.lemma, w.normalized_lemma, w.part_of_speech, w.cefr_level, w.article,
              (SELECT COUNT(*) FROM word_senses s WHERE s.word_id = w.id) AS sense_count,
              (SELECT s.definition FROM word_senses s WHERE s.word_id = w.id ORDER BY s.sense_number LIMIT 1) AS definition
       FROM words w
       ORDER BY RANDOM() LIMIT 1`
    )
    .get() as
    | { id: number; lemma: string; normalized_lemma: string; part_of_speech: string; cefr_level: string; article: string | null; sense_count: number; definition: string }
    | undefined;
  return row ? { ...row, sense_count: Number(row.sense_count) } : null;
}

export interface Overview {
  totalWords: number;
  totalSenses: number;
  byCefr: { cefr_level: string; count: number }[];
  byPos: { part_of_speech: string; count: number }[];
}

export function getOverview(): Overview {
  const db = getDb();
  const totalWords = (
    db.prepare("SELECT COUNT(*) AS c FROM words").get() as { c: number }
  ).c;
  const totalSenses = (
    db.prepare("SELECT COUNT(*) AS c FROM word_senses").get() as { c: number }
  ).c;
  const cefrOrder: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
  const byCefr = (
    db
      .prepare("SELECT cefr_level, COUNT(*) AS count FROM words GROUP BY cefr_level")
      .all() as { cefr_level: string; count: number }[]
  )
    .map((r) => ({ cefr_level: r.cefr_level, count: Number(r.count) }))
    .sort((a, b) => (cefrOrder[a.cefr_level] ?? 9) - (cefrOrder[b.cefr_level] ?? 9));
  const byPos = (
    db
      .prepare("SELECT part_of_speech, COUNT(*) AS count FROM words GROUP BY part_of_speech")
      .all() as { part_of_speech: string; count: number }[]
  )
    .map((r) => ({ part_of_speech: r.part_of_speech, count: Number(r.count) }))
    .sort((a, b) => (POS_ORDER[a.part_of_speech] ?? 99) - (POS_ORDER[b.part_of_speech] ?? 99));
  return { totalWords, totalSenses, byCefr, byPos };
}
