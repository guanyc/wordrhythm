import type { Metadata } from "next";
import Link from "next/link";

/**
 * The site's own 404, replacing Next's default "This page could not be found."
 *
 * Two things reach it. A mistyped or retired address, which should land
 * somewhere useful rather than on a bare page, and the Worker's fallback —
 * worker/index.ts serves `out/404.html` for anything the export does not have,
 * so the body it picks up is this one.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        This page is not here
      </h1>
      <p className="mt-4 leading-relaxed text-muted">
        The address may be mistyped, or the page may have moved. Every chapter of
        the King James Bible is one link away.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <Link
          href="/kjv"
          className="rounded-xl bg-brand px-5 py-2.5 text-white transition-transform hover:-translate-y-0.5"
        >
          Read the King James Bible
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-black/10 px-5 py-2.5 text-ink transition-colors hover:border-brand/40"
        >
          Go to the home page
        </Link>
      </div>
    </section>
  );
}
