import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';

import type { FontStack } from '../lib/stack';

type Role = 'heading' | 'body' | 'mono';

interface Props {
  stacks: FontStack[];
  defaults: Record<Role, string>;
}

const ROLES: Role[] = ['heading', 'body', 'mono'];

export default function PairPlayground({ stacks, defaults }: Props) {
  const bySlug = useMemo(() => new Map(stacks.map((s) => [s.slug, s])), [stacks]);
  const valid = (slug: string | null | undefined, fallback: string) =>
    slug && bySlug.has(slug) ? slug : fallback;

  const [picks, setPicks] = useState<Record<Role, string>>(() => {
    const p = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
    return {
      heading: valid(p.get('h'), defaults.heading),
      body: valid(p.get('b'), defaults.body),
      mono: valid(p.get('m'), defaults.mono),
    };
  });
  const [dark, setDark] = useState(false);
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  // Keep the URL in sync so a pairing is shareable.
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('h', picks.heading);
    p.set('b', picks.body);
    p.set('m', picks.mono);
    history.replaceState(null, '', `?${p.toString()}`);
  }, [picks]);

  const h = bySlug.get(picks.heading)!;
  const b = bySlug.get(picks.body)!;
  const m = bySlug.get(picks.mono)!;

  const files = useMemo(() => buildStack([h, b, m], ['heading', 'body', 'mono']), [h, b, m]);

  const previewVars = {
    '--pg-h': h.previewFamily,
    '--pg-b': b.previewFamily,
    '--pg-m': m.previewFamily,
    fontSize: `${scale}rem`,
    background: dark ? '#0c0c0b' : '#ffffff',
    color: dark ? '#f2f2ef' : '#141410',
  } as CSSProperties;

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const scaleId = useId();

  return (
    <div className="not-prose space-y-8">
      {/* Controls */}
      <div className="border-border bg-surface flex flex-wrap items-end gap-x-6 gap-y-4 rounded-xl border p-4">
        {ROLES.map((role) => (
          <label className="flex flex-col gap-1 text-sm" key={role}>
            <span className="text-muted capitalize">{role}</span>
            <select
              value={picks[role]}
              onChange={(e) => setPicks((p) => ({ ...p, [role]: e.currentTarget.value }))}
              className="border-border bg-bg min-w-44 rounded-md border px-2.5 py-1.5"
            >
              {stacks.map((s) => (
                <option value={s.slug} key={s.slug}>
                  {s.name} · {s.classification}
                </option>
              ))}
            </select>
          </label>
        ))}

        <label className="flex flex-col gap-1 text-sm" htmlFor={scaleId}>
          <span className="text-muted">Scale</span>
          <input
            id={scaleId}
            type="range"
            min={0.8}
            max={1.4}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.currentTarget.value))}
            className="accent-accent h-9"
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.currentTarget.checked)}
            className="accent-accent"
          />
          <span className="text-muted">Dark</span>
        </label>

        <div className="ml-auto flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => copy('link', location.href)}
            className="border-border text-muted hover:text-text rounded-md border px-3 py-1.5 transition"
          >
            {copied === 'link' ? 'Link copied' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPicks(defaults);
              setScale(1);
              setDark(false);
            }}
            className="border-border text-muted hover:text-text rounded-md border px-3 py-1.5 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mock */}
      <div
        className="border-border overflow-hidden rounded-xl border transition-colors"
        style={previewVars}
      >
        <Mock heading={h} body={b} mono={m} dark={dark} />
      </div>

      {/* Output */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Copy the stack</h2>
          <button
            type="button"
            onClick={() => copy('all', files.everything)}
            className="bg-accent text-accent-contrast rounded-md px-3 py-1.5 text-sm transition hover:opacity-90"
          >
            {copied === 'all' ? 'Copied' : 'Copy everything'}
          </button>
        </div>
        <div className="space-y-4">
          <Snippet label="Install" code={files.install} copied={copied} onCopy={copy} />
          <Snippet label="Import once" code={files.imports} copied={copied} onCopy={copy} />
          <Snippet
            label="CSS — zero-CLS fallback + variables"
            code={files.css}
            copied={copied}
            onCopy={copy}
            note="The fallback @font-face values are computed from each font's real metrics, so swapping in the web font causes no layout shift."
          />
          <Snippet
            label="Tailwind v4"
            code={files.tailwind}
            copied={copied}
            onCopy={copy}
            note="Generates font-heading / font-body / font-mono utilities."
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Mock({
  heading,
  body,
  mono,
  dark,
}: {
  heading: FontStack;
  body: FontStack;
  mono: FontStack;
  dark: boolean;
}) {
  const rule = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';
  const soft = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)';
  return (
    <div className="px-5 py-6 sm:px-10 sm:py-12" style={{ fontFamily: 'var(--pg-b)' }}>
      {/* nav */}
      <div
        className="flex items-center justify-between border-b pb-4 text-[0.95em]"
        style={{ borderColor: rule }}
      >
        <span className="font-semibold" style={{ fontFamily: 'var(--pg-h)' }}>
          Northwind
        </span>
        <div className="flex items-center gap-5">
          <span className="hidden opacity-70 sm:inline">Docs</span>
          <span className="hidden opacity-70 sm:inline">Pricing</span>
          <span
            className="rounded-full px-3 py-1 text-[0.9em]"
            style={{ background: dark ? '#f2f2ef' : '#141410', color: dark ? '#141410' : '#fff' }}
          >
            Sign up
          </span>
        </div>
      </div>

      {/* hero */}
      <p
        className="mt-10 text-[0.72em] font-medium tracking-[0.18em] uppercase opacity-60"
        style={{ fontFamily: 'var(--pg-m)' }}
      >
        Building blocks
      </p>
      <h1
        className="mt-3 text-[2.6em] leading-[1.05] font-bold tracking-[-0.02em]"
        style={{ fontFamily: 'var(--pg-h)' }}
      >
        Ship your interface in half the time.
      </h1>
      <p className="mt-5 max-w-[42ch] text-[1.05em] leading-relaxed opacity-80">
        A couple of lines of body copy, long enough to show the reading colour and rhythm of the
        text face next to the headline. Numbers like 1,240 and 3.5&times; sit in here too.
      </p>
      <div className="mt-7 flex items-center gap-5 text-[0.95em]">
        <span
          className="rounded-lg px-4 py-2 font-medium"
          style={{ background: dark ? '#f2f2ef' : '#141410', color: dark ? '#141410' : '#fff' }}
        >
          Get started
        </span>
        <span className="opacity-70">Read the docs &rarr;</span>
      </div>

      {/* code */}
      <pre
        className="mt-9 overflow-x-auto rounded-lg px-4 py-3 text-[0.85em] leading-relaxed"
        style={{ fontFamily: 'var(--pg-m)', background: soft }}
      >
        <code>{`$ npm i @northwind/ui\n+ @northwind/ui 2.4.0\nadded 1 package in 431ms`}</code>
      </pre>

      {/* table */}
      <div
        className="mt-9 text-[0.9em]"
        style={{ fontFamily: 'var(--pg-m)', fontVariantNumeric: 'tabular-nums' }}
      >
        {[
          ['Plan', 'Seats', 'Price'],
          ['Starter', '3', '$0'],
          ['Team', '12', '$49'],
          ['Business', '40', '$149'],
        ].map(([a, c, d], i) => (
          <div
            key={a}
            className="flex justify-between border-b py-1.5"
            style={{ borderColor: rule, opacity: i === 0 ? 0.55 : 1 }}
          >
            <span className="flex-1">{a}</span>
            <span className="w-16 text-right tabular-nums">{c}</span>
            <span className="w-20 text-right tabular-nums">{d}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[0.75em] opacity-45">
        Heading: {heading.name} · Body: {body.name} · Mono: {mono.name}
      </p>
    </div>
  );
}

function Snippet({
  label,
  code,
  note,
  copied,
  onCopy,
}: {
  label: string;
  code: string;
  note?: string;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <figure className="border-border bg-surface rounded-lg border">
      <figcaption className="border-border text-muted flex items-center justify-between border-b px-4 py-2 text-xs font-medium tracking-wide uppercase">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => onCopy(label, code)}
          className="text-faint hover:text-text normal-case transition"
        >
          {copied === label ? 'copied' : 'copy'}
        </button>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      {note && <p className="border-border text-muted border-t px-4 py-2.5 text-[13px]">{note}</p>}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */

function buildStack(fonts: FontStack[], roles: Role[]) {
  const pkgs = [...new Set(fonts.map((f) => f.fontsource).filter(Boolean))] as string[];

  const install = pkgs.length
    ? `pnpm add ${pkgs.join(' ')}\n# npm install ${pkgs.join(' ')}`
    : '# These fonts are not on Fontsource — see each font page for self-host files.';

  const imports = pkgs.map((p) => `import '${p}';`).join('\n') || '/* no Fontsource packages */';

  const faces = [
    ...new Map(
      fonts.filter((f) => f.fallbackFace).map((f) => [f.fallbackFace, f.fallbackFace]),
    ).keys(),
  ].join('\n\n');

  const vars = roles.map((role, i) => `  --font-${role}: ${fonts[i].cssFamily};`).join('\n');

  const css = `${faces ? faces + '\n\n' : ''}:root {\n${vars}\n}`;
  const tailwind = `@theme {\n${vars}\n}`;

  const everything = [
    '/* 1. Install */',
    install,
    '',
    '/* 2. Import once, in your entry or a fonts.css */',
    imports,
    '',
    '/* 3. Styles */',
    css,
  ].join('\n');

  return { install, imports, css, tailwind, everything };
}
