import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website privacy & cookies",
  description:
    "How wordrhythm.app uses analytics: cookieless measurement by default, Google Analytics only with your consent, and honest control over your choice.",
};

const UPDATED = "September 26, 2026";

export default function WebsitePrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Website privacy &amp; cookies
      </h1>
      <p className="mt-4 text-muted">
        How this website measures traffic, what gets stored in your browser, and
        how to change your mind. Last updated {UPDATED}.
      </p>

      <div className="wr-prose mt-10">
        <h2>The short version</h2>
        <p>
          This site has no accounts, no ads, and no payment. We do not sell,
          rent, or trade your data. By default we measure nothing beyond a
          cookieless page count. Anything stronger only happens if you agree to
          it.
        </p>

        <h2>Cloudflare Web Analytics (always on, cookieless)</h2>
        <p>
          Because this site is served through Cloudflare, we use Cloudflare Web
          Analytics to count page views and see which pages people read. It uses
          no cookies and stores no identifier in your browser, so there is
          nothing to consent to and nothing that can follow you between sites.
          It tells us things like page views, country, and referring site — not
          who you are.
        </p>

        <h2>Google Analytics (only with your consent)</h2>
        <p>
          We also use Google Analytics 4 to understand which guides actually
          help people, and how often visitors follow a link to Google Play. It
          is switched off until you press <strong>Accept</strong> in the consent
          dialog. Until then, your browser makes no request to Google at all.
        </p>
        <p>If you accept, Google Analytics may record:</p>
        <ul>
          <li>which pages you view and for how long</li>
          <li>rough location (usually city or country), derived from your IP</li>
          <li>device and browser type, screen size, and language</li>
          <li>
            clicks on links to Google Play or the App Store, sent as a{" "}
            <strong>store_click</strong> event with the link address and the
            page you were on
          </li>
        </ul>
        <p>
          To do this Google sets the <strong>_ga</strong> cookies in your
          browser. We do not use Google Signals, advertising features, or
          cross-site tracking, and we have not connected this property to Google
          Ads.
        </p>

        <h2>Changing your mind</h2>
        <p>
          Your choice is stored only in your own browser (localStorage), never
          on our servers. Use the <strong>Cookie settings</strong> link in the
          footer of any page to revisit it — clearing it removes Google
          Analytics immediately and takes you back to the cookieless default.
          You can also block analytics from your browser&apos;s own settings;
          the site works normally either way.
        </p>

        <h2>What we never do</h2>
        <ul>
          <li>No advertising cookies and no ad networks</li>
          <li>No selling or sharing of personal information</li>
          <li>No accounts, so no passwords and no email list from this site</li>
          <li>No tracking pixels embedded elsewhere</li>
        </ul>

        <h2>Server logs</h2>
        <p>
          Like every public website, requests pass through Cloudflare&apos;s
          network, which keeps short-lived technical logs (IP address, requested
          URL, user agent) needed to serve pages and block abuse. These are not
          used to build profiles.
        </p>

        <h2>The apps are different</h2>
        <p>
          This page describes <strong>wordrhythm.app</strong>, the website. Each
          app has its own policy covering what happens inside it — see the{" "}
          <Link href="/privacy">full list</Link>.
        </p>

        <h2>Questions</h2>
        <p>
          Email{" "}
          <a href="mailto:yc.guan@gmail.com">yc.guan@gmail.com</a> and we will
          answer plainly.
        </p>
      </div>
    </section>
  );
}
