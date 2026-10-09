// Copyright 2026 Qore Technologies, s.r.o.
// A menu item brought into view by the keyboard is scrolled to inside its own menu, and nothing else moves
// (qorus#646, David: arrow keys in an editor's completion list scrolled the page past its content - the
// item's `scrollIntoView` scrolled every scrollable ancestor, the page's own scroll container and the
// document included, to centre the item in the viewport).
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReqoreMenu, ReqoreMenuItem, ReqoreUIProvider } from '../src/index';

/** jsdom lays nothing out: an element given the sizes a browser would give it. */
const laidOut = (
  el: HTMLElement,
  box: { top: number; height: number },
  scroll?: { height: number }
) => {
  el.getBoundingClientRect = () =>
    ({
      top: box.top,
      height: box.height,
      bottom: box.top + box.height,
      left: 0,
      right: 100,
      width: 100,
    }) as DOMRect;
  if (scroll) {
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: scroll.height });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: box.height });
    el.style.overflowY = 'auto';
  }
};

/** jsdom has no `scrollIntoView`: one to watch, as a browser's would be called. */
const watchScrollIntoView = () => {
  const spy = vi.fn();
  (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView = spy;
  return spy;
};

afterEach(() => {
  delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
});

describe('a menu item brought into view', () => {
  it('scrolls its menu, and not the page around it', () => {
    const pageScroll = vi.fn();
    const itemScrollIntoView = watchScrollIntoView();
    const { rerender } = render(
      <ReqoreUIProvider>
        <div className='page' style={{ overflowY: 'auto' }}>
          <ReqoreMenu maxHeight='100px'>
            <ReqoreMenuItem className='one'>One</ReqoreMenuItem>
            <ReqoreMenuItem className='two'>Two</ReqoreMenuItem>
          </ReqoreMenu>
        </div>
      </ReqoreUIProvider>
    );
    const page = document.querySelector<HTMLElement>('.page')!;
    const menu = document.querySelector<HTMLElement>('.reqore-menu')!;
    const two = document.querySelector<HTMLElement>('.two.reqore-menu-item')!;
    laidOut(page, { top: 0, height: 300 }, { height: 2000 });
    page.scrollTo = pageScroll as never;
    laidOut(menu, { top: 100, height: 100 }, { height: 400 });
    const menuScroll = vi.fn();
    menu.scrollTo = menuScroll as never;
    laidOut(two, { top: 250, height: 20 });

    rerender(
      <ReqoreUIProvider>
        <div className='page' style={{ overflowY: 'auto' }}>
          <ReqoreMenu maxHeight='100px'>
            <ReqoreMenuItem className='one'>One</ReqoreMenuItem>
            <ReqoreMenuItem className='two' scrollIntoView>
              Two
            </ReqoreMenuItem>
          </ReqoreMenu>
        </div>
      </ReqoreUIProvider>
    );

    expect(itemScrollIntoView).not.toHaveBeenCalled();
    expect(pageScroll).not.toHaveBeenCalled();
    // centred in its menu: the item's middle (260) to the menu's middle (150)
    expect(menuScroll).toHaveBeenCalledWith(expect.objectContaining({ top: 110 }));
  });

  it('scrolls nothing where its menu shows it all', () => {
    const itemScrollIntoView = watchScrollIntoView();
    const { rerender } = render(
      <ReqoreUIProvider>
        <ReqoreMenu>
          <ReqoreMenuItem className='two'>Two</ReqoreMenuItem>
        </ReqoreMenu>
      </ReqoreUIProvider>
    );
    const menu = document.querySelector<HTMLElement>('.reqore-menu')!;
    laidOut(menu, { top: 100, height: 100 }, { height: 100 });
    const menuScroll = vi.fn();
    menu.scrollTo = menuScroll as never;
    rerender(
      <ReqoreUIProvider>
        <ReqoreMenu>
          <ReqoreMenuItem className='two' scrollIntoView>
            Two
          </ReqoreMenuItem>
        </ReqoreMenu>
      </ReqoreUIProvider>
    );
    expect(itemScrollIntoView).not.toHaveBeenCalled();
    expect(menuScroll).not.toHaveBeenCalled();
  });
});
