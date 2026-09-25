/**
 * Curated Google Play reviews, shown as quote cards on /versions/[slug].
 *
 * Short quotes work better than full reviews: one idea per card, easy to
 * scan. Add reviews per version here and the detail page picks them up.
 */

export interface Review {
  author: string;
  quote: string;
  /** Short theme label shown as a pill, e.g. "Daily reading". */
  theme: string;
  rating?: number;
}

const kjvReviews: Review[] = [
  {
    author: "Moboluwarin JIBOLA-SHITTU",
    theme: "Simple & quick",
    quote:
      "A clean, lightweight and simple interface is all we asked for. And I’m 100% satisfied — this app has provided that.",
    rating: 5,
  },
  {
    author: "Melody Idowu",
    theme: "Devotional",
    quote:
      "It’s beautiful and enlightening! The devotionals are exceptional — they draw me closer to God and help me understand the word.",
    rating: 5,
  },
  {
    author: "Patience Oluseye",
    theme: "Daily reading",
    quote:
      "I have been able to consistently read my Bible because of how easily the app structures Scripture for daily reading.",
    rating: 5,
  },
  {
    author: "Cynthia Daniel",
    theme: "Listening",
    quote:
      "Highly recommend for those who understand by listening, and who love to drive, run, walk, jog, or relax and listen to the word of God.",
    rating: 5,
  },
  {
    author: "Ronald Daniel Kupara",
    theme: "The KJV text",
    quote:
      "The King James Version has always been my preferred translation because of its depth, reverence, and the way it carries the weight of God’s Word.",
    rating: 5,
  },
  {
    author: "Ruth T",
    theme: "Long-time companion",
    quote:
      "I’ve used this app for many years. It’s solid, and it has become my number one Bible app.",
    rating: 5,
  },
];

const reviewsByVersion: Record<string, Review[]> = {
  kjv: kjvReviews,
};

export function getReviews(slug: string): Review[] {
  return reviewsByVersion[slug] ?? [];
}

/** Aggregate score published on Google Play (update manually when it moves). */
export interface AppRating {
  rating: number;
  reviewCount: number;
  /** How Play rounds the count, e.g. "48.2K" */
  displayCount: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const appRatings: Record<string, AppRating> = {
  // Global average — the listing page fetched without a `gl` country param.
  // Play also serves per-country averages: US 3.9, GB 4.7, BR 5.0, NG/IN 4.6.
  kjv: {
    rating: 4.64,
    reviewCount: 48200,
    displayCount: "48.2K",
    sourceLabel: "Google Play",
    sourceUrl:
      "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv",
  },
};

export function getAppRating(slug: string): AppRating | undefined {
  return appRatings[slug];
}
