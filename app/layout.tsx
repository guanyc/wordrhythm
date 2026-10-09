import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsentGate from "@/components/ConsentGate";

export const metadata: Metadata = {
  title: {
    default: "Word Rhythm — Scripture for the rhythm of everyday life",
    template: "%s · Word Rhythm",
  },
  description:
    "Word Rhythm puts God's Word into the rhythm of everyday life — morning, day, evening, and sleep. Multiple Bible translations, one calm daily companion.",
  metadataBase: new URL("https://wordrhythm.app"),
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "Word Rhythm Guides" }],
    },
  },
  icons: {
    icon: [{ url: "/brand/icon-512.png", type: "image/png", sizes: "512x512" }],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Word Rhythm — Scripture for the rhythm of everyday life",
    description:
      "God's Word, part of your daily rhythm. Multiple Bible translations in one calm companion.",
    url: "https://wordrhythm.app",
    siteName: "Word Rhythm",
    type: "website",
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 557,
        alt: "Word Rhythm — Scripture for the rhythm of everyday life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og.jpg"],
  },
};

/**
 * Profiles that confirm the site belongs to the same publisher as the apps.
 *
 * This is the only signal an AI or a search engine has for "who is behind
 * wordrhythm.app" — the apps on Play all point back here, but nothing here
 * pointed back at them. Add YouTube, a publisher page or a contact profile as
 * they exist; an empty array omits `sameAs` rather than shipping a guess.
 */
const SAME_AS: string[] = [
  "https://play.google.com/store/apps/developer?id=right",
];

const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://wordrhythm.app/#organization",
      name: "Word Rhythm",
      url: "https://wordrhythm.app",
      logo: {
        "@type": "ImageObject",
        url: "https://wordrhythm.app/brand/icon-512.png",
      },
      description:
        "Publisher of a family of offline Android Bible apps built around a four-slot daily rhythm: morning, day, evening and sleep.",
      ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
    },
    {
      "@type": "WebSite",
      "@id": "https://wordrhythm.app/#website",
      url: "https://wordrhythm.app",
      name: "Word Rhythm",
      publisher: { "@id": "https://wordrhythm.app/#organization" },
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <ConsentGate />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
