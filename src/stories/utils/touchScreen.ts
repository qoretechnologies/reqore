// Copyright 2026 Qore Technologies, s.r.o.

/** A phone's screen, in CSS pixels: what a touch story is laid out at, and what qlip captures it at. */
export const PHONE_VIEWPORT = { width: 390, height: 844 };

/**
 * What makes a story a phone's, spread into it: Storybook's preview at the phone's size (`globals`, with
 * the size it names in `parameters.viewport`) and qlip's capture at the same size. Always both - the
 * preview's size does not reach the capture, and the capture's does not reach the preview.
 */
export const PHONE_STORY = {
  parameters: {
    viewport: {
      options: {
        phone: {
          name: `Phone (${PHONE_VIEWPORT.width} × ${PHONE_VIEWPORT.height})`,
          styles: { width: `${PHONE_VIEWPORT.width}px`, height: `${PHONE_VIEWPORT.height}px` },
          type: 'mobile' as const,
        },
      },
    },
    qlip: { viewport: PHONE_VIEWPORT },
  },
  globals: { viewport: { value: 'phone', isRotated: false } },
};

/** A point in the story's own frame, in CSS pixels from its top left, as `clientX` / `clientY`. */
export interface ITouchPoint {
  x: number;
  y: number;
}

/** A finger on a phone, for a story's play. See `withTouchScreen`. */
export interface ITouchScreen {
  /**
   * The touches are the browser's own: Chromium emulates a touch screen (Playwright's `hasTouch` and
   * `isMobile`), so `(pointer: coarse)` and `(hover: none)` match, and each touch goes through its input
   * pipeline, which fires the pointer, touch and compatibility mouse events a phone fires, scrolls what a
   * finger would scroll and cancels what a scroll cancels. False where the play runs in Storybook's own
   * UI, where there is no DevTools protocol to ask: there the touches are dispatched events, and what
   * only a touch screen does (a `pointer: coarse` style) cannot be checked.
   */
  readonly real: boolean;
  /** The story's frame is at the phone's width. */
  readonly narrowed: boolean;
  /** A point in `element`: its centre, or `fx` and `fy` of the way across and down its box. */
  pointIn(element: Element, fx?: number, fy?: number): ITouchPoint;
  /** A finger put down on `at` (an element's centre, or a point) and lifted. */
  tap(at: Element | ITouchPoint): Promise<void>;
  /** A finger put down at `from`, moved to `to` in `steps` moves, and lifted there. */
  drag(from: ITouchPoint, to: ITouchPoint, steps?: number): Promise<void>;
}

interface ICdpSession {
  send(method: string, params?: Record<string, unknown>): Promise<unknown>;
}

interface IVitestBrowser {
  cdp(): ICdpSession;
  page: { viewport(width: number, height: number): Promise<void> };
}

const pointIn = (element: Element, fx = 0.5, fy = 0.5): ITouchPoint => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width * fx, y: box.top + box.height * fy };
};

const toPoint = (at: Element | ITouchPoint): ITouchPoint =>
  at instanceof Element ? pointIn(at) : at;

/**
 * The next frame: what the last event set in motion has been drawn, and the effects it scheduled have run. A
 * finger's events come a frame or more apart, and a drag handler that starts listening for moves in an effect
 * after the touch began hears none sent in the same frame.
 */
const nextFrame = (): Promise<void> =>
  new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

const between = (from: ITouchPoint, to: ITouchPoint, step: number, steps: number): ITouchPoint => ({
  x: from.x + ((to.x - from.x) * step) / steps,
  y: from.y + ((to.y - from.y) * step) / steps,
});

/**
 * Where a point of the story's frame is on the page the browser shows. The test runner draws the story in
 * an iframe of its own page, scaled to fit, and the DevTools protocol takes touches on that page.
 */
const toPage = (point: ITouchPoint): ITouchPoint => {
  const frame = window.frameElement as HTMLElement | null;
  if (!frame) {
    return point;
  }
  const box = frame.getBoundingClientRect();
  const scale = (box.width - frame.clientLeft * 2) / window.innerWidth;
  return {
    x: box.left + frame.clientLeft + point.x * scale,
    y: box.top + frame.clientTop + point.y * scale,
  };
};

/** Touches the browser takes as a finger's, through the DevTools protocol. */
const realTouches = (session: ICdpSession): Pick<ITouchScreen, 'tap' | 'drag'> => {
  const send = (type: string, points: ITouchPoint[]) =>
    session.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: points.map((point) => ({ ...toPage(point), id: 1, radiusX: 4, radiusY: 4, force: 1 })),
    });

  return {
    async tap(at) {
      const point = toPoint(at);
      await send('touchStart', [point]);
      await send('touchEnd', []);
    },
    async drag(from, to, steps = 8) {
      await send('touchStart', [from]);
      for (let step = 1; step <= steps; step++) {
        await send('touchMove', [between(from, to, step, steps)]);
      }
      await send('touchEnd', []);
    },
  };
};

/**
 * Touches dispatched as events, where there is no DevTools protocol (Storybook's own UI): the pointer and
 * touch events a finger fires, on the element under it, and after a tap the mouse events and the click a
 * browser follows a tap with.
 */
