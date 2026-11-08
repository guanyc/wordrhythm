/**
 * Fallback renderer for `/kjv/<book>/<chapter>/<verse>`.
 *
 * scripts/kjv-verses.mjs writes one file per verse into `out/`, so the assets
 * binding normally answers these URLs without this code ever running. What is
 * left for the Worker is the address that has no file: a verse number past the
 * end of the chapter, which should land the reader in the chapter rather than
 * on a 404, and any other miss, which gets the site's own 404 body.
 *
 * Keeping the page itself in lib/verse-page.mjs is what stops the pre-rendered
 * files and this fallback from disagreeing about how the same URL looks.
 */

import { versePage } from "../lib/verse-page.mjs";

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
