import { KJV_PLAY_URL, kjvIntentUrl } from "@/lib/kjv";

/**
 * Install / open-the-app call to action for the /kjv pages.
 *
 * Two links, in order of preference for the reader:
 *   1. `intent://` — targets the app by package name, so it works even when App
 *      Links verification has not completed on that device; Android falls back
 *      to the Play listing when the app is missing.
 *   2. the plain Play listing, for iOS, desktop and anyone who dismissed the
 *      first link.
 *
 * Nothing here redirects or covers the page: the verse is the content, the app
 * is an offer next to it.
 */
export default function KjvAppCta({
  slug,
  chapter,
  verse,
}: {
  slug: string;
  chapter: number;
  verse?: number;
}) {
  return (
    <aside className="mt-16 rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-brand">Word Rhythm: KJV Bible</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The same King James text, completely offline — with devotionals, audio,
        reading plans and verse cards. Free on Google Play.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={kjvIntentUrl(slug, chapter, verse ?? 1)}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Open in the app
        </a>
        <a
          href={KJV_PLAY_URL}
          rel="nofollow sponsored"
          className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Get it on Google Play
        </a>
      </div>
    </aside>
  );
}
