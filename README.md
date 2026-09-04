# German Vocabulary Learning

A focused, German-learning vocabulary companion — local-first, privacy-friendly.

German-only definitions and examples, aligned to the CEFR ladder (A1–C2). English UI.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4
- SQLite (better-sqlite3) — local database
- Local file system — content storage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content Pipeline

Vocabulary data is built from authoritative sources:

1. **CEFR word lists** — DWDS-released Goethe-Zertifikat lists (A1/A2/B1) define which words belong to which level.
2. **German-only definitions & examples** — the German Wiktionary extraction (`kaikki.org/dewiktionary/Deutsch`), filtered to the CEFR word sets.

See `docs/DATA_SOURCES.md` for the source research and decisions.

```bash
npm run content:fetch-cefr   # download Goethe A1/A2/B1 lists -> data/cefr/goethe/*.json
npm run content:extract      # stream Wiktionary data -> filter to CEFR set -> data/cefr/words.jsonl
npm run content:import       # words.jsonl -> SQLite (data/vocab.db)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run content:*` | Content pipeline (see above) |

## Directory Structure

```
app/          — page routes (App Router)
components/   — shared components
lib/          — utilities, database connection, vocabulary queries
scripts/      — content pipeline scripts
data/         — SQLite database + content artifacts (gitignored)
docs/         — project documentation
```
