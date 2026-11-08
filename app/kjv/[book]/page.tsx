import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import KjvAppCta from "@/components/KjvAppCta";
import { getKjvBook, kjvBooks } from "@/lib/kjv";

export const dynamicParams = false;

export function generateStaticParams() {
  return kjvBooks.map((b) => ({ book: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string }>;
}): Promise<Metadata> {
  const { book: slug } = await params;
  const book = getKjvBook(slug);
  if (!book) return { title: "Book not found" };

  const title = `${book.name} — King James Bible`;
  const description =
    `Read ${book.name} in the King James Version: ${book.chapters.length} ` +
    `${book.chapters.length === 1 ? "chapter" : "chapters"}, ${book.verses} verses, ` +
    `in the browser or offline in the Word Rhythm: KJV Bible app.`;

  return {
    title,
    description,
    alternates: { canonical: `/kjv/${book.slug}` },
    openGraph: { title, description, url: `/kjv/${book.slug}` },
  };
}

export default async function KjvBookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book: slug } = await params;
  const book = getKjvBook(slug);
  if (!book) notFound();

  const position = kjvBooks.findIndex((b) => b.slug === book.slug);
  const prev = position > 0 ? kjvBooks[position - 1] : undefined;
  const next = position < kjvBooks.length - 1 ? kjvBooks[position + 1] : undefined;

  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <nav className="text-sm text-muted">
        <Link href="/kjv" className="hover:text-ink">
          King James Bible
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink">{book.name}</span>
      </nav>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        {book.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {book.chapters.length}{" "}
        {book.chapters.length === 1 ? "chapter" : "chapters"} · {book.verses}{" "}
        verses in the King James Version. Pick a chapter to read.
      </p>

      <ul className="mt-10 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {book.chapterNumbers.map((chapter) => (
          <li key={chapter}>
            <Link
              href={`/kjv/${book.slug}/${chapter}`}
              className="grid h-14 place-items-center rounded-xl border border-black/5 bg-surface font-semibold shadow-card transition-colors hover:border-brand/40 hover:text-brand"
            >
              {chapter}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex items-center justify-between text-sm font-semibold">
        {prev ? (
          <Link href={`/kjv/${prev.slug}`} className="hover:text-brand">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/kjv/${next.slug}`} className="hover:text-brand">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>

      <KjvAppCta slug={book.slug} chapter={1} />
    </section>
  );
}
