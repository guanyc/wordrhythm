import type { Metadata } from "next";
import Link from "next/link";
import {
  TOTAL_EMOTION_PAGES,
  allEmotionPages,
} from "@/lib/emotions";

const title = `Bible Verses for Every Feeling — ${TOTAL_EMOTION_PAGES} KJV passages`;
const description =
  `Scripture for how you actually feel. ${TOTAL_EMOTION_PAGES} collections of KJV ` +
  `Bible verses — anxiety, grief, gratitude, anger, hope and more — each with the ` +
  `passage reference so you can read it in context.`;

export const metadata: Metadata = {
  title: "Bible Verses by feeling",
  description,
  alternates: { canonical: "/bible-verses" },
  openGraph: { title, description, url: "/bible-verses" },
};

export default function BibleVersesIndex() {
  const pages = allEmotionPages();

  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Bible Verses by feeling
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">
        Most people open a Bible app when they need something to hold, not when
        they want to study. These are {TOTAL_EMOTION_PAGES} collections of KJV
        passages, grouped by the feeling they are meant for — each one with the
        reference, so you can read it in context.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/bible-verses/${p.slug}`}
              className="block h-full rounded-2xl border border-black/5 bg-surface p-5 shadow-card transition-colors hover:border-brand/40"
            >
              <span className="font-semibold">{p.title}</span>
              <span className="mt-1 block text-sm text-muted">
                {p.subtitle}
              </span>
              <span className="mt-3 block text-xs font-semibold text-brand">
                {p.verses.length} verses
                {p.emotions.length > 1 &&
                  ` · also ${p.emotions
                    .slice(1)
                    .map((e) => e.label.toLowerCase())
                    .join(", ")}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-14 rounded-2xl bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold tracking-tight">
          Matched to how you feel, in the app
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          These collections are the same data Word Rhythm uses for Take a Break.
          In the app you pick an emotion and get one verse with a reflection and
          a prayer — about a minute, fully offline.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/versions/kjv"
            className="inline-flex items-center rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Get the KJV app
          </Link>
          <Link
            href="/take-a-break"
            className="rounded-xl border border-black/10 bg-bg px-5 py-2.5 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
          >
            How Take a Break works
          </Link>
        </div>
      </div>
    </section>
  );
}