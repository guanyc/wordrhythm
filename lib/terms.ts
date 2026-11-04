import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

/** The single Terms of Service URL Google Play asks each app to provide. */
export const TERMS_UPDATED = "November 4, 2026";

/**
 * Reads content/terms.md and converts it to HTML at build time. The markdown
 * is authored in this repo, so the output is trusted (same approach as the
 * privacy policies).
 */
export function renderTerms(): string {
  const file = path.join(process.cwd(), "content", "terms.md");
  const raw = fs.readFileSync(file, "utf8");
  return marked.parse(raw, { async: false });
}
