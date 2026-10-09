import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TOTAL_WORDS,
  featuredWordSlugs,
  featuredWords,
  formatRef,
  getWord,
  isFeatured,
  slugify,
} from "@/lib/archaic";

/** Only the words in FEATURED get a page; the rest live in the glossary. */
export function generateStaticParams() {
  return featuredWordSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const word = getWord(slug);
  if (!word || !isFeatured(word.word)) {
    return { title: "Word not found" };
  }

  // "thee, you (archaic objective form)" — the first chunk is often just the
  // word repeated, so pick the chunk that actually says something.
  const modern =
    word.modern
      .split(",")
      .map((s) => s.trim())
      .find((s) => s.toLowerCase() !== word.word.toLowerCase()) ?? word.word;

  const title = `${word.word} in the KJV: meaning and example`;
  const description =
    `${word.word} (/${word.phonetic.replace(/^\/|\/$/g, "")}/) means "${modern}" in the King James Version. ` +
    `${word.definition} See it in context${word.reference ? ` at ${formatRef(word.reference)}` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/kjv-words/${slug}` },
    openGraph: { title, description, url: `/kjv-words/${slug}` },
  };
}

export default async function ArchaicWordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const word = getWord(slug);
  if (!word || !isFeatured(word.word)) notFound();

  // Sibling links: readers who land on "thou" usually want "thee" next.
  const related = featuredWords()
    .filter((w) => w.word !== word.word)
    .slice(0, 12);

  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: word.word,
    alternateName: word.word.toLowerCase(),
    inDefinedTermSet: `${word.word} in the King James Version`,
    description: word.definition,
    ...(word.reference
      ? {
          example: `${word.quote} (${formatRef(word.reference)})`,
          subjectOf: {
            "@type": "CreativeWork",
            name: `KJV ${formatRef(word.reference)}`,
          },
        }
      : {}),
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav className="text-sm text-muted">
        <Link href="/kjv-words" className="font-semibold text-brand hover:underline">
          ← All KJV words
        </Link>
      </nav>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        {word.word}
      </h1>
      <p className="mt-2 font-mono text-sm text-muted">{word.phonetic}</p>

      <dl className="mt-8 space-y-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-brand">
            Modern equivalent
          </dt>
          <dd className="mt-2 text-xl">{word.modern}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-brand">
            What it means
          </dt>
          <dd className="mt-2 leading-relaxed">{word.definition}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-brand">
            In the KJV
          </dt>
          <dd className="mt-2 border-l-2 border-brand/40 pl-4">
            <blockquote className="leading-relaxed">{word.quote}</blockquote>
            {word.reference && (
              <p className="mt-2 text-sm font-semibold text-muted">
                {formatRef(word.reference)}
              </p>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/versions/kjv"
          className="inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Get the KJV app
        </Link>
        <Link
          href="/kjv-words"
          className="rounded-xl border border-black/10 bg-surface px-5 py-2.5 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
        >
          Browse all {TOTAL_WORDS} words
        </Link>
      </div>

      <div className="mt-14">
        <h2 className="text-lg font-semibold tracking-tight">Related words</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {related.map((w) => (
            <Link
              key={w.word}
              href={`/kjv-words/${slugify(w.word)}`}
              className="rounded-full bg-surface px-3 py-1.5 text-sm hover:text-brand"
            >
              {w.word}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}