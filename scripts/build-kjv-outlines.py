#!/usr/bin/env python3
"""
Build the chapter outlines the /kjv/<book>/<chapter> pages introduce themselves with.

Source is the MyApplication pipeline output `chapters_no_text.repaired.json`
(1,189 chapters of deepseek-flash summaries + verse-range segments), which was
produced from the model's own knowledge of the KJV rather than from the text.
That is why this script re-validates every range against `public/kjv-data/`
before writing anything: the pipeline could only check "segments run 1..N" for
the verse count it was told, whereas the ground truth lives here.

Output (committed, but build-time only — it lives in data/, not public/, so
1.3 MB of prose is not shipped to readers):

  data/kjv-outlines.json
    { "genesis": { "1": { "summary": "...", "segments": [ {start,end,title,gist,kind} ] } } }

Re-run after regenerating the upstream pipeline:

    python3 scripts/build-kjv-outlines.py
"""
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TJ_CUV = Path("/Users/guanyc/StudioProjects/KJV_CUV")
SRC = TJ_CUV / "MyApplication/pipeline_data/chapter_outline/chapters_no_text.repaired.json"
KJV_DATA = REPO / "public/kjv-data"
OUT = REPO / "data/kjv-outlines.json"

# The pipeline prompt allows eight kinds, but 20 segments came back with values
# outside that list (a psalm is always "song", an argument always "topic").
# Folding them onto the enum keeps Phase-2 rendering a switch over eight cases
# instead of nineteen one-offs.
KIND_ALIASES = {
    "prayer": "speech",
    "prophecy": "speech",
    "exhortation": "speech",
    "argument": "topic",
    "explanation": "topic",
    "judgment": "topic",
    "promise": "topic",
    "vision": "scene",
    "lament": "song",
    "trust": "song",
    "worship": "song",
}
KINDS = {"scene", "story", "topic", "turn", "list", "song", "speech", "other"}


def slugify(name: str) -> str:
    """Same spelling as scripts/build-kjv.py, which App Links round-trip."""
    return name.strip().lower().replace(" ", "-")


def main() -> int:
    for path in (SRC, KJV_DATA / "books.json"):
        if not path.exists():
            print(f"missing input: {path}", file=sys.stderr)
            return 1

    index = json.loads((KJV_DATA / "books.json").read_text(encoding="utf8"))
    books = {b["name"]: b for b in index["books"]}
    verse_counts = {
        b["slug"]: json.loads((KJV_DATA / f"{b['slug']}.json").read_text(encoding="utf8"))
        for b in index["books"]
    }

    source = json.loads(SRC.read_text(encoding="utf8"))
    chapters = source["chapters"]

    problems: list[str] = []
    out: dict[str, dict[str, dict]] = {}
    segment_total = 0
    aliased = 0

    for row in chapters:
        book = books.get(row["book"])
        if not book:
            problems.append(f"{row['book']}: no book of that name in public/kjv-data")
            continue
        slug, number = book["slug"], int(row["chapter"])
        reference = f"{row['book']} {number}"

        summary = (row.get("summary") or "").strip()
        if not summary:
            problems.append(f"{reference}: empty summary")
            continue

        verses = verse_counts[slug].get(str(number))
        if not verses:
            problems.append(f"{reference}: no verse text for that chapter")
            continue
        expected = len(verses)

        # Rewrite the ranges against the real verse count, not the one the model
        # was handed, then re-check the coverage rule the pipeline asserts.
        segments: list[dict] = []
        expect_next = 1
        for seg in row.get("segments") or []:
            start, end = int(seg["start"]), int(seg["end"])
            kind = str(seg.get("kind") or "other").strip().lower()
            if kind in KIND_ALIASES:
                kind = KIND_ALIASES[kind]
                aliased += 1
            if kind not in KINDS:
                problems.append(f"{reference}: unknown kind {seg.get('kind')!r}")
                kind = "other"
            if not (1 <= start <= end <= expected):
                problems.append(f"{reference}: segment {start}-{end} outside 1-{expected}")
                continue
            if start != expect_next:
                problems.append(
                    f"{reference}: segment starts at {start}, expected {expect_next}"
                )
            expect_next = end + 1
            segments.append(
                {
                    "start": start,
                    "end": end,
                    "title": (seg.get("title") or "").strip(),
                    "gist": (seg.get("gist") or "").strip(),
                    "kind": kind,
                }
            )
        if segments and expect_next != expected + 1:
            problems.append(
                f"{reference}: segments stop at {expect_next - 1} of {expected}"
            )

        # A one-segment chapter is an outline of one heading: the summary already
        # says it. Keep the summary, drop the segmentation.
        if len(segments) < 2:
            segments = []

        segment_total += len(segments)
        out.setdefault(slug, {})[str(number)] = {"summary": summary, "segments": segments}

    covered = sum(len(ch) for ch in out.values())
    if covered != index["totalChapters"]:
        problems.append(
            f"wrote {covered} chapters, books.json says {index['totalChapters']}"
        )
    if problems:
        print("outlines do not match public/kjv-data:", file=sys.stderr)
        for problem in problems[:20]:
            print(f"  - {problem}", file=sys.stderr)
        print(f"  ({len(problems)} problem(s))", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "generatedFrom": str(SRC.relative_to(TJ_CUV)),
                "chapters": out,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf8",
    )

    # The same guard scripts/check-data.mjs repeats at build time; printing it
    # here is how a re-run of this script explains itself.
    longest = max((len(c["summary"]) for ch in out.values() for c in ch.values()), default=0)
    print(
        f"wrote {covered} chapter outlines, {segment_total} segments "
        f"({aliased} kinds folded onto the enum), longest summary {longest} chars, "
        f"{OUT.stat().st_size // 1024} KB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
