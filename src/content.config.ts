import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { MOODS, CLASSIFICATIONS } from './data/moods';

const seenOn = z.object({
  /** Name of the site or product using the font. */
  site: z.string(),
  /** Live URL — the screenshot links here. */
  url: z.string().url(),
  /** Screenshot next to the MDX file. Optional: a slot is shown until one is added. */
  image: z.string().optional(),
  /** Where the font is used, e.g. "headings", "body", "whole site". */
  usage: z.string().optional(),
  /** Month captured, "YYYY-MM" — so stale examples are visible. */
  captured: z.string().regex(/^\d{4}-\d{2}$/),
});

const fonts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/fonts' }),
  schema: () =>
    z.object({
      /** Display name, e.g. "Bricolage Grotesque". */
      name: z.string(),
      /** CSS font-family value once the font is loaded (its Google Fonts name). */
      family: z.string(),
      designer: z.string(),
      foundry: z.string().optional(),
      /** Year first released. */
      released: z.number().int(),
      classification: z.enum(CLASSIFICATIONS),
      moods: z.array(z.enum(MOODS)).min(1),
      /** One line for the index — what it is and when to reach for it. */
      blurb: z.string().max(140),

      /** SPDX identifier, e.g. "OFL-1.1". */
      license: z.string(),
      /** One plain-English sentence: what you can and can't do. */
      licenseSummary: z.string(),
      licenseUrl: z.string().url(),

      variable: z.boolean(),
      /** Human-readable axis list, e.g. ["wght 200–800", "opsz 12–96"]. */
      axes: z.array(z.string()).default([]),
      /** Named instance weights available, ascending. */
      weights: z.array(z.number().int()).min(1),

      /** npm package, e.g. "@fontsource-variable/bricolage-grotesque". */
      fontsource: z.string().optional(),
      /** Family string to use after importing the Fontsource package. */
      fontsourceFamily: z.string().optional(),
      /** Export name in `next/font/google`, e.g. "Bricolage_Grotesque". */
      nextFont: z.string().optional(),
      /** css2 `family=` value with axes, e.g. "Bricolage+Grotesque:wght@200..800". */
      googleFontsSpec: z.string().optional(),

      /** Canonical home: repo, foundry page, or spec sheet. */
      sourceUrl: z.string().url(),

      /** Slugs of fonts in this catalogue. Rendered as plain text until that entry exists. */
      pairsWith: z.array(z.string()).default([]),
      similarTo: z.array(z.string()).default([]),
      /** Weight used for the big specimen on the index page. */
      featuredWeight: z.number().int().default(400),
      /** Manual sort position on the index (ascending). Unset entries fall to the end, then sort by name. */
      order: z.number().int().default(999),

      seenOn: z.array(seenOn).default([]),

      /** Hide from the index without deleting the file. */
      draft: z.boolean().default(false),
    }),
});

export const collections = { fonts };
