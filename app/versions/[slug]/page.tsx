import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Screenshots from "@/components/Screenshots";
import { getListing } from "@/lib/listings";
import { getVersion, versions } from "@/lib/versions";

export function generateStaticParams() {
  return versions.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const version = getVersion(slug);
  if (!version) return { title: "Version not found" };
  return {
    title: version.name,
    description: version.summary,
  };
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const version = getVersion(slug);
  if (!version) notFound();

  const others = versions.filter((v) => v.slug !== version.slug);
  const listing = getListing(version.slug);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <Link
        href="/versions"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← All versions
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        {version.icon && (
          <Image
            src={version.icon}
            alt=""
            width={72}
            height={72}
            className="rounded-2xl border border-black/5 shadow-card"
          />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Word Rhythm
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {version.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-brand-soft px-3 py-1 text-sm font-bold text-brand">
              {version.code}
            </span>
            <span className="rounded-lg border border-black/10 px-3 py-1 text-xs font-semibold text-muted">
              {version.language}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Available now
            </span>
          </div>

          <p className="mt-4 max-w-xl text-muted">{version.summary}</p>

          {version.playUrl && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={version.playUrl}
                className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
              >
                Get it on Google Play
              </a>
              <span className="text-sm text-muted">
                Listed there as “{version.storeTitle}”
              </span>
            </div>
          )}
        </div>
      </div>

      {listing && (
        <div className="mt-12 max-w-2xl space-y-3 border-l-2 border-brand-soft pl-5 text-muted">
          {listing.intro.map((line) => (
            <p key={line} className="text-lg leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}

      {version.screenshots && version.screenshots.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            Inside the app
          </h2>
          <p className="mt-2 text-sm text-muted">
            Screenshots from the Google Play listing.
          </p>
          <div className="mt-6">
            <Screenshots shots={version.screenshots} label={version.listing} />
          </div>
        </div>
      )}

      {listing && (
        <>
          <div className="mt-14">
            <h2 className="text-xl font-semibold tracking-tight">
              Everything inside
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {listing.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
                >
                  <h3 className="text-base font-semibold">
                    {section.heading}
                  </h3>
                  {section.blocks.map((block, i) =>
                    "text" in block ? (
                      <div
                        key={i}
                        className="mt-2 space-y-2 text-sm text-muted"
                      >
                        {block.text.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <ul
                        key={i}
                        className="mt-3 space-y-1.5 text-sm text-muted"
                      >
                        {block.list.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden="true" className="text-brand">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 max-w-2xl space-y-3 border-t border-black/5 pt-10 text-muted">
            {listing.closing.map((line, i) => (
              <p
                key={line}
                className={
                  i === 0
                    ? "text-lg font-semibold text-ink"
                    : i === listing.closing.length - 1
                      ? "font-semibold text-ink"
                      : undefined
                }
              >
                {line}
              </p>
            ))}
          </div>
        </>
      )}

      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          Other translations
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {others.map((v) => (
            <Link
              key={v.slug}
              href={`/versions/${v.slug}`}
              className="rounded-xl border border-black/10 bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:border-brand/40 hover:text-brand"
            >
              {v.code} · {v.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
