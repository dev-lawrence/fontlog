# Fontlog

A curated log of open-license typefaces, for developers tired of reaching for the same font.
Every entry has a live preview, real sites using it, the license in plain English, and copy-paste
install snippets.

Built with [Astro](https://astro.build), MDX content, Tailwind v4, and a single React island for
the type preview.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # static output in dist/
pnpm preview      # serve the build
pnpm format       # prettier
```

## Adding a font

1. Create `src/content/fonts/<slug>.mdx`. The filename is the slug used in URLs and in
   `pairsWith` / `similarTo` references.
2. Fill in the frontmatter — the schema in `src/content.config.ts` is the source of truth. Key
   fields:
   - `family` — the exact Google Fonts name; the previews and specimens load from it.
   - `googleFontsSpec` — the `family=` value with axes, e.g. `Inter:opsz,wght@14..32,100..900`.
     This drives both the preview stylesheet and the generated CDN snippet.
   - `fontsource` / `nextFont` — package name and `next/font/google` export. The install
     snippets in `src/lib/install.ts` are generated from these, so double-check them against
     [fontsource.org](https://fontsource.org) when you add a font.
   - `moods` — pick from the closed list in `src/data/moods.ts`. Add to that list deliberately,
     never ad hoc.
3. Write the personal note as the body of the file — 50–150 words, plain prose, and say what to
   watch out for.
4. Optional: add `seenOn` entries. Turn a raw screenshot into a correctly-sized WebP with
   `node scripts/shot.mjs <input.png> <slug>-<site>` — it writes a 1600×1000 crop into
   `src/assets/seen-on/`. Reference that filename in the `image` field. Until an image exists,
   the card shows a "screenshot pending" slot.
5. `pairsWith` / `similarTo` can reference fonts that aren't in the catalogue yet — they render as
   plain text and become links automatically once that `<slug>.mdx` exists.
6. For the pairing playground's zero-CLS fallbacks, add a line to `src/lib/capsize-metrics.ts`
   mapping the new slug to its `@capsizecss/metrics/<camelCaseName>` import. If you skip this the
   playground still works — it just omits the fallback `@font-face` for that font.

## Pairing playground

`/pair` lets you pick a heading / body / mono font, see them composed in a mock layout, and copy a
full stack: Fontsource installs, CSS variables, a Tailwind `@theme` block, and fallback
`@font-face` rules with `size-adjust` / `ascent-override` computed from real font metrics
(`@capsizecss/core` + `@capsizecss/metrics`, build-time only). The selection is encoded in the URL
(`/pair?h=…&b=…&m=…`) so a pairing is shareable.

## OG images

Per-font share images are generated at build time by `src/pages/og/[slug].png.ts` using
`astro-og-canvas` and the bundled Funnel Sans file in `src/assets/fonts/`. The site-wide default
is `/og/_site.png`.

## Deploy

Static site — any host works. Set up for Netlify; point it at this repo with build command
`pnpm build` and publish directory `dist`. Update `SITE.url` in `src/consts.ts` to the real
domain before launch.
