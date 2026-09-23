import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrivacy, privacyPolicies, renderPrivacy } from "@/lib/privacy";

export function generateStaticParams() {
  return privacyPolicies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPrivacy(slug);
  if (!policy) return { title: "Privacy policy not found" };
  return {
    title: `${policy.appName} privacy policy`,
    description: `How ${policy.appName} handles your data. Last updated ${policy.updated}.`,
    alternates: policy.hidden
      ? undefined
      : { canonical: `/privacy/${policy.slug}` },
    // Policies for apps outside this site stay reachable but unlisted.
    robots: policy.hidden ? { index: false, follow: false } : undefined,
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = getPrivacy(slug);
  if (!policy) notFound();

  const html = renderPrivacy(policy.slug);

  const identity: [string, string][] = [
    ["App / Store Listing Name", policy.storeName],
    ["App Name In Policy", policy.appName],
    ["Developer Name", policy.developerName],
    ["Legal Entity", policy.legalEntity],
    ["Android Package Name", policy.androidPackage],
    ["Privacy Contact Email", policy.contactEmail],
  ];

  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <Link
        href="/privacy"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← All privacy policies
      </Link>

      <div className="mt-6 flex items-start gap-4">
        {policy.icon && (
          <Image
            src={policy.icon}
            alt=""
            width={56}
            height={56}
            className="rounded-2xl border border-black/5 shadow-card"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {policy.appName} Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-muted">Updated {policy.updated}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-surface p-6 shadow-card">
        <p className="font-semibold">App And Developer Identity</p>
        <dl className="mt-3 space-y-2 text-sm text-muted">
          {identity.map(([label, value]) => (
            <div key={label} className="flex flex-wrap gap-1">
              <dt className="font-semibold text-ink">{label}:</dt>
              <dd className="break-all">{value}</dd>
            </div>
          ))}
          <div className="flex flex-wrap gap-1">
            <dt className="font-semibold text-ink">Google Play Listing:</dt>
            <dd className="break-all">
              <a
                href={policy.playUrl}
                className="text-brand hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {policy.playUrl}
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <article
        className="wr-prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        {policy.versionSlug && (
          <Link
            href={`/versions/${policy.versionSlug}`}
            className="rounded-xl border border-black/10 bg-surface px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
          >
            About this app
          </Link>
        )}
        {policy.slug === "take-a-break" && (
          <Link
            href="/take-a-break"
            className="rounded-xl border border-black/10 bg-surface px-4 py-2 font-semibold transition-colors hover:border-brand/40 hover:text-brand"
          >
            About Take a Break
          </Link>
        )}
      </div>
    </section>
  );
}
