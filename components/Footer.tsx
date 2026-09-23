import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink">Word Rhythm</p>
            <p>Scripture for the rhythm of everyday life.</p>
          </div>
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
        <p className="mt-6 text-xs text-muted/80">
          © {new Date().getFullYear()} Word Rhythm. A calm daily companion for
          God&apos;s Word.
        </p>
      </div>
    </footer>
  );
}
