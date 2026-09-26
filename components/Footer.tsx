import Image from "next/image";
import Link from "next/link";
import CookieSettings from "@/components/CookieSettings";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <Image
            src="/brand/og.jpg"
            alt="Word Rhythm — Scripture for the rhythm of everyday life"
            width={1200}
            height={557}
            className="w-full max-w-md rounded-2xl shadow-card sm:max-w-sm"
          />
          <nav className="flex flex-wrap gap-4">
            <Link href="/versions" className="hover:text-ink">
              Versions
            </Link>
            <Link href="/take-a-break" className="hover:text-ink">
              Take a Break
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted/80">
          <p>
            © {new Date().getFullYear()} Word Rhythm. A calm daily companion for
            God&apos;s Word.
          </p>
          <CookieSettings />
        </div>
      </div>
    </footer>
  );
}
