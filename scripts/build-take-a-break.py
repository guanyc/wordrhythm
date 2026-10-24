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

# How deep the candidate pool goes before verses alternate in from the tail.
# The two limits below only work together. MAX_PER_BOOK refuses a fourth passage
# from the same book, which a page can only honour if the pool still holds
# another book further down — at depth 32, joyful had 31 of its 32 candidates in
# Psalms and fell back to an uncapped top-10, leaving that page all Psalms.
# At 80 no emotion falls back, and the weakest passage still scores 1.48 against
# a noise floor near zero.
POOL_DEPTH = 80

# No page takes more than this many passages from one book. Psalms dominates
# several themes on weight alone — 429 of PRAISE's 716 candidates, 426 of
# PRAYER's 895 — which left /joy and /prayerful as ten Psalms and nothing else.
# Three per book keeps the strongest matches while forcing the rest of the page
# out to other books: 6.4 books per page on average, at least 4 everywhere.
MAX_PER_BOOK = 3

# How much each mapping priority contributes to a verse's score. Priority 3 is
# the emotion's defining theme, 1 is something adjacent.
PRIORITY_WEIGHT = {3: 1.0, 2: 0.7, 1: 0.45}

# Themes too broad to add anything — GOD_SOVEREIGNTY alone covers 6801 verses,
# so every emotion that touches it would otherwise converge on the same list.
WEAK_THEMES = {"GOD", "GOD_SOVEREIGNTY", "GOD_CHARACTER", "LAST_THINGS"}

# Two emotions join the same page when their verse lists overlap this much.
#
# This value moved twice, and it is coupled to both PER_EMOTION and how verses
# are picked.
#
# At 20 verses a 60% threshold gave 37 buckets. Dropping to 10 tightened every
# list, and 60% then merged gratitude with blessed — giving thanks and being
# blessed are not the same. 80% fixed that at 40 buckets.
#
# Alternating between the two ends of the pool (see POOL_DEPTH) spreads each
# list across more books, which incidentally makes near-duplicates rarer: the
# only pairs still overlapping by 70% are genuinely synonymous, and 70% through
# 100% all produce the same 42 buckets, so the value is no longer delicate.
#
# anxious and fearful land just under the threshold and merge, which the
# duplicate-title check confirmed is right — they name themselves the same and
# would otherwise be two pages with the same title.
OVERLAP_THRESHOLD = 0.7

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
    "fearful": ("Fear", "When something you dread is close"),
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

