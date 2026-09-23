import type { Metadata } from "next";
import VersionCard from "@/components/VersionCard";
import { versions } from "@/lib/versions";

export const metadata: Metadata = {
  title: "Versions",
  description:
    "Word Rhythm across every translation — KJV, ASV, WEB, Biblia RVR, 和合本, Bíblia AA.",
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
    </section>
  );
}
