import { fireEvent, render } from '@testing-library/react';
import { ReqoreFadeScroller, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/**
 * Drag-to-scroll on `ReqoreFadeScroller`.
 *
 * A mouse has no horizontal axis, so an overflowing row is reachable only by
 * shift+wheel or a trackpad gesture. Dragging is the gesture the row already
 * looks like it should accept — but a row of clickable tiles means the drag has
 * to coexist with clicking, and with selecting the text inside a tile. Those
 * three are what this asserts.
 */

/** jsdom lays nothing out: every element reports 0 for both, so the component's
 *  "is there anywhere to scroll?" guard is always false unless we say otherwise. */
const setOverflow = (element: HTMLElement, { scrollWidth = 2000, clientWidth = 500 } = {}) => {
  Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
};

/** jsdom has no PointerEvent, and `fireEvent.pointerDown` builds an Event with
 *  no pointerId/pointerType — the two fields the handler branches on.
 *
 *  `buttons` is load-bearing for the same reason. It is the bitmask of what is
 *  held RIGHT NOW, so every move that belongs to a drag reports 1 and a release
 *  reports 0. The component reads it to notice a release it never saw — the
 *  button coming up outside the window — so a move dispatched without it is not
 *  an under-specified event but an impossible one: a drag with nothing held. */
const pointer = (
  element: HTMLElement,
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  {
    clientX = 0,
    shiftKey = false,
    pointerType = 'mouse',
    button = 0,
    buttons = type === 'pointerUp' ? 0 : 1,
  } = {}
) => fireEvent[type](element, { clientX, shiftKey, pointerType, button, buttons, pointerId: 1 });

const renderScroller = (props: Record<string, unknown> = {}, onTileClick = () => {}) => {
  const { container, unmount } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreFadeScroller dragToScroll {...props}>
          <button type='button' onClick={onTileClick}>
            Tile
          </button>
          <input defaultValue='typed value' />
        </ReqoreFadeScroller>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const scroller = container.querySelector('.reqore-fade-scroller-content') as HTMLElement;
  setOverflow(scroller);
  return { container, scroller, unmount };
};

test('drags the row sideways with the mouse', () => {
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  // Pulled 100px left, so the row scrolled 100px right.
  expect(scroller.scrollLeft).toBe(100);

  pointer(scroller, 'pointerUp', { clientX: 300 });
});

test('does not move below the drag threshold, so a click is still a click', () => {
  // A press that wobbles by a pixel is a click, not a drag — moving here would
  // scroll the row out from under the thing being clicked.
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 398 });

  expect(scroller.scrollLeft).toBe(0);
});

test('swallows the click that follows a real drag', () => {
  // Pulling the row and letting go over a tile must not also activate the tile.
  const onTileClick = vi.fn();
  const { scroller } = renderScroller({}, onTileClick);
  const tile = scroller.querySelector('button') as HTMLElement;

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });
  pointer(scroller, 'pointerUp', { clientX: 300 });
  fireEvent.click(tile);

  expect(onTileClick).not.toHaveBeenCalled();
});

test('lets a plain click through', () => {
  // The other half of the same contract: suppression is armed by a drag, not by
  // the feature being enabled, so a tile stays clickable.
  const onTileClick = vi.fn();
  const { scroller } = renderScroller({}, onTileClick);
  const tile = scroller.querySelector('button') as HTMLElement;

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerUp', { clientX: 400 });
  fireEvent.click(tile);

  expect(onTileClick).toHaveBeenCalledTimes(1);
});

test('shift+drag selects instead of scrolling', () => {
  // The documented escape hatch: selecting a KPI value to copy it has to remain
  // possible on a row that has taken over press-and-move.
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400, shiftKey: true });
  pointer(scroller, 'pointerMove', { clientX: 300, shiftKey: true });

  expect(scroller.scrollLeft).toBe(0);
});

test('leaves touch alone, so native panning and long-press selection survive', () => {
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400, pointerType: 'touch' });
  pointer(scroller, 'pointerMove', { clientX: 300, pointerType: 'touch' });

  expect(scroller.scrollLeft).toBe(0);
});

