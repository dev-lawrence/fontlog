import type { CollectionEntry } from 'astro:content';

type FontData = CollectionEntry<'fonts'>['data'];

export type Snippet = {
  id: string;
  label: string;
  /** Syntax-highlight hint / fenced-code language. */
  lang: string;
  code: string;
  note?: string;
};

const GENERIC: Record<FontData['classification'], string> = {
  sans: 'sans-serif',
  serif: 'serif',
  mono: 'monospace',
  display: 'sans-serif',
};

/** Build the ordered list of install paths that actually apply to a font. */
export function installSnippets(font: FontData): Snippet[] {
  const out: Snippet[] = [];
  const fallback = GENERIC[font.classification];

  if (font.fontsource) {
    const family = font.fontsourceFamily ?? font.family;
    out.push({
      id: 'npm',
      label: 'npm (Fontsource)',
      lang: 'bash',
      code: `pnpm add ${font.fontsource}\n# npm install ${font.fontsource}\n# yarn add ${font.fontsource}`,
    });
    out.push({
      id: 'fontsource',
      label: 'Import & use',
      lang: 'ts',
      code: `import '${font.fontsource}';\n\n/* then, in your CSS */\nfont-family: '${family}', ${fallback};`,
      note: font.fontsourceFamily
        ? `Fontsource appends “Variable” to the family name for variable fonts — use “${family}”, not “${font.family}”.`
        : undefined,
    });
  }

  if (font.nextFont) {
    out.push({
      id: 'next-font',
      label: 'next/font',
      lang: 'tsx',
      code: [
        `import { ${font.nextFont} } from 'next/font/google';`,
        ``,
        `const ${camel(font.nextFont)} = ${font.nextFont}({`,
        `  subsets: ['latin'],`,
        `  display: 'swap',`,
        font.variable ? `  axes: [],` : `  weight: ['${font.featuredWeight}'],`,
        `});`,
        ``,
        `// <body className={${camel(font.nextFont)}.className}>`,
      ].join('\n'),
      note: 'Self-hosted and optimised at build time — no network request to Google.',
    });
  }

  if (font.googleFontsSpec) {
    out.push({
      id: 'google-cdn',
      label: 'Google Fonts (CDN)',
      lang: 'html',
      code: [
        `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
        `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
        `<link`,
        `  href="https://fonts.googleapis.com/css2?family=${font.googleFontsSpec}&display=swap"`,
        `  rel="stylesheet"`,
        `/>`,
        ``,
        `/* CSS */`,
        `font-family: '${font.family}', ${fallback};`,
      ].join('\n'),
      note: 'Quickest to paste in, but adds a third-party request. Prefer self-hosting for production.',
    });
  }

  out.push({
    id: 'self-host',
    label: 'Self-host',
    lang: 'css',
    code: [
      `/* Download the ${font.license} files from the source below, then: */`,
      `@font-face {`,
      `  font-family: '${font.family}';`,
      `  src: url('/fonts/${slugish(font.family)}.woff2') format('woff2');`,
      font.variable
        ? `  font-weight: ${font.weights[0]} ${font.weights[font.weights.length - 1]};`
        : `  font-weight: ${font.featuredWeight};`,
      `  font-display: swap;`,
      `}`,
    ].join('\n'),
    note: `Files: ${font.sourceUrl}`,
  });

  return out;
}

function camel(pascalSnake: string): string {
  const camelCased = pascalSnake.replace(/_([a-zA-Z])/g, (_, c: string) => c.toUpperCase());
  return camelCased.charAt(0).toLowerCase() + camelCased.slice(1);
}

function slugish(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
