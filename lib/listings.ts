/**
 * Full Google Play store listings, rendered on /versions/[slug].
 *
 * Copy is adapted from the published Play listings and rewritten in the
 * Word Rhythm voice: morning / day / evening beats, calm language, no
 * feature shouting. Headings carry emoji in the store — here they are
 * plain text to match the site's quiet tone.
 *
 * Add a version here and its detail page renders it automatically.
 */

export type ListingBlock =
  | { text: string[] }
  | { list: string[] };

export interface ListingSection {
  heading: string;
  blocks: ListingBlock[];
}

export interface StoreListing {
  /** Opening paragraphs, shown in the "About this app" block. */
  intro: string[];
  sections: ListingSection[];
  /** Closing lines shown after the section grid. */
  closing: string[];
}

const kjv: StoreListing = {
  intro: [
    "Word Rhythm: KJV Bible is a free, offline King James Bible built for the rhythm of everyday life — read in the morning, pause during the day, rest in the evening.",
    "Not just a Bible app, but a guided devotional system: Scripture, reflection, and prayer, shaped around the moments you actually live in.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Start the day with a verse, its meaning, and a short reflection",
            "A structured morning devotional flow",
            "Keeps the first moments of the day anchored in God’s Word",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "“How are you feeling today?” — find verses that speak to your emotions",
            "Emotion-based devotionals for peace, anxiety, strength, hope, and comfort",
            "Each pause gives you Verse + Meaning + Reflection + Prayer",
            "Topic guidance for Faith, Love, Forgiveness, Wisdom",
            "Designed to help you apply God’s Word in daily life",
            "A personalized experience that grows with you",
          ],
        },
      ],
    },
    {
      heading: "Evening — wind down and rest",
      blocks: [
        { text: ["End the day with prayer, peace, and restoration."] },
        {
          list: [
            "A structured evening devotional flow",
            "Sleep Audio: gentle nighttime Scripture reading with soft pacing and quiet pauses",
            "Peaceful background sounds for a more restful bedtime",
            "Simple and non-disruptive — made for lying in bed, resting quietly, or drifting into sleep",
          ],
        },
        {
          text: [
            "Whether you are stressed, emotionally overwhelmed, or simply having trouble slowing down at night, Sleep Audio opens a quiet space for comfort, reflection, and rest.",
          ],
        },
      ],
    },
    {
      heading: "Read — the offline KJV Bible",
      blocks: [
        {
          list: [
            "Full King James Version, offline — no internet required",
            "Clean, distraction-free reading experience",
            "Instant navigation to any book, chapter, or verse",
            "Scroll or slide reading modes",
            "Adjustable font size with light and dark themes",
          ],
        },
      ],
    },
    {
      heading: "Listen — audio anywhere",
      blocks: [
        {
          list: [
            "Built-in text-to-speech audio Bible",
            "Listen while commuting, walking, or resting",
            "Adjustable voice speed and pitch",
          ],
        },
      ],
    },
    {
      heading: "Plans — twenty-one days, or three hundred and sixty-five",
      blocks: [
        {
          list: [
            "21-day guided devotional journeys for focus and renewal",
            "365-day plans for long-term spiritual growth",
            "Simple daily reading plans for beginners",
            "Advanced structured plans for deeper Bible engagement",
            "Track progress and stay consistent",
          ],
        },
      ],
    },
    {
      heading: "Study — search every verse",
      blocks: [
        {
          list: [
            "Search all 31,102 KJV verses instantly",
            "Search by keyword, phrase, topic, or emotion",
            "Quick verse locator — jump straight to any Scripture",
            "Built-in definitions for archaic KJV words",
          ],
        },
      ],
    },
    {
      heading: "Memorize — one verse at a time",
      blocks: [
        {
          list: [
            "Save verses for memorization",
            "A simple four-step rhythm: New → Seen → Practice → Mastered",
            "Designed for daily Scripture memory practice",
            "Helps you go deeper in God’s Word over time",
          ],
        },
      ],
    },
    {
      heading: "Keep the rhythm — gentle tracking",
      blocks: [
        {
          list: [
            "Daily reading streaks",
            "Verses and chapters completed",
            "Gentle reminders to build consistency",
            "Visual progress tracking over time",
          ],
        },
      ],
    },
    {
      heading: "A verse on your home screen",
      blocks: [{ list: ["Daily verse widget"] }],
    },
    {
      heading: "Save, note, and share",
      blocks: [
        {
          list: [
            "Bookmark your favorite verses",
            "Add personal notes to Scripture",
            "Create and share beautiful verse images",
            "Share encouragement with others",
          ],
        },
      ],
    },
    {
      heading: "Backup & sync",
      blocks: [
        {
          list: [
            "Back up notes, bookmarks, and progress",
            "Sync across devices with Google Drive",
          ],
        },
      ],
    },
    {
      heading: "Optional Pro features",
      blocks: [
        { text: ["Free to use, with optional upgrades:"] },
        {
          list: [
            "Full devotional access",
            "Advanced reading plans",
            "Ad-free experience",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Rest in the evening.",
    "Word Rhythm: KJV Bible keeps Scripture in the rhythm of your everyday life.",
    "Read. Reflect. Pray. Grow.",
  ],
};

const asv: StoreListing = {
  intro: [
    "Word Rhythm: ASV Bible brings the American Standard Version into the rhythm of everyday life — read in the morning, pause during the day, rest in the evening.",
    "The ASV is valued for its accuracy and faithful translation. Here it comes with devotionals, reading plans, and study tools that keep you returning to God’s Word.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Daily devotionals and Bible reflections",
            "Read Genesis, Psalms, the Gospels, Revelation — wherever your reading lands",
            "A few quiet minutes before the day starts moving",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "Take a Break: short Scripture moments in the middle of a busy day",
            "Find Bible verses by emotion and life situation",
            "Encouragement when you have no time for anything long",
          ],
        },
      ],
    },
    {
      heading: "Evening — wind down and rest",
      blocks: [
        {
          list: [
            "Evening devotionals written for peaceful reflection",
            "End the day with something steady and true",
          ],
        },
      ],
    },
    {
      heading: "Read — the ASV Bible",
      blocks: [
        {
          list: [
            "The complete American Standard Version",
            "Light and dark reading themes",
            "Continue reading where you left off",
            "Easy navigation by book and chapter",
          ],
        },
      ],
    },
    {
      heading: "Plans — reading that sticks",
      blocks: [
        {
          list: [
            "Bible reading plans for daily spiritual growth",
            "Build consistent reading habits over time",
          ],
        },
      ],
    },
    {
      heading: "Study — search the text",
      blocks: [
        {
          list: [
            "Powerful AI-assisted Bible search",
            "Look up a verse without scrolling through chapters",
          ],
        },
      ],
    },
    {
      heading: "Save, note, and share",
      blocks: [
        {
          list: [
            "Bookmark your favorite verses",
            "Personal notes and highlights",
            "Share encouraging passages",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Rest in the evening.",
    "Built for anyone who wants distraction-free Bible reading with helpful study tools — whether you are a new believer or have read Scripture for years.",
    "Read. Reflect. Pray. Grow.",
  ],
};

const web: StoreListing = {
  intro: [
    "Word Rhythm: WEB Bible puts the World English Bible into the rhythm of everyday life — read in the morning, pause during the day, rest in the evening.",
    "The WEB is a modern English translation designed to make Scripture clear and accessible, while remaining faithful to the biblical text.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Daily devotional content connected to Scripture",
            "Reflect on the meaning of selected verses",
            "Take a quiet moment with God’s Word before the day begins",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "Return to Scripture whenever you need encouragement, wisdom, or peace",
            "Discover passages related to different situations and emotions",
            "Use prayer and reflection to deepen your reading",
          ],
        },
      ],
    },
    {
      heading: "Evening — wind down and rest",
      blocks: [
        {
          list: [
            "Evening-focused Bible reading",
            "Peaceful Scripture moments before sleep",
            "Listen to Scripture with supported audio features",
            "Create a calm routine centered on God’s Word",
          ],
        },
      ],
    },
    {
      heading: "Read — the offline WEB Bible",
      blocks: [
        {
          list: [
            "The complete World English Bible, offline",
            "Clean, comfortable reading experience",
            "Adjustable font size for easier reading",
            "Continue reading from where you left off",
            "Browse books, chapters, and verses easily",
          ],
        },
      ],
    },
    {
      heading: "Find any verse quickly",
      blocks: [
        {
          list: [
            "Search by word or phrase",
            "View results grouped by book",
            "Highlight matching words in results",
            "Quickly select and open verses",
          ],
        },
      ],
    },
    {
      heading: "Explore — topics and themes",
      blocks: [
        {
          list: [
            "Explore verses by topic and theme",
            "Save meaningful verses for later",
            "Copy and share Scripture easily",
          ],
        },
      ],
    },
    {
      heading: "Plans — a rhythm that fits",
      blocks: [
        {
          list: [
            "Follow structured Bible reading plans",
            "Choose plans for different reading rhythms",
            "Keep track of your progress",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Rest in the evening.",
    "Built around one simple goal: make it easier to spend time in Scripture every day. The Bible remains at the center.",
    "Read. Reflect. Pray. Return to God’s Word.",
  ],
};

const rvr: StoreListing = {
  intro: [
    "Word Rhythm: Biblia RVR carries the Reina-Valera through the rhythm of everyday life — read in the morning, pause during the day, reflect in the evening.",
    "A simple, close companion for creating a daily moment with God: read the Bible, reflect on its teaching, and find words of peace, hope, and strength when you need them most.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Daily devotionals built on Bible verses",
            "A short reflection, or a deeper devotional when you have more time",
            "A few minutes each day to draw closer to God",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "Take a Break: a pause during the day with a selection of verses and reflections",
            "“¿Cómo te sientes hoy?” — verses for worry, sadness, tiredness, gratitude, or joy",
            "Receive encouragement and comfort through God’s Word",
          ],
        },
      ],
    },
    {
      heading: "Evening — wind down and rest",
      blocks: [
        {
          list: [
            "Night reflection: end the day with calm reading and thoughts of peace",
            "Rest your heart by meditating on God’s Word",
          ],
        },
      ],
    },
    {
      heading: "Read — the Reina-Valera Bible",
      blocks: [
        {
          list: [
            "The complete Reina-Valera Bible — every book and chapter",
            "Explore God’s Word easily",
            "Personalize your reading and continue where you left off",
          ],
        },
      ],
    },
    {
      heading: "Listen — audio anywhere",
      blocks: [
        {
          list: [
            "Use read-aloud to listen to the verses",
            "Let audio accompany your reading and reflection",
          ],
        },
      ],
    },
    {
      heading: "Study — advanced Bible search",
      blocks: [
        {
          list: [
            "Find verses by words, topics, or references",
            "Explore the Bible quickly and simply",
          ],
        },
      ],
    },
    {
      heading: "Save, mark, and share",
      blocks: [
        {
          list: [
            "Save your favorite verses",
            "Mark important passages",
            "Share God’s Word with family and friends",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Reflect in the evening.",
    "For generations of Spanish-speaking Christians, the Reina-Valera has been one of the most loved translations. Keep it close every day.",
    "Read. Reflect. Pray. Grow.",
  ],
};

const cuv: StoreListing = {
  intro: [
    "Word Rhythm: 和合本圣经 brings the Chinese Union Version into the rhythm of everyday life — read in the morning, pause during the day, rest in the evening.",
    "For generations of Chinese Christians, the CUV has been the Bible read in churches, family worship, personal prayer, and everyday life. This app carries that familiar Scripture into every moment of your day.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Start the morning in God’s Word with peace and clarity",
            "Open a related reflection straight from a verse",
            "Return to the chapter context whenever you want the whole picture",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "Take a quiet break and return to God’s Word",
            "Explore content for anxiety, stress, loneliness, hope, gratitude, and peace",
            "Start from how you feel, or from what you are facing",
            "Receive daily encouragement, prayerful insight, and relevant Scripture",
          ],
        },
      ],
    },
    {
      heading: "Evening — end the day in prayer",
      blocks: [
        {
          list: [
            "Close the day in prayer with Scripture",
            "Spend quiet moments with God throughout the day too",
          ],
        },
      ],
    },
    {
      heading: "Read — the complete CUV Bible",
      blocks: [
        {
          list: [
            "Read the complete Chinese Union Version Bible",
            "Navigate quickly by book, chapter, and verse",
            "Continue where you left off",
            "Clean reading experience with dark mode support",
          ],
        },
      ],
    },
    {
      heading: "Study — search with clarity",
      blocks: [
        {
          list: [
            "Search by keyword, exact phrase, or passage range",
            "View results grouped by book",
            "Copy, select, and share verses",
            "Use advanced search tools for deeper Bible study",
          ],
        },
      ],
    },
    {
      heading: "Explore — topics and guided search",
      blocks: [
        {
          list: [
            "Open preset topic searches from the menu",
            "Explore verses connected to common themes and life situations",
            "Choose simple guided search or more advanced tools",
          ],
        },
      ],
    },
    {
      heading: "Plans — build a lasting reading habit",
      blocks: [
        {
          list: [
            "Choose from one-year Bible plans, shorter plans, and guided journeys",
            "Follow daily progress at your own pace",
            "Grow through steady reading and reflection",
          ],
        },
      ],
    },
    {
      heading: "Listen, save, and share",
      blocks: [
        {
          list: [
            "Listen to Scripture with text-to-speech",
            "Save meaningful verses and add bookmarks",
            "Share encouragement with friends and family",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Rest in the evening.",
    "More than a Bible reader — a daily companion for Scripture, prayer, reflection, and spiritual growth. Whatever this day brings, Scripture has a word for you.",
    "Read. Reflect. Pray. Grow.",
  ],
};

const aa: StoreListing = {
  intro: [
    "Word Rhythm: Bíblia AA carries the Almeida Atualizada through the rhythm of everyday life — read in the morning, pause during the day, rest in the evening.",
    "Made to keep reading God’s Word simple, organized, and inspiring — for a moment of study, of prayer, or of rest, with resources that strengthen your walk with God.",
  ],
  sections: [
    {
      heading: "Morning — begin with Scripture",
      blocks: [
        {
          list: [
            "Daily devotionals: reflections drawn from the Scriptures",
            "A verse for the day",
            "Readings shaped for morning and night",
          ],
        },
      ],
    },
    {
      heading: "Day — Take a Break when you need one",
      blocks: [
        {
          list: [
            "Take a break: receive a short verse to renew your mind during the day",
            "Find passages for anxiety, fear, sadness, gratitude, hope, peace, and joy",
          ],
        },
      ],
    },
    {
      heading: "Evening — wind down and rest",
      blocks: [
        {
          list: [
            "Night readings to close the day",
            "Listen to the Scriptures before sleeping",
          ],
        },
      ],
    },
    {
      heading: "Read — the offline AA Bible",
      blocks: [
        {
          list: [
            "The complete Almeida Atualizada, read offline",
            "Quick search",
            "Verse highlighting",
            "Bookmarks and notes",
            "Reading history — pick up where you stopped",
          ],
        },
      ],
    },
    {
      heading: "Listen — audio anywhere",
      blocks: [
        {
          list: [
            "Listen to the Scriptures while walking, resting, or before sleeping",
          ],
        },
      ],
    },
    {
      heading: "Plans — build the daily habit",
      blocks: [
        { list: ["Organized reading plans for everyday reading"] },
      ],
    },
    {
      heading: "Simple by design",
      blocks: [
        {
          list: [
            "Clean, simple interface",
            "Dark mode",
            "Adjustable font size",
            "Share verses and keep favorites",
            "Works offline",
          ],
        },
      ],
    },
  ],
  closing: [
    "Read in the morning. Pause during the day. Rest in the evening.",
    "May this Bible help you grow in faith and remain daily in God’s Word.",
    "Read. Reflect. Pray. Grow.",
  ],
};

export const listings: Record<string, StoreListing> = {
  kjv,
  asv,
  web,
  rvr,
  cuv,
  aa,
};

export function getListing(slug: string): StoreListing | undefined {
  return listings[slug];
}
