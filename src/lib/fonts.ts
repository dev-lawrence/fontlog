import { getCollection, type CollectionEntry } from 'astro:content';

export type Font = CollectionEntry<'fonts'>;

/** All published fonts, drafts filtered out, sorted by name. */
export async function getFonts(): Promise<Font[]> {
  const fonts = await getCollection('fonts', ({ data }) => !data.draft);
  return fonts.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

/**
 * Resolve a list of slugs to entries. Slugs with no matching entry are returned
 * as `{ slug, font: null }` so the UI can show plain text and link later.
 */
export function resolveRefs(
  slugs: string[],
  all: Font[],
): { slug: string; name: string; font: Font | null }[] {
  return slugs.map((slug) => {
    const font = all.find((f) => f.id === slug) ?? null;
    return { slug, name: font?.data.name ?? prettifySlug(slug), font };
  });
}

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
