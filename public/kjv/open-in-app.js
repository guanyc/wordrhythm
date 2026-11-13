/**
 * Makes the /kjv "Open in the app" button do something on every device.
 *
 * An `intent://` address is Android-only. iOS, desktop browsers, and the
 * WebViews inside messaging apps either ignore it or show an error, so the
 * page's main call to action looks broken exactly for the readers it was
 * written for. This script is loaded by both renderers of the /kjv pages —
 * `lib/verse-page.mjs` (the 31,102 generated verse files and the Worker's
 * fallback) and `components/KjvAppCta.tsx` (the React book/chapter pages) — so
 * the rule lives in one place instead of three.
 *
 *   Android          keep intent://; if nothing has taken over after two
 *                    seconds (a WebView cannot start intents and swallows the
 *                    click) send the reader to the Play listing, which is where
 *                    Chrome's S.browser_fallback_url would have gone anyway.
 *   anything else    the only button left is the Play listing.
 *
 * Markup contract, kept deliberately tiny:
 *   [data-open-in-app]  the primary button: data-intent, data-play
 *   [data-play-store]   the secondary Play listing
 */
(function () {
  if (window.__wrOpenInApp) return;
  window.__wrOpenInApp = true;

  function init() {
    var primary = document.querySelector("[data-open-in-app]");
    if (!primary) return;
    var store = document.querySelector("[data-play-store]");
    var play =
      primary.getAttribute("data-play") ||
      (store && store.getAttribute("href")) ||
      "";
    var intent = primary.getAttribute("data-intent");
    var android = /Android/i.test(navigator.userAgent);

    if (!android || !intent) {
      // One button, pointing at the only destination these readers can use.
      primary.href = store ? store.href : play;
      primary.textContent = "Get it on Google Play";
      primary.setAttribute("rel", "nofollow sponsored");
      if (store) {
        store.hidden = true;
        store.style.display = "none";
      }
      return;
    }

    primary.href = intent;
    primary.textContent = "Open in the app";

    primary.addEventListener("click", function () {
      var timer = setTimeout(function () {
        if (document.visibilityState === "visible") window.location.href = play;
      }, 2000);
      function cancel() {
        clearTimeout(timer);
      }
      window.addEventListener("pagehide", cancel, { once: true });
      document.addEventListener("visibilitychange", cancel, { once: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
