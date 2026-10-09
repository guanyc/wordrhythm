/**
 * Guards against scripts/llms-data.mjs drifting away from lib/versions.ts.
 *
 * The two files hold the same facts in different languages (ESM data vs
 * TypeScript). Nothing stops them from diverging except this check, so run it
 * after touching either one:
 *
 *   node scripts/check-data.mjs
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { versions as llmsVersions, slots, guides } from "./llms-data.mjs";

const root = path.join(process.cwd(), "lib", "versions.ts");
const src = await readFile(root, "utf8");

/** Pulls `slug: "x", ... audio: "y"` records out of the TS source. */
function parseTs() {
  const out = [];
  for (const block of src.split(/\n  \{\n/).slice(1)) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const audio = block.match(/audio:\s*"([^"]+)"/)?.[1] ?? "none";
    const sleepSlotLabel = block.match(/sleepSlotLabel:\s*"([^"]+)"/)?.[1];
    const listing = block.match(/listing:\s*"([^"]+)"/)?.[1];
    const lang = block.match(/\blang:\s*"([^"]+)"/)?.[1];
    if (slug) out.push({ slug, audio, sleepSlotLabel, listing, lang });
  }
  return out;
}

const problems = [];

const tsVersions = parseTs();
if (tsVersions.length !== llmsVersions.length) {
  problems.push(
    `translation count differs: versions.ts ${tsVersions.length}, llms-data.mjs ${llmsVersions.length}`,
  );
}

const bySlug = new Map(tsVersions.map((v) => [v.slug, v]));
for (const v of llmsVersions) {
  const ts = bySlug.get(v.slug);
  if (!ts) {
    problems.push(`${v.slug}: missing from lib/versions.ts`);
    continue;
  }
  if (ts.audio !== v.audio) {
    problems.push(
      `${v.slug}: audio differs — versions.ts "${ts.audio}", llms-data.mjs "${v.audio}"`,
    );
  }
  if (ts.sleepSlotLabel !== v.sleepLabel) {
    problems.push(
      `${v.slug}: sleep label differs — versions.ts "${ts.sleepSlotLabel}", llms-data.mjs "${v.sleepLabel}"`,
    );
  }
  if (ts.listing !== v.listing) {
    problems.push(
      `${v.slug}: listing differs — versions.ts "${ts.listing}", llms-data.mjs "${v.listing}"`,
    );
  }
  if (ts.lang !== v.lang) {
    problems.push(
      `${v.slug}: lang differs — versions.ts "${ts.lang}", llms-data.mjs "${v.lang}"`,
    );
  }
}
for (const ts of tsVersions) {
  if (!llmsVersions.some((v) => v.slug === ts.slug)) {
    problems.push(`${ts.slug}: missing from scripts/llms-data.mjs`);
  }
}

// Slot count must match DAILY_SLOTS.
const tsSlotCount = (src.match(/key:\s*"(morning|day|evening|sleep)"/g) ?? []).length;
if (tsSlotCount !== slots.length) {
  problems.push(
    `slot count differs: DAILY_SLOTS ${tsSlotCount}, llms-data.mjs ${slots.length}`,
  );
}

// Every guide must carry the fields search and retrieval depend on.
// A post whose frontmatter is missing entirely still builds — title falls back
// to the slug, date falls back to "today", which makes the sitemap look like it
// changed on every build. That failure is invisible, so assert on it here.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const { readdir } = await import("node:fs/promises");
const postFiles = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
for (const file of postFiles) {
  const slug = file.slice(0, -3);
  const body = await readFile(path.join(BLOG_DIR, file), "utf8");
  if (!body.startsWith("---")) {
    problems.push(`${slug}: no frontmatter — title/description/date fall back to defaults`);
    continue;
  }
  const fm = body.slice(3, body.indexOf("\n---", 3));
  for (const field of ["title", "description", "answer"]) {
    const value = fm.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1]?.trim();
    if (!value || value === '""' || value === "''") {
      problems.push(`${slug}: frontmatter is missing ${field}`);
    }
  }
  if (!/^date:\s*\d{4}-\d{2}-\d{2}/m.test(fm)) {
    problems.push(`${slug}: frontmatter has no real date (sitemap lastmod would drift)`);
  }
}
// Every guide listed in llms.txt must actually exist on disk.
for (const g of guides) {
  if (!postFiles.includes(`${g.slug}.md`)) {
    problems.push(`${g.slug}: listed in llms-data.mjs guides but no such file`);
  }
}

