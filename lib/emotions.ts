/**
 * Bible verses by feeling.
 *
 * Built by scripts/build-take-a-break.py from the same SQLite tables the
 * Android app uses to answer "How are you feeling?" — emotion_theme_mapping
 * resolves an emotion to themes, verse_themes scores each verse for those
 * themes, and the top 20 per emotion become this list.
 *
 * Emotions with near-identical verse lists share a page (see OVERLAP_THRESHOLD
 * in the script). Every emotion is still listed on the page, so "bible verses
 * for gratitude" and "for thankfulness" land on one URL rather than two pages
 * competing with the same content.
 */
import pages from "@/data/take-a-break.json";

export interface Verse {
  /** "Isaiah 26:3" */
  reference: string;
  /** KJV text. */
  text: string;
  /** One-line takeaway, the app's micro message. */
  micro: string;
  /** Short reflection shown when the reader expands the entry. */
  insight: string;
  /** Short prayer shown when the reader expands the entry. */
  prayer: string;
}

export interface EmotionVersePage {
  slug: string;
  /** Short human title, e.g. "Anxiety and fear". */
  title: string;
  /** One line on when this applies, used as the page description opener. */
  subtitle: string;
  /** Emotions folded into this page, with their database labels. */
  emotions: { code: string; label: string }[];
  verses: Verse[];
}

const all = pages as EmotionVersePage[];

const bySlug = new Map(all.map((p) => [p.slug, p]));

export function getEmotionPage(slug: string): EmotionVersePage | undefined {
  return bySlug.get(slug.toLowerCase());
}

export function allEmotionPages(): EmotionVersePage[] {
  return all;
}

export function emotionPageSlugs(): string[] {
  return all.map((p) => p.slug);
}

/**
 * Searches can land on any synonym ("verses for fear"), so look up by emotion
 * code as well as slug.
 */
const byEmotion = new Map(
  all.flatMap((p) => p.emotions.map((e) => [e.code.toLowerCase(), p] as const)),
);

export function findByEmotion(code: string): EmotionVersePage | undefined {
  return byEmotion.get(code.toLowerCase());
}

export const TOTAL_EMOTION_PAGES = all.length;