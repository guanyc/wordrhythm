export type VersionStatus = "live" | "planned";

/**
 * Audio support, which differs per translation:
 *  - `none`  reading only
 *  - `tts`   text-to-speech Scripture playback
 *  - `sleep` TTS plus a dedicated Sleep Audio track (gentle nighttime
 *            reading and background sounds)
 *
 * Distinct from the sleep slot itself, which every app has: devotional content
 * before bed is the product baseline, Sleep Audio is what only some
 * translations ship.
 *
 * Single source of truth: drives llms.txt, page copy and structured data.
 * Keep it honest — a capability listed here must be shipped in the Play build.
 */
export type AudioSupport = "none" | "tts" | "sleep";

/**
 * Every app runs the same four daily slots. The labels below are the default
 * English wording; translations localise them (CUV shows 清晨/白天/夜晚/睡前,
 * RVR shows Mañana/Día/Noche plus an Auto toggle).
 *
 * The fourth slot is a real slot, not a synonym for the third — its time
 * window starts in the evening and runs past midnight.
 */
export const DAILY_SLOTS = [
  { key: "morning", en: "Morning", window: "early morning" },
  { key: "day", en: "Day", window: "daytime" },
  { key: "evening", en: "Evening", window: "early evening" },
  { key: "sleep", en: "Sleep", window: "21:00-04:59" },
] as const;

export type DailySlotKey = (typeof DAILY_SLOTS)[number]["key"];

