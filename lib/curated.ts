/**
 * Curated Take a Break passages.
 *
 * Built by scripts/build-curated.py from the same SQLite tables the Android
 * app reads: devotional_compact.db supplies the lines Take a Break actually
 * shows (micro / insight / prayer) and BibleData_template.db supplies the
 * longer devotional (meaning / reflection / prayer) for readers who want
 * more than a 60-second pause.
 *
 * The app holds 15,777 rows. The site keeps the ten passages each feeling
 * page lists, stored one file per feeling so a page never loads the whole
 * set.
 * The same directory layout is meant to hold situations/ and topics/ next.
 */
import fs from "node:fs";
import path from "node:path";

import index from "@/data/curated/emotions.json";

export interface CuratedVerse {
  reference: string;
  /** KJV text. */
  text: string;
  /** One-line takeaway, as shown in the app. */
  micro: string;
  /** Compact reflection. */
  insight: string;
  /** Compact prayer. */
  prayer: string;
  /** Full devotional: what the passage means. */
  meaning: string;
  /** Full devotional: longer reflection. */
  reflection: string;
  /** Full devotional: prayer. */
  fullPrayer: string;
}

export interface CuratedEntry {
  slug: string;
  title: string;
  subtitle: string;
  emotions: { code: string; label: string }[];
  verses: CuratedVerse[];
}

export interface CuratedIndexEntry {
  slug: string;
  title: string;
  subtitle: string;
  labels: string[];
  preview: string;
}

const DIR = path.join(process.cwd(), "data/curated/emotions");

export function curatedIndex(): CuratedIndexEntry[] {
  return index as CuratedIndexEntry[];
}

export function curatedSlugs(): string[] {
  return curatedIndex().map((e) => e.slug);
}

/** Reads one feeling's file, so a page only ever loads its own passages. */
export function getCurated(slug: string): CuratedEntry | undefined {
  const file = path.join(DIR, `${slug.toLowerCase()}.json`);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf8")) as CuratedEntry;
}
