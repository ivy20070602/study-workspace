import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.cwd(), process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "vocab.db");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  ensureDataDir();
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initTables(_db);
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lemma TEXT NOT NULL,
      normalized_lemma TEXT NOT NULL,
      part_of_speech TEXT NOT NULL,
      cefr_level TEXT NOT NULL,
      article TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE (normalized_lemma, part_of_speech)
    );

    CREATE TABLE IF NOT EXISTS word_senses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      sense_number INTEGER NOT NULL DEFAULT 1,
      definition TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE (word_id, sense_number)
    );

    CREATE TABLE IF NOT EXISTS word_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_sense_id INTEGER NOT NULL REFERENCES word_senses(id) ON DELETE CASCADE,
      sort_order INTEGER NOT NULL DEFAULT 1,
      sentence TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE (word_sense_id, sort_order)
    );

    CREATE INDEX IF NOT EXISTS idx_words_cefr ON words(cefr_level);
    CREATE INDEX IF NOT EXISTS idx_words_normalized ON words(normalized_lemma);

    CREATE VIRTUAL TABLE IF NOT EXISTS words_fts USING fts5(
      lemma,
      normalized_lemma,
      content='words',
      content_rowid='id'
    );
    CREATE TRIGGER IF NOT EXISTS words_ai AFTER INSERT ON words BEGIN
      INSERT INTO words_fts(rowid, lemma, normalized_lemma) VALUES (new.id, new.lemma, new.normalized_lemma);
    END;
    CREATE TRIGGER IF NOT EXISTS words_ad AFTER DELETE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, lemma, normalized_lemma) VALUES ('delete', old.id, old.lemma, old.normalized_lemma);
    END;
    CREATE TRIGGER IF NOT EXISTS words_au AFTER UPDATE ON words BEGIN
      INSERT INTO words_fts(words_fts, rowid, lemma, normalized_lemma) VALUES ('delete', old.id, old.lemma, old.normalized_lemma);
      INSERT INTO words_fts(rowid, lemma, normalized_lemma) VALUES (new.id, new.lemma, new.normalized_lemma);
    END;

    CREATE TABLE IF NOT EXISTS bookmarks (
      normalized_lemma TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      word_id INTEGER PRIMARY KEY REFERENCES words(id) ON DELETE CASCADE,
      state INTEGER NOT NULL DEFAULT 0,
      due TEXT NOT NULL,
      stability REAL NOT NULL DEFAULT 0,
      difficulty REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      last_review TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS review_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      reviewed_at TEXT NOT NULL,
      rating INTEGER NOT NULL,
      state INTEGER NOT NULL,
      stability REAL NOT NULL,
      difficulty REAL NOT NULL,
      scheduled_days REAL NOT NULL,
      due TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(due);
    CREATE INDEX IF NOT EXISTS idx_review_logs_word ON review_logs(word_id);
    CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed ON review_logs(reviewed_at);
  `);
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

export function rebuildFts() {
  const db = getDb();
  db.exec("INSERT INTO words_fts(words_fts) VALUES('rebuild')");
}
