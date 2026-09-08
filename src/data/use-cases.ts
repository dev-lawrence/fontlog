/**
 * Closed vocabulary of "what is this font for" tags.
 *
 * This is a different axis from `moods`: moods describe how a typeface *feels*
 * (warm, brutalist, technical); use cases describe the *job* it does on a page.
 * Tagged by context of use rather than industry vertical — "SaaS dashboard" is a
 * useful hint, "fintech" is not, because good typefaces cross industries freely.
 *
 * Every tag on a font must carry a reason (see `bestFor` in the content schema).
 * Keep it to two or three per font; a face that is "good for everything" tells
 * the reader nothing.
 */
export const USE_CASES = [
  'product-ui',
  'marketing',
  'dev-tools',
  'docs',
  'code',
  'blog',
  'portfolio',
] as const;

export type UseCase = (typeof USE_CASES)[number];

export const USE_CASE_LABELS: Record<UseCase, string> = {
  'product-ui': 'Product UI',
  marketing: 'Marketing sites',
  'dev-tools': 'Developer tools',
  docs: 'Documentation',
  code: 'Code',
  blog: 'Blog & newsletter',
  portfolio: 'Portfolio & personal',
};

/** One line on what the context actually demands of a typeface. */
export const USE_CASE_DESCRIPTIONS: Record<UseCase, string> = {
  'product-ui': 'Dashboards and app interfaces — legibility at small sizes, clear numerals.',
  marketing: 'Landing and launch pages — personality in the headline weights.',
  'dev-tools': 'Developer-facing products and their sites — technical tone, sans and mono in step.',
  docs: 'Documentation and technical writing — sustained reading next to code.',
  code: 'Code blocks, terminals and editors — monospaced, unambiguous glyphs.',
  blog: 'Long-form writing and newsletters — comfort over a few thousand words.',
  portfolio: 'Personal and creative sites — the type is part of the statement.',
};
