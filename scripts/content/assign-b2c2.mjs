import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  DWDS_LEMMATA_URL,
  DWDS_LEMMATA_DEFAULT,
  DWDS_DIR,
  B2C2_LEVELS,
  DWDS_FREQ_TO_LEVEL,
  DWDS_POS_MAP,
  DWDS_DROP_POS,
  B2C2_TIER_MAX,
  isDwdsLemmaValid,
  normalizeLemma,
} from "./cefr.config.mjs";
import { loadCefrLayerFromDisk } from "./fetch-goethe.mjs";

function parseFreq(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 6 ? n : null;
}

function parsePos(pos) {
  if (!pos) return null;
  if (DWDS_DROP_POS.has(pos)) return null;
  const mapped = DWDS_POS_MAP[pos];
  return mapped && mapped !== null ? mapped : null;
}

export async function fetchDwdsLemmata(outFile) {
  const res = await fetch(DWDS_LEMMATA_URL, { redirect: "follow" });
  if (!res.ok) throw new Error(`DWDS lemmata download failed: HTTP ${res.status}`);
  const json = await res.json();
  await writeFile(outFile, JSON.stringify(json));
  return Array.isArray(json) ? json : (json.entries ?? []);
}

// DWDS lemmadataenbank CSV: "lemma","url","wortklasse","artikeldatum","artikeltyp","frequenzklasse"
function parseCsv(text) {
  const rows = [];
  let field = "";
  let quoted = false;
  const record = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      record.push(field);
      field = "";
    } else if (c === "\n") {
      record.push(field);
      field = "";
      rows.push(record.slice());
      record.length = 0;
    } else {
      field += c;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    rows.push(record);
  }
  return rows;
}

function normalizeEntries(raw) {
  if (Array.isArray(raw)) {
    return raw.map((e) => ({ lemma: e.lemma, pos: e.pos, freq: e.freq, other: e }));
  }
  if (typeof raw === "string" && raw.includes(",")) {
    const rows = parseCsv(raw);
    if (rows.length === 0) return [];
    const header = rows[0].map((h) => h.replace(/^"|"$/g, "").trim());
    const iLemma = header.indexOf("lemma");
    const iPos = header.indexOf("wortklasse");
    const iFreq = header.indexOf("frequenzklasse");
    if (iLemma < 0 || iPos < 0 || iFreq < 0) return [];
    const out = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      out.push({
        lemma: row[iLemma] ? row[iLemma].replace(/^"|"$/g, "") : "",
        pos: row[iPos] ? row[iPos].replace(/^"|"$/g, "") : "",
        freq: row[iFreq] ? row[iFreq].replace(/^"|"$/g, "") : "",
      });
    }
    return out;
  }
  return [];
}

export function buildB2C2Layer(rawEntries) {
  const byLemma = new Map();
  for (const e of rawEntries) {
    const lemma = String(e.lemma ?? "").trim();
    if (!lemma) continue;
    if (!isDwdsLemmaValid(lemma)) continue;
    const freq = parseFreq(e.freq);
    if (freq === null) continue;
    const level = DWDS_FREQ_TO_LEVEL[freq];
    if (!level) continue;
    const pos = parsePos(e.pos);
    if (!pos) continue;
    const key = normalizeLemma(lemma);
    if (!byLemma.has(key)) byLemma.set(key, []);
    byLemma.get(key).push({ lemma, part_of_speech: pos, freq, level });
  }

  const layers = { B2: [], C1: [], C2: [] };
  for (const infos of byLemma.values()) {
    for (const info of infos) {
      layers[info.level].push({
        lemma: info.lemma,
        part_of_speech: info.part_of_speech,
        article: null,
        only_plural: false,
        level: info.level,
        freq: info.freq,
      });
    }
  }

  // Cap each tier and sort by frequency (higher freq = more useful for learners)
  for (const level of B2C2_LEVELS) {
    layers[level].sort((a, b) => b.freq - a.freq);
    if (layers[level].length > B2C2_TIER_MAX) {
      layers[level] = layers[level].slice(0, B2C2_TIER_MAX);
    }
  }

  return layers;
}

export async function writeB2C2Layers(layers) {
  await mkdir(DWDS_DIR, { recursive: true });
  const stats = { total: 0 };
  for (const level of B2C2_LEVELS) {
    const entries = layers[level] ?? [];
    stats[level] = entries.length;
    stats.total += entries.length;
    await writeFile(new URL(`${level}.json`, DWDS_DIR), JSON.stringify(entries, null, 2));
    console.log(`${level}: ${entries.length} entries`);
  }
  console.log(`total: ${stats.total} entries`);
  return stats;
}

async function main() {
  const cefr = await loadCefrLayerFromDisk();
  const cefrKeys = new Set(cefr.map((e) => normalizeLemma(e.lemma)));
  console.log(`Loading DWDS lemmata from ${DWDS_LEMMATA_DEFAULT} ...`);
  let entries;
  try {
    const text = await readFile(DWDS_LEMMATA_DEFAULT, "utf8");
    if (DWDS_LEMMATA_DEFAULT.endsWith(".csv")) {
      entries = normalizeEntries(text);
    } else {
      const json = JSON.parse(text);
      entries = normalizeEntries(Array.isArray(json) ? json : (json.entries ?? []));
    }
    console.log("Using on-disk lemmata file.");
  } catch {
    console.log("On-disk file missing; downloading from DWDS (this may be slow) ...");
    const raw = await fetchDwdsLemmata(DWDS_LEMMATA_DEFAULT);
    entries = normalizeEntries(Array.isArray(raw) ? raw : (raw.entries ?? []));
  }
  console.log(`DWDS lemmata entries: ${entries.length}`);

  const layers = buildB2C2Layer(
    entries.filter((e) => !cefrKeys.has(normalizeLemma(String(e?.lemma ?? ""))))
  );

  // Dedupe same lemma+pos across levels by keeping the first (lowest freq stays).
  const seen = new Set();
  for (const level of B2C2_LEVELS) {
    layers[level] = layers[level].filter((e) => {
      const key = `${normalizeLemma(e.lemma)}::${e.part_of_speech}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const stats = await writeB2C2Layers(layers);
  console.log("Done:", JSON.stringify(stats, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
