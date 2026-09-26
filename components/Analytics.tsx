"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Google Analytics 4, GA4.
 *
 * Set NEXT_PUBLIC_GA_ID in .env.local (dev) and in the Cloudflare Pages
 * environment variables (build time) to enable. When it is missing the
 * component renders nothing, so localhost / CI stays clean.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** True when a measurement id is configured (false in dev without .env.local). */
export const analyticsEnabled = Boolean(GA_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Send a GA4 event. No-op when analytics is disabled. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

export default function Analytics() {
  // Count clicks on external store links as conversions.
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const host = anchor.hostname;
      if (!host.endsWith("play.google.com") && !host.endsWith("apps.apple.com")) {
        return;
      }
      trackEvent("store_click", {
        link_url: anchor.href,
        link_text: anchor.textContent?.trim().slice(0, 100) ?? "",
        page_path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
