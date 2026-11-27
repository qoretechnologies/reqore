/**
 * Reqore honours the user's request for reduced motion (`prefers-reduced-motion: reduce`, WCAG
 * 2.3.3), and changes nothing for anyone who has not asked for it: its CSS transitions take no time
 * (the provider's rule, scoped to Reqore's own elements, in the layout and in the portals; jsdom
 * drops the provider's global style, so the rule is checked as `getReducedMotionCss` builds it), an
 * input's clear button is at its settled opacity from its first paint, and a scroll the library
 * starts jumps instead of gliding.
 */
import { Globals, animated, useSpring } from '@react-spring/web';
import { render } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  ReqoreContent,
  ReqoreDrawer,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import {
  getReducedMotionCss,
  getReducedMotionSelectors,
  REDUCED_MOTION_SELECTORS,
} from '../src/containers/UIProvider';
import { smoothScrollBehavior } from '../src/hooks/usePrefersReducedMotion';
import { clearReducedMotion, mockReducedMotion } from './shared/reducedMotion';

const clearButton = () => document.querySelector('.reqore-clear-input-button') as HTMLElement;

const renderInput = () =>
  render(
    <ReqoreUIProvider>
      <ReqoreInput value='a value' onChange={() => undefined} onClearClick={() => undefined} />
    </ReqoreUIProvider>
  );

/** The app's own fade, on react-spring, on an element of its own. */
const AppFade = () => {
  const styles = useSpring({ from: { opacity: 0 }, to: { opacity: 1 } });

  return <animated.div className='app-fade' style={styles} />;
};

/** Whether the provider's reduced-motion rule stills `element`, given its selectors. */
const isStilledBy = (selectors: string[], element: Element) =>
  selectors.filter((selector) => !selector.includes('::')).some((selector) => element.matches(selector));

afterEach(() => {
  clearReducedMotion();
});

describe('under prefers-reduced-motion', () => {
  beforeEach(() => {
    mockReducedMotion(true);
  });

  test("an input's clear button is at its settled opacity from its first paint", () => {
    renderInput();

    expect(Number(clearButton().style.opacity)).toBe(0.5);
  });

  test("react-spring's global switch is left alone, so the app's own springs animate", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <AppFade />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(Globals.skipAnimation).toBeFalsy();
    expect(Number((document.querySelector('.app-fade') as HTMLElement).style.opacity)).toBe(0);
  });

  test('a scroll the library starts jumps, read as the scroll starts', () => {
    expect(smoothScrollBehavior()).toBe('auto');
    mockReducedMotion(false);
    expect(smoothScrollBehavior()).toBe('smooth');
  });
});

describe('without it', () => {
  beforeEach(() => {
    mockReducedMotion(false);
  });

  test("an input's clear button fades in, as before", () => {
    renderInput();

    expect(Number(clearButton().style.opacity)).toBeLessThan(0.5);
  });

  test('a scroll the library starts is smooth, as before', () => {
    expect(smoothScrollBehavior()).toBe('smooth');
  });
});

test('the transitions rule is written only inside the reduced-motion media query', () => {
  const css = getReducedMotionCss('#app-portal');

  expect(css.startsWith('@media (prefers-reduced-motion: reduce) {')).toBe(true);
  expect(css).toContain('transition-duration: 0.01ms !important');
  expect(css).toContain(REDUCED_MOTION_SELECTORS[1]);
  expect(css).toContain("#app-portal [class^='reqore-']");
  // the app's portal is in it only where the app names one
  expect(getReducedMotionCss()).not.toContain('#app-portal');
});

test("the transitions rule stills Reqore's elements, not the app's own inside the layout", () => {
  mockReducedMotion(false);
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <AppFade />
          <ReqoreInput value='a value' onChange={() => undefined} onClearClick={() => undefined} />
          <ReqoreDrawer isOpen label='Drawer'>
            <span className='app-label'>Content</span>
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(isStilledBy(REDUCED_MOTION_SELECTORS, document.querySelector('.app-fade')!)).toBe(false);
  expect(isStilledBy(REDUCED_MOTION_SELECTORS, document.querySelector('.app-label')!)).toBe(false);
  expect(isStilledBy(REDUCED_MOTION_SELECTORS, document.querySelector('.reqore-layout-wrapper')!)).toBe(true);
  expect(isStilledBy(REDUCED_MOTION_SELECTORS, clearButton())).toBe(true);
  // in the portal
  expect(isStilledBy(REDUCED_MOTION_SELECTORS, document.querySelector('.reqore-drawer-wrapper')!)).toBe(true);
  // never a universal selector, which would reach the app's own elements
  expect(REDUCED_MOTION_SELECTORS.some((selector) => /(^|\s)\*/.test(selector))).toBe(false);
});

test("stills Reqore's elements in the portal the app names", () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div id="app-portal"><div class="reqore-drawer" id="drawer-in-app-portal"></div></div>'
  );
  try {
    const drawer = document.getElementById('drawer-in-app-portal')!;

    expect(isStilledBy(getReducedMotionSelectors('#app-portal'), drawer)).toBe(true);
    // Reqore's own portal alone does not reach it
    expect(isStilledBy(REDUCED_MOTION_SELECTORS, drawer)).toBe(false);
  } finally {
    document.getElementById('app-portal')?.remove();
  }
});

test('the library never names smooth scrolling itself: it asks smoothScrollBehavior()', () => {
  const SRC = join(process.cwd(), 'src');
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        return name === 'stories' ? [] : walk(path);
      }
      return /\.tsx?$/.test(name) ? [path] : [];
    });
  const smooth = walk(SRC).flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .map((text, index) => ({ text, line: index + 1 }))
      .filter(({ text }) => /behavior:\s*['"`]smooth['"`]|scroll-behavior\s*:\s*smooth/.test(text))
      .map(({ text, line }) => `${relative(process.cwd(), file)}:${line} ${text.trim()}`)
  );

  expect(smooth).toEqual([]);
});
