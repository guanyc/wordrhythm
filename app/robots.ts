import type { MetadataRoute } from "next";

// Static export (output: "export") needs these metadata routes to be
// fully static — otherwise `next build` fails to collect their page data.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://wordrhythm.app/sitemap.xml",
    host: "https://wordrhythm.app",
  };
}
