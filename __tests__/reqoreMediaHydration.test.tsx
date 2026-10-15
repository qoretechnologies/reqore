/**
 * `useReqoreMedia` has the browser's answer from a page's first render, and is safe to hydrate.
 *
 * Rendered only in the browser, the first render already answers the query (a `responsiveLayout`
 * drawer opened on a phone is a sheet from its first frame). Rendered on a server - the docs site
 * renders `ReqoreUIProvider` there - the server cannot ask, and draws `defaultState`; the browser's
 * first render, the hydrating one, must draw the same, or React finds a page that is not the one
 * the server drew. It asked `matchMedia` in that render too, and a phone's `true` met the server's
 * `false`.
 *
 * `CAN_QUERY_MEDIA` is decided when the module loads, so `matchMedia` is in place before it is
 * imported.
 */
import { act, render } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const QUERY = '(max-width: 480px)';
let matches = true;
const listeners = new Set<() => void>();

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => ({
    get matches() {
      return query === QUERY ? matches : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

const { CAN_QUERY_MEDIA, useReqoreMedia } = await import('../src/hooks/useReqoreMedia');

/** What each render of a component asking the query answered. */
let answers: boolean[] = [];

const Probe = () => {
  const answer = useReqoreMedia(QUERY);
  answers.push(answer);

  return <span className='answer'>{String(answer)}</span>;
};

describe('useReqoreMedia', () => {
  beforeEach(() => {
    matches = true;
    answers = [];
    listeners.clear();
  });

  afterAll(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('can ask the browser here', () => {
    expect(CAN_QUERY_MEDIA).toBe(true);
  });

  it("answers the browser's answer on the first render of a page drawn in the browser", () => {
    const { container } = render(<Probe />);

    expect(answers[0]).toBe(true);
    expect(container.textContent).toBe('true');
  });

  it('draws the default on a server, which cannot ask', () => {
    expect(renderToString(<Probe />)).toContain('false');
  });

  it("hydrates what the server drew, then answers with the browser's answer", async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Probe />);
    document.body.appendChild(container);
    const onRecoverableError = vi.fn();
    answers = [];

    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Probe />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(answers[0]).toBe(false);
    expect(container.textContent).toBe('true');

    act(() => root?.unmount());
    container.remove();
  });

  it('follows the query when its answer changes', () => {
    const { container } = render(<Probe />);
    expect(container.textContent).toBe('true');

    act(() => {
      matches = false;
      listeners.forEach((listener) => listener());
    });

    expect(container.textContent).toBe('false');
  });
});
