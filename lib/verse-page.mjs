/**
 * The HTML for one verse address, `/kjv/<book>/<chapter>/<verse>`.
 *
 * Two callers render it and must not drift: the Worker, for addresses the
 * export does not contain, and scripts/kjv-verses.mjs, which writes one file
 * per verse into `out/`. The Worker serves the misses and the files serve
 * everything else, so a difference between the two would show up as the same
 * URL looks two ways depending on whether a file exists — which is exactly the
 * bug this module exists to prevent. Plain JavaScript, not TSX, because the
 * build script cannot import a .tsx and the Worker cannot render React.
 *
 * Two jobs for this page:
 *   1. Unfurl well when the link is pasted into a chat (title/description/OG).
 *   2. Hand the reader to the app if it is installed, or to Play if it is not.
 *      App Links already intercept the URL on a verified device, so this page is
 *      mostly for iOS, desktop and first-time visitors.
 */

export const VERSE_CSS_PATH = "/kjv/verse.css";

export const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv&referrer=kjv_web_verse";



export function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * @param {{ book: { slug: string, name: string }, chapter: number, verse: number,
 *           text: string, verses: string[] }} input
 */
export function versePage({ book, chapter, verse, text, verses }) {
  const reference = `${book.name} ${chapter}:${verse}`;
  const chapterPath = `/kjv/${book.slug}/${chapter}`;
  const intent =
    `intent://wordrhythm.app/kjv/${book.slug}/${chapter}/${verse}#Intent;scheme=https;` +
    `package=com.gyc.ace.kjv;S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`;

  const hasPrev = verse - 1 >= 1;
  const hasNext = verse + 1 <= verses.length;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(reference)} — King James Bible</title>
<meta name="description" content="${escapeHtml(text.slice(0, 155))}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://wordrhythm.app${chapterPath}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Word Rhythm">
<meta property="og:title" content="${escapeHtml(reference)} — King James Bible">
<meta property="og:description" content="${escapeHtml(text)}">
<meta property="og:url" content="https://wordrhythm.app/kjv/${book.slug}/${chapter}/${verse}">
<meta property="og:image" content="https://wordrhythm.app/brand/og-kjv.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/brand/icon-512.png" type="image/png">
<link rel="stylesheet" href="${VERSE_CSS_PATH}">
</head>
<body>
<header><div class="wrap"><span class="mark">W</span><a href="/" style="color:inherit">Word Rhythm</a></div></header>
<main class="wrap">
  <div class="crumb"><a href="/kjv">King James Bible</a> / <a href="/kjv/${book.slug}">${escapeHtml(book.name)}</a> / ${chapter}</div>
  <h1>${escapeHtml(reference)}<span>King James Version</span></h1>

  <p class="verse"><span class="num">${verse}</span>${escapeHtml(text)}</p>

  <div class="context">
    <span class="ref">${escapeHtml(book.name)} ${chapter}</span>
    This verse sits in a chapter of ${verses.length} verses.
    <a href="${chapterPath}">Read ${escapeHtml(book.name)} ${chapter} in full →</a>
  </div>

  <aside class="cta">
    <p class="brand">Word Rhythm: KJV Bible</p>
    <p>The same King James text, completely offline — with devotionals, audio, reading plans and verse cards. Free on Google Play.</p>
    <div class="btns">
      <a class="btn btn-primary" href="${intent}">Open in the app</a>
      <a class="btn btn-secondary" href="${PLAY_URL}" rel="nofollow sponsored">Get it on Google Play</a>
    </div>
  </aside>

  <nav class="chapters">
    ${hasPrev ? `<a href="/kjv/${book.slug}/${chapter}/${verse - 1}">← Verse ${verse - 1}</a>` : "<span></span>"}
    ${hasNext ? `<a href="/kjv/${book.slug}/${chapter}/${verse + 1}">Verse ${verse + 1} →</a>` : "<span></span>"}
  </nav>
</main>
</body>
</html>`;
}
