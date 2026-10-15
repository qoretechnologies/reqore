import { act, fireEvent, render } from '@testing-library/react';
import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReqoreControlGroup, ReqoreUIProvider } from '../src';

/**
 * A responsive control group folds only what it has, and folds each child once (qorus#646).
 *
 * The group folds its children into a `…` menu one at a time for as long as its row overflows. Nothing
 * stopped the count when every child was already in the menu: a group whose overflow button alone is wider
 * than its room - a labelled or large button, a narrow container - kept counting, re-rendering the same row
 * and measuring it again, forever. Under `act` that froze the page (the Qorus IDE's story run).
 *
 * The row and the menu also took from two different lists: the row sliced the raw `children` array, the
 * menu took from `React.Children.toArray(children)`, which leaves out the holes a caller leaves (`null`,
 * `false`). A hole therefore put a child in both the row and the menu. And a group with one child, which is
 * not an array, threw at its first fold.
 *
 * jsdom lays nothing out, so the layout is modelled, as in `controlGroupResponsiveSettles`: each child
 * declares its width, the overflow button is `menuWidth` wide, and the container grants `available`.
 */

/** Width of each child the test puts in the group. */
const CHILD_WIDTH = 50;

const layout = { available: 0, menuWidth: 40, measurements: 0 };

/**
 * How many times the group may measure itself before the test calls it a loop. A group that settles
 * measures a handful of times; one that never stops would hang the test inside `act` rather than fail it.
 */
const MEASUREMENT_LIMIT = 500;

const Action = ({ index }: { index: number }) => (
  <span data-test-width={CHILD_WIDTH} data-testid={`action-${index}`}>
    {`Action ${index + 1}`}
  </span>
);

const contentWidth = (group: HTMLElement): number =>
  Array.from(group.children).reduce(
    (total, child) => total + Number((child as HTMLElement).dataset.testWidth ?? layout.menuWidth),
    0
  );

/** Teaches jsdom the two widths the group reads, as the box model would give them. */
const modelLayout = (group: HTMLElement) => {
  Object.defineProperty(group, 'scrollWidth', {
    configurable: true,
    get: () => {
      layout.measurements++;
      if (layout.measurements > MEASUREMENT_LIMIT) {
        throw new Error('the group kept measuring itself');
      }
      return contentWidth(group);
    },
  });
  Object.defineProperty(group, 'clientWidth', {
    configurable: true,
    get: () => Math.min(contentWidth(group), layout.available),
  });
  Object.defineProperty(group.parentElement!, 'clientWidth', {
    configurable: true,
    get: () => layout.available,
  });
};

/** Renders the group with nothing folded, then gives it `available` px of room and lets it fold. */
const renderGroup = (children: ReactNode) => {
  const view = render(
    <ReqoreUIProvider>
      <div data-testid='container'>
        <ReqoreControlGroup responsive>{children}</ReqoreControlGroup>
      </div>
    </ReqoreUIProvider>
  );
  const group = view.container.querySelector('.reqore-control-group') as HTMLElement;
  modelLayout(group);
  // the room changes, as a resize would tell it
  act(() => {
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(250);
  });
  return { ...view, group };
};

/** The actions the row itself is showing. */
const rowActions = (group: HTMLElement) =>
  Array.from(group.querySelectorAll<HTMLElement>('[data-testid^="action-"]')).map(
    (element) => element.dataset.testid
  );

const menuButton = (group: HTMLElement) => group.querySelector<HTMLElement>('.reqore-button');

/** The actions the overflow menu holds, once it is opened. */
const menuActions = (group: HTMLElement) => {
  act(() => {
    fireEvent.click(menuButton(group)!);
    vi.advanceTimersByTime(500);
  });
  return Array.from(
    document.querySelectorAll<HTMLElement>('.reqore-popover-content [data-testid^="action-"]')
  ).map((element) => element.dataset.testid);
};

/** Makes the group measure itself again, as its observer does when its container changes size. */
const remeasure = () =>
  act(() => {
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(250);
  });

class TestResizeObserver {
  private static all: TestResizeObserver[] = [];
  constructor(readonly callback: ResizeObserverCallback) {
    TestResizeObserver.all.push(this);
  }
  observe() {
    window.addEventListener('resize', this.deliver);
  }
  unobserve() {}
  disconnect() {
    window.removeEventListener('resize', this.deliver);
  }
  private deliver = () => this.callback([], this as never);
}

beforeEach(() => {
  layout.available = 0;
  layout.menuWidth = 40;
  layout.measurements = 0;
  vi.useFakeTimers();
  vi.stubGlobal('ResizeObserver', TestResizeObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const actions = (count: number) =>
  Array.from({ length: count }, (_, index) => <Action key={index} index={index} />);

describe('a responsive control group with nothing left to fold', () => {
  it('stops when every child is in the menu, though its button alone does not fit', () => {
    // Three 50px children, and a 60px overflow button in 50px of room: with every child folded the row is
    // still 60px wide, which no further fold can change.
    layout.menuWidth = 60;
    const { group } = renderGroup(actions(3));
    layout.available = 50;

    remeasure();

    expect(layout.measurements).toBeLessThan(MEASUREMENT_LIMIT);
    expect(rowActions(group)).toEqual([]);
    expect(menuButton(group)).toBeTruthy();
    expect(menuActions(group)).toEqual(['action-0', 'action-1', 'action-2']);
  });

  it('folds a single child that does not fit, and does not throw', () => {
    const { group } = renderGroup(<Action index={0} />);
    layout.available = 45;

    remeasure();

    expect(rowActions(group)).toEqual([]);
    expect(menuActions(group)).toEqual(['action-0']);
  });
});

describe('a responsive control group whose children have holes', () => {
  it('puts each folded child in the menu and nowhere else', () => {
    // [hole, A, hole, B, C] in room for two of them beside the button
    const { group } = renderGroup([
      null,
      <Action key='a' index={0} />,
      false,
      <Action key='b' index={1} />,
      <Action key='c' index={2} />,
    ]);
    layout.available = 140;

    remeasure();

    const row = rowActions(group);
    const menu = menuActions(group);
    expect(row.length + menu.length).toBe(3);
    expect(row.filter((action) => menu.includes(action))).toEqual([]);
    expect([...menu, ...row]).toEqual(['action-0', 'action-1', 'action-2']);
  });
});

describe('a responsive control group that fits once it has folded', () => {
  it('still stops as soon as the row fits', () => {
    const { group } = renderGroup(actions(3));
    layout.available = 120;

    remeasure();

    // 120px holds one 50px child beside the 40px button
    expect(rowActions(group)).toEqual(['action-2']);
    expect(menuActions(group)).toEqual(['action-0', 'action-1']);
  });
});
