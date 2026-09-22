import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReqoreControlGroup, ReqoreUIProvider } from '../src';

/**
 * A responsive control group must stop measuring once it has decided.
 *
 * The group folds children into a `…` menu when its content does not fit, and
 * folding CHANGES THE GROUP'S OWN WIDTH. It also watched its own element with a
 * `ResizeObserver` and put every folded child back whenever that element
 * resized — so the fold undid itself, the group re-measured, folded again, and
 * the two fed each other forever. On a 380px panel that was ten observer
 * callbacks a second for as long as the panel was on screen.
 *
 * The guard here is therefore a MEASUREMENT, not a render: how many resize
 * notifications the group answers before it stops answering. A test that merely
 * rendered the group would pass on the oscillating code.
 *
 * Each round delivers one observer callback and then asks whether the group
 * re-rendered. A re-render is the whole loop in miniature — putting the folded
 * children back and folding them again changes the element's width twice, which
 * is precisely what makes the browser deliver the next callback — so "it
 * re-rendered" and "the browser has another callback to deliver" are the same
 * statement, and the round count is the callback rate a real browser measures.
 *
 * The layout is modelled rather than measured, because jsdom lays nothing out:
 * every child the test renders declares its width, anything the group renders
 * for itself (the overflow button) is 40px wide, and the container grants a
 * fixed amount of room. That covers the only two numbers the group reads —
 * `scrollWidth` (what the content wants) and `clientWidth` (what it got) — and
 * it makes the feedback loop exactly reproducible instead of intermittent: in a
 * real browser whether it spins or settles is a frame race that goes the wrong
 * way about one run in five.
 */

/** Width of each child the test puts in the group. */
const CHILD_WIDTH = 50;
/** Width of the overflow `…` button the group renders for itself. */
const MENU_WIDTH = 40;

/** How much room the container grants the group; changed to resize it. */
const available = { width: 0 };

/** Every render of a child the group is showing, across the whole tree. */
const renders = { count: 0 };

/** The registered observations, so the test can deliver callbacks by hand. */
interface IObservation {
  element: Element;
  callback: ResizeObserverCallback;
}

const observations: IObservation[] = [];

class TestResizeObserver {
  constructor(readonly callback: ResizeObserverCallback) {}

  observe(element: Element) {
    observations.push({ element, callback: this.callback });
  }

  unobserve(element: Element) {
    for (let index = observations.length - 1; index >= 0; index--) {
      if (
        observations[index].callback === this.callback &&
        observations[index].element === element
      ) {
        observations.splice(index, 1);
      }
    }
  }

  disconnect() {
    for (let index = observations.length - 1; index >= 0; index--) {
      if (observations[index].callback === this.callback) {
        observations.splice(index, 1);
      }
    }
  }
}

const Action = ({ index }: { index: number }) => {
  renders.count++;

  return (
    <span data-test-width={CHILD_WIDTH} data-testid={`action-${index}`}>
      {`Action ${index + 1}`}
    </span>
  );
};

/** What the group's content wants: the sum of what is currently rendered. */
const contentWidth = (group: HTMLElement): number =>
  Array.from(group.children).reduce(
    (total, child) => total + Number((child as HTMLElement).dataset.testWidth ?? MENU_WIDTH),
    0
  );

/**
 * Teaches jsdom the widths the group reads, as the box model would give them:
 * the group's content box is as wide as its content wants, up to what the
 * container granted, and the container is as wide as it was granted.
 */
const modelLayout = (group: HTMLElement) => {
  Object.defineProperty(group, 'scrollWidth', {
    configurable: true,
    get: () => contentWidth(group),
  });
  Object.defineProperty(group, 'clientWidth', {
    configurable: true,
    get: () => Math.min(contentWidth(group), available.width),
  });
  Object.defineProperty(group.parentElement!, 'clientWidth', {
    configurable: true,
    get: () => available.width,
  });
};

/** How many callbacks a group is given before the test calls it a spin. */
const CALLBACK_CAP = 40;

