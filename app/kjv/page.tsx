import type { Metadata } from "next";
import Link from "next/link";

import KjvAppCta from "@/components/KjvAppCta";
import {
  TOTAL_KJV_CHAPTERS,
  TOTAL_KJV_VERSES,
  kjvBooks,
} from "@/lib/kjv";

const OT_BOOKS = 39;

const title = `Read the King James Bible online — all ${TOTAL_KJV_VERSES.toLocaleString("en-US")} verses`;
const description =
  `The complete King James Version, chapter by chapter: ${TOTAL_KJV_VERSES.toLocaleString("en-US")} ` +
  `verses across ${TOTAL_KJV_CHAPTERS.toLocaleString("en-US")} chapters and 66 books, free to read in the ` +
  `browser. Every verse also opens in the Word Rhythm: KJV Bible app, which reads the same text offline.`;

export const metadata: Metadata = {
  title: "Read the King James Bible online",
  description,
  alternates: { canonical: "/kjv" },
  openGraph: { title, description, url: "/kjv" },
};

/**
 * Reading shell for links the app hands out.
 *
 * `https://wordrhythm.app/kjv/<book>/<chapter>/<verse>` is an Android App Link:
 * on a device with the app installed the OS opens the reader and never loads
 * this. Everyone else — iOS, desktop, a browser that has not verified the link,
 * a reader who has not installed anything — lands here, which is why the books
 * and the chapters are real pages with the real text rather than a redirect to
 * the Play listing.
 */
export default function KjvIndexPage() {
  const oldTestament = kjvBooks.slice(0, OT_BOOKS);
  const newTestament = kjvBooks.slice(OT_BOOKS);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Read the King James Bible
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        All {TOTAL_KJV_VERSES.toLocaleString("en-US")} verses of the KJV —{" "}
        {TOTAL_KJV_CHAPTERS.toLocaleString("en-US")} chapters across 66 books —
        free to read here in the browser. Pick a book to start, or open any verse
        in the app, where the same text is available offline.
      </p>

      {[
        { heading: "Old Testament", books: oldTestament },
        { heading: "New Testament", books: newTestament },
      ].map((group) => (
        <div key={group.heading} className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            {group.heading}
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.books.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/kjv/${book.slug}`}
                  className="flex h-full flex-col rounded-2xl border border-black/5 bg-surface px-4 py-3 shadow-card transition-colors hover:border-brand/40"
                >
                  <span className="font-semibold">{book.name}</span>
                  <span className="mt-1 text-xs text-muted">
                    {book.chapters.length}{" "}
                    {book.chapters.length === 1 ? "chapter" : "chapters"} ·{" "}
                    {book.verses} verses
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="mt-14 max-w-2xl text-sm leading-relaxed text-muted">
        The King James Version was published in 1611 and is in the public domain,
        so this text is free to read, quote and share. Verse links look like{" "}
        <span className="font-mono text-xs text-ink">/kjv/john/3/16</span> — that
        is the address a verse shared from the app points at.
      </p>

      <KjvAppCta slug="john" chapter={3} verse={16} />
    </section>
  );
}
