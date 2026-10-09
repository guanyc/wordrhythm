/**
 * KJV archaic-word glossary.
 *
 * The data is the same file the KJV Android app ships
 * (`MyApplication/app/src/main/res/raw/kjv_words_json.json`), copied here so
 * the site can render it. Every example is verbatim KJV text with a reference
 * to book, chapter and verse — verified against `kjv_bible.json` by
 * `verify_archaic_examples.py` in the KJV_CUV repo.
 *
 * Why this matters for search: "thee", "thou" and "unto" are high-volume
 * lookups with almost no dedicated content on the web. Each word page answers
 * one of them directly, which is the shape both search engines and AI
 * retrieval prefer.
 */
import words from "@/data/kjv-words.json";

export interface VerseRef {
  book: string;
  chapter: number;
  verse: number;
}

export interface ArchaicWord {
  /** The headword as spelled in the KJV, e.g. "thee". */
  word: string;
  /** IPA pronunciation. */
  phonetic: string;
  /** Modern English equivalent(s), comma separated. */
  modern: string;
  /** What the word means in this translation. */
  definition: string;
  /** Verbatim KJV text containing the word. */
  quote: string;
  /** Where the quote comes from. Always present. */
  reference: VerseRef | null;
}

const all = words as ArchaicWord[];

const slugify = (word: string) =>
  word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Words that get their own page.
 *
 * Only words a beginner actually searches for. The remaining 1400+ entries are
 * reachable through the full glossary — giving each one a page would dilute
 * the site into a dictionary and earn thin pages for terms nobody looks up.
 *
 * Three groups, each with real query volume behind it:
 *   1. the thou/thee/ye verb system, which a reader meets on the first page
 *      and cannot decode without help
 *   2. function words that carry weight the modern reader misses
 *   3. concrete words whose KJV sense has drifted — "comforter", "forsomuch",
 *      "importunity" mean something specific in the text that a modern reader
 *      gets wrong
 *
 * Every entry was checked against data/kjv-words.json. Stored lowercase: the
 * glossary spells some headwords with a leading capital (Comforter), and this
 * set is only ever compared against a lowercased word.
 */
const FEATURED = new Set([
  // second-person pronouns and their verb forms
  "thee", "thou", "thy", "thine", "ye",
  "hath", "doth", "didst", "dost", "shalt", "wilt", "saith", "knowest", "ought",
  // function words that carry weight
  "unto", "verily", "wherefore", "therefore", "lo", "forsomuch",
  "forasmuch", "contrariwise", "whilst", "whosoever", "whereof", "wherein",
  "whereunto", "wherewithal", "wist", "bethink",
  // nouns and verbs whose sense has drifted
  "comforter", "comfortless", "concubine", "importunity",
  "fornicator", "impenitent", "impotent", "impute", "ensample",
  "covetous", "concupiscence", "conversation", "profaned", "wanton",
  "discomfited", "unequaled", "unfeigned", "unsatiable", "imperious",
  // participles readers meet and cannot place
  "edify", "exhort", "forsaking", "forbear", "forbare",
  "consecrate", "backslider", "chasten", "foreknow", "forewarn",
  "disquiet", "dispossess", "persecute", "whisperings", "gainsay",
]);

// Normalised here as a belt-and-braces measure: if a capital ever slips into
// FEATURED it should not silently drop that word from its own page.
const FEATURED_SET = new Set([...FEATURED].map((w) => w.toLowerCase()));

/** Slug -> entry map. */
const bySlug = new Map(all.map((w) => [slugify(w.word), w]));

/** Entry for a slug produced by {@link slugify}, or undefined. */
export function getWord(slug: string): ArchaicWord | undefined {
  return bySlug.get(slug.toLowerCase());
}

/** Every entry, alphabetically. */
export function allWords(): ArchaicWord[] {
  return [...all].sort((a, b) =>
    a.word.toLowerCase().localeCompare(b.word.toLowerCase()),
  );
}

/** Entries that get their own page, alphabetically. */
export function featuredWords(): ArchaicWord[] {
  return allWords().filter((w) => FEATURED_SET.has(w.word.toLowerCase()));
}

export function isFeatured(word: string): boolean {
  return FEATURED_SET.has(word.toLowerCase());
}

/** Slugs for generateStaticParams — featured words only. */
export function featuredWordSlugs(): string[] {
  return featuredWords().map((w) => slugify(w.word));
}

/** "1 John 4:11" — the form a reader can paste into a Bible app. */
export function formatRef(ref: VerseRef): string {
  return `${ref.book} ${ref.chapter}:${ref.verse}`;
}

/** "thee" -> "T" for grouping. */
export function initialFor(word: string): string {
  const ch = word[0]?.toUpperCase() ?? "#";
  return /[A-Z]/.test(ch) ? ch : "#";
}

export function wordsByInitial(): Record<string, ArchaicWord[]> {
  const groups: Record<string, ArchaicWord[]> = {};
  for (const w of allWords()) {
    const k = initialFor(w.word);
    (groups[k] ??= []).push(w);
  }
  return groups;
}

/** Slug -> entry map for client-side search on the glossary page. */
export function searchIndex(): { slug: string; word: string; modern: string }[] {
  return all.map((w) => ({
    slug: slugify(w.word),
    word: w.word,
    modern: w.modern,
  }));
}

export { slugify };
export const TOTAL_WORDS = all.length;