/**
 * Writes out/llms.txt after `next build` from scripts/llms-data.mjs.
 *
 * llms.txt is the entry point AI crawlers read to understand what the site
 * covers. Generating it from data keeps the claims honest: one list of
 * translations drives the page, the sitemap and this file.
 *
 * The file is written to `public/` as well as `out/`. Next copies `public/`
 * into the export, so both paths end up with identical bytes — the public copy
 * is what `next dev` serves, and writing it from here keeps the fallback from
 * drifting away from the generated one.
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { versions, slots, guides } from "./llms-data.mjs";

const HOST = "https://wordrhythm.app";
const OUT = path.join(process.cwd(), "out");
const PUBLIC = path.join(process.cwd(), "public");

const slug = (word) =>
  word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * The KJV glossary. Only words with their own page are listed — the rest live
 * behind the search box on /kjv-words, and naming 1440 of them here would bury
 * everything else.
 *
 * FEATURED lives in lib/archaic.ts so the site and this file cannot disagree.
 * It is read out of that source rather than duplicated here; scripts/check-data.mjs
 * fails the build if the two lists stop matching.
 */
const allWords = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "kjv-words.json"), "utf8"),
);
const featuredSet = new Set(
  (
    await readFile(path.join(process.cwd(), "lib", "archaic.ts"), "utf8")
  )
    .match(/const FEATURED = new Set\(\[([\s\S]*?)\]\)/)[1]
    .match(/"([A-Za-z-]+)"/g)
    .map((m) => m.slice(1, -1).toLowerCase()),
);
const featured = allWords.filter((w) => featuredSet.has(w.word.toLowerCase()));

/** Bible verses by feeling — the same emotion→theme→verse mapping the app uses. */
const emotionPages = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "take-a-break.json"), "utf8"),
);
// Same problem as the word list above: alphabetical order is not what a reader
// is looking for. Lead with the feelings people actually search for.
//
// The order lives in lib/emotions.ts so the KJV version page and this file
// cannot disagree; it is read out of that source rather than duplicated here.
// A misspelled slug used to be skipped in silence, which quietly dropped the
// entry — the check below fails the build instead.
const FEELING_FIRST = (
  await readFile(path.join(process.cwd(), "lib", "emotions.ts"), "utf8")
)
  .match(/const FEATURED_FEELINGS = \[([\s\S]*?)\]/)[1]
  .match(/"([a-z-]+)"/g)
  .map((m) => m.slice(1, -1));
const rankedFeelings = [
  ...FEELING_FIRST.filter((s) => emotionPages.some((p) => p.slug === s)).map(
    (s) => emotionPages.find((p) => p.slug === s),
  ),
  ...emotionPages.filter((p) => !FEELING_FIRST.includes(p.slug)),
];

const unknown = FEELING_FIRST.filter(
  (s) => !emotionPages.some((p) => p.slug === s),
);
if (unknown.length > 0) {
  console.error(
    `FEELING_FEELINGS references slugs that do not exist: ${unknown.join(", ")}`,
  );
  process.exit(1);
}

/**
 * Order the listed words by what people actually search for.
 *
 * Alphabetical order buries the entry point: "thee", "thou" and "unto" sit past
 * any sensible cut-off while "backs" and "bethink" take the top slots. These are
 * the words that block a reader on their first page of Scripture, so they come
 * first, then the remaining entries alphabetically.
 */
const THOU_FIRST = [
  "thee", "thou", "thy", "thine", "ye", "unto", "hath", "doth", "didst", "dost",
  "shalt", "wilt", "saith", "knowest", "ought", "verily", "wherefore", "therefore",
  "lo", "comforter", "importunity",
];
const ranked = [
  ...THOU_FIRST.filter((w) => featuredSet.has(w)).map(
    (w) => featured.find((e) => e.word.toLowerCase() === w),
  ),
  ...featured.filter((e) => !THOU_FIRST.includes(e.word.toLowerCase())),
];

const playUrl = (pkg) =>
  `https://play.google.com/store/apps/details?id=${pkg}`;

const byAudio = (level) =>
  versions.filter((v) => v.audio === level).map((v) => v.name);

const list = (items) => items.join(", ");

const appLines = versions.map((v) => {
  const summary = v.summary ?? "offline Bible reading with four daily slots";
  // Non-English summaries already read as a full sentence, so they carry their
  // own punctuation and take the audio note as a separate sentence.
  const cjk = /[一-鿿]/.test(summary);
  const audio =
    v.audio === "sleep"
      ? cjk
        ? "。另有睡前音频：轻柔的夜间经文朗读与背景音"
        : ", plus **Sleep Audio** — gentle nighttime Scripture reading with soft pacing and peaceful background sounds"
      : v.audio === "tts"
        ? cjk
          ? "。支持 TTS 朗读"
          : `, ${v.audioNote}`
        : cjk
          ? "。纯文字，无音频"
          : `. ${v.audioNote}`;
  return `- [${v.listing ?? v.name}](${HOST}/versions/${v.slug}) (${v.language}) — ${summary}${audio}${cjk ? "" : "."} [Google Play](${playUrl(v.package)})`;
});

