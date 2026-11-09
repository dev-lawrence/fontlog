/**
 * Site-wide font switcher: "wear" a catalogue font across Fontlog.
 *
 * State lives in localStorage (`fontlog.siteType.v1`). A shared link carries
 * `?siteFont=<slug>&siteScope=<scope>`; the head script in BaseLayout applies it
 * before first paint, and this module strips it from the URL so filter and
 * pairing URLs never have to know about it.
 *
 * Specimens set their own font-family inline and code uses font-mono, so only
 * the site's heading/body roles change.
 */
import type { SiteFontEntry } from '../lib/site-fonts';

export type Scope = 'headings' | 'body' | 'all';
export const SCOPES: Scope[] = ['headings', 'body', 'all'];
export const SCOPE_LABELS: Record<Scope, string> = {
  headings: 'Headings',
  body: 'Body',
  all: 'Everything',
};

export interface SiteFontState {
  /** Slug being worn, or null for Fontlog's own fonts. */
  font: string | null;
  scope: Scope;
  status: 'idle' | 'loading' | 'error';
  /** Slug that is loading or failed, when status isn't idle. */
  pending: string | null;
}

const KEY = 'fontlog.siteType.v1';
const EVENT = 'fontlog:sitefont';

export const manifest: Record<string, SiteFontEntry> = (() => {
  try {
    return JSON.parse(document.getElementById('site-font-manifest')?.textContent ?? '{}');
  } catch {
    return {};
  }
})();

const root = document.documentElement;
const initial = (window as unknown as { __fontlogSiteFont?: { font: string; scope: Scope } })
  .__fontlogSiteFont;

let state: SiteFontState = {
  font: initial && manifest[initial.font] ? initial.font : null,
  scope: initial && SCOPES.includes(initial.scope) ? initial.scope : 'all',
  status: 'idle',
  pending: null,
};

// A shared link has done its job once applied; keep it out of later URLs.
{
  const p = new URLSearchParams(location.search);
  if (p.has('siteFont') || p.has('siteScope')) {
    p.delete('siteFont');
    p.delete('siteScope');
    const qs = p.toString();
    history.replaceState(history.state, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    save();
  }
}

export function getState(): SiteFontState {
  return state;
}

export function subscribe(fn: (s: SiteFontState) => void): () => void {
  const h = () => fn(state);
  document.addEventListener(EVENT, h);
  return () => document.removeEventListener(EVENT, h);
}

function emit() {
  document.dispatchEvent(new CustomEvent(EVENT));
}

function save() {
  try {
    if (state.font) localStorage.setItem(KEY, JSON.stringify({ font: state.font, scope: state.scope }));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the choice just won't persist */
  }
}

export function familyCss(slug: string): string {
  const f = manifest[slug];
  return f ? `"${f.family}", ${f.generic}` : '';
}

const loads = new Map<string, Promise<void>>();

/** Fetch the full-range stylesheet for a font and wait until its faces are usable. */
export function loadFont(slug: string): Promise<void> {
  const f = manifest[slug];
  if (!f) return Promise.reject(new Error('unknown font'));
  let p = loads.get(slug);
  if (p) return p;
  p = new Promise<void>((resolve, reject) => {
    const id = `sf-${slug}`;
    let link = document.getElementById(id) as HTMLLinkElement | null;
    const done = () =>
      Promise.all(
        [400, 600].map((w) => document.fonts.load(`${w} 1em "${f.family}"`, 'Ag')),
      ).then((faces) => (faces.some((x) => x.length) ? resolve() : reject(new Error('no faces'))), reject);
    if (link && link.sheet) {
      done();
      return;
    }
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${f.spec}&display=swap`;
      document.head.append(link);
    }
    link.addEventListener('load', done, { once: true });
    link.addEventListener(
      'error',
      () => {
        link?.remove(); // so a retry fetches again instead of reusing the dead link
        reject(new Error('stylesheet failed'));
      },
      { once: true },
    );
  });
  p.catch(() => loads.delete(slug));
  loads.set(slug, p);
  return p;
}

function paint() {
  const css = state.font ? familyCss(state.font) : '';
  const heading = css && state.scope !== 'body' ? css : '';
  const body = css && state.scope !== 'headings' ? css : '';
  if (heading) root.style.setProperty('--site-heading', heading);
  else root.style.removeProperty('--site-heading');
  if (body) root.style.setProperty('--site-body', body);
  else root.style.removeProperty('--site-body');
  if (state.font) {
    root.dataset.siteFont = state.font;
    root.dataset.siteScope = state.scope;
  } else {
    delete root.dataset.siteFont;
    delete root.dataset.siteScope;
  }
}

function transition(update: () => void) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduce && doc.startViewTransition) doc.startViewTransition(update);
  else update();
}

let token = 0;

/** Wear `slug` across the site. Keeps the current scope unless one is given. */
export async function setFont(slug: string | null, scope?: Scope): Promise<void> {
  const mine = ++token;
  if (!slug || !manifest[slug]) {
    state = { font: null, scope: scope ?? state.scope, status: 'idle', pending: null };
    save();
    transition(paint);
    emit();
    return;
  }
  state = { ...state, status: 'loading', pending: slug };
  emit();
  try {
    await loadFont(slug);
  } catch {
    if (mine !== token) return;
    state = { ...state, status: 'error', pending: slug };
    emit();
    return;
  }
  if (mine !== token) return; // a newer pick won
  // Read scope now, not when loading started: the visitor may have changed it meanwhile.
  state = { font: slug, scope: scope ?? state.scope, status: 'idle', pending: null };
  save();
  transition(paint);
  emit();
}

export function setScope(scope: Scope) {
  if (!SCOPES.includes(scope)) return;
  state = { ...state, scope };
  save();
  transition(paint);
  emit();
}

export function reset() {
  void setFont(null);
}

/** Link that reproduces the current choice on any page. */
export function shareUrl(): string {
  const u = new URL(location.href);
  u.hash = '';
  if (state.font) {
    u.searchParams.set('siteFont', state.font);
    u.searchParams.set('siteScope', state.scope);
  }
  return u.toString();
}

/** Name of whatever is currently setting the site's headings. */
export function currentName(): string {
  return state.font ? manifest[state.font]?.name ?? 'Fontlog' : 'Fontlog’s own fonts';
}

// Head script painted the saved font before load; make sure the files arrive and
// fall back cleanly if they can't.
if (state.font) {
  const slug = state.font;
  loadFont(slug).catch(() => {
    if (state.font !== slug) return;
    state = { ...state, font: null, status: 'error', pending: slug };
    paint();
    emit();
  });
}
