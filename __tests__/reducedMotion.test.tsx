/**
 * Reqore honours the user's request for reduced motion (`prefers-reduced-motion: reduce`, WCAG 2.3.3): its spring
 * animations - a fade, a slide, a reveal - settle at once at their end, and its CSS transitions take no time (that
 * one is checked in a browser: Form/Input "Transitions Under Reduced Motion"). A
 * contrast check of a page in that mode measures what stays on screen, not a frame of a fade: an input's clear
 * button, faded in by a spring, was measured on its way in (1.4-2.6:1, the IDE's gate) and rests at 4.8:1.
 */
import { Globals } from '@react-spring/web';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ReqoreInput, ReqoreUIProvider } from '../src';
import { getInputClearButtonOpacity } from '../src/components/Input';
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

  test("Reqore's springs skip to their end", () => {
    renderInput();

    expect(Globals.skipAnimation).toBe(true);
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
    expect(Globals.skipAnimation).toBe(false);
  });
});
