/**
 * Swipe-to-close on a `responsiveLayout` sheet.
 *
 * jsdom has no `matchMedia`, so a drawer is never a sheet here and the gesture cannot be driven
 * on a render; the `Dialogs/Drawer` `SheetSwipe*` stories do that in a real browser at phone
 * width. What this file proves is the decision — `getSheetSwipe`, pure — and the handle test
 * `isDrawerHeaderGrab`, plus the contract a render makes on a wide screen: no swipe class.
 */
import { render } from '@testing-library/react';
import { noop } from 'lodash';
import { describe, expect, it } from 'vitest';
import {
  getSheetSwipe,
  isDrawerHeaderGrab,
  ReqoreDrawer,
  TPosition,
} from '../src/components/Drawer';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

const size = 500;
const still = { vx: 0, vy: 0 };

describe('getSheetSwipe', () => {
  it.each<[TPosition, 'dx' | 'dy', 1 | -1]>([
    ['bottom', 'dy', 1],
    ['top', 'dy', -1],
    ['right', 'dx', 1],
    ['left', 'dx', -1],
  ])('a %s sheet follows the finger toward its edge and closes past 18% of its size', (
    position,
    axis,
    towardEdge
  ) => {
    const along = (distance: number) => ({ dx: 0, dy: 0, ...still, [axis]: distance });
    const offset = (distance: number) =>
      axis === 'dy' ? { x: 0, y: distance } : { x: distance, y: 0 };

    // Far enough: the sheet is where the finger left it, and letting go closes it.
    expect(getSheetSwipe(position, along(towardEdge * 100), size)).toEqual({
      offset: offset(towardEdge * 100),
      closes: true,
    });
    // Short: it follows, and springs back on release.
    expect(getSheetSwipe(position, along(towardEdge * 40), size)).toEqual({
      offset: offset(towardEdge * 40),
      closes: false,
    });
    // Pulled the other way: a sheet is not lifted off its edge, and it does not close.
    expect(getSheetSwipe(position, along(-towardEdge * 100), size)).toEqual({
      offset: { x: 0, y: 0 },
      closes: false,
    });
  });

  it('a flick toward the edge closes a sheet that barely moved; one away from it does not', () => {
    expect(
      getSheetSwipe('bottom', { dx: 0, dy: 20, vx: 0, vy: 0.5 }, size).closes
    ).toBe(true);
    expect(
      getSheetSwipe('bottom', { dx: 0, dy: 20, vx: 0, vy: -0.5 }, size).closes
    ).toBe(false);
    expect(getSheetSwipe('top', { dx: 0, dy: -20, vx: 0, vy: -0.5 }, size).closes).toBe(true);
    expect(getSheetSwipe('left', { dx: -20, dy: 0, vx: -0.5, vy: 0 }, size).closes).toBe(true);
    expect(getSheetSwipe('right', { dx: 20, dy: 0, vx: 0.5, vy: 0 }, size).closes).toBe(true);
    // Speed on the other axis is not a flick.
    expect(getSheetSwipe('bottom', { dx: 0, dy: 20, vx: 2, vy: 0 }, size).closes).toBe(false);
  });

  it('ignores movement across the axis', () => {
    expect(getSheetSwipe('bottom', { dx: 400, dy: 30, ...still }, size)).toEqual({
      offset: { x: 0, y: 30 },
      closes: false,
    });
    expect(getSheetSwipe('right', { dx: 30, dy: 400, ...still }, size)).toEqual({
      offset: { x: 30, y: 0 },
      closes: false,
    });
  });
});

describe('isDrawerHeaderGrab', () => {
  /* The box, its panel, the panel's title bar with a label, the close control and an action
     group, and a panel in the content with a title bar of its own. */
  const html = `
    <div class="box">
      <div class="reqore-drawer reqore-panel">
        <div class="reqore-panel-title">
          <div class="reqore-panel-title-header"><span class="label">Title</span></div>
          <div class="reqore-control-group">
            <button class="reqore-button action">Act</button>
            <span class="gap"></span>
          </div>
          <button class="reqore-button reqore-drawer-close-button">x</button>
          <input class="field" />
        </div>
        <div class="reqore-panel-content">
          <div class="reqore-panel nested">
            <div class="reqore-panel-title"><span class="nested-label">Nested</span></div>
          </div>
          <p class="text">Body</p>
        </div>
      </div>
    </div>`;
  const root = document.createElement('div');
  root.innerHTML = html;
  const box = root.querySelector('.box') as HTMLElement;
  const at = (selector: string) => isDrawerHeaderGrab(root.querySelector(selector), box);

  it('is the drawer’s own title bar and what is written on it', () => {
    expect(at('.reqore-drawer > .reqore-panel-title')).toBe(true);
    expect(at('.reqore-panel-title-header')).toBe(true);
    expect(at('.label')).toBe(true);
  });

  it('is not a control in the bar, nor the group the actions sit in', () => {
    expect(at('.reqore-drawer-close-button')).toBe(false);
    expect(at('.action')).toBe(false);
    expect(at('.gap')).toBe(false);
    expect(at('.field')).toBe(false);
  });

  it('is not the content, nor the title bar of a panel in it', () => {
    expect(at('.text')).toBe(false);
    expect(at('.reqore-panel-content')).toBe(false);
    expect(at('.nested-label')).toBe(false);
    expect(at('.nested > .reqore-panel-title')).toBe(false);
  });

  it('is nothing outside the box, and nothing that is not an element', () => {
    const other = document.createElement('div');
    other.innerHTML = html;
    expect(isDrawerHeaderGrab(other.querySelector('.label'), box)).toBe(false);
    expect(isDrawerHeaderGrab(null, box)).toBe(false);
    expect(isDrawerHeaderGrab(document.createTextNode('x'), box)).toBe(false);
  });
});

describe('ReqoreDrawer swipeToClose on a wide screen', () => {
  it('is nothing outside the sheet layout: the box carries no swipe class', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDrawer isOpen responsiveLayout onClose={noop} label='Wide'>
              content
            </ReqoreDrawer>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    const box = document.querySelector('.reqore-drawer-resizable') as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(false);
    expect(box.classList.contains('reqore-drawer-swipeable')).toBe(false);
    expect(box.classList.contains('reqore-drawer-draggable')).toBe(false);
  });
});
