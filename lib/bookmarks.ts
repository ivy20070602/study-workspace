import { getDb } from "./db";

export function isBookmarked(normalizedLemma: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM bookmarks WHERE normalized_lemma = ?")
    .get(normalizedLemma);
  return Boolean(row);
}

export function setBookmark(normalizedLemma: string, on: boolean): void {
  const db = getDb();
  if (on) {
    db.prepare("INSERT OR IGNORE INTO bookmarks (normalized_lemma) VALUES (?)").run(
      normalizedLemma
    );
  } else {
    db.prepare("DELETE FROM bookmarks WHERE normalized_lemma = ?").run(
      normalizedLemma
    );
  }
}

export function getBookmarkedCount(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS c FROM bookmarks")
    .get() as { c: number };
  return Number(row.c);
}