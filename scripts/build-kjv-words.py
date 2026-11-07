#!/usr/bin/env python3
"""
Build data/kjv-words.json from the Android app's glossary.

The app ships the same glossary in
MyApplication/app/src/main/res/raw/kjv_words_json.json, but stores the verse
reference glued onto the end of the example string:

    "Cast abroad the rage of thy wrath... (Job 40:11)"

This script splits that into `quote` + `reference` so the site can render the
citation separately — that is the part a reader can paste into a Bible app, and
the part search engines treat as an entity reference.

Every entry now ends with a parseable "(Book chapter:verse)" citation: the
entries that used to need a hand-written reference were repaired in the app
data, so the exceptions table is gone. The app-side checks live in the KJV_CUV
repo — `scripts/verify_archaic_words.py` (headwords really occur in the KJV)
and `verify_archaic_examples.py` (quotes are verbatim KJV). Re-run both after
changing anything here.
"""
import json
import re
import sys
from pathlib import Path

KJV_CUV = Path("/Users/guanyc/StudioProjects/KJV_CUV")
SRC = KJV_CUV / "MyApplication/app/src/main/res/raw/kjv_words_json.json"
OUT = Path("/Users/guanyc/projects/wordrhythm/data/kjv-words.json")

BOOKS = (
    "Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|"
    "1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|"
    "Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|"
    "Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|"
    "Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|"
    "Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|"
    "Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|"
    "Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation"
)
TAIL = re.compile(rf"\s*\((?P<book>{BOOKS})\s+(?P<chapter>\d+):(?P<verse>\d+)\)\s*$")

# The dataset writes "Psalm", the Bible JSON stores "Psalms".
ALIAS = {"Psalm": "Psalms"}

# Four entries in the shared file carry a Chinese gloss or clause someone added
# while filling gaps. The English is already there, so the Chinese is redundant
# on an English-only site — and mixed inside a sentence it reads as broken.
CN_GLOSSES = {
    "messenger,驿站 (relay station)": "messenger, relay station",
    "internal organs (of animals),附属物": "internal organs (of animals), offal",
    "turtle, turtledove (archaic简称)": "turtle, turtledove (archaic abbreviation)",
    "The internal organs (e.g., liver, kidneys) of animals, especially those "
    "used in sacrifices; or附属 parts of something":
        "The internal organs (e.g., liver, kidneys) of animals, especially those "
        "used in sacrifices; or the accessory parts of something",
    "People who engage in trade or commerce; merchants (not limited to modern "
    "'illegal trafficking'含义)":
        "People who engage in trade or commerce; merchants (not limited to the "
        "modern sense of illegal trafficking)",
}

# Only Han characters count as a problem here. The phonetic field legitimately
# carries IPA and the modern equivalents use ≈, so an ASCII-only check would
# report dozens of false positives.
HAN = re.compile(r"[㐀-䶿一-鿿]")


def main():
    words = json.loads(SRC.read_text(encoding="utf-8"))

    out = []
    for entry in words:
        example = entry["example"].strip()
        match = TAIL.search(example)
        quote = example
        reference = None

        if match:
            quote = example[: match.start()].strip()
            book = match.group("book")
            reference = {
                "book": ALIAS.get(book, book),
                "chapter": int(match.group("chapter")),
                "verse": int(match.group("verse")),
            }

        out.append(
            {
                "word": entry["archaic_word"],
                "phonetic": entry["phonetic"],
                "modern": CN_GLOSSES.get(
                    entry["modern_equivalent"], entry["modern_equivalent"]
                ),
                "definition": CN_GLOSSES.get(
                    entry["definition"], entry["definition"]
                ),
                "quote": quote.strip(),
                "reference": reference,
            }
        )

    out.sort(key=lambda e: (e["word"].upper(), e["word"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    non_ascii = [
        e["word"] for e in out if HAN.search(e["definition"] + e["modern"])
    ]

    # Slugs must be unique or two entries fight over one page.
    slugs = {}
    clashes = []
    for e in out:
        slug = re.sub(r"[^a-z0-9]+", "-", e["word"].lower()).strip("-")
        if slug in slugs:
            clashes.append(f"{slugs[slug]} / {e['word']} -> {slug}")
        slugs[slug] = e["word"]

    missing = [e["word"] for e in out if not e["reference"]]

    print(f"entries written    {len(out)}")
    print(f"missing reference  {len(missing)}")
    print(f"slug clashes       {len(clashes)}")
    for c in clashes:
        print(f"  {c}")
    for m in missing:
        print(f"  no reference: {m}")
    if non_ascii:
        print(f"NON-ENGLISH GLOSSES ({len(non_ascii)}): {', '.join(non_ascii)}")
    print(f"\n-> {OUT}")
    return 1 if clashes or missing or non_ascii else 0


if __name__ == "__main__":
    sys.exit(main())