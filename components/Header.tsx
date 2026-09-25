import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/versions", label: "Versions" },
  { href: "/take-a-break", label: "Take a Break" },
  { href: "/blog", label: "Guides" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            W
          </span>
          <span className="text-lg tracking-tight">Word Rhythm</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
