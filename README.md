# Word Rhythm

Brand hub for the **Word Rhythm** Bible app family — `Word Rhythm: KJV / ASV / WEB / Biblia RVR / 和合本 / Bíblia AA`.
Slogan: *Scripture for the rhythm of everyday life.*

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**. No backend — fully static/deployable.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build      # produces a static site in ./out
```

> This project uses `output: "export"`, so it builds to plain static files in
> `out/`. Preview locally with any static server, e.g. `npx serve out`, or use
> `npm run dev` for the dev server.

## Deploy to Cloudflare Pages (from GitHub)

This is a fully static Next.js site — no functions/SSR required.

1. Push this repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Framework preset: **Next.js** (Cloudflare detects it), or choose "None"
   and set build/output manually:
   - Build command: `npm run build`
   - Build output directory: `out`
5. Add custom domain: `wordrhythm.app` (DNS managed in Cloudflare).

## Project structure

```
app/
  layout.tsx              # root layout + metadata
  globals.css             # palette (CSS vars) + rhythm equalizer animation
  page.tsx                # home: hero + rhythm flow + version grid + screenshot strip
  versions/page.tsx       # all translations
  versions/[slug]/page.tsx# per-version detail: icon, Play link, screenshots
  take-a-break/page.tsx
components/               # Header, Footer, Hero, RhythmFlow, VersionCard, Screenshots
lib/versions.ts           # single source of truth for the version grid
public/apps/<slug>/       # icons + screenshots pulled from Google Play
DESIGN.md                 # brand analysis + site design
```

## Adding a translation

1. Add an entry in `lib/versions.ts` (`slug`, `code`, `name`, `listing`,
   `storeTitle`, `language`, `summary`, `status`, optional
   `package`/`playUrl`).
2. Drop its Play Store assets into `public/apps/<slug>/`: `icon.png` plus
   `01.jpg`–`04.jpg` screenshots (the `shots()` helper in `lib/versions.ts`
   wires the paths automatically).
