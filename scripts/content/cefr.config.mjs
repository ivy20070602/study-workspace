export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const GOETHE_SOURCE_BASE =
  "https://zwei.dwds.de/api/lemma/goethe";

export const GOETHE_LEVELS = ["A1", "A2", "B1"];

export const DWDS_LEMMATA_URL = "https://zwei.dwds.de/lemma/json";
export const DWDS_LEMMATA_DEFAULT = "/var/folders/ql/md8kj4nx0y75mshv5lycmmj80000gn/T/opencode/dwds-lemmata.csv";
export const B2C2_LEVELS = ["B2", "C1", "C2"];

// DWDS Häufigkeitsklasse (0 = selten … 6 = sehr häufig) → CEFR level.
// After Goethe overlap removal, B2-C2 tiers draw only non-Goethe words.
// Bands are calibration parameters tuned for balanced tier sizes.
export const DWDS_FREQ_TO_LEVEL = Object.freeze({
  6: "B2",
  5: "B2",
  4: "B2",
  3: "B2",  // freq 3 is mid-high frequency — B2 after Goethe overlap removal
  2: "C1",
  1: "C1",
  0: "C2",
});

// Maximum entries per tier after building. Keeps tiers manageable.
export const B2C2_TIER_MAX = 3000;

// POS that map to junk in DWDS — drop entirely.
export const DWDS_DROP_POS = new Set([
  "Affix", "Präposition + Artikel", "Symbol", "Subs-D",
]);

// Lemma filters: drop non-lexical, numeric, single-char, URL-contaminated entries.
export function isDwdsLemmaValid(lemma) {
  if (!lemma || lemma.length <= 2) return false;
  if (/^[^a-zA-ZäöüßÄÖÜ]/.test(lemma)) return false; // starts with non-letter
  if (/^[0-9]/.test(lemma)) return false;               // starts with digit
  if (/[\[\]<>{}]/.test(lemma)) return false;            // HTML/URL junk
  if (/\d[%$€‰]/.test(lemma)) return false;             // numeric units
  if (/^[A-Z][a-z]+-[0-9]/.test(lemma)) return false;   // compound with numeric
  return true;
}

export const WIKTIONARY_URL =
  "https://kaikki.org/dewiktionary/Deutsch/kaikki.org-dictionary-Deutsch.jsonl";

export const DATA_DIR = new URL("../../data/cefr/", import.meta.url);
export const GOETHE_DIR = new URL("goethe/", DATA_DIR);
export const DWDS_DIR = new URL("dwds/", DATA_DIR);
export const SAMPLE_DIR = new URL("sample/", DATA_DIR);
export const OUTPUT_FILE = new URL("words.jsonl", DATA_DIR);

export const SCHEMA_POS = [
  "Verb",
  "Nomen",
  "Adjektiv",
  "Adverb",
  "Phrase",
  "Präposition",
  "Konjunktion",
  "Pronomen",
  "Numeral",
  "Interjection",
  "Partikel",
];

const SCHEMA_POS_SET = new Set(SCHEMA_POS);

export function isSchemaPos(value) {
  return SCHEMA_POS_SET.has(value);
}

export const POS = Object.freeze({
  VERB: "Verb",
  NOUN: "Nomen",
  ADJ: "Adjektiv",
  ADV: "Adverb",
  PHRASE: "Phrase",
  PREP: "Präposition",
  CONJ: "Konjunktion",
  PRON: "Pronomen",
  NUM: "Numeral",
  INTJ: "Interjection",
  PART: "Partikel",
});

export const POS_ORDER = Object.freeze({
  [POS.VERB]: 0,
  [POS.NOUN]: 1,
  [POS.ADJ]: 2,
  [POS.ADV]: 3,
  [POS.PREP]: 4,
  [POS.CONJ]: 5,
  [POS.PRON]: 6,
  [POS.NUM]: 7,
  [POS.INTJ]: 8,
  [POS.PART]: 9,
  [POS.PHRASE]: 10,
});

export function posOrd(pos) {
  return POS_ORDER[pos] ?? 99;
}

export function sortByPos(a, b) {
  return posOrd(a.part_of_speech) - posOrd(b.part_of_speech);
}

export const DWDS_POS_MAP = {
  Verb: POS.VERB,
  Adjektiv: POS.ADJ,
  Adverb: POS.ADV,
  Konjunktion: POS.CONJ,
  Präposition: POS.PREP,
  Pronomen: POS.PRON,
  Interjektion: POS.INTJ,
  Partikel: POS.PART,
  Kardinalzahlwort: POS.NUM,
  Ordinalzahlwort: POS.NUM,
  Bruchzahlwort: POS.NUM,
  Numeral: POS.NUM,
  Eigenname: POS.NOUN,
  "bestimmter Artikel": null,
  Demonstrativpronomen: POS.PRON,
  Indefinitpronomen: POS.PRON,
  Interrogativpronomen: POS.PRON,
  Personalpronomen: POS.PRON,
  Possessivpronomen: POS.PRON,
  Reflexivpronomen: POS.PRON,
  Relativpronomen: POS.PRON,
  "reziprokes Pronomen": POS.PRON,
  Pronominaladverb: POS.ADV,
  Imperativ: POS.VERB,
  Komparativ: POS.ADJ,
  Superlativ: POS.ADJ,
  "partizipiales Adjektiv": POS.ADJ,
  "partizipiales Adverb": POS.ADV,
  Affix: null,
  "Präposition + Artikel": null,
  Mehrwortausdruck: POS.PHRASE,
  Symbol: null,
};

export const WIKTIONARY_POS_MAP = {
  noun: POS.NOUN,
  verb: POS.VERB,
  adj: POS.ADJ,
  adv: POS.ADV,
  prep: POS.PREP,
  conj: POS.CONJ,
  pron: POS.PRON,
  num: POS.NUM,
  intj: POS.INTJ,
  particle: POS.PART,
  phrase: POS.PHRASE,
  name: null,
  proper: null,
  abbrev: null,
  char: null,
  prefix: null,
  suffix: null,
  infix: null,
  circumfix: null,
  interfix: null,
  affix: null,
  punct: null,
  symbol: null,
  det: POS.PRON,
  determiner: POS.PRON,
  article: POS.PRON,
  postp: POS.PREP,
  contraction: null,
  proverb: POS.PHRASE,
  prep_phrase: POS.PHRASE,
  "adj-participle": POS.ADJ,
};

export const ARTICLE_BY_GENUS = Object.freeze({
  "mask.": "der",
  "fem.": "die",
  "neutr.": "das",
});

export const GENUS_VALUES = new Set(Object.keys(ARTICLE_BY_GENUS));

export const ARTICLE_TAGS = Object.freeze({
  masculine: "der",
  feminine: "die",
  neuter: "das",
});

export const MAX_EXAMPLES_PER_SENSE = 1;
export const MIN_GLOSS_LENGTH = 1;
export const MAX_GLOSS_LENGTH = 1000;
export const MAX_SENTENCE_LENGTH = 500;
export const MAX_LEMMA_LENGTH = 120;

export const DROP_SENSE_TAGS = new Set([
  "archaic",
  "obsolete",
  "slang",
  "dialectal",
  "colloquial",
  "dated",
]);

export const DROP_WORD_TAGS = new Set([
  "alt-of",
  "alternative",
  "rare",
  "archaic",
  "obsolete",
]);

export function normalizeLemma(lemma) {
  return String(lemma).trim().toLowerCase();
}

export const FILTER_OPTIONS = Object.freeze({
  skipNoGloss: true,
  skipNoCefr: true,
  skipSymbolOnly: true,
  maxSenses: 30,
});
