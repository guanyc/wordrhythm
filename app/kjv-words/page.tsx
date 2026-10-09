import type { Metadata } from "next";
import Link from "next/link";
import GlossarySearch, {
  type GlossaryEntry,
} from "@/components/GlossarySearch";
import {
  TOTAL_WORDS,
  allWords,
  featuredWords,
  isFeatured,
  slugify,
} from "@/lib/archaic";

const title = "KJV archaic words — what they mean in the King James Version";
const description =
  `A ${TOTAL_WORDS}-word glossary of King James Version spellings, each with a modern ` +
  `equivalent, a definition and a verbatim example from the text. Built for readers ` +
  `who meet “thee”, “unto” and “comforter” and need to know what they mean.`;

export const metadata: Metadata = {
  title: "KJV archaic words",
  description,
  alternates: { canonical: "/kjv-words" },
  openGraph: { title, description, url: "/kjv-words" },
};

export default function KjvWordsPage() {
  const featured = featuredWords();

  // Featured words first so they are visible without typing, then the rest of
  // the glossary so search has the full list to filter.
  const entries: GlossaryEntry[] = [
    ...featured.map((w) => ({
      slug: slugify(w.word),
      word: w.word,
      modern: w.modern,
      hasPage: true,
    })),
    ...allWords()
      .filter((w) => !isFeatured(w.word))
      .map((w) => ({
        slug: slugify(w.word),
        word: w.word,
        modern: w.modern,
        hasPage: false,
      })),
  ];

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        KJV archaic words
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        The King James Version was written in 1611. Its spellings —{" "}
        <em>thee</em>, <em>thou</em>, <em>unto</em>, <em>comforter</em> — often
        block readers from understanding what the text actually says. This
        glossary explains {TOTAL_WORDS} of them, each with a modern equivalent
        and a verbatim example from the KJV.
      </p>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          The ones readers look up most
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {featured.map((w) => (
            <li key={w.word}>
              <Link
                href={`/kjv-words/${slugify(w.word)}`}
                className="inline-flex items-center rounded-full border border-black/10 bg-surface px-3 py-1.5 text-sm hover:border-brand/40 hover:text-brand"
              >
                {w.word}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">
          Search all {TOTAL_WORDS} words
        </h2>
        <div className="mt-4">
          <GlossarySearch entries={entries} />
        </div>
      </div>

      <div className="mt-12 rounded-2xl bg-surface p-6 shadow-card">
        <h2 className="font-semibold">Why the KJV still reads this way</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The King James Version was translated in 1604 and published in 1611.
          Its second-person forms — <em>thou</em>, <em>thee</em>, <em>thy</em>,{" "}
          <em>thine</em> — come from Early Modern English, not from Shakespeare’s
          day exactly. They never fully disappeared either:{" "}
          <em>thee</em> survives in phrases like &ldquo;thee and thou&rdquo; and
          &ldquo;without thee&rdquo;.
        </p>
        <Link
          href="/versions/kjv"
          className="mt-5 inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Read the KJV offline
        </Link>
      </div>
    </section>
  );
}