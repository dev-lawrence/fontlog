import { fontsourceImports } from './fontsource';
import type { CollectionEntry } from 'astro:content';

type FontData = CollectionEntry<'fonts'>['data'];

export type RecipeStep = {
  title?: string;
  /** Syntax hint, shown as a small label. */
  lang: string;
  code: string;
};

export type Recipe = {
  id: 'fontsource' | 'next-font' | 'google-cdn' | 'self-host' | 'tailwind';
  label: string;
  steps: RecipeStep[];
  note?: string;
};

export type InstallInfo = {
  recipes: Recipe[];
  /** Brief for an LLM coding agent (secondary). */
  prompt: string;
  /** Family name to use in CSS after the first recipe is applied. */
  loadedFamily: string;
};

const GENERIC: Record<FontData['classification'], string> = {
  sans: 'sans-serif',
  serif: 'serif',
  mono: 'monospace',
  display: 'sans-serif',
};

const THEME_KEY: Record<FontData['classification'], string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  display: 'font-display',
};

/** Build the install recipes that the font's metadata actually supports. */
export function installInfo(font: FontData): InstallInfo {
  const recipes: Recipe[] = [];
  const fallback = GENERIC[font.classification];
  const fsFamily = font.fontsourceFamily ?? font.family;
  const fsImports = font.fontsource
    ? fontsourceImports(font.fontsource, font.variable, font.weights)
        .map((i) => `import '${i}';`)
        .join('\n')
    : '';
  const weightList = font.weights.map((w) => `'${w}'`).join(', ');

  if (font.fontsource) {
    recipes.push({
      id: 'fontsource',
      label: 'Fontsource',
      steps: [
        {
          title: '1. Install the package',
          lang: 'bash',
          code: `pnpm add ${font.fontsource}\n# npm install ${font.fontsource}\n# yarn add ${font.fontsource}`,
        },
        {
          title: '2. Import it and set the family',
          lang: 'ts',
          code: `${fsImports}\n\n/* then, in your CSS */\nfont-family: '${fsFamily}', ${fallback};`,
        },
      ],
      note: font.fontsourceFamily
        ? `Fontsource names this family \u201c${font.fontsourceFamily}\u201d, not \u201c${font.family}\u201d. Use that name in CSS.`
        : undefined,
    });
  }

  if (font.nextFont) {
    const v = camel(font.nextFont);
    recipes.push({
      id: 'next-font',
      label: 'Next.js',
      steps: [
        {
          lang: 'tsx',
          code: [
            `import { ${font.nextFont} } from 'next/font/google';`,
            ``,
            `const ${v} = ${font.nextFont}({`,
            `  subsets: ['latin'],`,
            `  display: 'swap',`,
            font.variable ? undefined : `  weight: [${weightList}],`,
            `});`,
            ``,
            `// <body className={${v}.className}>`,
          ]
            .filter((l) => l !== undefined)
            .join('\n'),
        },
      ],
      note: 'next/font downloads the files at build time and serves them from your own domain.',
    });
  }

  if (font.googleFontsSpec) {
    recipes.push({
      id: 'google-cdn',
      label: 'Google Fonts',
      steps: [
        {
          title: 'Add to your <head>',
          lang: 'html',
          code: [
            `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
            `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`,
            `<link`,
            `  href="https://fonts.googleapis.com/css2?family=${font.googleFontsSpec}&display=swap"`,
            `  rel="stylesheet"`,
            `/>`,
          ].join('\n'),
        },
        {
          title: 'Use it in CSS',
          lang: 'css',
          code: `font-family: '${font.family}', ${fallback};`,
        },
      ],
      note: 'Quickest to try, but it adds a third-party request. Self-host for production.',
    });
  }

  recipes.push({
    id: 'self-host',
    label: 'Self-host',
    steps: [
      {
        lang: 'css',
        code: [
          `/* Download the ${font.license} files from the source, then: */`,
          `@font-face {`,
          `  font-family: '${font.family}';`,
          `  src: url('/fonts/${slugish(font.family)}.woff2') format('woff2');`,
          font.variable
            ? `  font-weight: ${font.weights[0]} ${font.weights[font.weights.length - 1]};`
            : `  font-weight: ${font.featuredWeight};`,
          `  font-display: swap;`,
          `}`,
        ].join('\n'),
      },
    ],
    note: font.variable
      ? `Files: ${font.sourceUrl}`
      : `Static font: add one @font-face block per weight you use (${font.weights.join(', ')}). Files: ${font.sourceUrl}`,
  });

  if (font.fontsource || font.googleFontsSpec) {
    const themeFamily = font.fontsource ? fsFamily : font.family;
    const key = THEME_KEY[font.classification];
    const css = [
      `@import 'tailwindcss';`,
      ...(font.fontsource
        ? fontsourceImports(font.fontsource, font.variable, font.weights).map(
            (i) => `@import '${i}';`,
          )
        : []),
      ``,
      `@theme {`,
      `  --${key}: '${themeFamily}', ${fallback === 'sans-serif' ? 'ui-sans-serif, system-ui, sans-serif' : fallback};`,
      `}`,
    ]
      .filter((l) => l !== undefined)
      .join('\n');
    const steps: RecipeStep[] = [
      {
        title: font.fontsource ? 'In your main CSS file' : '1. In your main CSS file',
        lang: 'css',
        code: css,
      },
    ];
    if (font.fontsource) {
      steps[0].title = '2. In your main CSS file';
      steps.unshift({
        title: '1. Install the package',
        lang: 'bash',
        code: `pnpm add ${font.fontsource}\n# npm install ${font.fontsource}`,
      });
    } else {
      steps.unshift({
        title: '1. Load the font (Google Fonts link in your <head>)',
        lang: 'html',
        code: `<link\n  href="https://fonts.googleapis.com/css2?family=${font.googleFontsSpec}&display=swap"\n  rel="stylesheet"\n/>`,
      });
      steps[1].title = '2. Register it in your Tailwind theme';
    }
    steps.push({
      title: `${steps.length + 1}. Use the utility`,
      lang: 'html',
      code: `<p class="${key}">The quick brown fox</p>`,
    });
    recipes.push({
      id: 'tailwind',
      label: 'Tailwind v4',
      steps,
      note: `Defining --${key} in @theme replaces the default and generates the \`${key}\` utility.`,
    });
  }

  return { recipes, prompt: aiPrompt(font, fallback), loadedFamily: fsFamily };
}

/** A self-contained brief an LLM coding agent can act on without touching this site again. */
function aiPrompt(font: FontData, fallback: string): string {
  const lines = [
    `Add the "${font.name}" font to this project.`,
    '',
    `- CSS family name once loaded: '${font.fontsourceFamily ?? font.family}'`,
    `- Fallback stack: ${fallback}`,
    font.variable
      ? `- Variable font. Axes: ${font.axes.join(', ') || 'none listed'}`
      : `- Static weights: ${font.weights.join(', ')}`,
  ];

  if (font.fontsource) lines.push(`- Fontsource package (self-hosted, npm): ${font.fontsource}`);
  if (font.nextFont) lines.push(`- next/font/google export name: ${font.nextFont}`);
  if (font.googleFontsSpec) lines.push(`- Google Fonts CDN family param: ${font.googleFontsSpec}`);

  lines.push(
    `- License: ${font.license}. ${font.licenseSummary}`,
    `- Source: ${font.sourceUrl}`,
    '',
    'Detect how this project already loads fonts (Fontsource import, next/font, Tailwind @theme, ' +
      'plain @font-face) and follow that pattern. Prefer self-hosting over the Google Fonts CDN ' +
      'link for production.',
  );

  return lines.join('\n');
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
