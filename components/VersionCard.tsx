import Link from "next/link";
import type { BibleVersion } from "@/lib/versions";

export default function VersionCard({ version }: { version: BibleVersion }) {
  const isLive = version.status === "live";
  return (
    <article className="flex flex-col rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-lg bg-brand-soft px-3 py-1 text-sm font-bold text-brand">
          {version.code}
        </span>
        <span
          className={`text-xs font-semibold ${
            isLive ? "text-emerald-600" : "text-muted"
          }`}
        >
          {isLive ? "Available now" : "Coming soon"}
        </span>
      </div>

      <h3 className="text-lg font-semibold">{version.name}</h3>
      <p className="mt-1 text-sm text-muted">{version.listing}</p>
      <p className="mt-3 flex-1 text-sm text-muted">{version.summary}</p>

      <div className="mt-5">
        {isLive && version.playUrl ? (
          <a
            href={version.playUrl}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Google Play
          </a>
        ) : (
          <span className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-muted">
            Notify me
          </span>
        )}
      </div>
    </article>
  );
}
