import { useEffect, useState } from 'react';

/** The media query the reduced-motion preference is read from. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether the user has asked the system for reduced motion, read now. `false` wherever the
 * query cannot be evaluated (server rendering, a test environment without `matchMedia`).
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * `prefersReducedMotion()`, kept current: a component using it re-renders when the preference
 * changes while it is on screen (a user switching "Reduce motion" on with the page open).
 */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReduced(!!query.matches);

    update();

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', update);

      return () => query.removeEventListener('change', update);
    }

    // Safari before 14 only has the deprecated listener API.
    query.addListener?.(update);

    return () => query.removeListener?.(update);
  }, []);

  return reduced;
};
