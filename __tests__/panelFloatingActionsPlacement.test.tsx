// Copyright 2026 Qore Technologies, s.r.o.
/**
 * A panel's floating actions sit above its top-right corner, their right edge on the panel's. Hidden by
 * an earlier placement (the panel's top was covered), they measured 0 x 0 when placed again, so their left
 * edge went on the panel's right edge and they reached past it - past the screen's edge on a phone.
 */
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReqorePanel, ReqoreUIProvider } from '../src';

const PANEL = { left: 100, right: 300, top: 200, bottom: 400, width: 200, height: 200 };
const ACTIONS = { width: 120, height: 32 };

let topCovered = true;

beforeEach(() => {
  vi.useFakeTimers();
  // the actions measure as laid out: nothing while hidden
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('reqore-panel-floating-actions')) {
      const shown = this.style.display !== 'none';
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, toJSON: () => ({}),
        width: shown ? ACTIONS.width : 0, height: shown ? ACTIONS.height : 0 } as DOMRect;
    }
    return { x: PANEL.left, y: PANEL.top, ...PANEL, toJSON: () => ({}) } as DOMRect;
  });
  // the panel's top-right corner is covered at first, then not
  (document as any).elementFromPoint = () =>
    topCovered ? document.body : document.querySelector('.with-floating-actions');
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  topCovered = true;
});

test('floating actions placed again after being hidden end at the panel\'s right edge', async () => {
  render(
    <ReqoreUIProvider>
      <ReqorePanel
        className='with-floating-actions'
        label='Expression'
        floatingActions
        actions={[{ icon: 'DeleteBinLine', label: 'Remove', show: 'hover' }]}
      >
        content
      </ReqorePanel>
    </ReqoreUIProvider>
  );
  fireEvent.mouseEnter(document.querySelector('.with-floating-actions') as HTMLElement);
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  const actions = document.querySelector('.reqore-panel-floating-actions') as HTMLElement;
  // the first placement finds the corner covered, and hides them
  expect(actions.style.display).toBe('none');
  // uncovered, the next placement (a scroll) shows them
  topCovered = false;
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
  });
  expect(actions.style.display).toBe('flex');
  expect(actions.style.left).toBe(`${PANEL.right - ACTIONS.width}px`);
  expect(actions.style.top).toBe(`${PANEL.top - ACTIONS.height + 1}px`);
});
