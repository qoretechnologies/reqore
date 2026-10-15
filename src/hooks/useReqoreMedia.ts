import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Whether this environment can answer a media query at all. Decided ONCE at
 * module load, on purpose: a test that defines `window.matchMedia` after the
 * module loaded (several do, to drive their own hooks) must not be able to
 * flip it, and hand its own stub to every Reqore component.
 *
 * jsdom has no `matchMedia`, so unit tests get fixed defaults. A real browser —
 * the app, the Storybook dev server AND the browser-mode story runner — gets
 * live queries, which is what makes a mobile story able to prove a breakpoint
 * branch. The previous guard keyed on `NODE_ENV === 'test'`, which Vitest also
 * sets for browser-mode stories, so every width-dependent behaviour in the
 * library was unprovable by a story.
 */
export const CAN_QUERY_MEDIA =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * Whether a media query matches, live: `defaultState` where media queries
 * cannot be evaluated (jsdom, SSR), instead of throwing. Reqore owns the
 * breakpoints: this is for Reqore's own components — the provider's `isMobile` /
 * `isTablet` / `isHoverCapable` and the drawer's sheet breakpoint — not a
 * licence for a consumer to hand-roll a query of its own.
 *
 * The FIRST render already has the answer. It used to be react-use's
 * `useMedia(query, defaultState)`, which renders `defaultState` first and only
 * asks the browser in an effect: on a phone, a `responsiveLayout` drawer
 * mounted as the caller's side panel for one render before it became a sheet,
 * and a floating one kept the side panel's `right: 10px` from that render (a
 * 380px sheet on a 390px phone).
 *
 * And it is hydration-safe: the query is an external store
 * (`useSyncExternalStore`), whose server snapshot is `defaultState`. A page
 * rendered on a server (the docs site renders `ReqoreUIProvider` there) is
 * hydrated with the server's answer, so React finds what the server drew, and
 * the browser's answer follows straight after. Asked in `useState`'s
 * initialiser, the browser's answer was in the hydrating render itself: a
 * phone's `isMobile` against the server's `false`, a mismatch. A page rendered
 * only in the browser still has the browser's answer from its first render.
 */
export const useReqoreMedia = (query: string, defaultState = false): boolean => {
  // One list per query: `matchMedia` makes a new one on every call, and the snapshot is read on
  // every render.
  const list = useMemo(() => (CAN_QUERY_MEDIA ? window.matchMedia(query) : undefined), [query]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      list?.addEventListener('change', onChange);

      return () => list?.removeEventListener('change', onChange);
    },
    [list]
  );
  const getSnapshot = useCallback(() => (list ? list.matches : defaultState), [list, defaultState]);
  const getServerSnapshot = useCallback(() => defaultState, [defaultState]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