# Editorial passages, by page slug.
#
# The scoring above answers "which verses carry this emotion's themes". For a
# few pages that is not the same question as "which verses do people search
# for", and where they disagree the searchable answer wins:
#
#   unity-needed  the theme set pulls "one another" verses about hospitality and
#                 food laws (Matthew 12:49, Romans 14:2) and misses Psalm 133:1.
#                 Psalm 133:1 and John 17:21 are the two verses the query means.
#   fearful       overlapped /peace on half its list and drew sleep verses
#                 (Psalms 4:8, Proverbs 3:24) that answer "cannot sleep", not
#                 "afraid of what is coming".
#   peace         keeps the rest verses, so the two pages stop competing for the
#                 same five passages.
#   gratitude     scored on praise-as-music (Psalms 150:4, Isaiah 38:20) and
#                 Revelation 4:9. The query is the habit of thanks in an ordinary
#                 week: 1 Thessalonians 5:18, Colossians 3:17, Daniel 6:10.
#   thankful-for-grace
#                 this page exists so "thanksgiving" does not compete with
#                 /gratitude, so it keeps the thanks that has a gift behind it —
#                 Psalms 116:12, Ephesians 2:8, Titus 2:11 — and shares no
#                 passage with its sibling page.
#   grieving      answered "how do I feel better" (Job 8:7, Psalms 16:6) rather
#                 than "someone has died". Psalms 34:18, Matthew 5:4 and
#                 Revelation 21:4 are what the query means; 1 Thessalonians 4:13
#                 was already right and stays.
#   discouraged   drew Acts 26:6 and Romans 15:29 — Paul's trial defence and a
#                 travel plan — where Isaiah 41:10 and Isaiah 40:31 are the two
#                 passages the word actually means.
#   guilt         six of its ten passages came from Solomon's dedication prayer
#                 (1 Kings 8, 2 Chronicles 6) and five of those were also on
#                 /repentant. Guilt asks "is there still a record against me",
#                 so it keeps the passages that answer no: Romans 8:1, Isaiah
#                 1:18, Micah 7:19. Nothing here is shared with /repentant.
#   repentant     the same six verses, plus nothing about turning. Repentance is
#                 a change of direction (2 Chronicles 7:14, Joel 2:13, Acts
#                 3:19); 1 John 1:9 and Psalms 51:10 are what it sounds like.
#   anxiety       four of its ten are rest verses that belong to /peace — the
#                 page that also answers "restless" — and Philippians 4:6, the
#                 verse this query means, was on /gratitude as an example of
#                 thanksgiving. It moves here; /gratitude takes Colossians 4:2.
#   stressed      five of its ten were duplicates (Psalms 4:8, Psalms 3:5,
#                 Proverbs 3:24, Philippians 4:7, Matthew 6:34) and 2 Corinthians
#                 11:10 is Paul defending himself, not anything about pressure.
#                 Matthew 6:34 moves to /anxiety, so /uncertain takes Isaiah
#                 30:21 — a word behind you saying "this is the way".
#   uncertain     read the old list: Proverbs 26:6, Job 8:15, Psalms 49:6 and
#                 49:16, Ecclesiastes 11:1 and 11:4. Six of ten were about riches
#                 not lasting, because the theme set is WEALTH. The query is about
#                 a decision: James 1:5, Proverbs 16:9, Psalms 37:5.
#
# Order is the page order. A reference that does not resolve fails the build
# rather than quietly shrinking the page, and anything short of PER_EMOTION is
# topped up from the scored list.
PAGE_VERSE_OVERRIDES: dict[str, list[str]] = {
    "unity-needed": [
        "Psalms 133:1",
        "Ephesians 4:3",
        "Philippians 2:2",
        "Romans 15:5",
        "Romans 15:7",
        "1 Corinthians 1:10",
        "1 Corinthians 12:26",
        "Colossians 3:14",
        "Galatians 3:28",
        "John 17:21",
    ],
    "fearful": [
        "Psalms 27:1",
        "Psalms 56:4",
        "Psalms 34:4",
        "Isaiah 12:2",
        "Isaiah 26:4",
        "Isaiah 43:1",
        "Joshua 1:9",
        "2 Timothy 1:7",
        "Job 13:15",
        "2 Samuel 22:3",
    ],
    "peace": [
        "Isaiah 26:3",
        "John 14:27",
        "Philippians 4:7",
        "Colossians 3:15",
        "2 Thessalonians 3:16",
        "Psalms 23:2",
        "Isaiah 32:18",
        "Psalms 116:7",
        "Psalms 4:8",
        "Proverbs 3:24",
    ],
    "gratitude": [
        "1 Thessalonians 5:18",
        "Psalms 100:4",
        "Psalms 107:1",
        "Colossians 3:17",
        "James 1:17",
        "Ephesians 5:20",
        "Colossians 4:2",
        "1 Chronicles 29:13",
        "Daniel 6:10",
        "Hebrews 13:15",
    ],
    "thankful-for-grace": [
        "Psalms 116:12",
        "2 Corinthians 9:15",
        "Ephesians 2:8",
        "1 Corinthians 15:10",
        "Titus 2:11",
        "Isaiah 12:1",
        "2 Corinthians 2:14",
        "1 Peter 5:10",
        "Lamentations 3:22",
        "Psalms 34:8",
    ],
    "grieving": [
        "Psalms 34:18",
        "Matthew 5:4",
        "2 Corinthians 1:3",
        "1 Thessalonians 4:13",
        "Psalms 94:19",
        "John 16:20",
        "Revelation 21:4",
        "Isaiah 61:1",
        "Lamentations 3:32",
        "Psalms 147:3",
    ],
    "discouraged": [
        "Isaiah 41:10",
        "Isaiah 40:31",
        "Psalms 42:11",
        "2 Corinthians 4:8",
        "Galatians 6:9",
        "Hebrews 12:12",
        "Deuteronomy 31:8",
        "Zephaniah 3:16",
        "Proverbs 24:16",
        "2 Corinthians 12:9",
    ],
    "guilt": [
        "Romans 8:1",
        "Isaiah 1:18",
        "Psalms 103:12",
        "Micah 7:19",
        "Isaiah 44:22",
        "Zechariah 3:4",
        "Hebrews 10:22",
        "Psalms 130:4",
        "Ephesians 1:7",
        "1 John 3:20",
    ],
    "repentant": [
        "Psalms 51:10",
        "2 Chronicles 7:14",
        "Psalms 32:5",
        "Proverbs 28:13",
        "Joel 2:13",
        "Hosea 6:1",
        "Isaiah 55:7",
        "Luke 15:18",
        "Acts 3:19",
        "1 John 1:9",
    ],
    "anxiety": [
        "Philippians 4:6",
        "Matthew 6:34",
        "1 Peter 5:7",
        "Proverbs 3:5",
        "Psalms 139:23",
        "Psalms 55:22",
        "Proverbs 12:25",
        "John 14:1",
        "Isaiah 43:2",
        "Exodus 14:14",
    ],
    "stressed": [
        "Psalms 46:1",
        "2 Chronicles 32:7",
        "Nehemiah 8:10",
        "Isaiah 40:29",
        "Deuteronomy 33:27",
        "Proverbs 18:10",
        "Psalms 118:5",
        "Psalms 138:7",
        "John 16:33",
        "Isaiah 30:15",
    ],
    "uncertain": [
        "Isaiah 30:21",
        "James 1:5",
        "Proverbs 16:9",
        "Psalms 37:5",
        "Proverbs 19:21",
        "Jeremiah 29:11",
        "Isaiah 42:16",
        "Psalms 32:8",
        "Proverbs 20:24",
        "Psalms 119:105",
    ],
}


