/**
 * Reqore's window size classes: Material 3's (decision 031). A phone below 600px, a tablet to
 * 1199, a desktop from 1200, wide from 1600; each width in exactly one class.
 *
 * Before: the provider asked `(max-width: 480px)` and `(min-width: 480px) and (max-width:
 * 1200px)`, so at exactly 480px a window was a phone AND a tablet, a 599px window was a tablet,
 * and the numbers were not exported, so every app copied them (the IDE wrote its own 768).
 *
 * `useReqoreMedia` decides once per module load whether it can query, so `matchMedia` is in
 * place before the provider is imported.
 */
import { act, render } from '@testing-library/react';
import { afterAll, describe, expect, it } from 'vitest';
import {
  getReqoreWindowSizeClass,
  REQORE_BREAKPOINT_EDGE_PX,
  REQORE_BREAKPOINTS,
  reqoreMedia,
  TReqoreWindowSizeClass,
} from '../src/constants/breakpoints';

/** The window's width the media queries answer for. */
let width = 1440;

/** Answers `(min-width: Npx)` / `(max-width: Npx)` clauses joined by `and`, as a browser does. */
const matchesAt = (query: string, at: number): boolean =>
  query.split(' and ').every((clause) => {
    const range = clause.match(/\((min|max)-width:\s*([\d.]+)px\)/);

    if (!range) {
      return false;
    }

    const px = parseFloat(range[2]);

    return range[1] === 'min' ? at >= px : at <= px;
  });

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => ({
    get matches() {
      return matchesAt(query, width);
    },
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

const { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider, useReqoreProperty } = await import(
  '../src/index'
);

afterAll(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

const CLASSES: TReqoreWindowSizeClass[] = ['compact', 'medium', 'expanded', 'large', 'extraLarge'];

const Probe = () => {
  const windowSizeClass = useReqoreProperty('windowSizeClass');
  const isMobile = useReqoreProperty('isMobile');
  const isTablet = useReqoreProperty('isTablet');
  const isMobileOrTablet = useReqoreProperty('isMobileOrTablet');

  return (
    <span className='probe'>
      {JSON.stringify({ windowSizeClass, isMobile, isTablet, isMobileOrTablet })}
    </span>
  );
};

/** What the provider says at a window width. */
const flagsAt = (at: number) => {
  width = at;

  const { container, unmount } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Probe />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const text = container.querySelector('.probe')?.textContent ?? '';

  act(() => unmount());

  return JSON.parse(text);
};

describe('the window size classes', () => {
  it('are Material 3’s', () => {
    expect(REQORE_BREAKPOINTS).toEqual({ medium: 600, expanded: 840, large: 1200, extraLarge: 1600 });
  });

  it('never give a width two classes, and give the one getReqoreWindowSizeClass names', () => {
    // every hundredth of a px across each edge, and the whole range in whole px
    const edges = Object.values(REQORE_BREAKPOINTS).flatMap((px) =>
      Array.from({ length: 201 }, (_, i) => Math.round((px - 1 + i / 100) * 100) / 100)
    );
    const widths = [...edges, ...Array.from({ length: 2001 }, (_, i) => i)];
    const inTheEdge = (at: number) =>
      Object.values(REQORE_BREAKPOINTS).some((px) => at > px - REQORE_BREAKPOINT_EDGE_PX && at < px);

    for (const at of widths) {
      const matched = CLASSES.filter((sizeClass) => matchesAt(reqoreMedia.only(sizeClass), at));

      // Bootstrap's gap: between 599.98 and 600 (a zoomed window can be 599.99) no range query
      // answers; the provider's chain of "narrower than" queries does (medium), and so does
      // getReqoreWindowSizeClass. Nowhere is a width in two classes.
      expect(matched, `${at}px`).toEqual(inTheEdge(at) ? [] : [getReqoreWindowSizeClass(at)]);
    }
  });

  it('end just below the next one, as Bootstrap writes it', () => {
    expect(reqoreMedia.below('medium')).toBe('(max-width: 599.98px)');
    expect(reqoreMedia.from('large')).toBe('(min-width: 1200px)');
    expect(reqoreMedia.between('medium', 'large')).toBe(
      '(min-width: 600px) and (max-width: 1199.98px)'
    );
    expect(getReqoreWindowSizeClass(599.98)).toBe('compact');
    expect(getReqoreWindowSizeClass(599.99)).toBe('medium');
  });
});

describe('the provider at the edges', () => {
  it.each([
    [390, 'compact', true, false],
    [480, 'compact', true, false],
    [599, 'compact', true, false],
    [600, 'medium', false, true],
    [839, 'medium', false, true],
    [840, 'expanded', false, true],
    [1199, 'expanded', false, true],
    [1200, 'large', false, false],
    [1599, 'large', false, false],
    [1600, 'extraLarge', false, false],
  ] as const)('%ipx is %s (a phone: %s, a tablet: %s)', (at, windowSizeClass, isMobile, isTablet) => {
    expect(flagsAt(at)).toEqual({
      windowSizeClass,
      isMobile,
      isTablet,
      isMobileOrTablet: isMobile || isTablet,
    });
  });
});
