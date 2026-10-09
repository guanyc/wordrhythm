#!/usr/bin/env python3
"""
Build data/take-a-break.json from the Android app's emotion data.

The KJV app resolves "how are you feeling?" to Scripture in three steps:

    emotion  --emotion_theme_mapping-->  theme  --verse_themes-->  verse

This script runs the same path and writes the result for the website.

Why the weighted sum instead of the app's "take the first theme, then top N"
The app stops at the first theme once it has20 verses. Because PEACE and TRUST
are both high-priority for seven different emotions, those seven all return an
identical list. Scoring every theme instead, with priority as the weight, means
each emotion's whole theme set contributes:

    anxious   PEACE, TRUST, SPIRITUAL_CONFIDENCE, GOD_FAITHFULNESS, HOPE, WISDOM_FOR_LIFE
    calm      PEACE, TRUST, ENCOURAGEMENT, GOD_FAITHFULNESS, LOVE_FOR_OTHERS

That drops fully-duplicated emotions from 10 groups to 9 and overlapping pairs
from 71 to 25. It does not eliminate them — the source data really does assign
identical theme sets to some emotions — so identical results are merged into
one page and every synonym is listed on it. That keeps "bible verses for
gratitude" and "bible verses for thankfulness" on one page instead of two
competing ones.

Emotion display names are English: the site targets US readers, and the
Chinese labels in the database are for the app's own UI.
"""
import json
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

ASSETS = Path(
    "/Users/guanyc/StudioProjects/KJV_CUV/MyApplication/app/src/main/assets"
)
DB = ASSETS / "BibleData_template.db"
# Take a Break shows these, not the longer devotionals.* Meaning/Reflection/Prayer
# in BibleData_template.db are written for the daily reading flow and average 553
# bytes per passage; the compact ones average 129 and read as a 60-second pause.
COMPACT_DB = ASSETS / "devotional_compact.db"
OUT = Path("/Users/guanyc/projects/wordrhythm/data/take-a-break.json")

PER_EMOTION = 10

# How much each mapping priority contributes to a verse's score. Priority 3 is
# the emotion's defining theme, 1 is something adjacent.
PRIORITY_WEIGHT = {3: 1.0, 2: 0.7, 1: 0.45}

# Themes too broad to add anything — GOD_SOVEREIGNTY alone covers 6801 verses,
# so every emotion that touches it would otherwise converge on the same list.
WEAK_THEMES = {"GOD", "GOD_SOVEREIGNTY", "GOD_CHARACTER", "LAST_THINGS"}

# Two emotions join the same page when their verse lists overlap this much.
#
# This value moved with PER_EMOTION. At 20 verses a 60% threshold gave 37
# buckets, but dropping to 10 tightened every list: gratitude and blessed
# started scoring identically and were merged at 60%, which is wrong —
# giving thanks and being blessed are not the same. At 10 verses 85% keeps the
# genuinely synonymous pairs (grateful/thankful, calm/peaceful/restless) and
# separates the rest. 85% and 100% produce the same grouping.
#
# anxious and fearful land at 82% — nine of ten passages identical, differing
# only on Psalms 116:7 vs 52:8 — and were flagged as duplicate titles because
# they name themselves the same. Merged here rather than padding one with a
# second title.
OVERLAP_THRESHOLD = 0.8

# The database stores emotion_name in Chinese because that is what the app
# displays. The site is English-only, so every emotion needs an English label
# written the way a reader would describe the feeling — not a transliteration
# of the code, and not a bare topic label. Missing entries fail the build.
EMOTION_LABELS = {
    "anxious": "anxious",
    "fearful": "fearful",
    "stressed": "stressed",
    "overwhelmed": "overwhelmed",
    "weary": "weary",
    "tired": "tired",
    "calm": "calm",
    "peaceful": "at peace",
    "restless": "restless",
    "sad": "sad",
    "grieving": "grieving",
    "hopeless": "hopeless",
    "hopeful": "hopeful",
    "hopeful_joyful": "hopeful",
    "disappointed": "disappointed",
    "discouraged": "discouraged",
    "refreshed": "worn out",
    "empty": "empty",
    "lonely": "lonely",
    "lonely_strong": "lonely but holding on",
    "grateful": "grateful",
    "thankful": "thankful",
    "thankful_for_grace": "grateful for grace",
    "joyful": "joyful",
    "playful": "playful",
    "blessed": "blessed",
    "worshipful": "worshipful",
    "inspired": "encouraged",
    "confident": "confident",
    "courageous": "courageous",
    "determined": "determined",
    "peace": "peaceful",
    "ashamed": "ashamed",
    "guilty": "guilty",
    "repentant": "wanting to turn back",
    "bitter": "bitter",
    "angry": "angry",
    "unjust": "treated unfairly",
    "justice_longing": "longing for justice",
    "persecuted": "persecuted for faith",
    "confused": "confused",
    "confused_seeking": "lost and looking",
    "seeking": "seeking",
    "seeking_guidance": "seeking direction",
    "seeking_truth": "seeking truth",
    "uncertain": "uncertain",
    "trusting_in_god": "trusting",
    "prayerful": "wanting to pray",
    "tempted": "tempted",
    "content": "content",
    "serving": "serving others",
    "growth": "wanting to grow",
    "growing": "wanting to grow",
    "unity_needed": "wanting unity",
    "loving": "loving",
}

