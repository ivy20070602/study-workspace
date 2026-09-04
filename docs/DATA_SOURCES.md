# Data Sources

Status of the decision: **DECIDED** (2026-09-04) — this record captures the research and selection for the German vocabulary content pipeline. It is a planning/decision record, preserved along with the pipeline source so the German project can resume.

## Decisions

| Area                  | Selection                                        |
| --------------------- | ------------------------------------------------ |
| Dictionary primary    | Wiktionary dump (Wiktextract extractions) — dewiktionary Deutsch |
| CEFR level mapping    | Combination: official Goethe/telc lists for A1–B1, DWDS frequency bands for B2–C2 |
| Interface language    | English (UI copy); German-only core content     |
| Position              | Purely focused learning tool; no gamification    |
| Review algorithm      | FSRS                                             |

## Why not the alternatives

- **Duden API** — paid (€39.95–174.95/mo), oriented to spelling/grammar correction rather than a lemma→sense→example vocabulary corpus. Poor fit for a self-hosted vocabulary database.
- **PONS Dictionary API** — free quota only 1000 queries/month; a translation dictionary (injects English into the core). Conflicts with the German-only core principle and insufficient for bulk import.
- **DWDS public API** — authoritative and structured (IPA, frequency class 0–6, examples, articles), but free endpoints resolve one word at a time; it cannot serve a bulk build. Useful for on-demand lookup / frequency, not as primary corpus.

## Verified data sources (2026-09-04)

### Goethe CEFR word lists (DWDS redistributes, machine-readable)
- **A1** CSV: `https://zwei.dwds.de/api/lemma/goethe/A1.csv` and `.json` (A1 per DWDS also listed at `https://zwei.dwds.de/lemma/wortschatz-goethe-zertifikat/A1`)
- **A2** CSV/JSON: `https://zwei.dwds.de/api/lemma/goethe/A2.csv`
- **B1** CSV/JSON: `https://zwei.dwds.de/api/lemma/goethe/B1.csv`
- CSV header confirmed: `"Lemma","URL","Wortart","Genus","Artikel","nur_im_Plural"`
- Example rows: `"abschließen",...,"Verb","","","0"` and `"Teil",...,"Substantiv","mask., neutr.","der, das","0"`

Note: these lists are urheberrechtlich (Goethe-Institut) protected; DWDS provides them for redistribution as a factual reference.

### Wiktionary — German-gloss data (KEY CORRECTION)
The German-core data must come from the **dewiktionary** extraction whose glosses are in **German**, NOT the enwiktionary-derived "German" dictionary whose glosses are English.

- **Correct source**: `https://kaikki.org/dewiktionary/Deutsch/kaikki.org-dictionary-Deutsch.jsonl`
  - `lang: Deutsch`, `lang_code: de`, glosses in German.
  - Verified sample gloss: `Hallo` → `"lautes Rufen; fröhliches, lautes Durcheinander"`, `lieben` (verb) → `"eine innige, gefühlsmäßige Zuneigung für jemanden oder etwas empfinden"`.
  - Each JSONL line is one (word, pos) object with `senses[]glosses`, `senses[]examples[]text`, `sounds[]ipa`, `forms[]`, `pos` (abbreviated: `noun, verb, adj, adv, prep, pron, num, intj, particle, phrase`, …).
- **NOT to use for core**: `https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl` — this is Wiktionary German-word entries but glosses are **English** (e.g. `frei` → `"free; unenslaved"`), violating the German-only principle.

A local sample was downloaded to `/tmp/de_sample.jsonl` (~737 KB, partial) from the correct source; included in this backup under `data/devwiktionary-sample.jsonl`.

### Wiktionary original dump (alternative / full offline build)
- Wikimedia `dewiktionary` XML dump: `https://dumps.wikimedia.org/dewiktionary/latest/` → `dewiktionary-latest-pages-articles.xml.bz2`
- Process with Wiktextract: `https://github.com/tatuylonen/wiktextract` (MIT)
- Pre-extracted HF datasets: `cstr/de-wiktionary-extracted-full`, `cstr/de-wiktionary-sqlite-normalized` (CC-BY-SA 4.0)

