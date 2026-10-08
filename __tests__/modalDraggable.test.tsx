/**
 * `draggable` on ReqoreModal: moved by its title bar, held inside the viewport, reset on reopen.
 *
 * jsdom has no layout, so the geometry is stubbed — the box, the title bar and the viewport
 * are given sizes — and what is checked is the mechanism: which press starts a drag, where the
 * box is translated to, and what the clamp does. The measured behaviour, the resize that still
 * works and the `move` cursor are asserted in a real browser by the `Dialogs/Modal` drag stories.
 */
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';
import { clampModalDragOffset, IReqoreModalDragBounds } from '../src/components/Drawer';

const bounds: IReqoreModalDragBounds = {
  box: { left: 560, top: 340, width: 800, height: 400 },
  viewport: { width: 1920, height: 1080 },
  handleHeight: 55,
};

describe('clampModalDragOffset', () => {
  it('leaves an offset that keeps the title bar on screen alone', () => {
    expect(clampModalDragOffset({ x: 120, y: 80 }, bounds)).toEqual({ x: 120, y: 80 });
    expect(clampModalDragOffset({ x: -300, y: -200 }, bounds)).toEqual({ x: -300, y: -200 });
  });

  it('stops the box at the left and top edges', () => {
    expect(clampModalDragOffset({ x: -5000, y: -5000 }, bounds)).toEqual({ x: -560, y: -340 });
  });

  it('stops the box at the right edge, and the title bar above the bottom one', () => {
    // 1920 - 560 - 800 = 560 to the right; 1080 - 340 - 55 = 685 down: the bar’s bottom edge
    // meets the viewport’s, the rest of the modal may hang below.
    expect(clampModalDragOffset({ x: 5000, y: 5000 }, bounds)).toEqual({ x: 560, y: 685 });
  });

  it('a box wider than the viewport always spans it', () => {
    const wide = { ...bounds, box: { ...bounds.box, left: -40, width: 2000 } };

    expect(clampModalDragOffset({ x: 0, y: 0 }, wide)).toEqual({ x: 0, y: 0 });
    expect(clampModalDragOffset({ x: 100, y: 0 }, wide)).toEqual({ x: 40, y: 0 });
    expect(clampModalDragOffset({ x: -100, y: 0 }, wide)).toEqual({ x: -40, y: 0 });
  });
});

const box = () => document.querySelector('.reqore-drawer-resizable') as HTMLElement;
const header = () =>
  document.querySelector(
    '.reqore-drawer-resizable > .reqore-drawer > .reqore-panel-title'
  ) as HTMLElement;

/** The geometry jsdom does not have: an 800×400 box centred in a 1920×1080 viewport. */
const layOut = () => {
  const rect = (left: number, top: number, width: number, height: number) =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top }) as DOMRect;

  vi.spyOn(box(), 'getBoundingClientRect').mockImplementation(() => rect(560, 340, 800, 400));
  vi.spyOn(header(), 'getBoundingClientRect').mockImplementation(() => rect(560, 340, 800, 55));
  Object.defineProperty(document.documentElement, 'clientWidth', { value: 1920, configurable: true });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: 1080, configurable: true });
};

const pointer = (x: number, y: number) => ({
  pointerId: 1,
  pointerType: 'mouse',
  isPrimary: true,
  button: 0,
  buttons: 1,
  clientX: x,
  clientY: y,
});

/** A mouse drag from (x, y) by (dx, dy), pressed on `target`. */
const drag = (target: Element, x: number, y: number, dx: number, dy: number) => {
  fireEvent.pointerDown(target, pointer(x, y));
  fireEvent.pointerMove(target, pointer(x + dx / 2, y + dy / 2));
  fireEvent.pointerMove(target, pointer(x + dx, y + dy));
  fireEvent.pointerUp(target, { ...pointer(x + dx, y + dy), buttons: 0 });
};

const Modal = ({ isOpen = true, draggable = true }: { isOpen?: boolean; draggable?: boolean }) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>
        <ReqoreModal
          isOpen={isOpen}
          draggable={draggable}
          label='Drag me'
          actions={[{ label: 'An action', icon: 'Search2Line' }]}
          onClose={() => undefined}
        >
          content
        </ReqoreModal>
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

describe('ReqoreModal draggable', () => {
  it('marks the box, and keeps the HTML attribute of that name off the DOM', () => {
    render(<Modal />);

    expect(box().classList.contains('reqore-drawer-draggable')).toBe(true);
    expect(document.querySelector('.reqore-drawer-wrapper [draggable]')).toBeNull();
  });

  it('is opt-in', () => {
    render(<Modal draggable={false} />);

    expect(box().classList.contains('reqore-drawer-draggable')).toBe(false);
    drag(header(), 900, 360, 120, 80);
    expect(box().style.transform).not.toContain('translate3d');
  });

  it('moves the box by the drag of its title bar, and leaves it where it was let go', async () => {
    render(<Modal />);
    layOut();

    drag(header(), 900, 360, 120, 80);
    await waitFor(() => expect(box().style.transform).toContain('translate3d(120px, 80px, 0)'));

    // The next drag carries on from there.
    drag(header(), 1020, 440, -20, 10);
    await waitFor(() => expect(box().style.transform).toContain('translate3d(100px, 90px, 0)'));
  });

  it('does not start on the close button or on an action', async () => {
    render(<Modal />);
    layOut();

    const close = document.querySelector('.reqore-drawer-close-button') as HTMLElement;
    const action = [...document.querySelectorAll('.reqore-panel-title .reqore-button')].find(
      (button) => button.textContent?.includes('An action')
    ) as HTMLElement;

    expect(close).toBeTruthy();
    expect(action).toBeTruthy();

    drag(close, 1300, 360, 120, 80);
    drag(action, 1200, 360, 120, 80);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(box().style.transform).not.toContain('translate3d');
  });

  it('holds the title bar inside the viewport', async () => {
    render(<Modal />);
    layOut();

    drag(header(), 900, 360, -5000, -5000);
    await waitFor(() =>
      expect(box().style.transform).toContain('translate3d(-560px, -340px, 0)')
    );
  });

  it('opens centred again after it was dragged aside and closed', async () => {
    const { rerender } = render(<Modal />);
    layOut();

    drag(header(), 900, 360, 120, 80);
    await waitFor(() => expect(box().style.transform).toContain('translate3d(120px, 80px, 0)'));

    rerender(<Modal isOpen={false} />);
    rerender(<Modal isOpen />);
    await waitFor(() => expect(box().style.transform).not.toContain('translate3d'));
  });
});
