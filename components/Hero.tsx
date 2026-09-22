export default function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-16 pb-10 text-center sm:pt-24">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Word Rhythm
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Scripture for the rhythm of everyday life
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
        God&apos;s Word, part of your daily rhythm. Read in the morning, pause
        during the day, reflect in the evening — one calm companion across
        every translation.
      </p>

      <div className="wr-eq mt-10 justify-center" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://play.google.com/store/apps/details?id=com.gyc.ace.kjv"
          className="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          Get the KJV Bible app
        </a>
        <a
          href="/versions"
          className="rounded-xl border border-black/10 bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-brand/40"
        >
          Explore versions
        </a>
      </div>
    </section>
  );
}
