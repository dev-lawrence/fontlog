import { createFontStack } from '@capsizecss/core';
import type { CollectionEntry } from 'astro:content';

import { fontsourceImports } from './fontsource';
import { FONT_METRICS, SYSTEM_FALLBACK, GENERIC_STACK } from './capsize-metrics';

type FontData = CollectionEntry<'fonts'>['data'];

export interface FontStack {
  slug: string;
  name: string;
  classification: FontData['classification'];
  variable: boolean;
  fontsource: string | null;
  /** Import specifiers needed to load the weights the playground can render. */
  fontsourceImports: string[];
  /** Family list for the on-site preview; Google Fonts name first. */
  previewFamily: string;
  /** Family list for the copy-paste stack; Fontsource name first. */
  cssFamily: string;
  /** `@font-face` for the metric-matched fallback, or '' when metrics are unknown. */
  fallbackFace: string;
}

const bare = /^[a-z][a-z-]*$/i;
const quote = (s: string) => (bare.test(s) ? s : `'${s}'`);

/** Precompute everything the pairing playground needs for one font. */
export function fontStack(slug: string, data: FontData): FontStack {
  const generic = GENERIC_STACK[data.classification];
  const metrics = FONT_METRICS[slug];

  let fallbackName: string | null = null;
  let fallbackFace = '';
  if (metrics) {
    fallbackName = `${data.family} Fallback`;
    fallbackFace = createFontStack([
      metrics,
      SYSTEM_FALLBACK[data.classification],
    ]).fontFaces.trim();
  }

  const list = (primary: string) =>
    [quote(primary), fallbackName && quote(fallbackName), generic].filter(Boolean).join(', ');

  return {
    slug,
    name: data.name,
    classification: data.classification,
    variable: data.variable,
    fontsource: data.fontsource ?? null,
    fontsourceImports: data.fontsource
      ? fontsourceImports(data.fontsource, data.variable, data.weights)
      : [],
    previewFamily: list(data.family),
    cssFamily: list(data.fontsourceFamily ?? data.family),
    fallbackFace,
  };
}
