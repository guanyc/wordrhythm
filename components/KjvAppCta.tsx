import Script from "next/script";

import { KJV_PLAY_URL, kjvIntentUrl } from "@/lib/kjv";

/**
 * Install / open-the-app call to action for the /kjv pages.
 *
 * The markup is two buttons, but what they do is decided at runtime by
 * `public/kjv/open-in-app.js` — the same script the verse pages load, so the
 * chapter pages and the verse pages cannot disagree:
 *   - Android: the first button is the `intent://` address, which targets the
 *     app by package name and therefore works even when App Links verification
 *     has not completed on that device. If the app does not take over, the
 *     script sends the reader to the store instead of leaving a dead click.
 *   - iOS, desktop, in-app WebViews: `intent://` means nothing there, so the
 *     script relabels the first button as the Play listing and drops the
 *     duplicate.
 *   - a chat app's WebView (WeChat, Weibo, Instagram…): it owns the URL and
 *     cannot start intents at all, so both buttons are replaced by a line
 *     telling the reader to reopen the page in the system browser.
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
  const intent = kjvIntentUrl(slug, chapter, verse ?? 1);

  return (
    <aside className="mt-16 rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold text-brand">Word Rhythm: KJV Bible</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The same King James text, completely offline — with devotionals, audio,
        reading plans and verse cards. Free on Google Play.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={intent}
          data-open-in-app
          data-intent={intent}
          data-play={KJV_PLAY_URL}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Open in the app
        </a>
        <a
          href={KJV_PLAY_URL}
          rel="nofollow sponsored"
          data-play-store
          className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Get it on Google Play
        </a>
      </div>
      <p
        data-in-app-hint
        hidden
        className="mt-5 text-sm leading-relaxed text-ink"
      >
        The browser inside this app cannot open apps — tap ⋯ at the top right,
        then “Open in Browser”, and open the app from there.
      </p>
      <Script src="/kjv/open-in-app.js" strategy="afterInteractive" />
    </aside>
  );
}
