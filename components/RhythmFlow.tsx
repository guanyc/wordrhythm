import Link from "next/link";
import { hasSleepAudio } from "@/lib/versions";

const beats = [
  {
    time: "Morning",
    title: "Read Scripture",
    body: "Start the day with a verse and a short reflection. No pressure, just a steady opening rhythm.",
  },
  {
    time: "During the day",
    title: "Take a Break",
    body: "When life feels heavy, open Take a Break: pick an emotion or situation, get a verse, insight, and prayer.",
  },
  {
    time: "Evening",
    title: "Reflect",
    body: "Close the day with devotional reading — quiet reflection that settles the day behind you.",
  },
  {
    time: "Sleep",
    title: "Settle In",
    body: "A fourth slot for the wind-down before bed, running from late evening past midnight.",
  },
];

/** The one translation that ships the dedicated Sleep Audio track. */
const sleepSlug = "kjv";

export default function RhythmFlow() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          A rhythm, not a chore
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          Word Rhythm fits Scripture into the real shape of your day.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {beats.map((beat, i) => (
          <div
            key={beat.time}
            className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {i + 1}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                {beat.time}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{beat.title}</h3>
            <p className="mt-2 text-sm text-muted">{beat.body}</p>
          </div>
        ))}
      </div>

      {hasSleepAudio(sleepSlug) && (
        <div className="mt-6 rounded-2xl border border-black/5 bg-brand-soft p-6 shadow-card sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Sleep Audio · KJV only
            </p>
            <p className="mt-2 text-sm text-ink">
              The sleep slot read aloud with soft pacing, long pauses and peaceful
              background sounds — so the last thing you hear before sleep is
              Scripture, not a screen.
            </p>
          </div>
          <Link
            href={`/versions/${sleepSlug}`}
            className="mt-4 inline-flex shrink-0 items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:mt-0"
          >
            Get the KJV app
          </Link>
        </div>
      )}
    </section>
  );
}
