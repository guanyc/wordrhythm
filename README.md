# Word Rhythm

Brand hub for the **Word Rhythm** Bible app family — `Word Rhythm: KJV / ASV / WEB / Biblia RVR / Bible LSG`.
Slogan: *Scripture for the rhythm of everyday life.*

Built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS**. No backend — fully static/deployable.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Deploy to Cloudflare Pages (from GitHub)

1. Push this repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Framework preset: **Next.js**.
5. Build command: `npx @cloudflare/next-on-pages`
   (or simply `next build` — Cloudflare detects Next.js).
6. Add custom domain: `wordrhythm.app` (DNS managed in Cloudflare).

## Project structure

```
app/
  layout.tsx        # root layout + metadata
  globals.css       # palette (CSS vars) + rhythm equalizer animation
  page.tsx          # home: hero + rhythm flow + version grid + CTA
  versions/page.tsx # all translations
  take-a-break/page.tsx
components/         # Header, Footer, Hero, RhythmFlow, VersionCard
lib/versions.ts     # single source of truth for the version grid
DESIGN.md           # brand analysis + site design
```

## Adding a translation

Edit `lib/versions.ts` — add an entry (`slug`, `code`, `name`, `listing`,
`summary`, `status`, optional `package`/`playUrl`). It flows into the home
grid and `/versions` automatically.