def main():
    if not DB.exists():
        print(f"source database not found: {DB}")
        return 1

    db = sqlite3.connect(DB)
    if not COMPACT_DB.exists():
        print(f"compact database not found: {COMPACT_DB}")
        return 1
    db.execute("ATTACH DATABASE ? AS compact", (str(COMPACT_DB),))

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

    # Only verses Take a Break actually has material for. devotional_compact
    # covers 15,777 of the 31,102 passages, so without this filter a page can
    # list a verse that renders as bare text with no reflection — the gap is
    # visible on the page and reads as an oversight.
    has_compact = {
        row[0]
        for row in db.execute(
            "SELECT verse_id FROM compact.devotional_compact "
            "WHERE LENGTH(COALESCE(compact_insight, '')) > 0 "
            "AND LENGTH(COALESCE(compact_prayer, '')) > 0"
        )
    }

    # Keyed by book_id, not by display name: "1 Samuel" and "1 Kings" share a
    # leading "1", so counting on anything else pools their quotas and lets a
    # page exceed the cap.
    book_of = {
        verse_id: book_id
        for verse_id, book_id in db.execute("SELECT id, book_id FROM bible_verses")
    }

    def pick(pool, limit):
        """Walks the pool from both ends at once, skipping books already used up.

        Taking the top N straight off collapses onto a handful of books, because
        the highest-scoring verses for most emotions cluster in Psalms and
        Philippians. So the order is 1st, last, 2nd, 2nd-last, and so on: the
        strongest match still leads, and less obvious passages from the far end
        of the same theme set fill the rest. Combined with MAX_PER_BOOK that
        spreads a page across six books on average instead of five.

        The book cap is enforced on both ends, not by relaxing later — a cap
        that only applied to the tail would still let Psalms fill the front.
        """
        order = []
        lo, hi = 0, len(pool) - 1
        while lo <= hi:
            order.append(pool[lo][0])
            lo += 1
            if lo <= hi:
                order.append(pool[hi][0])
                hi -= 1

        picked = []
        used = defaultdict(int)
        for verse_id in order:
            if len(picked) >= limit:
                break
            book = book_of[verse_id]
            if used[book] >= MAX_PER_BOOK:
                continue
            picked.append(verse_id)
            used[book] += 1
        return picked

    verses = {}
    for code, mapping in themes.items():
        scores = defaultdict(float)
        for theme, priority in mapping:
            factor = PRIORITY_WEIGHT.get(priority, 0.3)
            for verse_id, weight in by_theme[theme]:
                if verse_id in has_compact:
                    scores[verse_id] += factor * weight
        # verse_id breaks ties so the ordering is stable between runs — otherwise
        # equal-scoring verses could reshuffle and change which ones get picked.
        ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
        if len(ranked) < PER_EMOTION:
            print(
                f"only {len(ranked)} verses with a compact reflection for "
                f"{code}, needed {PER_EMOTION}"
            )
            return 1
        chosen = pick(ranked[:POOL_DEPTH], PER_EMOTION)
        if len(chosen) < PER_EMOTION:
            # MAX_PER_BOOK can starve a page whose pool is one book deep.
            # Falling back to plain top-N keeps the page full; the guard in
            # check-data.mjs will still hold the line on compact content.
            chosen = [v for v, _ in ranked[:PER_EMOTION]]
        verses[code] = chosen

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

    # Apply PAGE_VERSE_OVERRIDES. Done here rather than before bucketing so the
    # editorial pick cannot reshuffle which emotions share a page — slugs are
    # URLs, and an override changing bucket membership would move them.
    ref_to_id = {
        f"{books.get(t['book'], t['book'])} {t['chapter']}:{t['verse']}": verse_id
        for verse_id, t in texts.items()
    }
    unknown_slugs = sorted(set(PAGE_VERSE_OVERRIDES) - {p["slug"] for p in pages})
    unknown_refs = sorted(
        ref for refs in PAGE_VERSE_OVERRIDES.values() for ref in refs
        if ref not in ref_to_id
    )
    if unknown_slugs or unknown_refs:
        if unknown_slugs:
            print(f"PAGE_VERSE_OVERRIDES: no such page: {', '.join(unknown_slugs)}")
        if unknown_refs:
            print(f"PAGE_VERSE_OVERRIDES: unknown reference: {', '.join(unknown_refs)}")
        return 1
    topped_up = []
    for slug, refs in PAGE_VERSE_OVERRIDES.items():
        picked = [ref_to_id[ref] for ref in refs][:PER_EMOTION]
        for verse_id in wanted[slug]:
            if len(picked) >= PER_EMOTION:
                break
            if verse_id not in picked:
                picked.append(verse_id)
                topped_up.append(slug)
        wanted[slug] = picked

    # Compact insight and prayer, the same three-part shape Take a Break shows.
    # Joined on verse_id, which is bible_verses.id in both databases.
    compact = {}
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
    print(f"overrides:    {len(PAGE_VERSE_OVERRIDES)} pages"
          + (f", topped up from scoring: {', '.join(sorted(set(topped_up)))}" if topped_up else ""))
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