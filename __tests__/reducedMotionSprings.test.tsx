/**
 * Under `prefers-reduced-motion: reduce`, a notification and an input's clear button are on screen as they settle
 * from their first paint: their own springs are immediate, whether or not react-spring's global `skipAnimation` is
 * on (here it is kept off, so that the components are shown to honour the preference themselves).
 */
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ReqoreInput, ReqoreNotification, ReqoreTextarea, ReqoreUIProvider } from '../src';
import { getInputClearButtonOpacity } from '../src/components/Input';
import { DEFAULT_THEME } from '../src/constants/theme';
import { buildTheme } from '../src/helpers/colors';
import { mockReducedMotion } from './shared/reducedMotion';

vi.mock('@react-spring/web', async (importOriginal) => {
  const spring = await importOriginal<typeof import('@react-spring/web')>();

  return {
    ...spring,
    Globals: {
      ...spring.Globals,
      // react-spring's own switch stays off: only the components' springs are under test
      assign: (globals: Parameters<typeof spring.Globals.assign>[0]) =>
        spring.Globals.assign({ ...globals, skipAnimation: false }),
    },
  };
});

/** jsdom has no `matchMedia`: one that answers the reduced-motion query as `reduced` says. */

const notification = () => document.querySelector('.reqore-notification') as HTMLElement;
const clearButton = () => document.querySelector('.reqore-clear-input-button') as HTMLElement;

afterEach(() => {
  delete (window as { matchMedia?: unknown }).matchMedia;
});

describe('under prefers-reduced-motion', () => {
  beforeEach(() => {
    mockReducedMotion(true);
  });

  test('a notification is on screen as it settles from its first paint', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' />
      </ReqoreUIProvider>
    );

    expect(Number(notification().style.opacity)).toBe(1);
    expect(notification().style.transform).toBe('scale(1)');
  });

  test("an input's and a text area's clear button is at its settled opacity from its first paint", () => {
    const settled = getInputClearButtonOpacity(buildTheme(DEFAULT_THEME));
    const { unmount } = render(
      <ReqoreUIProvider>
        <ReqoreInput value='a value' onChange={() => undefined} onClearClick={() => undefined} />
      </ReqoreUIProvider>
    );

    expect(Number(clearButton().style.opacity)).toBe(settled);

    unmount();
    render(
      <ReqoreUIProvider>
        <ReqoreTextarea value='a value' onChange={() => undefined} onClearClick={() => undefined} />
      </ReqoreUIProvider>
    );

    expect(Number(clearButton().style.opacity)).toBe(settled);
  });
});

describe('without it', () => {
  beforeEach(() => {
    mockReducedMotion(false);
  });

  test('a notification fades in', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' />
      </ReqoreUIProvider>
    );

    expect(Number(notification().style.opacity)).toBeLessThan(1);
  });
});
