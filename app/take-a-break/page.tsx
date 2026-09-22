import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take a Break",
  description:
    "When life feels heavy, Take a Break meets you in the moment with a verse, insight, and prayer.",
};

const steps = [
  {
    title: "Pick how you feel",
    body: "Choose an emotion or a situation — peace, strength, comfort, guidance, or a hard day.",
  },
  {
    title: "Get a verse",
    body: "A short, relevant Scripture appears — no search, no scrolling, just the right words.",
  },
  {
    title: "Read the insight",
    body: "A calm one-line reflection helps the verse land in your actual moment.",
  },
  {
    title: "Pray",
    body: "A simple prayer closes the loop so you can breathe and return to your day.",
  },
];

export default function TakeABreakPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          A moment of rhythm
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Take a Break
        </h1>
        <p className="mt-4 text-lg text-muted">
          When life feels heavy, Take a Break meets you in the moment — an
          emotion, a verse, an insight, a prayer. Built into every Word Rhythm
          Bible app.
        </p>
      </div>

      <ol className="mt-12 grid gap-5 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand">
              {i + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <a
          href="https://play.google.com/store/apps/details?id=com.guanyc.takeabreak"
          className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          Get Take a Break on Google Play
        </a>
      </div>
    </section>
  );
}
