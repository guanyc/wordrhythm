/**
 * Writes one HTML file per KJV verse into `out/`, so every address the Android
 * App Link can deliver — `/kjv/<book>/<chapter>/<verse>`, 31,102 of them — is a
 * static asset rather than something a Worker has to render.
 *
 * Runs after `next build` because `out/` is what it writes into, and before
 * `wrangler deploy` because those files are the point.
 *
 * The pages are not React: `lib/verse-page.mjs` is the same template the Worker
 * uses for the addresses that have no file (a verse past the end of its
 * chapter), so a pre-rendered verse and a fallback verse cannot look different.
 * Rendering 31k React routes would also cost minutes of build time for markup
 * that never hydrates — it is a text page with two links.
 *
 * Everything here is derived from `public/kjv-data`, which in turn comes from
 * the Android app's bible JSON via scripts/build-kjv.py.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { versePage } from "../lib/verse-page.mjs";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "public", "kjv-data");
const OUT = path.join(ROOT, "out");
const TARGET = path.join(OUT, "kjv");

const started = Date.now();

const index = JSON.parse(readFileSync(path.join(DATA, "books.json"), "utf8"));

if (!index.books?.length) {
  throw new Error("public/kjv-data/books.json has no books — run scripts/build-kjv.py");
}

// Chapter pages are `out/kjv/<book>/<chapter>.html` — the same directory these
// verse pages go into — so only the numeric subdirectories this script creates
// may be cleared. Deleting the book directory itself would take every chapter
// page with it.
for (const book of index.books) {
  const bookDir = path.join(TARGET, book.slug);
  if (!existsSync(bookDir)) continue;
  for (const entry of readdirSync(bookDir, { withFileTypes: true })) {
    if (entry.isDirectory() && /^\d+$/.test(entry.name)) {
      rmSync(path.join(bookDir, entry.name), { recursive: true, force: true });
    }
  }
}

let files = 0;
let chapters = 0;

for (const bookEntry of index.books) {
  const chaptersByNumber = JSON.parse(
    readFileSync(path.join(DATA, `${bookEntry.slug}.json`), "utf8"),
  );

  for (const [rawChapter, verses] of Object.entries(chaptersByNumber)) {
    const chapter = Number(rawChapter);
    const chapterDir = path.join(TARGET, bookEntry.slug, String(chapter));
    mkdirSync(chapterDir, { recursive: true });
    chapters += 1;

    for (let i = 0; i < verses.length; i += 1) {
      const verse = i + 1;
      writeFileSync(
        path.join(chapterDir, `${verse}.html`),
        versePage({
          book: { slug: bookEntry.slug, name: bookEntry.name },
          chapter,
          verse,
          text: verses[i],
          verses,
        }),
      );
      files += 1;
    }
  }
}

const expected = index.totalVerses;
if (files !== expected) {
  throw new Error(`wrote ${files} verse pages, expected ${expected}`);
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`kjv-verses: ${files} pages in ${chapters} chapters (${seconds}s)`);
