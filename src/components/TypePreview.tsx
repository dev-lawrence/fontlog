import { useId, useState, type CSSProperties } from 'react';

interface Props {
  family: string;
  variable: boolean;
  weights: number[];
  defaultWeight: number;
  defaultText: string;
  fallback?: string;
}

const SIZES = { min: 14, max: 160 };

export default function TypePreview({
  family,
  variable,
  weights,
  defaultWeight,
  defaultText,
  fallback = 'system-ui, sans-serif',
}: Props) {
  const [text, setText] = useState(defaultText);
  const [size, setSize] = useState(72);
  const [weight, setWeight] = useState(clampWeight(defaultWeight, weights));
  const [dark, setDark] = useState(false);

  const sizeId = useId();
  const weightId = useId();

  const min = weights[0];
  const max = weights[weights.length - 1];
  const canChangeWeight = weights.length > 1;

  const specimenStyle: CSSProperties = {
    fontFamily: `"${family}", ${fallback}`,
    fontSize: `${size}px`,
    lineHeight: 1.08,
    fontWeight: weight,
    fontVariationSettings: variable ? `"wght" ${weight}` : undefined,
  };

  return (
    <div className="not-prose border-border overflow-hidden rounded-xl border">
      <div className="border-border bg-surface flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3 text-sm">
        <label className="flex items-center gap-2" htmlFor={sizeId}>
          <span className="text-muted">Size</span>
          <input
            id={sizeId}
            type="range"
            min={SIZES.min}
            max={SIZES.max}
            value={size}
            onChange={(e) => setSize(Number(e.currentTarget.value))}
            className="accent-accent"
          />
          <span className="text-faint w-10 tabular-nums">{size}</span>
        </label>

        <label className="flex items-center gap-2" htmlFor={weightId}>
          <span className="text-muted">Weight</span>
          <input
            id={weightId}
            type="range"
            min={variable ? min : 0}
            max={variable ? max : weights.length - 1}
            step={1}
            disabled={!canChangeWeight}
            value={variable ? weight : Math.max(0, weights.indexOf(weight))}
            onChange={(e) => {
              const v = Number(e.currentTarget.value);
              setWeight(variable ? v : weights[v]);
            }}
            className="accent-accent disabled:opacity-40"
          />
          <span className="text-faint w-10 tabular-nums">{weight}</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => setDark(e.currentTarget.checked)}
            className="accent-accent"
          />
          <span className="text-muted">Dark</span>
        </label>

        <button
          type="button"
          onClick={() => {
            setText(defaultText);
            setSize(72);
            setWeight(clampWeight(defaultWeight, weights));
          }}
          className="text-muted hover:text-text ml-auto underline-offset-4 hover:underline"
        >
          Reset
        </button>
      </div>

      <div
        className="px-4 py-6 transition-colors sm:px-6 sm:py-8"
        style={{
          background: dark ? '#0c0c0b' : '#ffffff',
          color: dark ? '#f2f2ef' : '#141410',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          spellCheck={false}
          rows={2}
          aria-label={`Editable ${family} preview text`}
          className="w-full resize-y bg-transparent outline-none placeholder:opacity-40"
          style={specimenStyle}
        />
      </div>
    </div>
  );
}

function clampWeight(w: number, weights: number[]): number {
  if (weights.includes(w)) return w;
  return weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a), weights[0]);
}
