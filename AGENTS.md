<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Work State

## Project
Self-use German vocabulary learning website. English UI; German-only definitions/examples. SQLite (better-sqlite3) + Next.js 16 App Router + Tailwind v4. No gamification. FSRS spaced repetition (ts-fsrs). Not deployed; run via `npm run dev`.

## Data (committed, DB is gitignored at /data)
- **Sources**: Goethe A1–B1 official wordlists + DWDS frequency → B2/C1/C2. Definitions/examples from dewiktionary (kaikki.org).
- **DB**: 2,293 words · 6,283 senses · 6,017 examples. Level distribution: A1:369, A2:305, B1:732, B2:348, C1:380, C2:159.
- **B2–C2 calibration done**: `DWDS_FREQ_TO_LEVEL` {6,5,4,3→B2; 2,1→C1; 0→C2}, junk filtered (symbols, numeric compounds, single-char, URLs, affixes) in `cefr.config.mjs` (`isDwdsLemmaValid`, `DWDS_DROP_POS`), tier capped 3000.
- **Search**: SQLite FTS5 virtual table `words_fts` (external content, sync triggers). Search uses prefix match; `exact=1` uses normalized_lemma equality.
- **Raw downloads** live in `/var/folders/ql/md8kj4nx0y75mshv5lycmmj80000gn/T/opencode/` (dewiktionary gz, dwds-lemmata.csv) — NOT in repo.

## Checks
- `npm run typecheck` and `npm run lint` must pass. `npm run build` builds green.
- Pipeline order: `npm run content:fetch-cefr` → `content:assign-b2c2` → `content:extract` → `content:import` (import rebuilds FTS).
- `content:import` (import-db.mjs) refuses to run if `cards`/`review_logs` contain progress; pass `--wipe-progress` to confirm (progress is cascade-deleted with words). Backup `data/vocab.db` first if you need history.
- `DATA_DIR` env var (default `./data`) customizes the DB/data location; honored by both `lib/db.ts` and `import-db.mjs`. Configured via `.env` (see `.env.example`).
- Word IDs in DB are not contiguous from 1 (restart at ~5675 after re-imports); don't assume id 1 exists.

## Where things are
- `lib/vocab.ts` — query layer: `listWords`, `countWords` (cefr/pos/q/exact/scope∈{lemma,definition}/bookmarked/limit/offset), `getWordById`, `getAdjacentWords` (within-level), `getRandomWordWithDefinition`, `getOverview`.
- `lib/practice.ts` — FSRS session/queries; `getNextSession(due, new, level?, now?, bookmarked?)`, `countDue`/`countNew` (level?, bookmarked?), `getStatsByLevel`, `getRecentReviews`, retention (Good/Easy share), `getPracticeOverview`.
- `lib/bookmarks.ts` — bookmarks keyed by `normalized_lemma` (stable across re-imports, unlike word IDs); survive `--wipe-progress`.
- `components/` — `PracticeSession`, `SpeakButton` (native speechSynthesis de-DE, client-only), `BookmarkToggle`, `Highlight`, `WordNavKeys`, `DarkModeToggle`, `ui/Card`.
- `scripts/content/` — data pipeline (fetch-goethe, assign-b2c2, extract-wiktionary, import-db).
- `docs/DATA_SOURCES.md` — source research and decisions.

