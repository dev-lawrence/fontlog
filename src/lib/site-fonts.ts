import type { Font } from './fonts';

/** What the browser needs to "wear" a catalogue font across the whole site. */
export interface SiteFontEntry {
  slug: string;
  name: string;
  /** Google Fonts family name, used once the on-demand stylesheet loads. */
  family: string;
  /** Full css2 `family=` spec so every weight the site uses is available. */
  spec: string;
  classification: string;
  designer: string;
  variable: boolean;
  weights: number[];
  featuredWeight: number;
  /** CSS generic to fall back on while loading. */
  generic: string;
}

const GENERIC: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  display: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, Menlo, monospace',
};

export function siteFontManifest(fonts: Font[]): Record<string, SiteFontEntry> {
  const out: Record<string, SiteFontEntry> = {};
  for (const f of fonts) {
    const d = f.data;
    out[f.id] = {
      slug: f.id,
      name: d.name,
      family: d.family,
      spec: d.googleFontsSpec ?? d.family.trim().replace(/\s+/g, '+'),
      classification: d.classification,
      designer: d.designer,
      variable: d.variable,
      weights: [...d.weights].sort((a, b) => a - b),
      featuredWeight: d.featuredWeight,
      generic: GENERIC[d.classification] ?? GENERIC.sans,
    };
  }
  return out;
}
