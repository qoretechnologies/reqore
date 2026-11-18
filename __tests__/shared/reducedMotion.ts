import { REDUCED_MOTION_QUERY } from '../../src/hooks/usePrefersReducedMotion';

/** jsdom has no `matchMedia`: one that answers whether reduced motion is asked for, and nothing else. */
export const mockReducedMotion = (reduced: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query === REDUCED_MOTION_QUERY ? reduced : false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
};
