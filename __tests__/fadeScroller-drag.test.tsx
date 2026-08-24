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
 *  no pointerId/pointerType — the two fields the handler branches on. */
const pointer = (
  element: HTMLElement,
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  { clientX = 0, shiftKey = false, pointerType = 'mouse', button = 0 } = {}
) => fireEvent[type](element, { clientX, shiftKey, pointerType, button, pointerId: 1 });

const renderScroller = (props: Record<string, unknown> = {}, onTileClick = () => {}) => {
  const { container } = render(
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
  return { container, scroller };
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
