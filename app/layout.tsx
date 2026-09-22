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
  openGraph: {
    title: "Word Rhythm — Scripture for the rhythm of everyday life",
    description:
      "God's Word, part of your daily rhythm. Multiple Bible translations in one calm companion.",
    url: "https://wordrhythm.app",
    siteName: "Word Rhythm",
    type: "website",
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
