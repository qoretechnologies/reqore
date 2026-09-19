import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';

/**
 * A modal resizes from its corners as well as its edges, and it did not.
 *
 * `re-resizable` centres every handle ON the edge it drags — the sides are
 * 10px bands hung at -5px, the corners 20x20 squares hung at -10px on BOTH
 * axes — and the drawer box clipped itself. The clip amputated everything
 * outside the box: the sides kept their inner 5px and went on working, while
 * each corner was cut down to a 10x10 remnant buried inside the dialog, with
 * the corner itself belonging to the backdrop, whose click CLOSES the dialog.
 *
 * jsdom has no layout, so what is checked here is the mechanism — the handles
 * that exist, where they are hung, and that nothing clips them. The measured
 * geometry and the hit-testing are asserted in a real browser by the
 * `dialogs-modal--can-be-resized-from-its-corner` story.
 */
const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The element `re-resizable` sizes and drags; the handles are its children. */
const resizableBox = (): HTMLElement =>
  document.querySelector('.reqore-drawer-resizable') as HTMLElement;

const RESIZE_CURSOR = /cursor:\s*((?:col|row|se|sw|ne|nw)-resize)/;

/** Every resize handle in the box, keyed by the cursor it sets. */
const handles = (): Record<string, HTMLElement> =>
  [...resizableBox().querySelectorAll<HTMLElement>('div')].reduce((acc, el) => {
    const cursor = (el.getAttribute('style') || '').match(RESIZE_CURSOR)?.[1];

    return cursor ? { ...acc, [cursor]: el } : acc;
  }, {});

/** The offsets a handle is hung at, as `re-resizable` writes them. */
const offsets = (el: HTMLElement) => ({
  width: el.style.width,
  height: el.style.height,
  top: el.style.top,
  right: el.style.right,
  bottom: el.style.bottom,
  left: el.style.left,
});

describe('the handles a modal is resized by', () => {
  it('draws one for every edge and every corner', () => {
    inLayout(
      <ReqoreModal isOpen label='Select from items' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    // Two sides share `col-resize` and two share `row-resize`, so the four
    // corners are the four entries that prove the corners exist at all.
    expect(Object.keys(handles()).sort()).toEqual([
      'col-resize',
      'ne-resize',
      'nw-resize',
      'row-resize',
      'se-resize',
      'sw-resize',
    ]);
  });

  it('hangs each corner across the corner it drags, not inside it', () => {
    inLayout(
      <ReqoreModal isOpen label='Select from items' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    // 20x20 at -10px on both axes: a square centred on the corner. Half of it
    // is outside the box, which is the half the clip used to eat.
    expect(offsets(handles()['se-resize'])).toEqual({
      width: '20px',
      height: '20px',
      top: '',
      right: '-10px',
      bottom: '-10px',
      left: '',
    });
    expect(offsets(handles()['nw-resize'])).toEqual({
      width: '20px',
      height: '20px',
      top: '-10px',
      right: '',
      bottom: '',
      left: '-10px',
    });
  });

  it('does not clip the box, so the half of a handle outside it survives', () => {
    inLayout(
      <ReqoreModal isOpen label='Select from items' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    // The clip is what made the corners unusable. The panel inside clips its
    // own content, so the box has no reason to.
    expect(resizableBox().style.overflow).toBe('');
  });

  it('does not clip an edge drawer either, hidable or not', () => {
    const { unmount } = inLayout(
      <ReqoreDrawer isOpen position='right' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    expect(resizableBox().style.overflow).toBe('');
    // Its one enabled edge is hung across the edge in the same way: a 10px
    // band at -5px, half of it outside the box.
    expect(offsets(handles()['col-resize'])).toMatchObject({
      width: '10px',
      height: '100%',
      left: '-5px',
    });

    unmount();

    inLayout(
      <ReqoreDrawer isOpen hidable position='right' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    // A hidable drawer never clipped — its hide control lives outside the box
    // — and now every drawer behaves the way that one always did.
    expect(resizableBox().style.overflow).toBe('');
  });
});

describe('a drawer that says it cannot be resized', () => {
  it('draws no handles on a modal', () => {
    inLayout(
      <ReqoreModal isOpen resizable={false} label='Fixed size' onClose={() => undefined}>
        Contents
      </ReqoreModal>
    );

    // Every direction used to read `... || _isModal`, so a modal kept all
    // eight handles however `resizable` was set. Dragging one moved the box
    // through `re-resizable`'s inline style and the next render snapped it
    // back, because the size is only recorded when `resizable` is set.
    expect(handles()).toEqual({});
  });

  it('draws no handles on an edge drawer', () => {
    inLayout(
      <ReqoreDrawer isOpen resizable={false} position='right' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    expect(handles()).toEqual({});
  });

  it('still draws them when resizing is left alone', () => {
    inLayout(
      <ReqoreDrawer isOpen position='bottom' onClose={() => undefined}>
        Contents
      </ReqoreDrawer>
    );

    // A bottom drawer drags on one axis only: the edge facing the content.
    expect(Object.keys(handles())).toEqual(['row-resize']);
  });
});
