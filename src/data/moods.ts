/**
 * Closed vocabulary of mood tags. Add to this list deliberately — never let it
 * sprawl into near-duplicates, or the filtering stops meaning anything.
 */
export const MOODS = [
  'geometric',
  'humanist',
  'grotesque',
  'neo-grotesque',
  'warm',
  'brutalist',
  'editorial',
  'technical',
  'quirky',
  'retro',
  'elegant',
  'friendly',
] as const;

export type Mood = (typeof MOODS)[number];

export const CLASSIFICATIONS = ['sans', 'serif', 'mono', 'display'] as const;
export type Classification = (typeof CLASSIFICATIONS)[number];

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  sans: 'Sans',
  serif: 'Serif',
  mono: 'Mono',
  display: 'Display',
};
