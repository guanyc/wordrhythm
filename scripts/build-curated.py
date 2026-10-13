#!/usr/bin/env python3
"""Build a small curated Take a Break dataset for the website.

The app ships 15,777 devotional rows. The site only needs a hand-sized set:
a few passages per feeling, each with the compact lines the app shows in
Take a Break (micro / insight / prayer) plus the full devotional from the
main database (meaning / reflection / prayer) for readers who want more.

Output is split per emotion so a page loads only its own few passages
instead of one large JSON file:

    data/curated/emotions.json              index: slug, title, labels
    data/curated/emotions/<slug>.json       3 passages + full devotional

The same layout is meant to hold situations/ and topics/ later.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

ROOT = Path("/Users/guanyc/projects/wordrhythm")
ASSETS = Path("/Users/guanyc/StudioProjects/KJV_CUV/MyApplication/app/src/main/assets")
MAIN_DB = ASSETS / "BibleData_template.db"
SOURCE = ROOT / "data/take-a-break.json"
OUT_DIR = ROOT / "data/curated/emotions"

# Every passage the emotion page lists. Take a Break cycles through the first
# three (see CURATED_COUNT in lib/curated.ts); the verse page uses them all.
PER_PAGE = 10


def load_full_devotionals() -> dict[str, dict[str, str]]:
    """ref -> {meaning, reflection, prayer} from the app's devotional table."""
    db = sqlite3.connect(f"file:{MAIN_DB}?mode=ro", uri=True)
    books = {bid: name for bid, name in db.execute("SELECT id, name FROM bible_books")}
    out: dict[str, dict[str, str]] = {}
    rows = db.execute(
        "SELECT v.id, v.book_id, v.chapter, v.verse, d.meaning, d.reflection, d.prayer "
        "FROM bible_verses v JOIN devotionals d ON d.verse_id = v.id"
    )
    for _vid, book_id, chapter, verse, meaning, reflection, prayer in rows:
        ref = f"{books.get(book_id, '?')} {chapter}:{verse}"
        out[ref] = {
            "meaning": (meaning or "").strip(),
            "reflection": (reflection or "").strip(),
            "fullPrayer": (prayer or "").strip(),
        }
    db.close()
    return out


def main() -> None:
    pages = json.loads(SOURCE.read_text())
    full = load_full_devotionals()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    index = []
    missing = []
    for page in pages:
        verses = []
        for v in page["verses"][:PER_PAGE]:
            f = full.get(v["reference"])
            if not f or not (f["meaning"] or f["reflection"]):
                missing.append((page["slug"], v["reference"]))
                f = {"meaning": "", "reflection": "", "fullPrayer": ""}
            verses.append(
                {
                    "reference": v["reference"],
                    "text": v["text"],
                    "micro": v.get("micro", ""),
                    "insight": v.get("insight", ""),
                    "prayer": v.get("prayer", ""),
                    **f,
                }
            )
        payload = {
            "slug": page["slug"],
            "title": page["title"],
            "subtitle": page.get("subtitle", ""),
            "emotions": page["emotions"],
            "verses": verses,
        }
        (OUT_DIR / f"{page['slug']}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=1) + "\n"
        )
        index.append(
            {
                "slug": page["slug"],
                "title": page["title"],
                "subtitle": page.get("subtitle", ""),
                "labels": [e["label"] for e in page["emotions"]],
                "preview": verses[0]["reference"] if verses else "",
            }
        )

    (ROOT / "data/curated/emotions.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=1) + "\n"
    )

    sizes = [p.stat().st_size for p in OUT_DIR.glob("*.json")]
    print(f"情绪页 {len(index)} 个，每段 {PER_PAGE} 节经文")
    print(f"分文件 {len(sizes)} 个，平均 {sum(sizes)/len(sizes)/1024:.1f} KB，最大 {max(sizes)/1024:.1f} KB")
    print(f"索引 data/curated/emotions.json {(ROOT/'data/curated/emotions.json').stat().st_size/1024:.1f} KB")
    print(f"缺 full 内容的经文: {len(missing)}")
    for m in missing[:5]:
        print("   ", m)


if __name__ == "__main__":
    main()