test('does not drag from a text input, where press-and-move already means select', () => {
  const { scroller } = renderScroller();
  const input = scroller.querySelector('input') as HTMLElement;

  pointer(input, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  expect(scroller.scrollLeft).toBe(0);
});

test('does nothing when the row already fits', () => {
  // No overflow means no drag at all — a click on a row that fits must behave
  // exactly as it did before the feature existed.
  const { scroller } = renderScroller();
  setOverflow(scroller, { scrollWidth: 400, clientWidth: 500 });

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  expect(scroller.scrollLeft).toBe(0);
});

test('stays inert without the prop', () => {
  const { scroller } = renderScroller({ dragToScroll: false });

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  expect(scroller.scrollLeft).toBe(0);
});

/*
 * Losing the release.
 *
 * The gesture is tracked on the window, not on the row, because a pull leaves the
 * row almost immediately and the release can land anywhere — including outside the
 * browser window, where no listener of ours will ever see it. Every case below is
 * a release the row itself never got.
 */

test('ends a drag whose release happened outside the window', () => {
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });
  expect(scroller.scrollLeft).toBe(100);

  // The button came up off-window, so no pointerup ever arrives. The pointer then
  // comes back across the row with nothing held: `buttons` is 0, which during a
  // drag is impossible and is therefore the tell.
  pointer(scroller, 'pointerMove', { clientX: 200, buttons: 0 });

  // Without this the row keeps following the pointer with no button down and
  // there is no way to let go — the drag is stuck.
  expect(scroller.scrollLeft).toBe(100);
  expect(scroller.classList.contains('reqore-fade-scroller-dragging')).toBe(false);

  // ...and the row is still usable afterwards: a fresh press drags again.
  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 350 });
  expect(scroller.scrollLeft).toBe(150);
  pointer(scroller, 'pointerUp', { clientX: 350 });
});

test('ends a drag when the window loses focus mid-pull', () => {
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });
  expect(scroller.classList.contains('reqore-fade-scroller-dragging')).toBe(true);

  // Alt-tab: the release happens in another window entirely.
  fireEvent.blur(window);

  expect(scroller.classList.contains('reqore-fade-scroller-dragging')).toBe(false);
  pointer(scroller, 'pointerMove', { clientX: 200, buttons: 0 });
  expect(scroller.scrollLeft).toBe(100);
});

test('a release it never saw does not swallow the next genuine click', () => {
  const onTileClick = vi.fn();
  const { container, scroller } = renderScroller({}, onTileClick);

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });
  // Released off-window: the click that would have consumed the swallow never came.

  const tile = container.querySelector('button') as HTMLElement;

  pointer(tile, 'pointerDown', { clientX: 10 });
  pointer(tile, 'pointerUp', { clientX: 10 });
  fireEvent.click(tile);

  expect(onTileClick).toHaveBeenCalledTimes(1);
});

test('a release it never saw does not swallow a click the drag declined', () => {
  // Pressing a text input is declined by the drag guard. It must still clear a
  // swallow left armed by an earlier gesture, or the decline inherits it.
  const onTileClick = vi.fn();
  const { container, scroller } = renderScroller({}, onTileClick);

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  const input = container.querySelector('input') as HTMLElement;

  pointer(input, 'pointerDown', { clientX: 10 });
  pointer(input, 'pointerUp', { clientX: 10 });

  const tile = container.querySelector('button') as HTMLElement;
  fireEvent.click(tile);

  expect(onTileClick).toHaveBeenCalledTimes(1);
});

test('leaves no window listeners behind when it unmounts mid-drag', () => {
  const { scroller, unmount } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });
  pointer(scroller, 'pointerMove', { clientX: 300 });

  const removeSpy = vi.spyOn(window, 'removeEventListener');
  unmount();

  const removed = removeSpy.mock.calls.map(([type]) => type);
  removeSpy.mockRestore();

  expect(removed).toContain('pointermove');
  expect(removed).toContain('pointerup');
});

test('keeps following the pointer once it has left the row, and ends on a release elsewhere', () => {
  // The pull leaves the row almost at once — the edge is exactly where you are
  // pulling TO — so the moves land on whatever else is under the pointer. Nothing
  // dispatched on the page bubbles back INTO the row, so a row-bound listener
  // stops hearing the gesture the moment it matters most.
  const { scroller } = renderScroller();

  pointer(scroller, 'pointerDown', { clientX: 400 });

  pointer(document.body, 'pointerMove', { clientX: 300 });
  expect(scroller.scrollLeft).toBe(100);

  pointer(document.body, 'pointerMove', { clientX: 250 });
  expect(scroller.scrollLeft).toBe(150);

  // ...and the release, also elsewhere, still ends the drag.
  pointer(document.body, 'pointerUp', { clientX: 250 });
  expect(scroller.classList.contains('reqore-fade-scroller-dragging')).toBe(false);
});
