import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';

interface Props {
  family: string;
  variable: boolean;
  weights: number[];
  defaultWeight: number;
  defaultText: string;
  fallback?: string;
}

const SIZE = { min: 14, max: 160, initial: 72 };

const SAMPLES = [
  { id: 'sentence', label: 'Sentence' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'numbers', label: 'Numbers' },
] as const;
type SampleId = (typeof SAMPLES)[number]['id'];

const SAMPLE_TEXT: Record<Exclude<SampleId, 'sentence'>, string> = {
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789 1,234.56 12:30 #42 $9.99',
};

/** Independent canvas palettes; they do not follow the site theme. */
const CANVAS = {
  light: { background: '#fffefa', color: '#242821' },
  dark: { background: '#171916', color: '#f3f1e9' },
} as const;

export default function TypePreview({
  family,
  variable,
  weights: rawWeights,
  defaultWeight,
  defaultText,
  fallback = 'system-ui, sans-serif',
}: Props) {
  const weights = [...rawWeights].sort((a, b) => a - b);
  const startWeight = clampWeight(defaultWeight, weights);

  const [text, setText] = useState(defaultText);
  const [sample, setSample] = useState<SampleId | null>('sentence');
  const [size, setSize] = useState(SIZE.initial);
  const [weight, setWeight] = useState(startWeight);
  const [dark, setDark] = useState(false);
  const pageDark = useRef(false);
  const startSize = useRef(SIZE.initial);
  const area = useRef<HTMLTextAreaElement>(null);

  const textId = useId();
  const sizeId = useId();
  const weightId = useId();

  // Default the canvas to the page theme once hydrated.
  useEffect(() => {
    const d = document.documentElement.classList.contains('dark');
    pageDark.current = d;
    setDark(d);
    // 72px breaks words mid-way on phones; start smaller there.
    if (window.matchMedia('(max-width: 639px)').matches) {
      startSize.current = 44;
      setSize(44);
    }
  }, []);

  // Grow the textarea with its content so nothing is clipped.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text, size, weight]);

  const min = weights[0];
  const max = weights[weights.length - 1];
  const canChangeWeight = weights.length > 1;
  const palette = dark ? CANVAS.dark : CANVAS.light;

  const specimenStyle: CSSProperties = {
    fontFamily: `"${family}", ${fallback}`,
    fontSize: `${size}px`,
    lineHeight: 1.12,
    fontWeight: weight,
    fontVariationSettings: variable ? `"wght" ${weight}` : undefined,
    color: palette.color,
  };

  const reset = () => {
    setText(defaultText);
    setSample('sentence');
    setSize(startSize.current);
    setWeight(startWeight);
    setDark(pageDark.current);
  };

  const pickSample = (id: SampleId) => {
    setSample(id);
    setText(id === 'sentence' ? defaultText : SAMPLE_TEXT[id]);
  };

  return (
    <div className="border-divider bg-surface overflow-hidden rounded-xl border">
      <div className="border-divider flex flex-col gap-4 border-b p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div role="group" aria-label="Sample text" className="flex flex-wrap items-center gap-2">
            <span className="meta mr-1" aria-hidden="true">
              Sample
            </span>
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="chip"
                aria-pressed={sample === s.id}
                onClick={() => pickSample(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Preview background"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="meta mr-1" aria-hidden="true">
              Preview background
            </span>
            {(['light', 'dark'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className="chip"
                aria-pressed={(mode === 'dark') === dark}
                onClick={() => setDark(mode === 'dark')}
              >
                {mode === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor={sizeId} className="text-sm font-semibold">
              Size <span className="text-ink-2 font-normal tabular-nums">{size}px</span>
            </label>
            <input
              id={sizeId}
              type="range"
              min={SIZE.min}
              max={SIZE.max}
              value={size}
              onChange={(e) => setSize(Number(e.currentTarget.value))}
              className="accent-accent h-11 w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            {variable && canChangeWeight ? (
              <>
                <label htmlFor={weightId} className="text-sm font-semibold">
                  Weight <span className="text-ink-2 font-normal tabular-nums">{weight}</span>
                </label>
                <input
                  id={weightId}
                  type="range"
                  min={min}
                  max={max}
                  step={1}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.currentTarget.value))}
                  className="accent-accent h-11 w-full"
                />
              </>
            ) : (
              <div role="group" aria-labelledby={weightId}>
                <span id={weightId} className="block pb-1 text-sm font-semibold">
                  Weight{' '}
                  {!canChangeWeight && (
                    <span className="text-ink-2 font-normal tabular-nums">{weight} only</span>
                  )}
                </span>
                {canChangeWeight && (
                  <div className="flex flex-wrap gap-2">
                    {weights.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className="chip tabular-nums"
                        aria-pressed={weight === w}
                        onClick={() => setWeight(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="button" onClick={reset} className="btn btn-quiet sm:justify-self-start">
            Reset
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <label htmlFor={textId} className="mb-2 block text-sm font-semibold">
          Type your own text
        </label>
        <div
          className="min-h-72 overflow-hidden rounded-lg border px-4 py-5 sm:px-6 sm:py-7"
          style={{
            background: palette.background,
            color: palette.color,
            borderColor: dark ? '#3a4137' : '#d9d9ce',
          }}
        >
          <textarea
            ref={area}
            id={textId}
            value={text}
            onChange={(e) => {
              setText(e.currentTarget.value);
              setSample(null);
            }}
            spellCheck={false}
            rows={2}
            className="block w-full resize-none bg-transparent outline-offset-8 focus-visible:outline-2"
            style={specimenStyle}
          />
        </div>
      </div>
    </div>
  );
}

function clampWeight(w: number, weights: number[]): number {
  if (weights.includes(w)) return w;
  return weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), weights[0]);
}