/**
 * Delivers observer callbacks for as long as the group keeps reacting to them,
 * and returns how many were needed. A settled group stops reacting after a
 * fixed, small number; a group feeding its own observer never stops, so the
 * count runs to the cap.
 */
const deliverResizesUntilSettled = (): number => {
  let delivered = 0;

  for (let round = 0; round < CALLBACK_CAP; round++) {
    const before = renders.count;

    act(() => {
      [...observations].forEach(({ callback }) => callback([], null as never));
      // The group debounces its observer by 200ms.
      vi.advanceTimersByTime(250);
    });

    delivered++;

    // The group did not re-render, so its width did not change, so the browser
    // has nothing more to tell it.
    if (renders.count === before) {
      break;
    }
  }

  return delivered;
};

const renderGroup = (childCount: number) => {
  const view = render(
    <ReqoreUIProvider>
      <div data-testid='container'>
        <ReqoreControlGroup responsive>
          {Array.from({ length: childCount }, (_, index) => (
            <Action key={index} index={index} />
          ))}
        </ReqoreControlGroup>
      </div>
    </ReqoreUIProvider>
  );

  const group = view.container.querySelector('.reqore-control-group') as HTMLElement;
  modelLayout(group);

  return { ...view, group };
};

/** The children the group is currently showing in the row itself. */
const visibleActions = (group: HTMLElement): number =>
  group.querySelectorAll('[data-testid^="action-"]').length;

/** Whether the group folded anything into its overflow menu. */
const hasOverflowMenu = (group: HTMLElement): boolean =>
  group.querySelectorAll('.reqore-button').length > 0;

beforeEach(() => {
  observations.length = 0;
  available.width = 0;
  renders.count = 0;
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('a responsive control group that has to fold', () => {
  it('stops answering its observer once it has folded', () => {
    // Three 50px children in 120px of room: the row cannot hold them, and
    // folding two of them away makes the group 90px wide — a size change its
    // own observer sees.
    const { group } = renderGroup(3);
    available.width = 120;

    const callbacks = deliverResizesUntilSettled();

    // One callback to measure the container for the first time, one to be
    // ignored as the group's own doing. Anything past that is the group
    // answering its own collapse, which is the oscillation.
    expect(callbacks).toBeLessThanOrEqual(3);
    expect(callbacks).toBeLessThan(CALLBACK_CAP);

    // ...and it settled folded, so the bound is not met by never folding.
    expect(hasOverflowMenu(group)).toBe(true);
    expect(visibleActions(group)).toBeLessThan(3);
  });

  it('leaves a group that fits alone, and never folds it', () => {
    const { group } = renderGroup(3);
    available.width = 400;

    const callbacks = deliverResizesUntilSettled();

    expect(callbacks).toBeLessThanOrEqual(3);
    expect(hasOverflowMenu(group)).toBe(false);
    expect(visibleActions(group)).toBe(3);
  });

  it('unfolds again when the container gives the room back', () => {
    const { group } = renderGroup(3);

    available.width = 120;
    deliverResizesUntilSettled();
    expect(visibleActions(group)).toBeLessThan(3);

    // The container widens. The group's OWN width does not change while it is
    // folded — it is only as wide as the one button it is showing — so the
    // container is the only thing that can carry this news.
    available.width = 400;
    const callbacks = deliverResizesUntilSettled();

    expect(callbacks).toBeLessThan(CALLBACK_CAP);
    expect(visibleActions(group)).toBe(3);
    expect(hasOverflowMenu(group)).toBe(false);
  });

  it('folds again when the container takes the room back', () => {
    const { group } = renderGroup(3);

    available.width = 400;
    deliverResizesUntilSettled();
    expect(visibleActions(group)).toBe(3);

    available.width = 120;
    const callbacks = deliverResizesUntilSettled();

    expect(callbacks).toBeLessThan(CALLBACK_CAP);
    expect(hasOverflowMenu(group)).toBe(true);
    expect(visibleActions(group)).toBeLessThan(3);
  });
});
