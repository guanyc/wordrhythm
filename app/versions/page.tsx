import type { Metadata } from "next";
import Link from "next/link";
import VersionCard from "@/components/VersionCard";
import { versions } from "@/lib/versions";

export const metadata: Metadata = {
  title: "Versions",
  description:
    "Word Rhythm across every translation — KJV, ASV, WEB, Biblia RVR, 和合本, Bíblia AA.",
  alternates: { canonical: "/versions" },
};

export default function VersionsPage() {
  const live = versions.filter((v) => v.status === "live").length;
  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Word Rhythm Bible
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        One calm daily companion, available across the translations you love.
        {live > 0 && ` ${live} ${live === 1 ? "version is" : "versions are"} available now.`}
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {versions.map((v) => (
          <VersionCard key={v.slug} version={v} />
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 bg-surface p-6">
        <p className="font-semibold">New to the King James Version?</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The KJV is written in 1611 English, and<span className="whitespace-nowrap">
            {" "}
            <em>thee</em>, <em>thou</em>, <em>unto</em>
          </span>{" "}
          can stop you before you reach the meaning. Our glossary explains 1,440
          of these words, each with a modern equivalent and a verbatim example
          from the text.
        </p>
        <Link
          href="/kjv-words"
          className="mt-4 inline-flex items-center rounded-xl border border-black/10 bg-bg px-4 py-2 text-sm font-semibold transition-colors hover:border-brand/40 hover:text-brand"
        >
          Look up a KJV word
        </Link>
      </div>
    </section>
  );
}
