import { useEffect, useId, useMemo, useState, type CSSProperties, type SelectHTMLAttributes } from 'react';

import type { FontStack } from '../lib/stack';

type Role = 'heading' | 'body' | 'mono';
type Background = 'site' | 'light' | 'dark';

interface Props {
  stacks: FontStack[];
  defaults: Record<Role, string>;
}

const ROLES: { role: Role; label: string }[] = [
  { role: 'heading', label: 'Heading' },
  { role: 'body', label: 'Body' },
  { role: 'mono', label: 'Code' },
];

const FIELD_GUIDE = { heading: 'bricolage-grotesque', body: 'funnel-sans', mono: 'inconsolata' };

/** Independent, self-contained palettes for the preview canvas. */
const PALETTES = {
  light: { bg: '#fffefa', ink: '#242821', ink2: '#62675d', rule: '#d9d9ce', soft: '#f3efe6' },
  dark: { bg: '#171916', ink: '#f3f1e9', ink2: '#afb6a7', rule: '#3a4137', soft: '#20231f' },
} as const;

const readSiteDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

function PlaygroundSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative min-w-0">
      <select
        {...props}
        className="field hover:border-accent block min-h-12 min-w-0 cursor-pointer appearance-none rounded-xl pr-10 pl-3 text-sm transition-colors"
      >
        {children}
      </select>
      <svg
        className="text-ink-2 pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function PairPlayground({ stacks, defaults }: Props) {
  const bySlug = useMemo(() => new Map(stacks.map((s) => [s.slug, s])), [stacks]);
  const valid = (slug: string | null | undefined, fallback: string) =>
    slug && bySlug.has(slug) ? slug : fallback;

  const [picks, setPicks] = useState<Record<Role, string>>(defaults);
  const [ready, setReady] = useState(false);
  const [background, setBackground] = useState<Background>('site');
  const [siteDark, setSiteDark] = useState(false);
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  // Read a shared pairing once on the client (validated against the catalogue).
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setPicks({
      heading: valid(p.get('h'), defaults.heading),
      body: valid(p.get('b'), defaults.body),
      mono: valid(p.get('m'), defaults.mono),
    });
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync so a pairing is shareable.
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    p.set('h', picks.heading);
    p.set('b', picks.body);
    p.set('m', picks.mono);
    history.replaceState(null, '', `?${p.toString()}`);
  }, [picks, ready]);

  // "Match site" follows the header theme toggle.
  useEffect(() => {
    setSiteDark(readSiteDark());
    const obs = new MutationObserver(() => setSiteDark(readSiteDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const h = bySlug.get(picks.heading)!;
  const b = bySlug.get(picks.body)!;
  const m = bySlug.get(picks.mono)!;
  const picked: Record<Role, FontStack> = { heading: h, body: b, mono: m };

  const out = useMemo(() => buildStack([h, b, m], ['heading', 'body', 'mono']), [h, b, m]);

  const previewDark = background === 'dark' || (background === 'site' && siteDark);
  const pal = previewDark ? PALETTES.dark : PALETTES.light;
  const previewVars = {
    '--pg-h': h.previewFamily,
    '--pg-b': b.previewFamily,
    '--pg-m': m.previewFamily,
    '--pg-bg': pal.bg,
    '--pg-ink': pal.ink,
    '--pg-ink2': pal.ink2,
    '--pg-rule': pal.rule,
    '--pg-soft': pal.soft,
    fontSize: `${scale}rem`,
    background: pal.bg,
    color: pal.ink,
  } as CSSProperties;

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError(false);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      setCopied(null);
      setCopyError(true);
    }
  };

  const fieldGuideAvailable = Object.values(FIELD_GUIDE).every((s) => bySlug.has(s));
  const isFieldGuide = ROLES.every(({ role }) => picks[role] === FIELD_GUIDE[role]);
  const missingMetrics = [h, b, m]
    .filter((f, i, a) => a.indexOf(f) === i && !f.fallbackFace)
    .map((f) => f.name);

  const scaleId = useId();
  const bgId = useId();

  return (
    <div className="not-prose space-y-16">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-6 lg:sticky lg:top-24">
          <section className="panel space-y-6 p-5" aria-label="Font families">
            {ROLES.map(({ role, label }) => {
              const f = picked[role];
              const id = `${scaleId}-${role}`;
              return (
                <div key={role} className="min-w-0 space-y-2">
                  <label htmlFor={id} className="text-ink-2 block text-sm font-medium">
                    {label}
                  </label>
                  <PlaygroundSelect
                    id={id}
                    title={f.name}
                    value={picks[role]}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setPicks((p) => ({ ...p, [role]: value }));
                    }}
                  >
                    {stacks.map((s) => (
                      <option value={s.slug} key={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </PlaygroundSelect>
                  <a
                    href={`/fonts/${f.slug}`}
                    className="meta hover:text-accent decoration-divider inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    Open font details
                  </a>
                </div>
              );
            })}

            <div className="border-divider flex flex-wrap gap-2 border-t pt-5">
              {fieldGuideAvailable && (
                <button
                  type="button"
                  className="chip"
                  aria-pressed={isFieldGuide}
                  onClick={() => setPicks(FIELD_GUIDE)}
                >
                  Fontlog field guide
                </button>
              )}
              <button
                type="button"
                className="chip"
                onClick={() => {
                  setPicks(defaults);
                  setScale(1);
                  setBackground('site');
                }}
              >
                Reset
              </button>
            </div>
          </section>

          <section className="panel space-y-5 p-5" aria-label="Preview settings">
            <div className="space-y-2">
              <label htmlFor={scaleId} className="text-ink-2 flex justify-between text-sm font-medium">
                <span>Scale</span>
                <span className="font-mono tracking-normal normal-case">
                  {Math.round(scale * 100)}%
                </span>
              </label>
              <input
                id={scaleId}
                type="range"
                min={0.8}
                max={1.4}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(Number(e.currentTarget.value))}
                className="accent-accent block h-11 w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={bgId} className="text-ink-2 block text-sm font-medium">
                Preview background
              </label>
              <PlaygroundSelect
                id={bgId}
                value={background}
                onChange={(e) => setBackground(e.currentTarget.value as Background)}
              >
                <option value="site">Match site theme</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </PlaygroundSelect>
            </div>
          </section>
        </div>

        {/* Canvas */}
        <div
          className="border-divider min-w-0 overflow-hidden rounded-xl border"
          style={previewVars}
        >
          <Sample heading={h} body={b} mono={m} />
        </div>
      </div>

      {/* Output */}
      <section aria-labelledby="use-pairing">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 id="use-pairing" className="text-2xl font-semibold tracking-tight">
              Use this pairing
            </h2>
            <p className="meta mt-2">
              Four steps, in order. &ldquo;Copy everything&rdquo; includes all four blocks; the
              Tailwind block is an alternative to the plain CSS variables.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => copy('link', location.href)}
            >
              {copied === 'link' ? 'Link copied' : 'Copy link'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => copy('all', out.everything)}
            >
              {copied === 'all' ? 'Copied' : 'Copy everything'}
            </button>
          </div>
        </div>
        <p role="status" className="meta mb-4 min-h-5">
          {copyError
            ? 'Copy was blocked by the browser. Select the text and copy it manually.'
            : ''}
        </p>
        <ol className="space-y-4">
          <Snippet n={1} label="Install" code={out.install} copied={copied} onCopy={copy} />
          <Snippet n={2} label="Import" code={out.imports} copied={copied} onCopy={copy} />
          <Snippet
            n={3}
            label="CSS variables and fallback faces"
            code={out.css}
            copied={copied}
            onCopy={copy}
            note={
              'The fallback @font-face rules are generated from each font’s metrics to reduce layout shift while the web font loads.' +
              (missingMetrics.length
                ? ` No metrics are available for ${missingMetrics.join(', ')}, so its fallback is omitted.`
                : '')
            }
          />
          <Snippet
            n={4}
            label="Tailwind v4"
            code={out.tailwind}
            copied={copied}
            onCopy={copy}
            note="Generates font-heading, font-body and font-mono utilities. Use it instead of the :root block in step 3; keep the fallback faces."
          />
        </ol>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Sample({ heading, body, mono }: { heading: FontStack; body: FontStack; mono: FontStack }) {
  return (
    <div
      className="min-h-[34rem] px-5 py-8 sm:px-10 sm:py-12"
      style={{ fontFamily: 'var(--pg-b)', lineHeight: 1.6 }}
    >
      <h2
        className="max-w-[16ch] text-[2.75em] leading-[1.05] font-semibold text-balance"
        style={{ fontFamily: 'var(--pg-h)', letterSpacing: '-0.01em' }}
      >
        Notes from a small studio
      </h2>
      <p className="mt-5 max-w-[56ch] text-[1.0625em]" style={{ color: 'var(--pg-ink2)' }}>
        We keep a paper notebook beside the keyboard. Most pages hold a sketch, a few numbers and a
        half-finished sentence: 12 columns, a 1.25 ratio, 16&nbsp;px of space. The ones worth
        keeping get typed up, tidied, and shared.
      </p>

      <pre
        className="mt-8 overflow-x-auto rounded-lg px-4 py-3 text-[0.875em] leading-relaxed"
        style={{
          fontFamily: 'var(--pg-m)',
          background: 'var(--pg-soft)',
          border: '1px solid var(--pg-rule)',
        }}
      >
        <code>{`h1 { font-family: var(--font-heading); }\np  { font-family: var(--font-body); }\ncode { font-family: var(--font-mono); }`}</code>
      </pre>

      <table
        className="mt-8 w-full max-w-md border-collapse text-[0.875em]"
        style={{ fontFamily: 'var(--pg-m)', fontVariantNumeric: 'tabular-nums' }}
      >
        <caption className="sr-only">Sample font files</caption>
        <thead>
          <tr style={{ color: 'var(--pg-ink2)' }}>
            {['File', 'Format', 'Weight'].map((c, i) => (
              <th
                key={c}
                scope="col"
                className={`py-2 font-normal ${i === 2 ? 'text-right' : 'text-left'}`}
                style={{ borderBottom: '1px solid var(--pg-rule)' }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['notes-regular', 'WOFF2', '400'],
            ['notes-medium', 'WOFF2', '500'],
            ['notes-bold', 'WOFF2', '700'],
          ].map(([a, c, d]) => (
            <tr key={a}>
              <td className="py-2" style={{ borderBottom: '1px solid var(--pg-rule)' }}>
                {a}
              </td>
              <td className="py-2" style={{ borderBottom: '1px solid var(--pg-rule)' }}>
                {c}
              </td>
              <td className="py-2 text-right" style={{ borderBottom: '1px solid var(--pg-rule)' }}>
                {d}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-[0.8125em]" style={{ color: 'var(--pg-ink2)' }}>
        Heading: {heading.name} · Body: {body.name} · Code: {mono.name}
      </p>
    </div>
  );
}

function Snippet({
  n,
  label,
  code,
  note,
  copied,
  onCopy,
}: {
  n: number;
  label: string;
  code: string;
  note?: string;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <li className="panel overflow-hidden">
      <div className="border-divider flex items-center justify-between gap-3 border-b py-1 pr-2 pl-4">
        <h3 className="font-body! flex items-baseline gap-3 text-base font-semibold">
          <span className="text-ink-2 font-mono text-sm" aria-hidden="true">
            {String(n).padStart(2, '0')}
          </span>
          {label}
        </h3>
        <button
          type="button"
          onClick={() => onCopy(label, code)}
          className="meta hover:text-ink decoration-divider inline-flex min-h-11 items-center px-3 font-medium underline underline-offset-4"
        >
          {copied === label ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[15px] leading-relaxed">
        <code>{code}</code>
      </pre>
      {note && <p className="meta border-divider border-t px-4 py-3">{note}</p>}
    </li>
  );
}

/* -------------------------------------------------------------------------- */

function buildStack(fonts: FontStack[], roles: Role[]) {
  const pkgs = [...new Set(fonts.map((f) => f.fontsource).filter(Boolean))] as string[];

  const unavailable = [...new Set(fonts.filter((f) => !f.fontsource).map((f) => f.name))];
  const notOnFontsource = unavailable.length
    ? `# ${unavailable.join(', ')}: not on Fontsource, see the font page for self-host files.`
    : '';

  const install = pkgs.length
    ? [`pnpm add ${pkgs.join(' ')}`, `# npm install ${pkgs.join(' ')}`, notOnFontsource]
        .filter(Boolean)
        .join('\n')
    : notOnFontsource;

  const imports =
    [...new Set(fonts.flatMap((f) => f.fontsourceImports))]
      .map((p) => `import '${p}';`)
      .join('\n') || '/* no Fontsource packages */';

  const faces = [
    ...new Map(
      fonts.filter((f) => f.fallbackFace).map((f) => [f.fallbackFace, f.fallbackFace]),
    ).keys(),
  ].join('\n\n');

  const vars = roles.map((role, i) => `  --font-${role}: ${fonts[i].cssFamily};`).join('\n');

  const css = `${faces ? faces + '\n\n' : ''}:root {\n${vars}\n}`;
  const tailwind = `@theme {\n${vars}\n}`;

  const everything = [
    '/* 1. Install (shell) */',
    install,
    '',
    '/* 2. Import once, in your entry or a fonts.css */',
    imports,
    '',
    '/* 3. CSS variables and fallback faces */',
    css,
    '',
    '/* 4. Tailwind v4: use instead of the :root block in step 3 (keep the fallback faces) */',
    tailwind,
  ].join('\n');

  return { install, imports, css, tailwind, everything };
}
