export const SITE = {
  name: 'Fontlog',
  url: 'https://fontlog.dev',
  tagline: 'A curated log of open-license typefaces, for developers tired of the same font.',
  description:
    'Fontlog is a hand-kept catalogue of open-license typefaces I have used or seriously evaluated. ' +
    'Every entry has a live preview, real sites using it, a plain-English license note, and copy-paste ' +
    'install snippets for npm, next/font, and Google Fonts.',
  author: 'Lawrence',
  authorUrl: 'https://github.com/dev-lawrence',
  repo: 'https://github.com/dev-lawrence/fontlog',
} as const;

/** Default string shown in every type preview, so comparisons are fair. */
export const PREVIEW_TEXT = 'Ship your side project before the weekend ends.';
