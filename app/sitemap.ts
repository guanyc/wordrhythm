import type { MetadataRoute } from "next";
import { featuredWordSlugs } from "@/lib/archaic";
import { getPublishedPosts } from "@/lib/blog";
import { emotionPageSlugs } from "@/lib/emotions";
import { publicPrivacyPolicies } from "@/lib/privacy";
import { versions } from "@/lib/versions";

const BASE = "https://wordrhythm.app";

// Static export (output: "export") needs these metadata routes to be
// fully static — otherwise `next build` fails to collect their page data.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const versionPages = versions.map((v) => ({
    url: `${BASE}/versions/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const postPages = getPublishedPosts().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const privacyPages = publicPrivacyPolicies().map((p) => ({
    url: `${BASE}/privacy/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // Each word answers one specific query ("thee meaning"), which is closer to
  // how people search than the app pages are.
  const wordPages = featuredWordSlugs().map((slug) => ({
    url: `${BASE}/kjv-words/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  // "bible verses for anxiety" and similar. These are the closest thing the
  // site has to a high-intent query, so they rank above the glossary.
  const versePages = emotionPageSlugs().map((slug) => ({
    url: `${BASE}/bible-verses/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/versions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...versionPages,
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postPages,
    {
      url: `${BASE}/bible-verses`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...versePages,
    {
      url: `${BASE}/kjv-words`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...wordPages,
    {
      url: `${BASE}/take-a-break`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy/website`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    ...privacyPages,
  ];
}