const md = `# Word Rhythm

> Scripture for the rhythm of everyday life. A family of ${versions.length} Android Bible apps
> — ${list(versions.map((v) => v.name))} — each built around
> ${slots.length} daily touchpoints: ${slots.map((s) => s.en.toLowerCase()).join(", ")}.

## Daily rhythm (every app)

All ${versions.length} apps run the same ${slots.length} daily slots:

${slots.map((s, i) => `${i + 1}. **${s.en}** (${s.window})`).join("\n")}

The fourth slot is a real slot, not a synonym for the third: it opens in the
evening and runs past midnight. Every app has before-bed devotional content —
the label is localised (${list(versions.map((v) => v.sleepLabel))}).

Each devotional follows the same shape: time window, theme tag, the verse with
its reference, what the verse says, how to reflect, and a short prayer.

## Audio support (varies by translation)

Audio is the feature that differs between apps:

- **Sleep Audio — ${list(byAudio("sleep"))} only.** Gentle nighttime Scripture
  reading with soft pacing and quiet pauses, plus peaceful background sounds.
- **Text-to-speech — ${list(byAudio("tts"))}.** Read-aloud Scripture playback.
- **No audio — ${list(byAudio("none"))}.** Reading and devotionals only.

Every app has all ${slots.length} devotional slots, including the sleep slot.
Only ${list(byAudio("sleep"))} ships the dedicated Sleep Audio track.

## Apps

${appLines.join("\n")}
- [All versions](${HOST}/versions)

## Bible verses by feeling

KJV passages matched to a feeling, the same way the app's Take a Break picks a
verse — emotion → themes → highest-weighted verses. ${emotionPages.length} collections,
20 verses each. This is the site's highest-intent content: these are the
questions people actually ask.

${rankedFeelings
  .map(
    (p) =>
      `- [${p.title}](${HOST}/bible-verses/${p.slug}) — ${p.verses.length} verses; ${
        p.verses[0] ? `starts at ${p.verses[0].reference}` : "see page"
      }`,
  )
  .join("\n")}
- [All collections](${HOST}/bible-verses)

## KJV words

${ranked
  .map((w) => {
    // "thee, you (archaic objective form)" — the first comma chunk is often
    // just the word repeated, which tells a reader nothing.
    const modern = w.modern
      .split(",")
      .map((s) => s.trim())
      .find((s) => s.toLowerCase() !== w.word.toLowerCase());
    const ref = w.reference
      ? `${w.reference.book} ${w.reference.chapter}:${w.reference.verse}`
      : null;
    return `- [${w.word}](${HOST}/kjv-words/${slug(w.word)}) — ${
      modern ?? w.word
    }${ref ? `; ${ref}` : ""}`;
  })
  .join("\n")}
- [Full glossary of ${allWords.length} KJV words](${HOST}/kjv-words)

Every entry in the glossary carries a modern equivalent, a definition and a
verbatim KJV example with its book, chapter and verse. The ones listed above
are the words readers look up most; all ${allWords.length} are searchable at
the link above.

## Facts

- Platform: Android only. Fully offline reading. No account required.
- ${slots.length} daily slots in every app: ${slots.map((s) => s.en.toLowerCase()).join(", ")}.
- Reading plans, memorization and Take a Break are available in every app.
- Audio varies: Sleep Audio (${list(byAudio("sleep"))}), text-to-speech (${list(byAudio("tts"))}), or none (${list(byAudio("none"))}).
- Also available as a standalone app: [Take a Break](${HOST}/take-a-break)
- KJV archaic-word glossary: ${allWords.length} entries, examples verified against the full KJV text.

## Guides

${guides.map((g) => `- [${g.title}](${HOST}/blog/${g.slug})`).join("\n")}
- [All guides](${HOST}/blog)
`;

await mkdir(OUT, { recursive: true });
await mkdir(PUBLIC, { recursive: true });
await writeFile(path.join(OUT, "llms.txt"), md);
await writeFile(path.join(PUBLIC, "llms.txt"), md);
console.log(
  `llms.txt written: ${versions.length} apps, ${slots.length} slots, ` +
    `${guides.length} guides, ${allWords.length} KJV words, ${emotionPages.length} verse collections`,
);