/**
 * Import specifiers for a Fontsource package. Variable packages load every
 * weight from the bare import; static packages only load 400 that way, so
 * each weight needs its own `<pkg>/<weight>.css` import.
 */
export function fontsourceImports(pkg: string, variable: boolean, weights: number[]): string[] {
  if (variable) return [pkg];
  return [...new Set(weights)].sort((a, b) => a - b).map((w) => `${pkg}/${w}.css`);
}
