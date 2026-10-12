import { useMedia } from 'react-use';

/**
 * Whether this environment can answer a media query at all. Decided ONCE at
 * module load, on purpose: `useReqoreMedia` calls `useMedia` only when this is
 * true, and a hook that appears in one render and not the next is a React
 * error — a test that defines `window.matchMedia` after the module loaded
 * (several do, to drive their own hooks) must not be able to flip it.
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
 * `useMedia` that degrades to `defaultState` where media queries cannot be
 * evaluated (jsdom, SSR) instead of throwing. Reqore owns the breakpoints:
 * this is for Reqore's own components — the provider's `isMobile` /
 * `isTablet` / `isHoverCapable` and the drawer's sheet breakpoint — not a
 * licence for a consumer to hand-roll a query of its own.
 */
export const useReqoreMedia = (query: string, defaultState = false): boolean =>
  CAN_QUERY_MEDIA ? useMedia(query, defaultState) : defaultState;
