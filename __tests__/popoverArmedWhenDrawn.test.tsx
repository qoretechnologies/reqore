// Copyright 2026 Qore Technologies, s.r.o.
import { act } from '@testing-library/react';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreDropdown,
  ReqoreLayoutContent,
  ReqorePopover,
  ReqoreUIProvider,
} from '../src';

/**
 * A popover takes a click that lands as soon as its trigger is drawn (qorus#646).
 *
 * A Reqore component handed the popover its element in an effect, after the browser had painted it, and the
 * popover armed its click listener in the render after that: a button on screen that opened nothing when
 * clicked straight away, with nothing on the page saying when it would. The Qorus IDE's story harness kept
 * sleeps for it (a template selector, among others). The element is now handed on in the commit that draws
 * it, and the listener is there before the paint.
 *
 * `flushSync` draws the page and commits it, and nothing more: the state of a page as it is first painted.
 * The click is dispatched straight after, with no `act` to run what React would run later.
 */

let root: Root;
let container: HTMLElement;
let actEnvironment: unknown;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  actEnvironment = (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT;
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = false;
});

afterEach(() => {
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = actEnvironment;
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

const page = (children: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

/** Draws the page, clicks `selector` at once, then lets everything run; whether a popover is open after. */
const clickedAsDrawn = (children: React.ReactNode, selector: string) => {
  flushSync(() => root.render(page(children)));
  const trigger = container.querySelector<HTMLElement>(selector);
  expect(trigger).toBeTruthy();
  /* The click is dispatched inside `act` only so that what it sets off is run by the test; whether anything
     listens for it was settled by the commit above. */
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  act(() => {
    trigger!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  act(() => {
    vi.advanceTimersByTime(50);
  });
  return document.querySelectorAll('.reqore-popover-content').length > 0;
};

describe('a popover clicked as soon as its trigger is drawn', () => {
  it('opens around a Reqore button', () => {
    expect(
      clickedAsDrawn(
        <ReqorePopover
          component={ReqoreButton}
          componentProps={{ label: 'Open', className: 'trigger' }}
          content='Hello'
          handler='click'
        />,
        '.trigger'
      )
    ).toBe(true);
  });

  it('opens a dropdown', () => {
    expect(
      clickedAsDrawn(
        <ReqoreDropdown
          label='Templates'
          className='template-selector'
          items={[{ label: 'qty', value: '$record:{qty}' }]}
        />,
        '.template-selector'
      )
    ).toBe(true);
  });
});
