/**
 * Editorial specimen backdrops, assigned by slug so colours stay stable when
 * filters change. Not a claim about font classification.
 */
export type SpecimenTheme = 'sand' | 'sage' | 'clay' | 'surface';

const THEMES: Record<string, SpecimenTheme> = {
  'bricolage-grotesque': 'sand',
  recursive: 'sage',
  inconsolata: 'surface',
  'funnel-sans': 'sand',
  'crimson-text': 'clay',
  'schibsted-grotesk': 'sage',
  inter: 'surface',
  'inter-tight': 'sage',
  geist: 'sand',
  'dm-sans': 'sage',
  poppins: 'clay',
  geom: 'clay',
};

export function specimenTheme(slug: string): SpecimenTheme {
  return THEMES[slug] ?? 'sand';
}