# Display copy. The database carries Chinese labels for the app; these are the
# English equivalents, written to read as a page heading rather than a label.
COPY = {
    # merged groups — the first code is the one that names the page
    "anxious": ("Anxiety and fear", "When your mind will not settle"),
    "ashamed": ("Guilt and shame", "When you feel exposed"),
    "calm": ("Calm and peace", "When you need to be still"),
    "confident": ("Courage", "When you need to act"),
    "grateful": ("Gratitude", "When you want to give thanks"),
    "hopeful": ("Hope and hopelessness", "When the future looks uncertain"),
    "joyful": ("Joy", "When you want to rejoice"),
    "overwhelmed": ("Overwhelmed and weary", "When you are carrying too much"),
    "seeking": ("Seeking God", "When you are looking for direction"),
    # members of the groups above, kept so the lookup never misses
    "fearful": ("Anxiety and fear", "When your mind will not settle"),
    "guilty": ("Guilt and shame", "When you feel exposed"),
    "peaceful": ("Calm and peace", "When you need to be still"),
    "restless": ("Calm and peace", "When you cannot settle"),
    "courageous": ("Courage", "When you need to act"),
    "determined": ("Resolve", "When you have decided and need to hold on"),
    "thankful": ("Gratitude", "When you want to give thanks"),
    "hopeless": ("Hope and hopelessness", "When the future looks uncertain"),
    "playful": ("Joy", "When you want to rejoice"),
    "weary": ("Overwhelmed and weary", "When you are carrying too much"),
    "seeking_guidance": ("Seeking God", "When you are looking for direction"),
    # singles
    "angry": ("Anger", "When you are frustrated"),
    "bitter": ("Bitterness", "When resentment sits in you"),
    "blessed": ("Blessing", "When you want to remember what is good"),
    "confused": ("Confusion", "When nothing makes sense"),
    "confused_seeking": ("Seeking in confusion", "When you are lost and looking"),
    "content": ("Contentment", "When you want to be satisfied"),
    "discouraged": ("Discouragement", "When effort feels pointless"),
    "disappointed": ("Disappointment", "When things did not turn out"),
    "empty": ("Emptiness", "When you feel hollow"),
    "grieving": ("Grief", "When you are mourning"),
    "growth": ("Growth", "When you want to go deeper"),
    "hopeful_joyful": ("Joyful hope", "When you are glad about what is coming"),
    "inspired": ("Encouragement", "When you need a lift"),
    "refreshed": ("Refreshed", "When you feel worn out"),
    "lonely": ("Loneliness", "When nobody seems close"),
    "lonely_strong": ("Loneliness, but holding on", "When you are alone and still standing"),
    "loving": ("Love", "When you are thinking of others"),
    "persecuted": ("Persecution", "When you are under pressure for your faith"),
    "prayerful": ("Prayer", "When you want to pray"),
    "repentant": ("Repentance", "When you want to turn back"),
    "sad": ("Sadness", "When you are low"),
    "seeking_truth": ("Seeking truth", "When you want to know what is real"),
    "serving": ("Service", "When you are caring for others"),
    "stressed": ("Stress", "When you are under strain"),
    "tempted": ("Temptation", "When you are being pulled away"),
    "thankful_for_grace": ("Thanksgiving", "When you are grateful"),
    "trusting_in_god": ("Trust", "When you are not sure what comes next"),
    "uncertain": ("Uncertainty", "When the way is not clear"),
    "unity_needed": ("Unity", "When people are divided"),
    "unjust": ("Justice", "When you have been treated unfairly"),
    "worshipful": ("Worship", "When you want to praise God"),
    "justice_longing": ("Longing for justice", "When you want things made right"),
}


