/**
 * Facts about each translation that llms.txt states as plain text.
 *
 * This duplicates data that also lives in `lib/versions.ts` (TypeScript), which
 * build scripts cannot import. `scripts/check-data.mjs` runs on every build and
 * fails if `slug`, `audio`, `sleepLabel`, `listing` or `lang` drift apart, so
 * edit both and let the check catch a missed one.
 *
 * `audio` values must match `AudioSupport` in lib/versions.ts:
 *   "sleep" = TTS plus a dedicated Sleep Audio track
 *   "tts"   = text-to-speech playback
 *   "none"  = reading and devotionals only
 */
export const versions = [
  {
    slug: "kjv",
    name: "KJV Bible",
    listing: "Word Rhythm: KJV Bible",
    summary:
      "offline KJV with morning, day, evening and before-bed devotionals, reading plans and memorization",
    language: "English",
    lang: "en",
    audio: "sleep",
    audioNote:
      "**Sleep Audio** — gentle nighttime Scripture reading with soft pacing, plus peaceful background sounds",
    sleepLabel: "Sleep",
    package: "com.gyc.ace.kjv",
  },
  {
    slug: "asv",
    name: "ASV Bible",
    listing: "Word Rhythm: ASV Bible",
    summary:
      "scholarly American Standard Version, reading and devotionals only",
    language: "English",
    lang: "en",
    audio: "none",
    audioNote: "Text only, no audio",
    sleepLabel: "Sleep",
    package: "com.gyc.ace.asv",
  },
  {
    slug: "web",
    name: "WEB Bible",
    listing: "Word Rhythm: WEB Bible",
    summary: "modern-language public-domain World English Bible",
    language: "English",
    lang: "en",
    audio: "tts",
    audioNote: "text-to-speech audio",
    sleepLabel: "Sleep",
    package: "com.gyc.ace.webu",
  },
  {
    slug: "rvr",
    name: "Biblia RVR",
    listing: "Word Rhythm: Biblia RVR",
    summary: "Reina-Valera with four daily slots",
    language: "Español",
    lang: "es",
    audio: "tts",
    audioNote: "text-to-speech audio",
    sleepLabel: "Noche",
    package: "com.gyc.ace.esp",
  },
  {
    slug: "cuv",
    name: "和合本圣经",
    listing: "Word Rhythm: 和合本圣经",
    summary: "和合本圣经（中文），含清晨、白天、夜晚与睡前四个时段",
    language: "中文",
    lang: "zh-Hans",
    audio: "tts",
    audioNote: "TTS 朗读",
    sleepLabel: "睡前",
    package: "com.gyc.ace.bible",
  },
  {
    slug: "aa",
    name: "Bíblia AA",
    listing: "Word Rhythm: Bíblia AA",
    summary: "Almeida Atualizada with four daily slots",
    language: "Português",
    lang: "pt-BR",
    audio: "tts",
    audioNote: "text-to-speech audio",
    sleepLabel: "Noite",
    package: "com.guanyc.ace.almeida",
  },
  {
    slug: "lsg",
    name: "Bible Louis Segond 1910",
    listing: "Word Rhythm: Louis Segond 1910",
    summary:
      "LSG 1910 hors ligne, méditation, plans de lecture et recherche",
    language: "Français",
    lang: "fr",
    audio: "none",
    audioNote: "Texte uniquement, sans audio",
    sleepLabel: "Nuit",
    package: "com.gyc.ace.lsg",
  },
];

/** The four daily slots, matching `DAILY_SLOTS` in lib/versions.ts. */
export const slots = [
  { key: "morning", en: "Morning", window: "early morning" },
  { key: "day", en: "Day", window: "daytime" },
  { key: "evening", en: "Evening", window: "early evening" },
  { key: "sleep", en: "Sleep", window: "21:00-04:59" },
];

/** Guides published on the site, newest first. */
export const guides = [
  {
    slug: "what-do-people-need-from-a-bible-app-today",
    title: "What Do People Need From a Bible App Today?",
  },
  {
    slug: "a-bible-app-for-real-life-not-just-research",
    title: "A Bible App for Real Life, Not Just Research",
  },
  {
    slug: "what-is-take-a-break-in-a-bible-app",
    title: "What Is Take a Break in a Bible App?",
  },
  {
    slug: "what-is-the-best-kjv-bible-app-for-offline-reading",
    title: "What Is the Best KJV Bible App for Offline Reading?",
  },
  {
    slug: "how-to-start-a-bible-reading-plan-without-the-guilt-loop",
    title: "How to Start a Bible Reading Plan Without the Guilt Loop",
  },
  {
    slug: "what-bible-verses-help-when-you-feel-anxious",
    title: "What Bible Verses Help When You Feel Anxious?",
  },
  {
    slug: "fell-behind-bible-reading-plan-take-a-break",
    title: "Fell Behind on Your Bible Reading Plan? Here's a Gentler Way Back",
  },
  {
    slug: "kjv-bible-app-daily-devotional-features",
    title: "A Daily Devotional That Fits Real Life (KJV Bible App – Daily Devotional)",
  },
];