// KJV glossary. The upstream file is shared with the Android app, so it can
// change without a commit here — these assertions catch the two ways that
// silently breaks the word pages:
//   a duplicate headword (two entries collide on one slug, one page wins and
//     the other is unreachable) and a missing quote or reference (the page
//   renders a definition with no example, which is the whole point).
const WORDS = path.join(process.cwd(), "data", "kjv-words.json");
const glossary = JSON.parse(await readFile(WORDS, "utf8"));
const slugs = new Map();
for (const entry of glossary) {
  for (const field of ["word", "modern", "definition", "quote"]) {
    if (!String(entry[field] ?? "").trim()) {
      problems.push(`kjv-words: "${entry.word}" is missing ${field}`);
    }
  }
  if (!entry.reference) {
    problems.push(`kjv-words: "${entry.word}" has no verse reference`);
  }
  const slug = entry.word.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (slugs.has(slug)) {
    problems.push(`kjv-words: slug "${slug}" is claimed by both "${slugs.get(slug)}" and "${entry.word}"`);
  }
  slugs.set(slug, entry.word);

  // The glossary feeds an English-only site. The shared source carries a few
  // Chinese glosses; IPA and "≈" are legitimate, so match Han only.
  for (const field of ["modern", "definition"]) {
    if (/[㐀-䶿一-鿿]/.test(entry[field] ?? "")) {
      problems.push(`kjv-words: "${entry.word}" ${field} contains Chinese`);
    }
  }
  if (!String(entry.phonetic ?? "").trim()) {
    problems.push(`kjv-words: "${entry.word}" is missing phonetic`);
  }

  // Definitions use "1) ... 2) ..." inline lists and some entries contain
  // "(120)", so raw bracket counting produces false positives. Only flag a "("
  // that is never closed anywhere in the string — an actual truncation.
  for (const [label, text] of [
    ["modern", entry.modern],
    ["definition", entry.definition],
  ]) {
    let depth = 0;
    for (const ch of text ?? "") {
      if (ch === "(") depth += 1;
      else if (ch === ")") depth = Math.max(0, depth - 1);
    }
    if (depth > 0) {
      problems.push(
        `kjv-words: "${entry.word}" ${label} has an unclosed parenthesis`,
      );
    }
  }
}

// Bible verses by feeling. Same reason as the glossary: two pages carrying the
// same verses is duplicate content, and a page with no verses is useless.
const EMOTIONS = path.join(process.cwd(), "data", "take-a-break.json");
const emotionPages = JSON.parse(await readFile(EMOTIONS, "utf8"));
const emotionSlugs = new Map();
const emotionTitles = new Set();
for (const page of emotionPages) {
  for (const field of ["slug", "title", "subtitle"]) {
    if (!String(page[field] ?? "").trim()) {
      problems.push(`bible-verses: "${page.slug}" is missing ${field}`);
    }
  }
  if (!Array.isArray(page.emotions) || page.emotions.length === 0) {
    problems.push(`bible-verses: "${page.slug}" lists no emotions`);
  }
  for (const e of page.emotions ?? []) {
    if (!String(e.label ?? "").trim()) {
      problems.push(`bible-verses: "${page.slug}" has an emotion with no label`);
    }
    // The site is English-only. The source database carries Chinese labels for
    // the app, and one slipping through would be visible on the page.
    if (/[^\x00-\x7F]/.test(e.label ?? "")) {
      problems.push(`bible-verses: "${page.slug}" emotion label "${e.label}" is not English`);
    }
  }
  if (!Array.isArray(page.verses) || page.verses.length < 10) {
    problems.push(
      `bible-verses: "${page.slug}" has ${page.verses?.length ?? 0} verses, expected 10`,
    );
  }
  // Take a Break pairs every passage with a compact reflection and prayer. The
  // build script only picks verses that have both, so a gap here means the data
  // was edited by hand or an older build is being checked.
  for (const v of page.verses ?? []) {
    for (const field of ["insight", "prayer"]) {
      if (!String(v[field] ?? "").trim()) {
        problems.push(`bible-verses: "${page.slug}" ${v.reference} has no ${field}`);
      }
    }
  }
  // Ten passages drawn from one book is what the per-book cap exists to
  // prevent; four means the cap silently stopped applying.
  const perBook = new Map();
  for (const v of page.verses ?? []) {
    // Strip the chapter:verse tail, keeping any leading number in the name
    // ("1 Kings" is one book, not "1").
    const book = String(v.reference ?? "").replace(/ \d+:\d+$/, "");
    perBook.set(book, (perBook.get(book) ?? 0) + 1);
  }
  const worst = [...perBook.entries()].sort((a, b) => b[1] - a[1])[0];
  if (worst && worst[1] > 3) {
    problems.push(
      `bible-verses: "${page.slug}" draws ${worst[1]} passages from ${worst[0]}, cap is 3`,
    );
  }
  if (perBook.size < 4) {
    problems.push(
      `bible-verses: "${page.slug}" draws from only ${perBook.size} book(s): ${[...perBook.keys()].join(", ")}`,
    );
  }
  for (const v of page.verses ?? []) {
    // "<book> <chapter>:<verse>". The book may carry a leading digit
    // ("1 Kings") and one is three words long ("Song of Solomon"), so match on
    // the chapter:verse tail plus a non-empty name rather than an enumeration.
    // A reference that is only a number means the book lookup failed upstream.
    if (!/^.+ \d+:\d+$/.test(String(v.reference ?? ""))) {
      problems.push(`bible-verses: "${page.slug}" has a malformed reference "${v.reference}"`);
      break;
    }
  }
  if (emotionSlugs.has(page.slug)) {
    problems.push(`bible-verses: duplicate slug "${page.slug}"`);
  }
  emotionSlugs.set(page.slug, true);
  if (emotionTitles.has(page.title)) {
    problems.push(`bible-verses: duplicate title "${page.title}"`);
  }
  emotionTitles.add(page.title);
}

if (problems.length > 0) {
  console.error("data sources are out of sync:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

console.log(
  `data in sync: ${llmsVersions.length} translations, ${slots.length} slots, ` +
    `${postFiles.length} guides, ${glossary.length} KJV words, ` +
    `${emotionPages.length} verse collections`,
);