def main():
    if not DB.exists():
        print(f"source database not found: {DB}")
        return 1

    db = sqlite3.connect(DB)

    themes = defaultdict(list)
    for code, theme, priority in db.execute(
        "SELECT emotion_code, theme, priority FROM emotion_theme_mapping "
        "ORDER BY priority DESC"
    ):
        if theme in WEAK_THEMES:
            continue
        themes[code].append((theme, priority))

    # Load verse→theme weights once; 60k rows, queried per theme otherwise.
    by_theme = defaultdict(list)
    for verse_id, theme_code, weight in db.execute(
        "SELECT verse_id, theme_code, weight FROM verse_themes"
    ):
        by_theme[theme_code].append((verse_id, weight))

    names = {}
    for code, name in db.execute(
        "SELECT emotion_code, emotion_name FROM emotion_theme_mapping GROUP BY 1, 2"
    ):
        names[code] = name

    verses = {}
    for code, mapping in themes.items():
        scores = defaultdict(float)
        for theme, priority in mapping:
            factor = PRIORITY_WEIGHT.get(priority, 0.3)
            for verse_id, weight in by_theme[theme]:
                scores[verse_id] += factor * weight
        ranked = sorted(scores.items(), key=lambda kv: -kv[1])[:PER_EMOTION]
        verses[code] = [v for v, _ in ranked]

    # Bucket the emotions. Each emotion joins the first bucket whose verse list
    # it overlaps enough; otherwise it starts a new one. Everything in a bucket
    # shares one page, and every emotion's search term is listed on it, so
    # "bible verses for gratitude" and "for thankfulness" land on the same URL
    # instead of two pages competing with identical content.
    #
    # Buckets are visited largest-verse-list first so the emotion that names the
    # page is the one with the most specific material, not an arbitrary
    # alphabetical winner.
    order = sorted(verses, key=lambda c: (-len(verses[c]), c))
    buckets = []  # [members, verse_set]
    for code in order:
        current = set(verses[code])
        placed = False
        for bucket in buckets:
            other = bucket[1]
            overlap = len(current & other) / len(current | other)
            if overlap >= OVERLAP_THRESHOLD:
                bucket[0].append(code)
                placed = True
                break
        if not placed:
            buckets.append(([code], set(current)))

    # The page slug is what people search for, which is not always the emotion
    # code: nobody looks up "ashamed", they look up "guilt".
    SLUGS = {
        "anxious": "anxiety", "ashamed": "guilt", "calm": "peace",
        "confident": "courage", "grateful": "gratitude", "hopeful": "hope",
        "joyful": "joy", "overwhelmed": "overwhelmed", "seeking": "seeking-god",
    }

    pages = []
    for members, _verse_set in buckets:
        primary = members[0]
        slug = SLUGS.get(primary, primary.replace("_", "-"))
        title, subtitle = COPY.get(primary, (primary.replace("_", " ").title(), ""))
        pages.append(
            {
                "slug": slug,
                "title": title,
                "subtitle": subtitle,
                "emotions": [
                    {"code": c, "label": EMOTION_LABELS.get(c, "")} for c in members
                ],
                "verses": [],
            }
        )

    # Every emotion must have an English label; the Chinese one in the database
    # is meaningless to this audience, and an empty label would render as a
    # stray comma on the page.
    unlabelled = [
        e["code"] for p in pages for e in p["emotions"] if not e["label"]
    ]
    if unlabelled:
        print(f"EMOTION_LABELS is missing: {', '.join(sorted(set(unlabelled)))}")
        return 1

    # Attach verse text once, keyed by slug.
    wanted = {}
    for page in pages:
        primary = page["emotions"][0]["code"]
        wanted[page["slug"]] = verses[primary]

    texts = {}
    ref_re = __import__("re").compile(r"^(\d+)\.(\d+)\.(\d+)$")
    for verse_id, book_id, chapter, verse, text in db.execute(
        "SELECT id, book_id, chapter, verse, text FROM bible_verses"
    ):
        texts[verse_id] = {
            "book": book_id,
            "chapter": chapter,
            "verse": verse,
            "text": text,
        }

    # book_id is an int column; verse_ref's first segment is the same number,
    # so read book_id directly rather than parsing it back out of the string.
    books = {}
    for book_id, name in db.execute("SELECT id, name FROM bible_books"):
        books[book_id] = name

    # Compact insight and prayer, the same three-part shape Take a Break shows.
    # Joined on verse_id, which is bible_verses.id in both databases.
    compact = {}
    db.execute("ATTACH DATABASE ? AS compact", (str(COMPACT_DB),))
    for verse_id, micro, insight, prayer in db.execute(
        "SELECT verse_id, micro_message, compact_insight, compact_prayer "
        "FROM compact.devotional_compact"
    ):
        compact[verse_id] = (micro or "", insight or "", prayer or "")

    missing_compact = 0
    for page in pages:
        page["verses"] = []
        for v in wanted[page["slug"]]:
            if v not in texts:
                continue
            micro, insight, prayer = compact.get(v, ("", "", ""))
            if not (insight and prayer):
                missing_compact += 1
            page["verses"].append(
                {
                    "reference": f"{books.get(texts[v]['book'], texts[v]['book'])} "
                    f"{texts[v]['chapter']}:{texts[v]['verse']}",
                    "text": texts[v]["text"],
                    "micro": micro,
                    "insight": insight,
                    "prayer": prayer,
                }
            )

    pages.sort(key=lambda p: p["title"])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")

    merged = sum(len(p["emotions"]) - 1 for p in pages)
    empty = [p["slug"] for p in pages if not p["verses"]]
    print(f"emotions in:  {len(verses)}")
    print(f"pages out:    {len(pages)}  ({merged} synonyms merged)")
    print(f"verses:       {sum(len(p['verses']) for p in pages)} "
          f"across {len({v['text'] for p in pages for v in p['verses']})} unique")
    print(f"compact:      {len(compact):,} loaded, "
          f"{missing_compact} passages without insight or prayer")
    print(f"size:         {OUT.stat().st_size / 1024:.0f} KB")
    if empty:
        print(f"EMPTY PAGES:  {empty}")
        return 1
    if missing_compact:
        print("\nSome verses have no compact content — the site renders those as a")
        print("plain verse with no toggle. Re-run after the app ships an update.")
    print(f"\n-> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())