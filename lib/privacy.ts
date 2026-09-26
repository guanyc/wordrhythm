import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export interface PrivacyPolicy {
  /** URL slug under /privacy, e.g. "kjv" */
  slug: string;
  /** App name as written inside the policy */
  appName: string;
  /** Name shown on the Google Play listing */
  storeName: string;
  androidPackage: string;
  playUrl: string;
  developerName: string;
  legalEntity: string;
  contactEmail: string;
  /** Human-readable effective date shown in the page header */
  updated: string;
  /** App icon in /public, when available */
  icon?: string;
  /** Matching /versions/[slug], when the app is a Bible translation */
  versionSlug?: string;
  /**
   * Other apps by the same developer. They are reachable at
   * /privacy/<slug> for store listings, but stay out of the index
   * page and out of search results.
   */
  hidden?: boolean;
}

const DEVELOPER = "Guan Yongchun";
const EMAIL = "yc.guan@gmail.com";

/** Mirrors the "App And Developer Identity" block from the Hugo shortcode. */
export const privacyPolicies: PrivacyPolicy[] = [
  {
    slug: "kjv",
    appName: "Bible KJV",
    storeName: "Bible KJV",
    androidPackage: "com.gyc.ace.kjv",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.kjv",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/kjv/icon.png",
    versionSlug: "kjv",
  },
  {
    slug: "asv",
    appName: "Bible ASV - Holy Bible",
    storeName: "Bible ASV - Holy Bible",
    androidPackage: "com.gyc.ace.asv",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.asv",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/asv/icon.png",
    versionSlug: "asv",
  },
  {
    slug: "web",
    appName: "Bible Web - World English Bible Updated",
    storeName: "Bible Web - World English Bible Updated",
    androidPackage: "com.gyc.ace.webu",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.webu",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/web/icon.png",
    versionSlug: "web",
  },
  {
    slug: "rvr",
    appName: "Biblia RVR - Reina Valera",
    storeName: "Biblia RVR - Reina Valera",
    androidPackage: "com.gyc.ace.esp",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.esp",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/rvr/icon.png",
    versionSlug: "rvr",
  },
  {
    slug: "cuv",
    appName: "CUV Bible",
    storeName: "CUV Bible",
    androidPackage: "com.gyc.ace.bible",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.bible",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/cuv/icon.png",
    versionSlug: "cuv",
  },
  {
    slug: "aa",
    appName: "Bíblia AA Almeida Atualizada",
    storeName: "Bíblia AA Almeida Atualizada",
    androidPackage: "com.guanyc.ace.almeida",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.guanyc.ace.almeida",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/aa/icon.png",
    versionSlug: "aa",
  },
  {
    slug: "take-a-break",
    appName: "Take a Break",
    storeName: "Take a Break",
    androidPackage: "com.guanyc.takeabreak",
    playUrl: "https://play.google.com/store/apps/details?id=com.guanyc.takeabreak",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    icon: "/apps/take-a-break/icon.png",
  },
  {
    slug: "quick",
    appName: "Bible KJV Quick",
    storeName: "Bible KJV Quick",
    androidPackage: "com.gyc.ace.quick",
    playUrl: "https://play.google.com/store/apps/details?id=com.gyc.ace.quick",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    hidden: true,
  },
  {
    slug: "hanzinova",
    appName: "HanziNova HanziWriter",
    storeName: "HanziNova: HSK Chinese Writing",
    androidPackage: "com.guanyc.hanzinova.hanziwrite",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.guanyc.hanzinova.hanziwrite",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "September 26, 2026",
    hidden: true,
  },
  {
    slug: "winfirst",
    appName: "Win First",
    storeName: "Born Win",
    androidPackage: "com.guanyc.stock.discipline",
    playUrl:
      "https://play.google.com/store/apps/details?id=com.guanyc.stock.discipline",
    developerName: DEVELOPER,
    legalEntity: DEVELOPER,
    contactEmail: EMAIL,
    updated: "August 20, 2024",
    hidden: true,
  },
];

export function getPrivacy(slug: string): PrivacyPolicy | undefined {
  return privacyPolicies.find((p) => p.slug === slug);
}

/** Policies linked from /privacy — the apps hosted on this site. */
export function publicPrivacyPolicies(): PrivacyPolicy[] {
  return privacyPolicies.filter((p) => !p.hidden);
}

/**
 * Reads content/privacy/<slug>.md and converts it to HTML at build time.
 * The markdown is authored in this repo, so the output is trusted.
 */
export function renderPrivacy(slug: string): string {
  const file = path.join(process.cwd(), "content", "privacy", `${slug}.md`);
  const raw = fs.readFileSync(file, "utf8");
  // The page renders its own heading, so drop the leading "# Privacy Policy".
  const markdown = raw.replace(/^#\s+Privacy Policy\s*\n+/, "");
  return marked.parse(markdown, { async: false });
}
