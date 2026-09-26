"use client";

import { analyticsEnabled } from "@/components/Analytics";

const KEY = "wr-analytics-consent";

/** Lets a visitor revisit their analytics choice (re-shows the consent dialog). */
export default function CookieSettings() {
  if (!analyticsEnabled) return null;

  return (
    <button
      type="button"
      onClick={() => {
        try {
          localStorage.removeItem(KEY);
        } catch {
          // Ignore.
        }
        location.reload();
      }}
      className="underline underline-offset-2 hover:text-ink"
    >
      Cookie settings
    </button>
  );
}
