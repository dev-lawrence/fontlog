import { OGImageRoute } from 'astro-og-canvas';
import { getFonts } from '../../lib/fonts';
import { SITE } from '../../consts';

const fonts = await getFonts();

const pages: Record<string, { name: string; blurb: string; tags: string }> = Object.fromEntries(
  fonts.map((font) => [
    font.id,
    {
      name: font.data.name,
      blurb: font.data.blurb,
      tags: [font.data.classification, ...font.data.moods].join('  ·  '),
    },
  ]),
);

// Synthetic entry for the site-wide default OG image (`/og/_site.png`).
pages._site = {
  name: SITE.name,
  blurb: SITE.tagline,
  tags: `${fonts.length} open-license typefaces`,
};

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_id, page: (typeof pages)[string]) => ({
    title: page.name,
    description: `${page.blurb}\n\n${page.tags}`,
    bgGradient: [
      [251, 251, 250],
      [239, 238, 233],
    ],
    border: { color: [47, 95, 224], width: 8, side: 'inline-start' },
    padding: 72,
    font: {
      title: { color: [20, 20, 15], size: 72, weight: 'SemiBold', families: ['Funnel Sans'] },
      description: { color: [107, 107, 99], size: 30, families: ['Funnel Sans'] },
    },
    fonts: ['./src/assets/fonts/FunnelSans-Variable.ttf'],
  }),
});
