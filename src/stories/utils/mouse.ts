// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent } from 'storybook/test';

/** The browser's own mouse, for a story's play. See `withMouse`. */
export interface IStoryMouse {
  /**
   * The browser's own mouse: Playwright moves it, and its pointer events say `mouse` as a person's do.
   * False where the play runs in Storybook's own UI, where there is none to move: there a rest is a
   * mouse's pointer event and `mouseenter` / `mouseover`, dispatched.
   */
  readonly real: boolean;
  /** Rests the mouse on `element`: its centre, or `fx` and `fy` of the way across and down its box. */
  restOn(element: Element, fx?: number, fy?: number): Promise<void>;
}

interface IVitestMouse {
  userEvent: { hover(element: Element, options?: unknown): Promise<void> };
  cdp(): { send(method: string, params?: Record<string, unknown>): Promise<unknown> };
}

/**
 * Run `body` with the browser's own mouse, and move it off the page when `body` ends, passed or failed.
 *
 * The mouse stays where a story rests it, over the stories that come after it in the same browser, and
 * whatever they draw there is hovered: a story whose play rested the mouse on a card left the next stories'
 * titles opening their hovers, which said each title a second time (reqraft, qorus#646). Off the page -
 * where it is before anything moves it - nothing is under it.
 *
 * `vitest/browser` is imported when called, never statically: it throws outside the test runner (see
 * `withViewport`).
 */
export const withMouse = async (body: (mouse: IStoryMouse) => Promise<void>): Promise<void> => {
  let browser: IVitestMouse | undefined;
  try {
    browser = (await import('vitest/browser')) as unknown as IVitestMouse;
  } catch {
    browser = undefined;
  }

  const restOn = async (element: Element, fx = 0.5, fy = 0.5) => {
    const box = element.getBoundingClientRect();
    if (browser) {
      await browser.userEvent.hover(element, {
        position: { x: box.width * fx, y: box.height * fy },
      });
      return;
    }
    const at = { clientX: box.left + box.width * fx, clientY: box.top + box.height * fy };
    fireEvent.pointerOver(element, { pointerType: 'mouse', ...at });
    fireEvent.pointerEnter(element, { pointerType: 'mouse', ...at });
    fireEvent.mouseOver(element, at);
    fireEvent.mouseEnter(element, at);
  };

  try {
    await body({ real: !!browser, restOn });
  } finally {
    await browser?.cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: -1, y: -1 });
  }
};
