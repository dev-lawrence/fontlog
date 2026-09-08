/**
 * Font metrics for the pairing playground's zero-CLS fallback generation.
 *
 * When you add a font to the catalogue, add a line here too: import its metrics
 * from `@capsizecss/metrics/<camelCaseName>` and map it by slug. If a font has no
 * entry, the playground still works — it just omits the fallback `@font-face` for it.
 */
import type { FontMetrics } from '@capsizecss/core';

import bricolageGrotesque from '@capsizecss/metrics/bricolageGrotesque';
import recursive from '@capsizecss/metrics/recursive';
import inconsolata from '@capsizecss/metrics/inconsolata';
import funnelSans from '@capsizecss/metrics/funnelSans';
import crimsonText from '@capsizecss/metrics/crimsonText';

import arial from '@capsizecss/metrics/arial';
import timesNewRoman from '@capsizecss/metrics/timesNewRoman';
import courierNew from '@capsizecss/metrics/courierNew';

import type { Classification } from '../data/moods';

export const FONT_METRICS: Record<string, FontMetrics> = {
  'bricolage-grotesque': bricolageGrotesque,
  recursive,
  inconsolata,
  'funnel-sans': funnelSans,
  'crimson-text': crimsonText,
};

/** System face each classification falls back to (must be widely pre-installed). */
export const SYSTEM_FALLBACK: Record<Classification, FontMetrics> = {
  sans: arial,
  display: arial,
  serif: timesNewRoman,
  mono: courierNew,
};

/** Generic CSS keyword stack appended after the fallback face. */
export const GENERIC_STACK: Record<Classification, string> = {
  sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  display: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};
