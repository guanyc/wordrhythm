/**
 * Bible verses by feeling.
 *
 * Built by scripts/build-take-a-break.py from the same SQLite tables the
 * Android app uses to answer "How are you feeling?" — emotion_theme_mapping
 * resolves an emotion to themes, verse_themes scores each verse for those
 * themes, and the highest-scoring ten per emotion become this list.
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

/**
 * Editorial grouping for the feeling lists.
 *
 * Forty-one flat chips are hard to scan, so /bible-verses and /take-a-break
 * list them under four headings. This lives here rather than in the generated
 * data because it is a reading decision, not data — and the headings give
 * each collection page a themed neighbour to link from.
 */
export interface EmotionGroup {
  title: string;
  blurb: string;
  slugs: string[];
}

export const emotionGroups: EmotionGroup[] = [
  {
    title: "Hard moments",
    blurb: "When the day is heavy, or something has gone wrong.",
    slugs: [
      "angry",
      "anxiety",
      "bitter",
      "disappointed",
      "discouraged",
      "empty",
      "fearful",
      "grieving",
      "guilt",
      "lonely-strong",
      "overwhelmed",
      "persecuted",
      "sad",
      "stressed",
      "tempted",
      "uncertain",
    ],
  },
  {
    title: "Seeking",
    blurb: "Looking for direction, truth, or the will to keep going.",
    slugs: [
      "confused",
      "confused-seeking",
      "seeking-truth",
      "unjust",
      "justice-longing",
      "growth",
      "determined",
    ],
  },
  {
    title: "Rest and trust",
    blurb: "Quiet ground — peace, courage, hope, and holding on.",
    slugs: [
      "peace",
      "content",
      "courage",
      "inspired",
      "hope",
      "refreshed",
      "trusting-in-god",
      "unity-needed",
    ],
  },
  {
    title: "Worship and gratitude",
    blurb: "Turning toward God with thanks, love, and praise.",
    slugs: [
      "blessed",
      "gratitude",
      "joy",
      "hopeful-joyful",
      "loving",
      "prayerful",
      "repentant",
      "serving",
      "thankful-for-grace",
      "worshipful",
    ],
  },
];

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

/** The feeling lists, under their editorial headings. */
export function groupedEmotionPages(): {
  title: string;
  blurb: string;
  pages: EmotionVersePage[];
}[] {
  return emotionGroups.map((group) => ({
    title: group.title,
    blurb: group.blurb,
    pages: group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((p): p is EmotionVersePage => Boolean(p)),
  }));
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

/**
 * The feelings worth naming on a page that links here, in the order people
 * reach for them. These are slugs in data/take-a-break.json.
 *
 * Single source for the order, shared with scripts/llms.mjs, which reads the
 * list straight out of this file. Writing a separate list there is how
 * "grief" and "restless" — neither of which exists as a page — slipped
 * through a filter that skipped silently instead of failing.
 */
const FEATURED_FEELINGS = [
  "anxiety",
  "grieving",
  "gratitude",
  "hope",
  "lonely-strong",
  "angry",
  "guilt",
  "peace",
  "courage",
  "confused",
  "tempted",
  "empty",
  "prayerful",
  "persecuted",
  "unjust",
  "serving",
];

/** Featured feelings that actually have a page, in the declared order. */
export function featuredFeelings(): EmotionVersePage[] {
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return FEATURED_FEELINGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is EmotionVersePage => Boolean(p),
  );
}

/** Slugs that were asked for but do not exist, so the caller can fail loudly. */
export function missingFeelings(): string[] {
  const known = new Set(all.map((p) => p.slug));
  return FEATURED_FEELINGS.filter((slug) => !known.has(slug));
}