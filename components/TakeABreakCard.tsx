"use client";

import { useState } from "react";

import type { CuratedVerse } from "@/lib/curated";

/**
 * The app's Take a Break flow on the web: one passage at a time with the
 * short insight and prayer the app shows. No length switch here — this is
 * the 60-second pause; /bible-verses/ is where the full devotional lives.
 */
export default function TakeABreakCard({ verses }: { verses: CuratedVerse[] }) {
  const [index, setIndex] = useState(0);

  if (!verses.length) return null;
  const v = verses[index];

  return (
    <div>
      <article className="rounded-3xl bg-surface p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          {v.reference}
        </p>
        {v.micro && (
          <p className="mt-3 text-lg font-semibold text-brand">{v.micro}</p>
        )}
        <blockquote className="mt-4 text-xl leading-relaxed sm:text-2xl">
          {v.text}
        </blockquote>

        <div className="mt-6 space-y-4">
          {v.insight && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Insight
              </p>
              <p className="mt-1 leading-relaxed">{v.insight}</p>
            </div>
          )}
          {v.prayer && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Prayer
              </p>
              <p className="mt-1 leading-relaxed">{v.prayer}</p>
            </div>
          )}
        </div>
      </article>

      {verses.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setIndex((index + 1) % verses.length)}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
          >
            Another verse
          </button>
          <p className="text-sm text-muted">
            Passage {index + 1} of {verses.length}
          </p>
        </div>
      )}
    </div>
  );
}
