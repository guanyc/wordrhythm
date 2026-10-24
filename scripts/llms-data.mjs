import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

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
  {
    slug: "luther",
    name: "Lutherbibel 1912",
    listing: "Word Rhythm: Lutherbibel 1912",
    summary:
      "Lutherbibel 1912 offline: Lesen, Andacht, Innehalten und Gebet",
    language: "Deutsch",
    lang: "de",
    audio: "tts",
    audioNote: "Bibel wird vorgelesen (TTS)",
    sleepLabel: "Nacht",
    package: "com.gyc.ace.luther",
  },
];

/** The four daily slots, matching `DAILY_SLOTS` in lib/versions.ts. */
export const slots = [
  { key: "morning", en: "Morning", window: "early morning" },
  { key: "day", en: "Day", window: "daytime" },
  { key: "evening", en: "Evening", window: "early evening" },
  { key: "sleep", en: "Sleep", window: "21:00-04:59" },
];

/**
 * Guides published on the site, newest first.
 *
 * The Guides index at /blog is generated from content/blog, and llms.txt has to
 * name the same set. This list used to be typed out here, so every post written
 * after it was last edited appeared on the site but not in llms.txt. Derive it
 * from the same source instead, and the two cannot disagree.
 */
export const guides = fs.existsSync(BLOG_DIR)
  ? fs
      .readdirSync(BLOG_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const slug = file.slice(0, -3);
        const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
        // gray-matter turns an unquoted `date:` into a Date, so normalise to ISO
        // the way lib/blog.ts does — sorting on `Fri Oct 24 ...` orders by weekday.
        const rawDate = data.date;
        return {
          slug,
          title: String(data.title ?? slug),
          date: rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate ?? ""),
          draft: data.draft === true,
        };
      })
      .filter((post) => !post.draft)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ slug, title }) => ({ slug, title }))
  : [];
