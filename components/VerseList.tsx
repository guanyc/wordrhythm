"use client";

import { useState } from "react";

import type { CuratedVerse } from "@/lib/curated";

/**
 * The passage list on /bible-verses/[slug].
 *
 * Short shows the lines the app's Take a Break uses (a one-line insight and a
 * short prayer); Full shows the longer devotional — what the passage means, a
 * reflection, and a prayer. Both depths are rendered and the inactive one is
 * only hidden, so the whole text is in the HTML search engines fetch.
 */
export default function VerseList({ verses }: { verses: CuratedVerse[] }) {
  const [full, setFull] = useState(false);

  return (
    <div>
      <div
        role="group"
        aria-label="Devotional length"
        className="inline-flex rounded-full bg-surface p-1 text-sm"
      >
        <button
          type="button"
          onClick={() => setFull(false)}
          aria-pressed={!full}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            full ? "text-muted hover:text-ink" : "bg-white text-brand shadow-sm"
          }`}
        >
          Short
        </button>
        <button
          type="button"
          onClick={() => setFull(true)}
          aria-pressed={full}
          className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
            full ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
          }`}
        >
          Full
        </button>
      </div>

      <ol className="mt-8 space-y-6">
        {verses.map((v, i) => (
          <li key={v.reference} className="border-t border-black/5 pt-6">
            <p className="font-semibold text-brand">
              {i + 1}. {v.reference}
            </p>
            {v.micro && (
              <p className="mt-2 font-semibold text-brand">{v.micro}</p>
            )}
            <blockquote className="mt-2 leading-relaxed">{v.text}</blockquote>

            <div
              className={`mt-3 space-y-3 rounded-xl bg-surface px-4 py-4 text-sm leading-relaxed ${
                full ? "hidden" : ""
              }`}
            >
              {v.insight && (
                <p>
                  <span className="font-semibold">Insight </span>
                  {v.insight}
                </p>
              )}
              {v.prayer && (
                <p>
                  <span className="font-semibold">Prayer </span>
                  {v.prayer}
                </p>
              )}
            </div>

            <div
              className={`mt-3 space-y-3 rounded-xl bg-surface px-4 py-4 text-sm leading-relaxed ${
                full ? "" : "hidden"
              }`}
            >
              {v.meaning && (
                <p>
                  <span className="font-semibold">What it means </span>
                  {v.meaning}
                </p>
              )}
              {v.reflection && (
                <p>
                  <span className="font-semibold">Reflection </span>
                  {v.reflection}
                </p>
              )}
              {(v.fullPrayer || v.prayer) && (
                <p>
                  <span className="font-semibold">Prayer </span>
                  {v.fullPrayer || v.prayer}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
