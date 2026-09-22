export type VersionStatus = "live" | "planned";

export interface BibleVersion {
  /** URL slug, e.g. "kjv" */
  slug: string;
  /** Short code shown on cards, e.g. "KJV" */
  code: string;
  /** Display name, e.g. "KJV Bible" */
  name: string;
  /** Store listing title, e.g. "Word Rhythm: KJV Bible" */
  listing: string;
  /** One-line description for the card */
  summary: string;
  status: VersionStatus;
  /** Android package id (if published) */
  package?: string;
  /** Google Play URL (if published) */
  playUrl?: string;
}

/**
 * Single source of truth for the version grid and /versions page.
 * Add a new translation here and it flows everywhere.
 */
export const versions: BibleVersion[] = [
  {
    slug: "kjv",
    code: "KJV",
    name: "KJV Bible",
    listing: "Word Rhythm: KJV Bible",
    summary:
      "The timeless King James Version, woven into your daily rhythm with devotionals, audio, and reading plans.",
    status: "live",
    package: "com.gyc.ace.kjv",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv",
  },
  {
    slug: "asv",
    code: "ASV",
    name: "ASV Bible",
    listing: "Word Rhythm: ASV Bible",
    summary:
      "The American Standard Version — a precise, scholarly companion for steady daily reading.",
    status: "planned",
  },
  {
    slug: "web",
    code: "WEB",
    name: "WEB Bible",
    listing: "Word Rhythm: WEB Bible",
    summary:
      "The World English Bible — a modern-language public-domain text for everyday Scripture.",
    status: "planned",
  },
  {
    slug: "rvr",
    code: "RVR",
    name: "Biblia RVR",
    listing: "Word Rhythm: Biblia RVR",
    summary:
      "Reina-Valera para el ritmo de la vida diaria — Spanish Scripture in a calm, daily flow.",
    status: "planned",
  },
  {
    slug: "lsg",
    code: "LSG",
    name: "Bible LSG",
    listing: "Word Rhythm: Bible LSG",
    summary:
      "La Bible Louis Segond — French Scripture for the quiet moments of the day.",
    status: "planned",
  },
];
