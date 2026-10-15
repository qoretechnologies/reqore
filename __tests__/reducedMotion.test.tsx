/**
 * Reqore honours the user's request for reduced motion (`prefers-reduced-motion: reduce`, WCAG
 * 2.3.3): its spring animations - a fade, a slide, a reveal - settle at once at their end, and its
 * CSS transitions take no time (that one is checked in a browser: Form/Input "Transitions Under
 * Reduced Motion"). A contrast check of a page in that mode measures what stays on screen, not a
 * frame of a fade: an input's clear button, faded in by a spring, was measured on its way in
 * (1.4-2.6:1, the IDE's gate) and rests at 4.8:1.
 *
 * Reqore's own motion only. Its springs are `immediate` in their own components: the provider used
 * to turn on react-spring's global `skipAnimation`, which settled the app's springs too, and its
 * transitions rule named every element inside the layout and the portal, the app's own included.
 * The rule names Reqore's elements now.
 */
import { animated, Globals, useSpring } from '@react-spring/web';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  ReqoreContent,
  ReqoreDrawer,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import { getInputClearButtonOpacity } from '../src/components/Input';
import { REDUCED_MOTION_SELECTORS } from '../src/containers/UIProvider';
import { DEFAULT_THEME } from '../src/constants/theme';
import { buildTheme } from '../src/helpers/colors';
import { REDUCED_MOTION_QUERY } from '../src/hooks/usePrefersReducedMotion';

/** jsdom has no `matchMedia`: one that answers the reduced-motion query as `reduced` says. */
const mockReducedMotion = (reduced: boolean) => {
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

const appFade = () => document.querySelector('.app-fade') as HTMLElement;

const renderApp = () =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <AppFade />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const drawerBox = () => document.querySelector('.reqore-drawer-resizable') as HTMLElement;

const renderDrawer = () =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen label='Drawer'>
            Content
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** Whether the provider's reduced-motion rule stills `element` (REDUCED_MOTION_SELECTORS). */
const isStilled = (element: Element) =>
  REDUCED_MOTION_SELECTORS.filter((selector) => !selector.includes('::')).some((selector) =>
    element.matches(selector)
  );

describe('under prefers-reduced-motion', () => {
  beforeEach(() => {
    mockReducedMotion(true);
  });

  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  test("an input's clear button is at its settled opacity on first paint", () => {
    renderInput();

    expect(clearButton()).toBeTruthy();
    expect(Number(clearButton().style.opacity)).toBe(
      getInputClearButtonOpacity(buildTheme(DEFAULT_THEME))
    );
  });

  test('a drawer, and its backdrop, are in place on first paint', () => {
    renderDrawer();

    expect(Number(drawerBox().style.opacity)).toBe(1);
    expect(
      Number((document.querySelector('.reqore-drawer-backdrop') as HTMLElement).style.opacity)
    ).toBe(1);
  });

  test("react-spring's global switch is left alone", () => {
    renderInput();

    expect(Globals.skipAnimation).toBeFalsy();
  });

  test("the app's own springs inside the layout animate as the app made them", () => {
    renderApp();

    expect(Number(appFade().style.opacity)).toBe(0);
  });

  test("the transitions rule stills Reqore's elements, not the app's own inside the layout", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <AppFade />
            <ReqoreInput
              value='a value'
              onChange={() => undefined}
              onClearClick={() => undefined}
            />
            <ReqoreDrawer isOpen label='Drawer'>
              <span className='app-label'>Content</span>
            </ReqoreDrawer>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(isStilled(appFade())).toBe(false);
    expect(isStilled(document.querySelector('.app-label')!)).toBe(false);
    expect(isStilled(document.querySelector('.reqore-layout-wrapper')!)).toBe(true);
    expect(isStilled(clearButton())).toBe(true);
    // in the portal
    expect(isStilled(drawerBox())).toBe(true);
    expect(REDUCED_MOTION_SELECTORS.some((selector) => /(^|\s)\*/.test(selector))).toBe(false);
  });
});

describe('without it', () => {
  beforeEach(() => {
    mockReducedMotion(false);
  });

  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  test("an input's clear button fades in, as before", () => {
    renderInput();

    expect(clearButton()).toBeTruthy();
    expect(Number(clearButton().style.opacity)).toBeLessThan(
      getInputClearButtonOpacity(buildTheme(DEFAULT_THEME))
    );
    expect(Globals.skipAnimation).toBeFalsy();
  });

  test('a drawer fades in, as before', () => {
    renderDrawer();

    expect(Number(drawerBox().style.opacity)).toBeLessThan(1);
  });
});
