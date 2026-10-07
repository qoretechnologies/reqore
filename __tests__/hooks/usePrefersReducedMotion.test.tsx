import { act, render } from '@testing-library/react';
import {
  prefersReducedMotion,
  REDUCED_MOTION_QUERY,
  usePrefersReducedMotion,
} from '../../src/hooks/usePrefersReducedMotion';

const Probe = () => <span id='reduced'>{String(usePrefersReducedMotion())}</span>;
const reduced = () => document.querySelector('#reduced')!.textContent;

/** A media query list whose answer the test changes, notifying what listens to it. */
const mockQuery = (matches: boolean) => {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    media: REDUCED_MOTION_QUERY,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
  const matchMedia = window.matchMedia;

  window.matchMedia = ((asked: string) =>
    asked === REDUCED_MOTION_QUERY
      ? query
      : { ...query, matches: false }) as unknown as typeof window.matchMedia;

  return {
    change: (next: boolean) => {
      query.matches = next;
      listeners.forEach((listener) => listener());
    },
    listeners,
    restore: () => {
      window.matchMedia = matchMedia;
    },
  };
};

test('Reads false where the query cannot be evaluated', () => {
  const matchMedia = window.matchMedia;

  // jsdom has no matchMedia of its own.
  (window as { matchMedia?: unknown }).matchMedia = undefined;

  try {
    expect(prefersReducedMotion()).toBe(false);
    render(<Probe />);
    expect(reduced()).toBe('false');
  } finally {
    window.matchMedia = matchMedia;
  }
});

test('Reads the preference on the first render', () => {
  const query = mockQuery(true);

  try {
    expect(prefersReducedMotion()).toBe(true);
    render(<Probe />);
    expect(reduced()).toBe('true');
  } finally {
    query.restore();
  }
});

test('Follows the preference when it changes while mounted, and stops listening when unmounted', () => {
  const query = mockQuery(false);

  try {
    const { unmount } = render(<Probe />);

    expect(reduced()).toBe('false');

    act(() => query.change(true));
    expect(reduced()).toBe('true');

    act(() => query.change(false));
    expect(reduced()).toBe('false');

    unmount();
    expect(query.listeners.size).toBe(0);
  } finally {
    query.restore();
  }
});
