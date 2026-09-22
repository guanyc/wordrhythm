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
