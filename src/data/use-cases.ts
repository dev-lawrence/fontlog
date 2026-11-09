/**
 * Closed vocabulary of "what is this font for" tags.
 *
 * This is a different axis from `moods`: moods describe how a typeface *feels*
 * (warm, brutalist, technical); use cases describe the *job* it does on a page.
 * Tagged by context of use rather than industry vertical; "SaaS dashboard" is a
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
  'product-ui': 'Readable text and clear numerals for dashboards and app interfaces.',
  marketing: 'Distinctive headlines for landing pages and product launches.',
  'dev-tools': 'Related sans and mono styles for developer products and their sites.',
  docs: 'Comfortable reading alongside code in docs and technical writing.',
  code: 'Monospaced letters that are easy to tell apart in code, terminals, and editors.',
  blog: 'Comfortable reading over long articles and newsletters.',
  portfolio: 'Expressive type for portfolios and personal sites.',
};
