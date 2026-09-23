import Hero from "@/components/Hero";
import RhythmFlow from "@/components/RhythmFlow";
import Screenshots from "@/components/Screenshots";
import Testimonials from "@/components/Testimonials";
import VersionCard from "@/components/VersionCard";
import { getAppRating, getReviews } from "@/lib/reviews";
import { getVersion, takeABreak, versions } from "@/lib/versions";

const FEATURED_SLUG = "kjv";

export default function HomePage() {
  const flagship = getVersion(FEATURED_SLUG);
  const showcase = [
    ...(flagship?.screenshots ?? []),
    ...takeABreak.screenshots,
  ];
  const featuredReviews = getReviews(FEATURED_SLUG).slice(0, 3);
  const featuredRating = getAppRating(FEATURED_SLUG);

  // Review snippet markup — only reviews actually rendered on this page.
  const reviewSchema =
    flagship && featuredRating
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: flagship.listing,
          operatingSystem: "Android",
          applicationCategory: "LifestyleApplication",
          url: flagship.playUrl,
          description: flagship.summary,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: featuredRating.rating,
            ratingCount: featuredRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: featuredReviews.map((r) => ({
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
      : null;

  return (
    <>
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}
      <Hero />
      <RhythmFlow />

      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              One brand, every translation
            </h2>
            <p className="mt-3 max-w-lg text-muted">
              The same calm daily rhythm, across the versions you love.
            </p>
          </div>
          <a
            href="/versions"
            className="hidden shrink-0 text-sm font-semibold text-brand hover:underline sm:inline"
          >
            See all versions →
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {versions.map((v) => (
            <VersionCard key={v.slug} version={v} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Inside the apps
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Real screenshots from the Google Play listings — the same calm
          reading rhythm, plus Take a Break, in every translation.
        </p>
        <div className="mt-8">
          <Screenshots variant="strip" shots={showcase} label="Word Rhythm" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-10">
        <Testimonials slug={FEATURED_SLUG} limit={3} />
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="overflow-hidden rounded-2xl bg-brand px-8 py-12 text-center text-white shadow-card">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Need a pause right now?
          </h2>
          <p className="mx-auto mt-3 max-w-md opacity-90">
            Take a Break meets you in the moment — an emotion, a verse, an
            insight, a prayer.
          </p>
          <a
            href="/take-a-break"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-brand transition-transform hover:-translate-y-0.5"
          >
            Try Take a Break
          </a>
        </div>
      </section>
    </>
  );
}
