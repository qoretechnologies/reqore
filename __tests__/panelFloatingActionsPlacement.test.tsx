// Copyright 2026 Qore Technologies, s.r.o.
/**
 * A panel's floating actions sit above its top-right corner, their right edge on the panel's.
 *
 * - Hidden by an earlier placement (the panel's top was covered), they measured 0 x 0 when placed again,
 *   so their left edge went on the panel's right edge and they reached past it - past the screen's edge on
 *   a phone.
 * - They are fixed to the screen, so nothing moves them but a placement, and they were placed only as
 *   they were shown, when the actions changed and on a scroll. A window that resized, a panel that grew
 *   or shrank, and actions whose content widened each left them where they had been: mid-screen once the
 *   window widened (reqraft's "Expression Can Be Wrapped", captured wider than it was played), or reaching
 *   past the panel's edge once they widened. Each of these places them again now, once per frame however
 *   many come in, and none does once they are hidden or the panel is gone.
 */
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ReqorePanel, ReqoreUIProvider } from '../src';

const INITIAL_PANEL = { left: 100, right: 300, top: 200, bottom: 400, width: 200, height: 200 };
const INITIAL_ACTIONS = { width: 120, height: 32 };

let panel = { ...INITIAL_PANEL };
let actionsSize = { ...INITIAL_ACTIONS };
let topCovered = true;
let elementFromPoint: ReturnType<typeof vi.fn>;

/** A ResizeObserver whose reports the test makes, for the elements it was asked to observe. */
class TestResizeObserver {
  static instances: TestResizeObserver[] = [];

  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(readonly callback: ResizeObserverCallback) {
    TestResizeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.add(element);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  /** Reports a size change of `element` to every observer still observing it. */
  static resize(element: Element) {
    TestResizeObserver.instances
      .filter((observer) => observer.observed.has(element))
      .forEach((observer) =>
        observer.callback(
          [{ target: element } as ResizeObserverEntry],
          observer as unknown as ResizeObserver
        )
      );
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  panel = { ...INITIAL_PANEL };
  actionsSize = { ...INITIAL_ACTIONS };
  TestResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
  // the actions measure as laid out: nothing while hidden
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    if (this.classList.contains('reqore-panel-floating-actions')) {
      const shown = this.style.display !== 'none';
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        toJSON: () => ({}),
        width: shown ? actionsSize.width : 0,
        height: shown ? actionsSize.height : 0,
      } as DOMRect;
    }
    return { x: panel.left, y: panel.top, ...panel, toJSON: () => ({}) } as DOMRect;
  });
  // the panel's top-right corner is covered while `topCovered`
  elementFromPoint = vi.fn(() =>
    topCovered ? document.body : document.querySelector('.with-floating-actions')
  );
  (document as any).elementFromPoint = elementFromPoint;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  topCovered = true;
});

const renderPanel = () =>
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

const panelElement = () => document.querySelector('.with-floating-actions') as HTMLElement;
const floatingActions = () =>
  document.querySelector('.reqore-panel-floating-actions') as HTMLElement | null;

/** Hovers the panel, its top-right corner in view, and returns its actions, placed. */
const hover = async () => {
  topCovered = false;
  fireEvent.mouseEnter(panelElement());
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  const actions = floatingActions();
  expect(actions).not.toBeNull();
  expect(actions!.style.display).toBe('flex');
  return actions!;
};

const nextFrame = () =>
  act(() => {
    vi.advanceTimersToNextFrame();
  });

const expectPlacedByThePanel = (actions: HTMLElement) => {
  expect(actions.style.left).toBe(`${panel.right - actionsSize.width}px`);
  expect(actions.style.top).toBe(`${panel.top - actionsSize.height + 1}px`);
};

test("floating actions placed again after being hidden end at the panel's right edge", async () => {
  renderPanel();
  fireEvent.mouseEnter(panelElement());
  await act(async () => {
    vi.advanceTimersByTime(300);
  });
  const actions = floatingActions()!;
  // the first placement finds the corner covered, and hides them
  expect(actions.style.display).toBe('none');
  // uncovered, the next placement (a scroll) shows them
  topCovered = false;
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
  nextFrame();
  expect(actions.style.display).toBe('flex');
  expectPlacedByThePanel(actions);
});

