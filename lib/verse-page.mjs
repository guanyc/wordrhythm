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

export const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv&referrer=kjv_web_verse";

export const VERSE_CSS = `
  :root { --bg:#f7f6f3; --surface:#fff; --ink:#1f2430; --muted:#6b7280; --brand:#4f46e5; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    -webkit-font-smoothing:antialiased; }
  a { color:var(--brand); text-decoration:none; }
  header { border-bottom:1px solid rgba(0,0,0,.05); background:rgba(247,246,243,.85);
    backdrop-filter:blur(8px); position:sticky; top:0; }
  .wrap { max-width:46rem; margin:0 auto; padding:0 1.25rem; }
  header .wrap { display:flex; align-items:center; gap:.5rem; padding-top:1rem; padding-bottom:1rem;
    font-weight:600; }
  .mark { display:grid; place-items:center; width:2rem; height:2rem; border-radius:.5rem;
    background:var(--brand); color:#fff; font-weight:700; }
  main { padding:2.5rem 0 4rem; }
  .crumb { font-size:.875rem; color:var(--muted); }
  h1 { font-size:2rem; line-height:1.2; letter-spacing:-.02em; margin:.75rem 0 0; }
  h1 span { font-size:.875rem; font-weight:400; color:var(--muted); margin-left:.5rem; }
  .verse { margin:1.75rem 0 0; font-size:1.375rem; line-height:1.65; }
  .verse .num { color:var(--brand); font-size:.75rem; font-weight:600; vertical-align:super;
    margin-right:.35rem; }
  .context { margin-top:1.5rem; border-top:1px solid rgba(0,0,0,.06); padding-top:1.25rem;
    font-size:1rem; line-height:1.7; color:var(--muted); }
  .context .ref { font-weight:600; color:var(--ink); font-size:.8125rem; display:block;
    margin-bottom:.35rem; }
  .cta { margin-top:2.5rem; background:var(--surface); border:1px solid rgba(0,0,0,.05);
    border-radius:1.5rem; padding:1.5rem; box-shadow:0 10px 30px rgba(31,41,55,.06); }
  .cta p { margin:0; font-size:.875rem; line-height:1.6; color:var(--muted); }
  .cta .brand { color:var(--brand); font-weight:600; font-size:.875rem; }
  .btns { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:1.25rem; }
  .btn { border-radius:999px; padding:.625rem 1.25rem; font-size:.875rem; font-weight:600; }
  .btn-primary { background:var(--brand); color:#fff; }
  .btn-secondary { border:1px solid rgba(0,0,0,.1); color:var(--ink); }
  nav.chapters { display:flex; justify-content:space-between; gap:1rem; margin-top:2rem;
    font-size:.875rem; font-weight:600; }
`;

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
<style>${VERSE_CSS}</style>
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
