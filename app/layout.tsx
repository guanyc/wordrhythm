import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Word Rhythm — Scripture for the rhythm of everyday life",
    template: "%s · Word Rhythm",
  },
  description:
    "Word Rhythm puts God's Word into the rhythm of everyday life — morning, day, and evening. Multiple Bible translations, one calm daily companion.",
  metadataBase: new URL("https://wordrhythm.app"),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
