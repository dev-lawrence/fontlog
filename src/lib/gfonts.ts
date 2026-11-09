import type { CollectionEntry } from 'astro:content';

type FontData = CollectionEntry<'fonts'>['data'];

const CSS2 = 'https://fonts.googleapis.com/css2';

/**
 * Stylesheet URL for a single font page preview; includes the full weight
 * range (or static list) so the weight control has something to move through.
 */
export function previewStylesheet(font: FontData): string | null {
  if (!font.googleFontsSpec) return null;
  return `${CSS2}?family=${font.googleFontsSpec}&display=swap`;
}

/**
 * One combined stylesheet for a list of fonts at 400 + featured weight. Loaded
 * site-wide (BaseLayout): cards, the font picker, and the marquee set each name
 * in its own face. Browsers only fetch the files a page actually renders.
 */
export function listStylesheet(fonts: FontData[]): string {
  const families = fonts
    .map((f) => {
      const name = f.family.trim().replace(/\s+/g, '+');
      // 400 for body-size samples, plus the featured weight for display specimens.
      const ws = [...new Set([400, f.featuredWeight])]
        .filter((w) => f.weights.includes(w) || f.variable)
        .sort((a, b) => a - b);
      return `family=${name}:wght@${ws.join(';')}`;
    })
    .join('&');
  return `${CSS2}?${families}&display=swap`;
}

/**
 * One stylesheet covering every catalogue font at its full weight range; used
 * by the pairing playground, where headings and body need different weights.
 */
export function playgroundStylesheet(fonts: FontData[]): string {
  const families = fonts
    .map((f) => f.googleFontsSpec ?? f.family.trim().replace(/\s+/g, '+'))
    .map((spec) => `family=${spec}`)
    .join('&');
  return `${CSS2}?${families}&display=swap`;
}

/** `<link>` tags (preconnect + stylesheet) as a string for BaseLayout's headExtra. */
export function fontLinks(href: string): string {
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link rel="stylesheet" href="${href}" />`,
  ].join('\n');
}
