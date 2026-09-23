export type VersionStatus = "live" | "planned";

export interface BibleVersion {
  /** URL slug, e.g. "kjv" */
  slug: string;
  /** Short code shown on cards, e.g. "KJV" */
  code: string;
  /** Display name, e.g. "KJV Bible" */
  name: string;
  /** Word Rhythm store name, e.g. "Word Rhythm: KJV Bible" */
  listing: string;
  /** Title currently used on Google Play */
  storeTitle: string;
  /** Language of the translation, e.g. "English" */
  language: string;
  /** One-line description for the card */
  summary: string;
  status: VersionStatus;
  /** Android package id (if published) */
  package?: string;
  /** Google Play URL (if published) */
  playUrl?: string;
  /** App icon in /public (from the Play listing) */
  icon?: string;
  /** Phone screenshots in /public (from the Play listing) */
  screenshots?: string[];
}

/** Builds the screenshot paths downloaded from a Play listing. */
function shots(slug: string, count = 4): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/apps/${slug}/${String(i + 1).padStart(2, "0")}.jpg`,
  );
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
    storeTitle: "Bible KJV",
    language: "English",
    summary:
      "The King James Version, offline — devotionals, audio, and guided plans for morning, day, and evening.",
    status: "live",
    package: "com.gyc.ace.kjv",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv",
    icon: "/apps/kjv/icon.png",
    screenshots: shots("kjv"),
  },
  {
    slug: "asv",
    code: "ASV",
    name: "ASV Bible",
    listing: "Word Rhythm: ASV Bible",
    storeTitle: "Bible ASV - Holy Bible",
    language: "English",
    summary:
      "The American Standard Version — a precise, scholarly companion for steady daily reading.",
    status: "live",
    package: "com.gyc.ace.asv",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.asv",
    icon: "/apps/asv/icon.png",
    screenshots: shots("asv"),
  },
  {
    slug: "web",
    code: "WEB",
    name: "WEB Bible",
    listing: "Word Rhythm: WEB Bible",
    storeTitle: "Bible Web-World English Bible",
    language: "English",
    summary:
      "The World English Bible — a modern-language public-domain text for everyday Scripture.",
    status: "live",
    package: "com.gyc.ace.webu",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.webu",
    icon: "/apps/web/icon.png",
    screenshots: shots("web"),
  },
  {
    slug: "rvr",
    code: "RVR",
    name: "Biblia RVR",
    listing: "Word Rhythm: Biblia RVR",
    storeTitle: "Biblia RVR - Reina Valera",
    language: "Español",
    summary:
      "Reina-Valera para el ritmo de la vida diaria — Spanish Scripture in a calm, daily flow.",
    status: "live",
    package: "com.gyc.ace.esp",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.esp",
    icon: "/apps/rvr/icon.png",
    screenshots: shots("rvr"),
  },
  {
    slug: "cuv",
    code: "CUV",
    name: "和合本圣经",
    listing: "Word Rhythm: 和合本圣经",
    storeTitle: "和合本圣经 - 祷告、灵修与每日读经",
    language: "中文",
    summary:
      "Chinese Union Version — 晨读、日间片刻与晚间默想，让经文进入日常的节奏。",
    status: "live",
    package: "com.gyc.ace.bible",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.bible",
    icon: "/apps/cuv/icon.png",
    screenshots: shots("cuv"),
  },
  {
    slug: "aa",
    code: "AA",
    name: "Bíblia AA",
    listing: "Word Rhythm: Bíblia AA",
    storeTitle: "Bíblia AA Almeida Atualizada",
    language: "Português",
    summary:
      "Almeida Atualizada — a Bíblia em português para o ritmo da vida diária.",
    status: "live",
    package: "com.guanyc.ace.almeida",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.guanyc.ace.almeida",
    icon: "/apps/aa/icon.png",
    screenshots: shots("aa"),
  },
];

export function getVersion(slug: string): BibleVersion | undefined {
  return versions.find((v) => v.slug === slug);
}

/** The standalone Take a Break app (screenshots come from its Play listing). */
export const takeABreak = {
  package: "com.guanyc.takeabreak",
  playUrl:
    "https://play.google.com/store/apps/details?id=com.guanyc.takeabreak",
  icon: "/apps/take-a-break/icon.png",
  screenshots: shots("take-a-break"),
};
