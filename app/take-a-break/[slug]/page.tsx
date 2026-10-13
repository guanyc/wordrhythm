import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import TakeABreakCard from "@/components/TakeABreakCard";
import { CURATED_COUNT, curatedSlugs, getCurated } from "@/lib/curated";

export function generateStaticParams() {
  return curatedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCurated(slug);
  if (!entry) return { title: "Not found" };

  const subject = entry.title.toLowerCase();
  const first = entry.verses[0];
  const title = `Take a Break for ${subject} — a verse, an insight, a prayer`;
  const description =
    `One KJV passage for ${subject}, with a short insight and a prayer. ` +
    `Today: ${first.reference}. ` +
    `The full devotional for each passage is on the verse collection.`;

  return {
    title,
    description,
    alternates: { canonical: `/take-a-break/${entry.slug}` },
    openGraph: { title, description, url: `/take-a-break/${entry.slug}` },
  };
}

export default async function TakeABreakFeelingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getCurated(slug);
  if (!entry) notFound();

  const subject = entry.title.toLowerCase();
  const first = entry.verses[0];

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <nav className="text-sm text-muted">
        <Link
          href="/take-a-break"
          className="font-semibold text-brand hover:underline"
        >
          ← All feelings
        </Link>
      </nav>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        Take a Break for {subject}
      </h1>
      {entry.subtitle && (
        <p className="mt-4 text-lg text-muted">{entry.subtitle}.</p>
      )}
      <p className="mt-3 text-sm text-muted">
        One passage at a time — the same flow the app uses: a verse, a short
        insight, a prayer. Nothing to install.
      </p>

      <div className="mt-10">
        <TakeABreakCard verses={entry.verses.slice(0, CURATED_COUNT)} />
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 bg-surface p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          More passages for {subject}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Take a Break keeps {CURATED_COUNT} passages for {subject} close at
          hand. The full collection lists all {entry.verses.length}, each with a
          short reflection and the longer devotional.
        </p>
        <Link
          href={`/bible-verses/${entry.slug}`}
          className="mt-4 inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          See all Bible verses for {subject}
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Take a Break passages for ${entry.title}`,
            description: `${entry.verses.length} KJV passages for ${subject}, each with an insight and a prayer.`,
            numberOfItems: entry.verses.length,
            itemListElement: entry.verses.map((v, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "CreativeWork",
                name: v.reference,
                text: v.text,
                abstract: [v.micro, v.insight, v.prayer, v.meaning, v.reflection]
                  .filter(Boolean)
                  .join(" "),
                inLanguage: "en",
              },
            })),
          }),
        }}
      />
      <p className="mt-6 text-sm text-muted">
        First passage: {first.reference}.
      </p>
    </section>
  );
}
