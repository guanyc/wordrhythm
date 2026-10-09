"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/archaic";

export interface GlossaryEntry {
  slug: string;
  word: string;
  modern: string;
  /** False for entries that only appear in the full glossary. */
  hasPage: boolean;
}

export default function GlossarySearch({ entries }: { entries: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.word.toLowerCase().includes(q) ||
        e.modern.toLowerCase().includes(q),
    );
  }, [entries, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 1,500 KJV words — try “thee”, “comforter”, “impute”"
        className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
        aria-label="Search KJV words"
      />

      <p className="mt-3 text-sm text-muted">
        {query.trim() ? (
          <>
            {results.length} {results.length === 1 ? "word" : "words"}
          </>
        ) : (
          <>
            {entries.length} words — showing the most searched
          </>
        )}
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {results.map((e) => (
          <li key={e.slug}>
            {e.hasPage ? (
              <Link
                href={`/kjv-words/${e.slug}`}
                className="block rounded-xl border border-black/5 bg-surface p-4 shadow-card transition-colors hover:border-brand/40"
              >
                <span className="font-semibold">{e.word}</span>
                <span className="mt-1 block text-sm text-muted">
                  {e.modern}
                </span>
              </Link>
            ) : (
              <div className="rounded-xl border border-black/5 bg-surface p-4">
                <span className="font-semibold">{e.word}</span>
                <span className="mt-1 block text-sm text-muted">{e.modern}</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No match. Try the modern meaning instead — “comfort”, “envy”, “ate”.
        </p>
      )}
    </div>
  );
}