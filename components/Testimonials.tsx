import { getAppRating, getReviews } from "@/lib/reviews";

interface TestimonialsProps {
  slug: string;
  /** Show only the first N reviews. */
  limit?: number;
  heading?: string;
  /** Grid columns override for narrow strips. */
  columnsClassName?: string;
}

export default function Testimonials({
  slug,
  limit,
  heading = "What readers say",
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-3",
}: TestimonialsProps) {
  const reviews = getReviews(slug);
  if (reviews.length === 0) return null;

  const shown = limit ? reviews.slice(0, limit) : reviews;
  const rating = getAppRating(slug);

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        {rating && (
          <a
            href={rating.sourceUrl}
            className="text-sm text-muted hover:text-ink"
          >
            <span className="text-accent" aria-hidden="true">
              ★
            </span>{" "}
            {rating.rating} average · {rating.displayCount} reviews on{" "}
            {rating.sourceLabel}
          </a>
        )}
      </div>

      <div className={`mt-6 grid gap-5 ${columnsClassName}`}>
        {shown.map((review) => (
          <figure
            key={review.author}
            className="flex flex-col rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
          >
            <span
              className="text-3xl leading-none text-brand/30"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed">
              {review.quote}
            </blockquote>
            <figcaption className="mt-5">
              <div
                className="text-sm text-accent"
                aria-label={`${review.rating ?? 5} out of 5 stars`}
              >
                {"★".repeat(review.rating ?? 5)}
              </div>
              <div className="mt-1 font-semibold">{review.author}</div>
              <div className="mt-2">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                  {review.theme}
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
