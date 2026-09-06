import type { CollectionEntry } from 'astro:content';

type FontData = CollectionEntry<'fonts'>['data'];

const CSS2 = 'https://fonts.googleapis.com/css2';

/**
 * Stylesheet URL for a single font page preview — includes the full weight
 * range (or static list) so the weight control has something to move through.
 */
export function previewStylesheet(font: FontData): string | null {
  if (!font.googleFontsSpec) return null;
  return `${CSS2}?family=${font.googleFontsSpec}&display=swap`;
}

/**
 * One combined stylesheet for a list of fonts, each at its featured weight.
 * Used on the index, where every row is set in its own typeface.
 */
export function listStylesheet(fonts: FontData[]): string {
  const families = fonts
    .map((f) => {
      const name = f.family.trim().replace(/\s+/g, '+');
      return `family=${name}:wght@${f.featuredWeight}`;
    })
    .join('&');
  return `${CSS2}?${families}&display=swap`;
}

/**
 * One stylesheet covering every catalogue font at its full weight range — used
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
