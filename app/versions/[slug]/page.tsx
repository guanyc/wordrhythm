import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Screenshots from "@/components/Screenshots";
import { getListing } from "@/lib/listings";
import { getVersion, versions, audioNote } from "@/lib/versions";
import { postsForVersion, getPublishedPosts } from "@/lib/blog";
import { getAppRating, getReviews } from "@/lib/reviews";
import { TOTAL_WORDS } from "@/lib/archaic";
import { TOTAL_EMOTION_PAGES, featuredFeelings } from "@/lib/emotions";

export function generateStaticParams() {
  return versions.map((v) => ({ slug: v.slug }));
}

/** Maps a BCP-47 tag from `versions.ts` onto an og:locale tag. */
function ogLocale(lang: string): string {
  switch (lang) {
    case "zh-Hans":
      return "zh_CN";
    case "es":
      return "es_ES";
    case "pt-BR":
      return "pt_BR";
    case "fr":
      return "fr_FR";
    default:
      return "en_US";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const version = getVersion(slug);
  if (!version) return { title: "Version not found" };

  const title = version.brandName
    ? `${version.brandName} · ${version.name}`
    : version.name;
  const description = version.tagline
    ? `${version.tagline} — ${version.summary}`
    : version.summary;

  return {
    title,
    description,
    alternates: {
      canonical: `/versions/${version.slug}`,
      // Each translation answers to its own language, so point Google at the
      // matching Play listing rather than making every page compete in English.
      languages: {
        ...(version.playUrl ? { "x-default": version.playUrl } : {}),
      },
    },
    openGraph: {
      title,
      description,
      url: `/versions/${version.slug}`,
      locale: ogLocale(version.lang),
      images: [version.ogImage ?? "/brand/og.jpg"],
    },
    twitter: {
      title,
      description,
      images: [version.ogImage ?? "/brand/og.jpg"],
    },
  };
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const version = getVersion(slug);
  if (!version) notFound();

  const others = versions.filter((v) => v.slug !== version.slug);
  const listing = getListing(version.slug);
  const guides = postsForVersion(version.slug, 3);
  const fallbackGuides =
    guides.length > 0
      ? guides
      : getPublishedPosts().slice(0, 3);
  const rating = getAppRating(version.slug);
  const reviewQuotes = getReviews(version.slug).slice(0, 3);
  // KJV-only companion blocks: the glossary and the verse collections are
  // specific to that translation's archaic spellings and to Take a Break's
  // KJV content, so they must not appear on the other six pages.
  const featured = version.slug === "kjv" ? featuredFeelings() : [];

  // Per-version SoftwareApplication: the detail page is what a Play search
  // query should land on, so it carries its own app markup rather than
  // relying on the homepage aggregate.
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: version.listing,
    url: `https://wordrhythm.app/versions/${version.slug}`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Android",
    inLanguage: version.lang,
    description: version.summary,
    image: version.icon ? `https://wordrhythm.app${version.icon}` : undefined,
    ...(version.package ? { identifier: version.package } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(version.playUrl ? { sameAs: version.playUrl } : {}),
    ...(rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.rating,
            reviewCount: rating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviewQuotes.length > 0
      ? {
          review: reviewQuotes.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating ?? 5,
              bestRating: 5,
            },
            reviewBody: r.quote,
          })),
        }
      : {}),
  };

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <Link
        href="/versions"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← All versions
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        {version.icon && (
          <Image
            src={version.icon}
            alt=""
            width={72}
            height={72}
            className="rounded-2xl border border-black/5 shadow-card"
          />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            {version.brandName ?? "Word Rhythm"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {version.name}
          </h1>

          {version.tagline && (
            <p className="mt-2 text-lg font-medium text-brand">
              {version.tagline}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-brand-soft px-3 py-1 text-sm font-bold text-brand">
              {version.code}
            </span>
            <span className="rounded-lg border border-black/10 px-3 py-1 text-xs font-semibold text-muted">
              {version.language}
            </span>
            {version.audio === "sleep" && (
              <span className="rounded-lg bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                Sleep Audio
              </span>
            )}
            {version.audio === "tts" && (
              <span className="rounded-lg bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                Text-to-speech
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-600">
              Available now
            </span>
          </div>

          <p className="mt-4 max-w-xl text-muted">{version.summary}</p>

          <p className="mt-3 text-sm text-muted">
            Four daily slots: morning, day, evening, and the before-bed
            devotional.{" "}
            {audioNote(version.slug) ?? "Reading and devotionals only."}
          </p>

          {version.playUrl && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={version.playUrl}
                className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                Get it on Google Play
              </a>
              <span className="text-sm text-muted">
                Listed there as “{version.storeTitle}”
              </span>
            </div>
          )}

          <p className="mt-4 text-sm text-muted">
            <Link
              href={`/privacy/${version.slug}`}
              className="font-semibold text-brand hover:underline"
            >
              Privacy policy
            </Link>
          </p>
        </div>
      </div>

      {listing && (
        <div className="mt-12 max-w-2xl space-y-3 border-l-2 border-brand-soft pl-5 text-muted">
          {(listing.introZh ?? listing.intro).map((line) => (
            <p key={line} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}

      {version.screenshots && version.screenshots.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            Inside the app
          </h2>
          <p className="mt-2 text-sm text-muted">
            Screenshots from the Google Play listing.
          </p>
          <div className="mt-6">
            <Screenshots shots={version.screenshots} label={version.listing} />
          </div>
        </div>
      )}

      {listing && (
        <>
          <div className="mt-14">
            <h2 className="text-xl font-semibold tracking-tight">
              Everything inside
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {listing.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
                >
                  <h3 className="text-base font-semibold">
                    {section.heading}
                  </h3>
                  {section.blocks.map((block, i) =>
                    "text" in block ? (
                      <div
                        key={i}
                        className="mt-2 space-y-2 text-sm text-muted"
                      >
                        {block.text.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <ul
                        key={i}
                        className="mt-3 space-y-1.5 text-sm text-muted"
                      >
                        {block.list.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden="true" className="text-brand">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 max-w-2xl space-y-3 border-t border-black/5 pt-10 text-muted">
            {listing.closing.map((line, i) => (
              <p
                key={line}
                className={
                  i === 0
                    ? "text-lg font-semibold text-ink"
                    : i === listing.closing.length - 1
                      ? "font-semibold text-ink"
                      : undefined
                }
              >
                {line}
              </p>
            ))}
          </div>
        </>
      )}

      {fallbackGuides.length > 0 && (
        <div className="mt-14 border-t border-black/5 pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Read about {version.code}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {fallbackGuides.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block h-full rounded-2xl border border-black/5 bg-surface p-5 shadow-card transition-colors hover:border-brand/40"
                >
                  <span className="font-semibold">{p.title}</span>
                  <span className="mt-2 block text-sm text-muted">
                    {p.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {version.slug === "kjv" && featured.length > 0 && (
        <>
          <div className="mt-14 rounded-2xl bg-surface p-8 shadow-card">
            <h2 className="text-xl font-semibold tracking-tight">
              Reading the KJV?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              The King James Version was written in 1611. Its spellings —
              <em>thee</em>, <em>thou</em>, <em>unto</em>, <em>comforter</em> —
              stop a lot of readers before they reach the meaning. We have a
              glossary of {TOTAL_WORDS.toLocaleString("en-US")} of them, each with
              a modern equivalent and a verbatim example from the text.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["thee", "thou", "unto", "comforter", "verily", "wherefore"].map(
                (w) => (
                  <Link
                    key={w}
                    href={`/kjv-words/${w}`}
                    className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand transition-opacity hover:opacity-70"
                  >
                    {w}
                  </Link>
                ),
              )}
            </div>
            <Link
              href="/kjv-words"
              className="mt-6 inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Open the full glossary
            </Link>
          </div>

          <div className="mt-8 rounded-2xl bg-surface p-8 shadow-card">
            <h2 className="text-xl font-semibold tracking-tight">
              Take a Break, on the web
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Not sure where to read? Pick what you are feeling and get ten KJV
              passages matched to it, each with a short reflection and a prayer —
              the same pairing the app shows.{" "}
              {TOTAL_EMOTION_PAGES} collections in all, from anxiety and grief to
              hope and gratitude.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {featured.map((page) => (
                <Link
                  key={page.slug}
                  href={`/bible-verses/${page.slug}`}
                  className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand transition-opacity hover:opacity-70"
                >
                  {page.title}
                </Link>
              ))}
            </div>
            <Link
              href="/bible-verses"
              className="mt-6 inline-flex items-center rounded-xl border border-black/10 px-5 py-2.5 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
            >
              All {TOTAL_EMOTION_PAGES} collections
            </Link>
          </div>
        </>
      )}

      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          Other translations
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((v) => (
            <Link
              key={v.slug}
              href={`/versions/${v.slug}`}
              className="rounded-xl border border-black/10 bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-brand/40 hover:text-brand"
            >
              {v.code} · {v.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