### DWDS Lemmadatenbank (bulk frequency + POS source — B2–C2 mapping)
- Full bulk download (CC BY-SA 4.0): `https://zwei.dwds.de/lemma/json` (~40 MB, JSON) and `https://zwei.dwds.de/lemma/csv` (~27.6 MB, CSV).
- CSV schema (verified 2026-09-04): `"lemma","url","wortklasse","artikeldatum","artikeltyp","frequenzklasse"`
  - `wortklasse` → DWDS POS label → schema POS via `DWDS_POS_MAP`.
  - `frequenzklasse` → Häufigkeitsklasse 0–6 (6 = most frequent) or `n/a`; the bulk value is what the per-word `/api/frequency/?q=…` endpoint returns.
- The per-word endpoint `https://zwei.dwds.de/api/frequency/?q=WORT` returns `{q, lemma, hits, frequency}`; **one word per call** (pipe `|` is NOT supported for frequency). The `wb/snippet` endpoint (`?q=a|b|c`) DOES accept pipes but returns `wortart` (POS), not frequency.
- Mapping frequency band → CEFR is a calibration parameter (`DWDS_FREQ_TO_LEVEL` in `cefr.config.mjs`); default 5–6→B2, 3–4→C1, 1-2→C2, 0/`n/a` excluded.

> Network note: DWDS and kaikki.org are heavily throttled from this environment (~5–30 KB/s). A parallel chunked downloader (per-chunk `curl --range` + append, resumable) is used; see temp workspace `pdown.mjs`.

## CEFR mapping (combination strategy)

The schema requires every word to carry `cefr_level` (A1–C2). No authoritative data source supplies it directly, so CEFR is derived:

1. **A1–B1** — official Goethe-Zertifikat lists (ladder counts: A1 ≈ 800, A2 ≈ 600, B1 ≈ 1800 lemmas). A word present in an official list is tagged with that list's level. B1 is the "deepest" official public list.
2. **B2–C2** — no official public list. Map the DWDS **Häufigkeitsklasse** (frequency band 0–6, where 6 = most frequent) onto CEFR bands. Exact band→level mapping is a parameter to calibrate during the pipeline task.

Words with no CEFR signal are excluded from the learning corpus until assigned a level.

## Interface language
English UI copy; definitions and examples remain German-only. `profiles.locale` default is already `'en'`.

## Pipeline architecture (in `scripts/content/`)
1. `fetch-goethe.mjs` — download DWDS Goethe A1/A2/B1 CSV → `data/cefr/goethe/{level}.json` (CEFR layer: lemma/pos/article/level)
2. `extract-wiktionary.mjs` — stream the dewiktionary Deutsch JSONL, filter to CEFR-mapped lemmas, clean+map pos → `data/cefr/words.jsonl`
3. `import-db.mjs` — read `words.jsonl`, batch insert into `words/word_senses/word_examples` (Postgres/Supabase), ON CONFLICT idempotent
4. `cefr.config.mjs` — shared config: levels, URLs, DWDS→schema & Wiktextract→schema pos maps, article inference, filter rules

Schema mapping notes:
- DWDS pos labels (`Substantiv`, `Verb`, `Adjektiv`, …) → schema German-labeled set (`Verb, Nomen, Adjektiv, Adverb, Phrase, Präposition, Konjunktion, Pronomen, Numeral, Interjection, Partikel`).
- Wiktextract abbreviated pos (`noun, verb, adj, …`) → same schema set.
- Article for nouns from DWDS `Artikel`/`Genus`, falling back to Wiktextract gender tags.

## npm scripts to add
```
"content:fetch-cefr": "node scripts/content/fetch-goethe.mjs",
"content:extract": "node scripts/content/extract-wiktionary.mjs",
"content:import": "node --env-file-if-exists=.env.local scripts/content/import-db.mjs",
```
Requires `pg` devDependency for the import step (already planned in the German project).
