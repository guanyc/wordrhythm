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

  // The modern equivalent is rendered into llms.txt and meta descriptions.
  // Definitions use "1) ... 2) ..." inline lists and some entries contain
  // "(120)", so raw bracket counting produces false positives. Only flag a "("
  // that is never closed anywhere in the string — an actual truncation.
  for (const [label, text] of [
    ["modern", entry.modern],
    ["definition", entry.definition],
  ]) {
    let depth = 0;
    for (const ch of text) {
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

if (problems.length > 0) {
  console.error("data sources are out of sync:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

console.log(
  `data in sync: ${llmsVersions.length} translations, ${slots.length} slots, ` +
    `${postFiles.length} guides, ${glossary.length} KJV words`,
);