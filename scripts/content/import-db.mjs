import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DATA_DIR, POS, normalizeLemma } from "./cefr.config.mjs";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const rootDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const DEFAULT_DB = path.join(rootDir, "data", "vocab.db");

export function readRows(source) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const rl = createInterface({ input: createReadStream(source), crlfDelay: Infinity });
    rl.on("line", (line) => {
      const t = (line || "").trim();
      if (!t) return;
      try {
        rows.push(JSON.parse(t));
      } catch {
        /* ignore malformed line */
      }
    });
    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });
}

export class WordBatcher {
  constructor() {
    this.plan = [];
  }

  buildPlan(rows) {
    const byWord = new Map();
    for (const row of rows) {
      const key = `${normalizeLemma(row.lemma)}::${row.part_of_speech}`;
      if (!byWord.has(key)) {
        byWord.set(key, { ...row, senses: [] });
      }
      const rec = byWord.get(key);
      rec.senses.push({ definition: row.definition, examples: row.examples ?? [] });
    }
    this.plan = [...byWord.values()];
    return this.plan;
  }

  getPlanStats() {
    const totals = { words: 0, senses: 0, examples: 0, nouns: 0 };
    for (const rec of this.plan) {
      totals.words++;
      totals.senses += rec.senses.length;
      for (const s of rec.senses) totals.examples += s.examples.length;
      if (rec.part_of_speech === POS.NOUN && rec.article) totals.nouns++;
    }
    return totals;
  }
}

export function dryRun(rows) {
  const batcher = new WordBatcher();
  batcher.buildPlan(rows);
  const stats = batcher.getPlanStats();
  const sample = batcher.plan.slice(0, 5).map((r) => ({
    lemma: r.lemma,
    pos: r.part_of_speech,
    article: r.article,
    senses: r.senses.length,
    examples: r.senses.reduce((n, s) => n + s.examples.length, 0),
  }));
  return { stats, sample };
}

export function importRows(rows, dbPath = DEFAULT_DB) {
  return new Promise((resolve, reject) => {
    let db;
    try {
      db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");
      db.pragma("synchronous = OFF");

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
      `);

      db.exec("INSERT INTO words_fts(words_fts) VALUES('rebuild')");

      const insertWord = db.prepare(`
        INSERT INTO words (lemma, normalized_lemma, part_of_speech, cefr_level, article)
        VALUES (@lemma, @normalized_lemma, @part_of_speech, @cefr_level, @article)
        ON CONFLICT (normalized_lemma, part_of_speech) DO UPDATE SET
          cefr_level = excluded.cefr_level,
          article = excluded.article
      `);
      const getWordId = db.prepare(`
        SELECT id FROM words WHERE normalized_lemma = ? AND part_of_speech = ?
      `);
      const insertSense = db.prepare(`
        INSERT INTO word_senses (word_id, sense_number, definition)
        VALUES (?, ?, ?)
        ON CONFLICT (word_id, sense_number) DO UPDATE SET definition = excluded.definition
      `);
      const getSenseId = db.prepare(`
        SELECT id FROM word_senses WHERE word_id = ? AND sense_number = ?
      `);
      const insertExample = db.prepare(`
        INSERT INTO word_examples (word_sense_id, sort_order, sentence)
        VALUES (?, ?, ?)
        ON CONFLICT (word_sense_id, sort_order) DO UPDATE SET sentence = excluded.sentence
      `);

      const batcher = new WordBatcher();
      batcher.buildPlan(rows);

      let wordsInserted = 0;
      let sensesInserted = 0;
      let examplesInserted = 0;

      const tx = db.transaction(() => {
        db.exec("DELETE FROM word_examples");
        db.exec("DELETE FROM word_senses");
        db.exec("DELETE FROM words");
        for (const rec of batcher.plan) {
          const norm = normalizeLemma(rec.lemma);
          insertWord.run({
            lemma: rec.lemma,
            normalized_lemma: norm,
            part_of_speech: rec.part_of_speech,
            cefr_level: rec.level ?? "B1",
            article: rec.article ?? null,
          });
          const wordId = getWordId.get(norm, rec.part_of_speech).id;
          wordsInserted++;
          let senseNumber = 1;
          for (const sense of rec.senses) {
            insertSense.run(wordId, senseNumber, sense.definition);
            const senseId = getSenseId.get(wordId, senseNumber).id;
            senseNumber++;
            sensesInserted++;
            let sort = 1;
            for (const ex of sense.examples) {
              insertExample.run(senseId, sort, ex);
              sort++;
              examplesInserted++;
            }
          }
        }
      });

      tx();
      db.close();
      resolve({ wordsInserted, sensesInserted, examplesInserted });
    } catch (err) {
      if (db) {
        try {
          db.close();
        } catch {
          /* ignore */
        }
      }
      reject(err);
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = new URL("words.jsonl", DATA_DIR);
  readRows(source)
    .then((rows) => {
      const dry = dryRun(rows);
      console.log("Dry run (no DB):");
      console.log(JSON.stringify(dry, null, 2));
      return rows;
    })
    .then((rows) => {
      const dbArg = process.argv[2];
      return importRows(rows, dbArg ?? DEFAULT_DB).then((r) =>
        console.log("Imported:", r)
      );
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
