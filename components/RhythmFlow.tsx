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
    title: "Reflect & Rest",
    body: "Wind down with evening reading and a quiet reflection — Scripture that helps you settle before sleep.",
  },
];

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

      <div className="grid gap-5 md:grid-cols-3">
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
    </section>
  );
}