test("a window that resizes after the actions are shown takes them with the panel's corner", async () => {
  renderPanel();
  const actions = await hover();
  expectPlacedByThePanel(actions);

  // the window widens, and the panel with it
  panel = { ...panel, right: 1100, width: 1000 };
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  nextFrame();

  expectPlacedByThePanel(actions);
  expect(actions.style.left).toBe('980px');
});

test('a panel that resizes, with no scroll and no window resize, takes its actions with it', async () => {
  renderPanel();
  const actions = await hover();

  // its container narrows: the panel's corner moves left and down
  panel = { ...panel, right: 250, width: 150, top: 240 };
  act(() => TestResizeObserver.resize(panelElement()));
  nextFrame();

  expectPlacedByThePanel(actions);
  expect(actions.style.left).toBe('130px');
  expect(actions.style.top).toBe('209px');
});

test("actions whose content widens are placed again, their right edge still on the panel's", async () => {
  renderPanel();
  const actions = await hover();
  expect(actions.style.left).toBe('180px');

  // a label, an icon or a font loads in them: 40px wider, and nothing about the panel changed
  actionsSize = { ...actionsSize, width: 160 };
  act(() => TestResizeObserver.resize(actions));
  nextFrame();

  // their right edge is the panel's, not 40px past it
  expect(actions.style.left).toBe('140px');
  expectPlacedByThePanel(actions);
});

test('they are placed once per frame, however many changes come in during it', async () => {
  renderPanel();
  const actions = await hover();
  elementFromPoint.mockClear();

  panel = { ...panel, right: 500, width: 400 };
  act(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    TestResizeObserver.resize(panelElement());
    TestResizeObserver.resize(actions);
  });
  // none inside the reports themselves: a placement there that changes the actions' size (shown again)
  // is a layout change the browser leaves unreported for the frame
  expect(elementFromPoint).not.toHaveBeenCalled();

  nextFrame();
  expect(elementFromPoint).toHaveBeenCalledTimes(1);
  expectPlacedByThePanel(actions);

  // and nothing more until something changes again
  nextFrame();
  expect(elementFromPoint).toHaveBeenCalledTimes(1);
});

test('a panel whose actions are hidden again places them no more, and observes nothing', async () => {
  renderPanel();
  await hover();
  const [observer] = TestResizeObserver.instances;
  expect(observer.observed.has(panelElement())).toBe(true);
  expect(observer.observed.has(floatingActions()!)).toBe(true);

  // a change comes in, and the pointer leaves for what is beside the panel before the frame
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  fireEvent.mouseLeave(panelElement(), {
    relatedTarget: document.body,
    clientX: 5000,
    clientY: 5000,
  });
  expect(floatingActions()).toBeNull();
  expect(observer.disconnected).toBe(true);
  elementFromPoint.mockClear();

  nextFrame();
  act(() => {
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
  });
  nextFrame();

  expect(elementFromPoint).not.toHaveBeenCalled();
});

test('a panel that is gone places nothing in a frame asked for before it went', async () => {
  const { unmount } = renderPanel();
  await hover();
  const [observer] = TestResizeObserver.instances;

  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  unmount();
  elementFromPoint.mockClear();

  nextFrame();
  window.dispatchEvent(new Event('resize'));
  nextFrame();

  expect(elementFromPoint).not.toHaveBeenCalled();
  expect(observer.disconnected).toBe(true);
});

test('without ResizeObserver, a window that resizes still takes the actions with the panel', async () => {
  vi.stubGlobal('ResizeObserver', undefined);
  renderPanel();
  const actions = await hover();

  panel = { ...panel, right: 900, width: 800 };
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
  nextFrame();

  expectPlacedByThePanel(actions);
  expect(TestResizeObserver.instances).toHaveLength(0);
});
