#!/usr/bin/env python3
"""
Build the KJV reading data the /kjv routes serve.

Source of truth is the Android app's own JSON export
(MyApplication/kjv_bible.json, 31,102 verses), so the site can never drift from
the text the app ships.

Output (committed, both consumed at runtime):

  public/kjv-data/books.json       66 books, chapter verse counts, totals
  public/kjv-data/<book-slug>.json { "1": ["verse 1", "verse 2", ...], ... }

One file per book: the chapter pages read them at build time, and the
verse-level Worker fetches a single book instead of the whole Bible, so a cold
verse request parses ~40 KB rather than 4.4 MB.

Re-run after changing the app's KJV data:

    python3 scripts/build-kjv.py
"""
import json
import sys
from pathlib import Path

KJV_CUV = Path("/Users/guanyc/StudioProjects/KJV_CUV")
SRC = KJV_CUV / "MyApplication/kjv_bible.json"
OUT_DIR = Path(__file__).resolve().parent.parent / "public/kjv-data"

# The app's reference parser joins path segments with spaces, so hyphens are the
# only slug separator it can receive; keep the two sides on the same spelling.
def slugify(name: str) -> str:
    return name.strip().lower().replace(" ", "-")


def main() -> int:
    if not SRC.exists():
        print(f"missing source: {SRC}", file=sys.stderr)
        return 1

    data = json.loads(SRC.read_text(encoding="utf8"))
    verses = data["verses"]

    books: dict[str, dict] = {}
    for row in verses:
        name = row["book_name"]
        book = books.setdefault(
            slugify(name),
            {"slug": slugify(name), "name": name, "abbr": row["book_abbr"], "chapters": {}},
        )
        chapter = book["chapters"].setdefault(int(row["chapter"]), {})
        chapter[int(row["verse"])] = row["text"].strip()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    index = []
    for slug, book in books.items():
        # Chapters are stored as position -> verse list so the reader can index
        # straight into a chapter without a second lookup.
        payload = {}
        counts = []
        for ch in sorted(book["chapters"]):
            verses_in_ch = book["chapters"][ch]
            if sorted(verses_in_ch) != list(range(1, len(verses_in_ch) + 1)):
                print(f"{slug} {ch}: verse numbers are not contiguous", file=sys.stderr)
                return 1
            payload[str(ch)] = [verses_in_ch[v] for v in sorted(verses_in_ch)]
            counts.append(len(verses_in_ch))
        (OUT_DIR / f"{slug}.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf8"
        )
        index.append(
            {
                "slug": slug,
                "name": book["name"],
                "abbr": book["abbr"],
                "chapters": counts,
                "verses": sum(counts),
            }
        )

    if len(index) != 66:
        print(f"expected 66 books, got {len(index)}", file=sys.stderr)
        return 1

    total_verses = sum(b["verses"] for b in index)
    total_chapters = sum(len(b["chapters"]) for b in index)
    if total_verses != data["metadata"]["total_verses"]:
        print(
            f"verse total differs from source metadata: {total_verses} vs "
            f"{data['metadata']['total_verses']}",
            file=sys.stderr,
        )
        return 1

    (OUT_DIR / "books.json").write_text(
        json.dumps(
            {
                "translation": "KJV",
                "totalBooks": len(index),
                "totalChapters": total_chapters,
                "totalVerses": total_verses,
                "books": index,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf8",
    )

    print(f"wrote {len(index)} books, {total_chapters} chapters, {total_verses} verses")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
