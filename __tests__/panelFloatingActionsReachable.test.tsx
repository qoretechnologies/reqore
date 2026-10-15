// Copyright 2026 Qore Technologies, s.r.o.
/**
 * A panel's floating actions can be reached with the mouse.
 *
 * They float above the panel's top-right corner, so the pointer leaves the panel through its top edge -
 * usually to the left of the actions, on a diagonal - before it reaches them. The hover ended as it left
 * the panel, the actions went, and the click landed on what they had covered (qorus#646: an expression's
 * Remove landed on the Visual / Text switch beneath it).
 */
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReqorePanel, ReqoreUIProvider } from '../src';

const PANEL = { left: 100, right: 300, top: 200, bottom: 400, width: 200, height: 200 };
const ACTIONS = { width: 120, height: 32 };

beforeEach(() => {
  vi.useFakeTimers();
  // as laid out: the panel where it is, the actions where they were placed
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('reqore-panel-floating-actions')) {
      const left = parseFloat(this.style.left) || 0;
      const top = parseFloat(this.style.top) || 0;
      return { x: left, y: top, left, top, right: left + ACTIONS.width, bottom: top + ACTIONS.height,
        width: ACTIONS.width, height: ACTIONS.height, toJSON: () => ({}) } as DOMRect;
    }
    return { x: PANEL.left, y: PANEL.top, ...PANEL, toJSON: () => ({}) } as DOMRect;
  });
  (document as any).elementFromPoint = () => document.querySelector('.with-floating-actions');
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const hovered = async () => {
  render(
    <ReqoreUIProvider>
      <ReqorePanel
        className='with-floating-actions'
        label='Expression'
        floatingActions
        actions={[{ icon: 'DeleteBinLine', label: 'Remove', show: 'hover', className: 'remove-me' }]}
      >
        content
      </ReqorePanel>
    </ReqoreUIProvider>
  );
  const panel = document.querySelector('.with-floating-actions') as HTMLElement;
  fireEvent.mouseEnter(panel);
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  return panel;
};
const actionsShown = () => !!document.querySelector('.reqore-panel-floating-actions .remove-me');

test('the actions stay while the pointer crosses from the panel to them', async () => {
  const panel = await hovered();
  expect(actionsShown()).toBe(true);
  // out through the top edge, left of the actions (they span x 180-300, y 169-201)
  await act(async () => {
    fireEvent.mouseLeave(panel, { clientX: 150, clientY: 199, relatedTarget: document.body });
  });
  expect(actionsShown()).toBe(true);
  // on its way, over what lies above the panel
  await act(async () => {
    fireEvent.mouseMove(document.body, { clientX: 170, clientY: 190 });
  });
  expect(actionsShown()).toBe(true);
  // and onto the actions: still there to be clicked
  const remove = document.querySelector('.reqore-panel-floating-actions .remove-me') as HTMLElement;
  await act(async () => {
    fireEvent.mouseMove(remove, { clientX: 290, clientY: 185 });
  });
  expect(actionsShown()).toBe(true);
});

test('the actions go when the pointer leaves the strip for anything else', async () => {
  const panel = await hovered();
  await act(async () => {
    fireEvent.mouseLeave(panel, { clientX: 150, clientY: 199, relatedTarget: document.body });
  });
  await act(async () => {
    fireEvent.mouseMove(document.body, { clientX: 150, clientY: 120 });
  });
  expect(actionsShown()).toBe(false);
});

test('leaving the panel away from its actions ends the hover at once, as before', async () => {
  const panel = await hovered();
  await act(async () => {
    fireEvent.mouseLeave(panel, { clientX: 150, clientY: 420, relatedTarget: document.body });
  });
  expect(actionsShown()).toBe(false);
});
