import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { privacyPolicies } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy policies",
  description:
    "Privacy policies for every Word Rhythm translation and for Take a Break.",
};

export default function PrivacyIndexPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Privacy policies
      </h1>
      <p className="mt-4 text-muted">
        Each app has its own policy. Pick the one you are looking for.
      </p>

      <ul className="mt-8 space-y-3">
        {privacyPolicies.map((policy) => (
          <li key={policy.slug}>
            <Link
              href={`/privacy/${policy.slug}`}
              className="flex items-center gap-4 rounded-2xl border border-black/5 bg-surface p-4 shadow-card transition-colors hover:border-brand/40"
            >
              {policy.icon && (
                <Image
                  src={policy.icon}
                  alt=""
                  width={44}
                  height={44}
                  className="rounded-xl border border-black/5"
                />
              )}
              <span className="flex-1">
                <span className="block font-semibold">{policy.appName}</span>
                <span className="block text-sm text-muted">
                  Updated {policy.updated} · {policy.androidPackage}
                </span>
              </span>
              <span aria-hidden="true" className="text-brand">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted">
        Questions? Email{" "}
        <a
          href="mailto:yc.guan@gmail.com"
          className="font-semibold text-brand hover:underline"
        >
          yc.guan@gmail.com
        </a>
        .
      </p>
    </section>
  );
}
