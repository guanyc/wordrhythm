import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Svenska 1917 Bible quick",
  description:
    "A fast, offline reader for the public-domain Svenska 1917 Bible — 66 books, 31,152 verses, with semantic highlights, tags, memorization, reading plans and on-device text-to-speech.",
  alternates: { canonical: "/projects/sv1917-quick" },
};

const features = [
  {
    title: "Read without waiting",
    body: "Continue Reading opens the last chapter instantly. Clean reading view, adjustable type and theme, and no devotional layer in the way.",
  },
  {
    title: "Find a verse fast",
    body: "Book / chapter / verse locator, full-text search with phrase and prefix operators, search history and grouped results.",
  },
  {
    title: "Highlights with meaning",
    body: "Five colours carry a simple language: Christ and gospel, God and promise, life and growth, hope and eternity, warning and sin.",
  },
  {
    title: "Tags that survive language changes",
    body: "Topic, Doctrine and Life tags use stable English keys with localized display names, so backups and migration stay predictable.",
  },
  {
    title: "Memorize at your pace",
    body: "Four levels, hide-the-text review, and a straightforward in-progress / mastered state for every memorized verse.",
  },
  {
    title: "Plans, widgets and speech",
    body: "Daily reading and reading plans, home-screen widgets, and optional on-device text-to-speech for hands-free listening.",
  },
];

const shots = [
  { src: "/apps/sv1917-quick/01.jpg", alt: "Home screen" },
  { src: "/apps/sv1917-quick/02.jpg", alt: "Clean Bible reading view" },
  { src: "/apps/sv1917-quick/03.jpg", alt: "Five-colour highlight dialog" },
  { src: "/apps/sv1917-quick/04.jpg", alt: "Topic search presets" },
];

export default function Sv1917QuickPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <Image
          src="/apps/sv1917-quick/icon.png"
          alt="Svenska 1917 Bible quick app icon"
          width={96}
          height={96}
          priority
          className="rounded-[22%] shadow-card"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Word Rhythm family app
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Svenska 1917 Bible quick
          </h1>
          <p className="mt-2 text-lg font-medium text-brand">
            Svenska 1917 Bibeln Snabb
          </p>
          <p className="mt-4 max-w-2xl text-muted">
            A focused, offline reader for the 1917 Swedish Church Bible. The
            complete text is on the device — 66 books and 31,152 verses — with
            fast search, meaningful highlights and a calm reading experience.
            Swedish is the default interface language; English is available in
            Settings.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-brand-soft px-3 py-1 text-brand">
              Swedish 1917
            </span>
            <span className="rounded-lg border border-black/10 px-3 py-1 text-muted">
              Offline
            </span>
            <span className="rounded-lg border border-black/10 px-3 py-1 text-muted">
              Text-to-speech
            </span>
            <span className="rounded-lg border border-black/10 px-3 py-1 text-muted">
              Quick reader
            </span>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">What it does</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
        <p className="mt-2 text-sm text-muted">
          Captured with the network disabled, so no advertising appears in the
          interface.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {shots.map((shot) => (
            <Image
              key={shot.src}
              src={shot.src}
              alt={shot.alt}
              width={360}
              height={800}
              className="rounded-xl border border-black/5 shadow-card"
            />
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-2xl border border-black/5 bg-surface p-6">
        <h2 className="text-xl font-semibold tracking-tight">Project details</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold">Android package</dt>
            <dd className="mt-1 text-muted">com.gyc.ace.sv1917_quick</dd>
          </div>
          <div>
            <dt className="font-semibold">Interface languages</dt>
            <dd className="mt-1 text-muted">Svenska (default), English</dd>
          </div>
          <div>
            <dt className="font-semibold">Scripture source</dt>
            <dd className="mt-1 text-muted">
              1917 års kyrkobibel, public domain (66 books, 31,152 verses)
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Build</dt>
            <dd className="mt-1 text-muted">
              Java / XML · minSdk 24 · targetSdk 37
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/privacy/sv1917-quick"
          className="inline-flex items-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          Privacy policy
        </Link>
        <Link
          href="/versions"
          className="text-sm font-semibold text-brand hover:underline"
        >
          See the other Word Rhythm apps →
        </Link>
      </div>
    </section>
  );
}
