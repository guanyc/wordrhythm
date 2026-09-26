"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Analytics, { analyticsEnabled } from "@/components/Analytics";

/**
 * Opt-in gate for Google Analytics.
 *
 * Nothing is loaded and nothing is stored until the visitor chooses. This keeps
 * the site usable in jurisdictions that require prior consent (GDPR/EEA), and
 * also means the Cloudflare beacon stays the only always-on measurement.
 *
 * The choice lives in localStorage only — it never leaves the browser.
 */
const KEY = "wr-analytics-consent";

type Consent = "granted" | "denied";

function readStored(): Consent | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Private browsing / storage disabled: treat as "not yet answered".
    return null;
  }
}

export default function ConsentGate() {
  const [consent, setConsent] = useState<Consent | null>(null);
  // Avoid flashing the dialog for visitors who already answered.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readStored());
    setReady(true);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Ignore: consent simply won't be remembered for this visit.
    }
    setConsent(value);
  };

  // No measurement id configured → nothing to ask, nothing to load.
  if (!analyticsEnabled) return null;

  return (
    <>
      {consent === "granted" && <Analytics />}

      {consent === null && ready && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-50 rounded-2xl bg-surface p-5 shadow-card ring-1 ring-black/5 sm:left-4 sm:right-auto sm:max-w-sm"
        >
          <p className="text-sm font-semibold text-ink">Cookies &amp; analytics</p>
          <p className="mt-2 text-sm text-muted">
            We use Google Analytics to understand which guides help people
            around here. No ads, no selling of data. You can change your mind at
            any time. Read our{" "}
            <Link href="/privacy/website" className="text-brand underline">
              privacy &amp; cookie notice
            </Link>
            .
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="flex-1 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="flex-1 rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand/40"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
