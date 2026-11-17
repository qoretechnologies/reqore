/**
 * Reqore's window size classes: where a phone ends, a tablet starts and a desktop starts.
 *
 * They are Material 3's (decision 031, Filip, 17 Nov 2026): compact below 600px, medium
 * 600-839, expanded 840-1199, large 1200-1599 and extra-large from 1600. Every phone held
 * upright is 360-440px wide, so the phone line at 600 moves no phone; what it decides is a
 * narrow or split window (481-599px, a phone layout) and an iPad mini held upright or a phone
 * on its side (600px and up, a tablet layout). It was 480, and the IDE's own 768.
 *
 * These are WINDOW classes. A component that lays itself out by its own box keeps its own
 * container rule (`NARROW_CONTAINER_BREAKPOINT_PX`, `SEVERITY_ROW_NARROW_BREAKPOINT_PX`,
 * `DRAWER_SHEET_BREAKPOINT`).
 *
 * An app reads the numbers from here, in CSS (`reqoreMedia`) and in JS (`windowSizeClass`,
 * `isMobile`, `isTablet` from the provider), and never writes a width of its own.
 */
export const REQORE_BREAKPOINTS = {
  /** A tablet from here (Material's medium); narrower is a phone (compact). */
  medium: 600,
  /** A large tablet from here (Material's expanded). */
  expanded: 840,
  /** A desktop from here (Material's large). */
  large: 1200,
  /** A wide desktop from here (Material's extra-large). */
  extraLarge: 1600,
} as const;

export type TReqoreBreakpoint = keyof typeof REQORE_BREAKPOINTS;

/** The class a window's width falls in: `compact` (a phone) up to `extraLarge`. */
export type TReqoreWindowSizeClass = 'compact' | TReqoreBreakpoint;

/**
 * How far below a breakpoint its lower range ends, in px. Bootstrap's .02: `max-width: 599.98px`
 * and `min-width: 600px` meet without overlapping, and a fractional width (a zoomed or high-DPI
 * window) falls in one of them. It was `max-width: 480px` with `min-width: 480px`, and at exactly
 * 480px a window was a phone AND a tablet.
 */
export const REQORE_BREAKPOINT_EDGE_PX = 0.02;

const lastPxBelow = (breakpoint: TReqoreBreakpoint) =>
  REQORE_BREAKPOINTS[breakpoint] - REQORE_BREAKPOINT_EDGE_PX;

/**
 * Media queries for the window size classes, for CSS (styled-components) and `useReqoreMedia`.
 *
 * ```ts
 * css`@media ${reqoreMedia.below('medium')} { ... }`   // a phone
 * useReqoreMedia(reqoreMedia.from('large'))             // a desktop
 * ```
 */
export const reqoreMedia = {
  /** Narrower than `breakpoint`: `below('medium')` is a phone. */
  below: (breakpoint: TReqoreBreakpoint): string => `(max-width: ${lastPxBelow(breakpoint)}px)`,
  /** At least `breakpoint` wide: `from('large')` is a desktop. */
  from: (breakpoint: TReqoreBreakpoint): string => `(min-width: ${REQORE_BREAKPOINTS[breakpoint]}px)`,
  /** From `from`, narrower than `to`: `between('medium', 'large')` is a tablet. */
  between: (from: TReqoreBreakpoint, to: TReqoreBreakpoint): string =>
    `${reqoreMedia.from(from)} and ${reqoreMedia.below(to)}`,
  /** Exactly one window size class. */
  only: (sizeClass: TReqoreWindowSizeClass): string => {
    switch (sizeClass) {
      case 'compact':
        return reqoreMedia.below('medium');
      case 'medium':
        return reqoreMedia.between('medium', 'expanded');
      case 'expanded':
        return reqoreMedia.between('expanded', 'large');
      case 'large':
        return reqoreMedia.between('large', 'extraLarge');
      default:
        return reqoreMedia.from('extraLarge');
    }
  },
};

/**
 * The window size class of a width in px, as the media queries above answer it: 599.98 is
 * still `compact`, 599.99 is `medium`.
 */
export const getReqoreWindowSizeClass = (width: number): TReqoreWindowSizeClass => {
  if (width <= lastPxBelow('medium')) {
    return 'compact';
  }

  if (width <= lastPxBelow('expanded')) {
    return 'medium';
  }

  if (width <= lastPxBelow('large')) {
    return 'expanded';
  }

  return width <= lastPxBelow('extraLarge') ? 'large' : 'extraLarge';
};
