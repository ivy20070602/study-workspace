import { createInterface } from "node:readline";
import { createReadStream, createWriteStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { fileURLToPath } from "node:url";
import {
  DATA_DIR,
  OUTPUT_FILE,
  WIKTIONARY_POS_MAP,
  normalizeLemma,
  DROP_SENSE_TAGS,
  DROP_WORD_TAGS,
  MAX_EXAMPLES_PER_SENSE,
  MAX_GLOSS_LENGTH,
  MAX_SENTENCE_LENGTH,
  MAX_LEMMA_LENGTH,
  FILTER_OPTIONS,
} from "./cefr.config.mjs";
import { loadFullCefrLayerFromDisk } from "./fetch-goethe.mjs";

function buildCefrIndex(entries) {
  const idx = new Map();
  for (const e of entries) {
    const key = normalizeLemma(e.lemma);
    if (!idx.has(key)) idx.set(key, []);
    idx.get(key).push({
      part_of_speech: e.part_of_speech,
      article: e.article,
      only_plural: e.only_plural ?? false,
      level: e.level,
    });
  }
  return idx;
}

function pickPos(entries) {
  if (!entries || entries.length === 0) return null;
  const order = {
    Nomen: 0,
    Verb: 1,
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
  return [...entries].sort(
    (a, b) => (order[a.part_of_speech] ?? 99) - (order[b.part_of_speech] ?? 99)
  )[0];
}

function tagMatches(tag, words) {
  const norm = String(tag).toLowerCase();
  for (const w of words) {
    if (norm === w || norm.startsWith(`${w}:`) || norm.startsWith(`${w}-`)) return true;
  }
  return false;
}

function hasDropWordTags(entry) {
  const all = [...(entry.tags ?? []), ...(entry.categories ?? [])];
  return all.some((c) => tagMatches(c, [...DROP_WORD_TAGS]));
}

function mapGenderToArticle(entry) {
  for (const form of entry.forms ?? []) {
    for (const tag of form.tags ?? []) {
      const norm = String(tag).toLowerCase();
      if (norm === "masculine" || norm === "m") return "der";
      if (norm === "feminine" || norm === "f") return "die";
      if (norm === "neuter" || norm === "n") return "das";
    }
  }
  return null;
}

function cleanGloss(raw) {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();
  if (s.length < 1 || s.length > MAX_GLOSS_LENGTH) return null;
  if (s.includes("{") || s.includes("}")) return null;
  return s;
}

function mapEntryToRows(entry, cefrInfo) {
  const record_pos = WIKTIONARY_POS_MAP[String(entry.pos ?? "")];
  if (!record_pos || record_pos !== cefrInfo.part_of_speech) return [];
  const lemma = String(entry.word ?? "").trim();
  if (lemma.length === 0 || lemma.length > MAX_LEMMA_LENGTH) return [];
  const article = record_pos === "Nomen" ? cefrInfo.article ?? mapGenderToArticle(entry) : null;
  const rows = [];
  const senses = entry.senses ?? [];
  let senseCount = 0;
  for (const sense of senses) {
    if (senseCount >= (FILTER_OPTIONS.maxSenses ?? Infinity)) break;
    const drop = (sense.tags ?? []).some((t) => DROP_SENSE_TAGS.has(String(t).toLowerCase()));
    if (drop) continue;
    const definition = (sense.glosses ?? [])
      .map(cleanGloss)
      .filter(Boolean)
      .join("; ");
    if (!definition) continue;
    senseCount++;
    const examples = [];
    for (const ex of (sense.examples ?? []).slice(0, MAX_EXAMPLES_PER_SENSE)) {
      const text = (ex.text || "").trim();
      if (text.length === 0 || text.length > MAX_SENTENCE_LENGTH) continue;
      examples.push(text);
    }
    rows.push({ lemma, part_of_speech: record_pos, definition, examples, article, level: cefrInfo.level });
  }
  return rows;
}

export async function extractFromStream({ cefrEntries, source, outFile, limit }) {
  const cefrIndex = buildCefrIndex(cefrEntries);
  const stats = {
    processed: 0,
    kept: 0,
    droppedNoCefr: 0,
    droppedPos: 0,
    droppedNoGloss: 0,
    droppedOther: 0,
    skippedUnparseable: 0,
  };
  const seenLemmaPos = new Set();
  const out = createWriteStream(outFile);
  await new Promise((resolve, reject) => {
    let input = createReadStream(source);
    if (String(source).endsWith(".gz")) {
      input = input.pipe(createGunzip());
    }
    const rl = createInterface({ input, crlfDelay: Infinity });
    rl.on("line", (line) => {
      if (!line || !line.trim()) return;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        stats.skippedUnparseable++;
        return;
      }
      stats.processed++;
      const lemma = String(entry.word ?? "").trim();
      const cefrInfos = cefrIndex.get(normalizeLemma(lemma));
      if (!cefrInfos) {
        stats.droppedNoCefr++;
        return;
      }
      const cefrInfo = pickPos(cefrInfos);
      if (hasDropWordTags(entry)) {
        stats.droppedOther++;
        return;
      }
      const rows = mapEntryToRows(entry, cefrInfo);
      if (rows.length === 0) {
        stats.droppedPos++;
        return;
      }
      if (limit && stats.kept >= limit) return;
      const key = `${normalizeLemma(lemma)}::${cefrInfo.part_of_speech}`;
      if (seenLemmaPos.has(key)) {
        stats.droppedOther++;
        return;
      }
      seenLemmaPos.add(key);
      stats.kept++;
      for (const row of rows) {
        out.write(JSON.stringify(row) + "\n");
      }
    });
    rl.on("close", () => {
      out.end();
      resolve();
    });
    rl.on("error", reject);
    out.on("error", reject);
  });
  return stats;
}

export async function extractFromFile({ source, outFile, limit }) {
  const cefrEntries = await loadFullCefrLayerFromDisk();
  return extractFromStream({ cefrEntries, source, outFile, limit });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = process.argv[2]
    ? new URL(process.argv[2], DATA_DIR)
    : new URL("sample/de_sample.jsonl", DATA_DIR);
  extractFromFile({ source, outFile: OUTPUT_FILE })
    .then((stats) => {
      console.log(JSON.stringify(stats, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