const dispatchedTouches = (): Pick<ITouchScreen, 'tap' | 'drag'> => {
  const pointer = (type: string, target: Element, point: ITouchPoint) =>
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: 'touch',
        isPrimary: true,
        clientX: point.x,
        clientY: point.y,
        buttons: type === 'pointerup' ? 0 : 1,
      })
    );
  const touch = (type: string, target: Element, point: ITouchPoint) => {
    if (typeof Touch === 'undefined' || typeof TouchEvent === 'undefined') {
      return;
    }
    const finger = new Touch({
      identifier: 1,
      target,
      clientX: point.x,
      clientY: point.y,
      pageX: point.x + window.scrollX,
      pageY: point.y + window.scrollY,
    });
    const down = type !== 'touchend';
    target.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches: down ? [finger] : [],
        targetTouches: down ? [finger] : [],
        changedTouches: [finger],
      })
    );
  };
  const mouse = (type: string, target: Element, point: ITouchPoint) =>
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: point.x,
        clientY: point.y,
      })
    );
  const under = (point: ITouchPoint) => document.elementFromPoint(point.x, point.y) ?? document.body;
  /**
   * What a press moves the focus to, as a browser decides it: the nearest element a click can focus - a
   * control, a link, anything with a `tabindex` (-1 included), an editable area - or none, which leaves the
   * focus nowhere. The element under the finger is often a label inside a control; focusing only that (or
   * nothing) tells the component around it the focus came from outside.
   */
  const focusTargetOf = (target: Element): HTMLElement | null =>
    target.closest<HTMLElement>(
      'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]'
    );

  return {
    async tap(at) {
      const point = toPoint(at);
      const target = under(point);
      pointer('pointerdown', target, point);
      touch('touchstart', target, point);
      pointer('pointerup', target, point);
      touch('touchend', target, point);
      // a press the page cancels moves no focus; otherwise the focus goes where a browser would put it
      if (mouse('mousedown', target, point)) {
        const focusTarget = focusTargetOf(target);
        if (focusTarget) {
          focusTarget.focus();
        } else {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }
      mouse('mouseup', target, point);
      mouse('click', target, point);
    },
    async drag(from, to, steps = 8) {
      // a touch stays with the element it started on, wherever the finger goes
      const target = under(from);
      pointer('pointerdown', target, from);
      touch('touchstart', target, from);
      await nextFrame();
      for (let step = 1; step <= steps; step++) {
        const point = between(from, to, step, steps);
        pointer('pointermove', target, point);
        touch('touchmove', target, point);
        await nextFrame();
      }
      pointer('pointerup', target, to);
      touch('touchend', target, to);
      await nextFrame();
    },
  };
};

/**
 * Run `body` on a phone held in a hand: the story's frame at a phone's size, the browser a touch screen,
 * and touches that are a finger's, then put everything back.
 *
 * In the test run, Chromium's own emulation is turned on through the DevTools protocol - touch input
 * (`Emulation.setTouchEmulationEnabled`, which is what Playwright's `hasTouch` does: `(pointer: coarse)` and
 * `(hover: none)` match, and `navigator.maxTouchPoints` is 5) and a mobile device
 * (`Emulation.setDeviceMetricsOverride` with `mobile`, which is what its `isMobile` does) - and the frame is
 * narrowed with the `page.viewport` call qlip makes. Each is put back when `body` ends, passed or failed,
 * or every later story would run on a phone.
 *
 * `vitest/browser` is imported when called, never statically: it throws outside the test runner, and a
 * static import would take the Storybook dev server down. There the touches are dispatched events instead
 * (`real` is false) and the frame keeps its width (`narrowed` is false).
 */
export const withTouchScreen = async (
  body: (touch: ITouchScreen) => Promise<void>,
  { width, height }: { width: number; height: number } = PHONE_VIEWPORT
): Promise<void> => {
  let browser: IVitestBrowser | undefined;
  try {
    browser = (await import('vitest/browser')) as unknown as IVitestBrowser;
  } catch {
    browser = undefined;
  }

  if (!browser) {
    await body({ real: false, narrowed: false, pointIn, ...dispatchedTouches() });
    return;
  }

  const session = browser.cdp();
  const top = window.top ?? window;
  const page = { width: top.innerWidth, height: top.innerHeight, deviceScaleFactor: top.devicePixelRatio };
  const was = { width: window.innerWidth, height: window.innerHeight };

  await browser.page.viewport(width, height);
  try {
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await session.send('Emulation.setDeviceMetricsOverride', { ...page, mobile: true });
    await body({
      real: true,
      narrowed: window.innerWidth === width,
      pointIn,
      ...realTouches(session),
    });
  } finally {
    // Unconditional, and each on its own: whatever failed, the next story gets a desktop browser.
    await session.send('Emulation.setTouchEmulationEnabled', { enabled: false }).catch(() => undefined);
    // this session's override only: the runner's own viewport stays as it was
    await session.send('Emulation.clearDeviceMetricsOverride').catch(() => undefined);
    await browser.page.viewport(was.width, was.height);
  }
};
