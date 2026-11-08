import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import KjvAppCta from "@/components/KjvAppCta";
import { getKjvBook, getKjvChapter, kjvBooks } from "@/lib/kjv";

export const dynamicParams = false;

/**
 * 1,189 chapter pages. This is the indexable set: verse links
 * (`/kjv/<book>/<chapter>/<verse>`) are rendered per request by the Worker and
 * point their canonical here, so search engines see one page per chapter rather
 * than 31,102 thin ones.
 */
export function generateStaticParams() {
  return kjvBooks.flatMap((book) =>
    book.chapterNumbers.map((chapter) => ({
      book: book.slug,
      chapter: String(chapter),
    })),
  );
}

function snippet(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > 60 ? cut.slice(0, space) : cut).trim()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}): Promise<Metadata> {
  const { book: slug, chapter: rawChapter } = await params;
  const book = getKjvBook(slug);
  const chapter = Number(rawChapter);
  const verses = book ? getKjvChapter(slug, chapter) : null;
  if (!book || !verses) return { title: "Chapter not found" };

  const reference = `${book.name} ${chapter}`;
  const title = `${reference} — King James Bible`;
  const description = `${reference} in the King James Version, ${verses.length} verses: “${snippet(
    verses[0],
    110,
  )}” Read the full chapter or open it offline in the Word Rhythm: KJV Bible app.`;

  return {
    title,
    description,
    alternates: { canonical: `/kjv/${book.slug}/${chapter}` },
    openGraph: {
      title,
      description,
      url: `/kjv/${book.slug}/${chapter}`,
      type: "article",
    },
  };
}

export default async function KjvChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book: slug, chapter: rawChapter } = await params;
  const book = getKjvBook(slug);
  const chapter = Number(rawChapter);
  const verses = book ? getKjvChapter(slug, chapter) : null;
  if (!book || !verses) notFound();

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < book.chapters.length ? chapter + 1 : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <nav className="text-sm text-muted">
        <Link href="/kjv" className="hover:text-ink">
          King James Bible
        </Link>
        <span className="px-2">/</span>
        <Link href={`/kjv/${book.slug}`} className="hover:text-ink">
          {book.name}
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink">{chapter}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {book.name} {chapter}
        <span className="ml-3 align-middle text-sm font-normal text-muted">
          King James Version
        </span>
      </h1>

      <ol className="mt-10 space-y-3 text-lg leading-relaxed">
        {verses.map((text, i) => {
          const verse = i + 1;
          return (
            <li key={verse} id={`v${verse}`} className="scroll-mt-24">
              <a
                href={`/kjv/${book.slug}/${chapter}/${verse}`}
                rel="nofollow"
                className="mr-2 align-super text-xs font-semibold text-brand"
                aria-label={`${book.name} ${chapter}:${verse}`}
              >
                {verse}
              </a>
              {text}
            </li>
          );
        })}
      </ol>

      <nav className="mt-12 flex items-center justify-between gap-4 text-sm font-semibold">
        {prevChapter ? (
          <Link
            href={`/kjv/${book.slug}/${prevChapter}`}
            className="hover:text-brand"
          >
            ← {book.name} {prevChapter}
          </Link>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <Link
            href={`/kjv/${book.slug}/${nextChapter}`}
            className="text-right hover:text-brand"
          >
            {book.name} {nextChapter} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <KjvAppCta slug={book.slug} chapter={chapter} />
    </article>
  );
}
