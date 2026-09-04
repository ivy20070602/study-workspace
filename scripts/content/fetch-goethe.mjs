import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { GOETHE_SOURCE_BASE, GOETHE_LEVELS, GOETHE_DIR, DWDS_DIR, B2C2_LEVELS, DWDS_POS_MAP } from "./cefr.config.mjs";

export function parseCsv(text) {
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
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
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
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function inferArticle(artikel, genus) {
  if (artikel && artikel.trim()) {
    const first = artikel.trim().split(",")[0].trim().toLowerCase();
    if (["der", "die", "das"].includes(first)) return first;
  }
  if (genus && genus.trim()) {
    const g = genus.trim().split(",")[0].trim().toLowerCase();
    if (g === "mask.") return "der";
    if (g === "fem.") return "die";
    if (g === "neutr.") return "das";
  }
  return null;
}

export async function fetchGoetheLevel(level) {
  const url = `${GOETHE_SOURCE_BASE}/${level}.csv`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`DWDS ${level} CSV failed: HTTP ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  const header = rows[0].map((h) => h.trim());
  const idx = {
    lemma: header.indexOf("Lemma"),
    pos: header.indexOf("Wortart"),
    genus: header.indexOf("Genus"),
    artikel: header.indexOf("Artikel"),
    onlypl: header.indexOf("nur_im_Plural"),
  };
  if (idx.lemma < 0 || idx.pos < 0) throw new Error(`${level}: unexpected CSV header ${header}`);
  const entries = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const lemma = (row[idx.lemma] || "").trim();
    const posLabel = (row[idx.pos] || "").trim();
    const genus = idx.genus >= 0 ? (row[idx.genus] || "").trim() : "";
    const artikel = idx.artikel >= 0 ? (row[idx.artikel] || "").trim() : "";
    const onlyplRaw = idx.onlypl >= 0 ? (row[idx.onlypl] || "").trim() : "0";
    if (!lemma) continue;
    const part_of_speech = DWDS_POS_MAP[posLabel] ?? null;
    if (!part_of_speech) continue;
    const article = part_of_speech === "Nomen" ? inferArticle(artikel, genus) : null;
    if (part_of_speech === "Nomen" && !article) continue;
    entries.push({
      lemma,
      part_of_speech,
      article,
      only_plural: onlyplRaw === "1",
      level,
    });
  }
  return { level, entries };
}

export async function buildCefrLayer() {
  await mkdir(GOETHE_DIR, { recursive: true });
  const stats = { total: 0 };
  const all = [];
  for (const level of GOETHE_LEVELS) {
    const { entries } = await fetchGoetheLevel(level);
    const out = new URL(`${level}.json`, GOETHE_DIR);
    await writeFile(out, JSON.stringify(entries, null, 2));
    stats[level] = entries.length;
    stats.total += entries.length;
    all.push(...entries);
    console.log(`${level}: ${entries.length} entries -> ${out.pathname}`);
  }
  const combined = new URL("all.json", GOETHE_DIR);
  await writeFile(combined, JSON.stringify(all, null, 2));
  console.log(`total: ${stats.total} entries`);
  return stats;
}

export async function loadCefrLayerFromDisk() {
  const all = [];
  for (const level of GOETHE_LEVELS) {
    const out = new URL(`${level}.json`, GOETHE_DIR);
    try {
      const raw = await readFile(out, "utf8");
      all.push(...JSON.parse(raw));
    } catch {
      throw new Error(
        `Missing CEFR layer for ${level}. Run: node scripts/content/fetch-goethe.mjs first.`
      );
    }
  }
  return all;
}

export async function loadFullCefrLayerFromDisk() {
  const all = await loadCefrLayerFromDisk();
  for (const level of B2C2_LEVELS) {
    const out = new URL(`${level}.json`, DWDS_DIR);
    try {
      const raw = await readFile(out, "utf8");
      all.push(...JSON.parse(raw));
    } catch {
      // B2–C2 layer optional; if missing they are simply skipped.
    }
  }
  return all;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildCefrLayer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
