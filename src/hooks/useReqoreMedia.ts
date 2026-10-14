import { useEffect, useState } from 'react';

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
 * 380px sheet on a 390px phone). Where the query can be evaluated it is asked
 * as the state is made, and the effect keeps it current from then on.
 */
export const useReqoreMedia = (query: string, defaultState = false): boolean => {
  const [matches, setMatches] = useState(() =>
    CAN_QUERY_MEDIA ? window.matchMedia(query).matches : defaultState
  );

  useEffect(() => {
    if (!CAN_QUERY_MEDIA) {
      return undefined;
    }

    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);

    // A new query, or a change between the render and this effect.
    update();
    list.addEventListener('change', update);

    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
};
