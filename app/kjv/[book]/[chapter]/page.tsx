import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import KjvAppCta from "@/components/KjvAppCta";
import {
  getKjvBook,
  getKjvChapter,
  getKjvOutline,
  kjvBooks,
} from "@/lib/kjv";

export const dynamicParams = false;

const SITE = "https://wordrhythm.app";

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

/**
 * The chapter summary as a meta description. Prefer its first sentence, so the
 * snippet reads as a finished thought rather than a cut-off one; 457 of the
 * 1,189 summaries already open with the book name ("Genesis 1 continues…"), and
 * prefixing those with the reference would stutter.
 */
function metaDescription(
  reference: string,
  bookName: string,
  summary: string,
): string {
  const body = summary.replace(/\s+/g, " ").trim();
  const prefix = body.toLowerCase().startsWith(bookName.toLowerCase())
    ? ""
    : `${reference}: `;
  const firstSentence = /^.*?[.!?](?=\s|$)/.exec(body)?.[0] ?? body;
  return snippet(`${prefix}${firstSentence}`, 155);
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
  const outline = getKjvOutline(slug, chapter);
  // Without a summary the page has no prose of its own, so the opening verse
  // still stands in — but it reads as an excerpt, not as what the chapter is.
  const description = outline
    ? metaDescription(reference, book.name, outline.summary)
    : `${reference} in the King James Version, ${verses.length} verses: “${snippet(
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
  const outline = getKjvOutline(slug, chapter);

  const reference = `${book.name} ${chapter}`;
  const url = `${SITE}/kjv/${book.slug}/${chapter}`;
  const chapterSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "King James Bible",
            item: `${SITE}/kjv`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: book.name,
            item: `${SITE}/kjv/${book.slug}`,
          },
          { "@type": "ListItem", position: 3, name: reference, item: url },
        ],
      },
      {
        // What tells 1,189 near-identical pages apart: the summary, plus the
        // book the chapter belongs to.
        "@type": "Chapter",
        name: reference,
        position: chapter,
        url,
        inLanguage: "en",
        isPartOf: {
          "@type": "Book",
          name: book.name,
          url: `${SITE}/kjv/${book.slug}`,
        },
        ...(outline ? { abstract: outline.summary } : {}),
      },
    ],
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterSchema) }}
      />

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

      {outline && (
        <p className="mt-6 border-l-2 border-brand/40 pl-4 text-lg leading-relaxed text-ink">
          {outline.summary}
        </p>
      )}

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
