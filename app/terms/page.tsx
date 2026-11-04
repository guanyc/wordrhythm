import type { Metadata } from "next";
import Link from "next/link";
import { TERMS_UPDATED, renderTerms } from "@/lib/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of every Word Rhythm Bible app and Take a Break. Last updated " +
    TERMS_UPDATED +
    ".",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const html = renderTerms();

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-muted">
        One set of terms covers every app published under the Word Rhythm brand.
        Updated {TERMS_UPDATED}.
      </p>

      <div className="mt-8 rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
        <p className="font-semibold">Who this applies to</p>
        <dl className="mt-3 space-y-2 text-sm text-muted">
          <div className="flex flex-wrap gap-1">
            <dt className="font-semibold text-ink">Developer:</dt>
            <dd>Guan Yongchun</dd>
          </div>
          <div className="flex flex-wrap gap-1">
            <dt className="font-semibold text-ink">Contact Email:</dt>
            <dd className="break-all">
              <a href="mailto:yc.guan@gmail.com" className="text-brand hover:underline">
                yc.guan@gmail.com
              </a>
            </dd>
          </div>
          <div className="flex flex-wrap gap-1">
            <dt className="font-semibold text-ink">Apps covered:</dt>
            <dd>
              Bible KJV, Bible ASV, Bible Web, Biblia RVR, and Word Rhythm: 道韵
              CUV Bible, Bíblia AA, Bible Louis Segond 1910, Lutherbibel 1912,
              and Take a Break.
            </dd>
          </div>
        </dl>
      </div>

      <article
        className="wr-prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link
          href="/privacy"
          className="rounded-xl border border-black/10 bg-surface px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
        >
          Privacy policies
        </Link>
        <Link
          href="/versions"
          className="rounded-xl border border-black/10 bg-surface px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
        >
          About the apps
        </Link>
      </div>
    </section>
  );
}