export interface BibleVersion {
  /** URL slug, e.g. "kjv" */
  slug: string;
  /** Short code shown on cards, e.g. "KJV" */
  code: string;
  /** Display name, e.g. "KJV Bible" */
  name: string;
  /** Word Rhythm store name, e.g. "Word Rhythm: KJV Bible" */
  listing: string;
  /** Localised brand name, e.g. 道韵 for the Chinese app. Falls back to listing. */
  brandName?: string;
  /** Tagline shown beside the brand name, in the same language. */
  tagline?: string;
  /** Title currently used on Google Play */
  storeTitle: string;
  /** Language of the translation, e.g. "English" */
  language: string;
  /**
   * BCP-47 tag for the same language, e.g. "zh-Hans".
   * `language` is the display label shown to readers; structured data and
   * hreflang need the machine-readable form, so both live here.
   */
  lang: string;
  /** One-line description for the card */
  summary: string;
  status: VersionStatus;
  /** Audio capability. Omit when the app is text-only. */
  audio?: AudioSupport;
  /** Localised label for the before-bed slot, e.g. "睡前", "Noche", "Nuit". */
  sleepSlotLabel?: string;
  /** Android package id (if published) */
  package?: string;
  /** Google Play URL (if published) */
  playUrl?: string;
  /** Optional social share image (1200x630) for this version's page. */
  ogImage?: string;
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
    lang: "en",
    summary:
      "The King James Version, offline — devotionals, audio, and guided plans across four daily slots: morning, day, evening and sleep.",
    status: "live",
    audio: "sleep",
    sleepSlotLabel: "Sleep",
    package: "com.gyc.ace.kjv",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv",
    icon: "/apps/kjv/icon.png",
    ogImage: "/brand/og-kjv.jpg",
    screenshots: shots("kjv"),
  },
  {
    slug: "asv",
    code: "ASV",
    name: "ASV Bible",
    listing: "Word Rhythm: ASV Bible",
    storeTitle: "Bible ASV - Holy Bible",
    language: "English",
    lang: "en",
    summary:
      "The American Standard Version — a precise, scholarly companion for steady daily reading.",
    status: "live",
    audio: "none",
    sleepSlotLabel: "Sleep",
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
    lang: "en",
    summary:
      "The World English Bible — a modern-language public-domain text for everyday Scripture.",
    status: "live",
    audio: "tts",
    sleepSlotLabel: "Sleep",
    package: "com.gyc.ace.webu",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.webu",
    icon: "/apps/web/icon.png",
    ogImage: "/brand/og-web.jpg",
    screenshots: shots("web"),
  },
  {
    slug: "rvr",
    code: "RVR",
    name: "Biblia RVR",
    listing: "Word Rhythm: Biblia RVR",
    storeTitle: "Biblia RVR - Reina Valera",
    language: "Español",
    lang: "es",
    summary:
      "Reina-Valera para el ritmo de la vida diaria — Spanish Scripture in a calm, daily flow.",
    status: "live",
    audio: "tts",
    sleepSlotLabel: "Noche",
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
    brandName: "道韵",
    tagline: "让神的话进入生活的节奏",
    storeTitle: "和合本圣经 - 祷告、灵修与每日读经",
    language: "中文",
    lang: "zh-Hans",
    summary:
      "和合本圣经 · 中文 —— 清晨、白天、夜晚与睡前四个时段，让经文进入日常的节奏。",
    status: "live",
    audio: "tts",
    sleepSlotLabel: "睡前",
    package: "com.gyc.ace.bible",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.bible",
    icon: "/apps/cuv/icon.png",
    ogImage: "/brand/og-cuv.jpg",
    screenshots: shots("cuv"),
  },
  {
    slug: "aa",
    code: "AA",
    name: "Bíblia AA",
    listing: "Word Rhythm: Bíblia AA",
    storeTitle: "Bíblia AA Almeida Atualizada",
    language: "Português",
    lang: "pt-BR",
    summary:
      "Almeida Atualizada — a Bíblia em português para o ritmo da vida diária.",
    status: "live",
    audio: "tts",
    sleepSlotLabel: "Noite",
    package: "com.guanyc.ace.almeida",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.guanyc.ace.almeida",
    icon: "/apps/aa/icon.png",
    screenshots: shots("aa"),
  },
  {
    slug: "lsg",
    code: "LSG",
    name: "Bible Louis Segond 1910",
    listing: "Word Rhythm: Louis Segond 1910",
    brandName: "WordRhythm",
    tagline: "la Parole au rythme de tes journées",
    storeTitle: "Bible Louis Segond 1910",
    language: "Français",
    lang: "fr",
    summary:
      "Une Bible Louis Segond gratuite et entièrement hors ligne, pour la méditation, la lecture et la prière au rythme de tes journées.",
    status: "live",
    audio: "none",
    sleepSlotLabel: "Nuit",
    package: "com.gyc.ace.lsg",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.lsg",
    icon: "/apps/lsg/icon.png",
    ogImage: "/brand/og-lsg.jpg",
    screenshots: shots("lsg"),
  },
];

export function getVersion(slug: string): BibleVersion | undefined {
  return versions.find((v) => v.slug === slug);
}

/** True when the translation ships the dedicated Sleep Audio track. */
export function hasSleepAudio(slug: string): boolean {
  return getVersion(slug)?.audio === "sleep";
}

/**
 * Human-readable audio note for cards, llms.txt and structured data.
 * `none` returns null so callers can skip the line entirely rather than
 * printing "no audio" everywhere.
 */
export function audioNote(slug: string): string | null {
  switch (getVersion(slug)?.audio) {
    case "sleep":
      return "Sleep Audio (gentle nighttime reading + background sounds)";
    case "tts":
      return "text-to-speech audio";
    default:
      return null;
  }
}

/**
 * The before-bed slot label in this translation's own words, e.g. "睡前",
 * "Noche", "Nuit". Falls back to the English default.
 */
export function sleepSlotLabel(slug: string): string {
  return getVersion(slug)?.sleepSlotLabel ?? "Sleep";
}

/** The standalone Take a Break app (screenshots come from its Play listing). */
export const takeABreak = {
  package: "com.guanyc.takeabreak",
  playUrl:
    "https://play.google.com/store/apps/details?id=com.guanyc.takeabreak",
  icon: "/apps/take-a-break/icon.png",
  screenshots: shots("take-a-break"),
};
