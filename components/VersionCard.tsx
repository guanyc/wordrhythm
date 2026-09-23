import Image from "next/image";
import Link from "next/link";
import type { BibleVersion } from "@/lib/versions";

export default function VersionCard({ version }: { version: BibleVersion }) {
  const isLive = version.status === "live";
  return (
    <article className="flex flex-col rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {version.icon && (
            <Image
              src={version.icon}
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
            />
          )}
          <span className="rounded-lg bg-brand-soft px-3 py-1 text-sm font-bold text-brand">
            {version.code}
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            isLive ? "text-emerald-600" : "text-muted"
          }`}
        >
          {isLive ? "Available now" : "Coming soon"}
        </span>
      </div>

      <h3 className="text-lg font-semibold">
        <Link
          href={`/versions/${version.slug}`}
          className="transition-colors hover:text-brand"
        >
          {version.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">
        {version.listing} · {version.language}
      </p>
      <p className="mt-3 flex-1 text-sm text-muted">{version.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
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
        <Link
          href={`/versions/${version.slug}`}
          className="text-sm font-semibold text-brand hover:underline"
        >
          Details →
        </Link>
      </div>
    </article>
  );
}
