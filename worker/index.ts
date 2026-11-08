/**
 * Verse-level renderer for `/kjv/<book>/<chapter>/<verse>`.
 *
 * The rest of the site is a static export (`out/`), and those 1,189 chapter
 * pages are served straight off the assets binding. Verse URLs cannot be: any of
 * the 31,102 verses can appear in a shared link, and pre-rendering all of them
 * would blow past Cloudflare's files-per-deployment limit. So this Worker only
 * catches what the export does not have — a verse URL — reads that one book's
 * JSON from the assets binding, and renders a small page around the verse.
 *
 * Two jobs for that page:
 *   1. Unfurl well when the link is pasted into a chat (title/description/OG).
 *   2. Hand the reader to the app if it is installed, or to Play if it is not.
 *      App Links already intercept the URL on a verified device, so this page is
 *      mostly for iOS, desktop and first-time visitors.
 *
 * It is deliberately `noindex, follow` with a canonical pointing at the chapter
 * page: the chapter is the page worth ranking, and 31k thin pages would waste
 * crawl budget.
 */

interface AssetFetcher {
  fetch(input: Request | string | URL, init?: RequestInit): Promise<Response>;
}

export interface Env {
  ASSETS: AssetFetcher;
}

interface BookIndex {
  slug: string;
  name: string;
  abbr: string;
  chapters: number[];
  verses: number;
}

interface Index {
  totalVerses: number;
  books: BookIndex[];
}

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv&referrer=kjv_web_verse";

// Isolates are long-lived, so the parsed index and the books actually asked for
// stay cached between requests. A single book is ~40 KB; the whole Bible is
// 4.2 MB, which is why the index is loaded on its own.
let indexPromise: Promise<Index> | null = null;
const bookCache = new Map<string, Record<string, string[]>>();

async function assetJson<T>(env: Env, path: string): Promise<T | null> {
  const res = await env.ASSETS.fetch(new URL(path, "https://wordrhythm.app"));
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function loadIndex(env: Env): Promise<Index | null> {
  indexPromise ??= assetJson<Index>(env, "/kjv-data/books.json").then(
    (data) => data ?? ({} as Index),
  );
  return indexPromise.then((data) => (data.books ? data : null));
}

async function loadBook(
  env: Env,
  slug: string,
): Promise<Record<string, string[]> | null> {
  const cached = bookCache.get(slug);
  if (cached) return cached;
  const book = await assetJson<Record<string, string[]>>(
    env,
    `/kjv-data/${slug}.json`,
  );
  if (book) bookCache.set(slug, book);
  return book;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function versePage({
  book,
  chapter,
  verse,
  text,
  verses,
}: {
  book: BookIndex;
  chapter: number;
  verse: number;
  text: string;
  verses: string[];
}): string {
  const reference = `${book.name} ${chapter}:${verse}`;
  const chapterPath = `/kjv/${book.slug}/${chapter}`;
  const intent =
    `intent://wordrhythm.app/kjv/${book.slug}/${chapter}/${verse}#Intent;scheme=https;` +
    `package=com.gyc.ace.kjv;S.browser_fallback_url=${encodeURIComponent(PLAY_URL)};end`;

  const neighbours = [verse - 1, verse + 1].filter(
    (v) => v >= 1 && v <= verses.length,
  );

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
<style>
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
</style>
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
    ${
      neighbours.includes(verse - 1)
        ? `<a href="/kjv/${book.slug}/${chapter}/${verse - 1}">← Verse ${verse - 1}</a>`
        : "<span></span>"
    }
    ${
      neighbours.includes(verse + 1)
        ? `<a href="/kjv/${book.slug}/${chapter}/${verse + 1}">Verse ${verse + 1} →</a>`
        : "<span></span>"
    }
  </nav>
</main>
</body>
</html>`;
}

function notFoundPage(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Not found · Word Rhythm</title>
<style>body{margin:0;background:#f7f6f3;color:#1f2430;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;display:grid;place-items:center;min-height:100vh;padding:2rem}main{max-width:28rem;text-align:center}h1{font-size:1.5rem;margin:0 0 .75rem}p{color:#6b7280;line-height:1.6}a{color:#4f46e5;font-weight:600}</style>
</head><body><main><h1>That reference is not in the KJV</h1>
<p>The King James Version has 66 books, 1,189 chapters and 31,102 verses — this address is outside that range.</p>
<p><a href="/kjv">Browse the books</a></p></main></body></html>`;
}

const VERSE_PATH = /^\/kjv\/([a-z0-9-]+)\/(\d{1,3})\/(\d{1,3})\/?$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    const match = VERSE_PATH.exec(url.pathname);
    if (!match) {
      // Everything the export already has — chapters, books, the rest of the
      // site — is served from the assets binding untouched.
      const res = await env.ASSETS.fetch(request);
      if (res.status !== 404) return res;
      const fallback = await env.ASSETS.fetch(
        new URL("/404.html", "https://wordrhythm.app"),
      );
      return new Response(fallback.ok ? fallback.body : notFoundPage(), {
        status: 404,
        headers: { "content-type": "text/html;charset=utf-8" },
      });
    }

    const [, slug, rawChapter, rawVerse] = match;
    const chapter = Number(rawChapter);
    const verse = Number(rawVerse);

    const index = await loadIndex(env);
    const book = index?.books.find((b) => b.slug === slug);
    if (!book || chapter < 1 || chapter > book.chapters.length) {
      return new Response(notFoundPage(), {
        status: 404,
        headers: { "content-type": "text/html;charset=utf-8" },
      });
    }

    const verses = (await loadBook(env, slug))?.[String(chapter)];
    if (!verses) {
      return new Response(notFoundPage(), {
        status: 404,
        headers: { "content-type": "text/html;charset=utf-8" },
      });
    }

    // A stale or hand-typed verse number should still land the reader in the
    // right chapter instead of on an error page. Origin-relative so preview and
    // workers.dev deployments stay on their own host.
    if (verse < 1 || verse > verses.length) {
      return Response.redirect(
        new URL(`/kjv/${slug}/${chapter}`, url.origin).toString(),
        302,
      );
    }

    return new Response(
      versePage({ book, chapter, verse, text: verses[verse - 1], verses }),
      {
        headers: {
          "content-type": "text/html;charset=utf-8",
          // The text never changes; the template might.
          "cache-control": "public, max-age=600, s-maxage=86400",
        },
      },
    );
  },
};
