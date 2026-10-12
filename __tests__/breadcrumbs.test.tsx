import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreBreadcrumbs, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/*
 * jsdom lays nothing out, so these tests lay the trail out themselves: its row is `layout.row` wide from 0,
 * and its parts sit side by side from the row's start - a crumb `layout.crumb` wide, an arrow 20px, the
 * "…" menu 40px, and the dropdown that stands in for the current page as wide as the row (it fills it).
 * The trail folds crumbs from its start until no part reaches past the row's end. The same, in a real
 * browser and before the browser paints, is covered by the Breadcrumbs stories.
 */
const layout = { row: 1000, crumb: 100 };

const partWidth = (part: Element): number => {
  if (part.classList.contains('reqore-breadcrumbs-overflow-current')) {
    return layout.row;
  }
  if (part.classList.contains('reqore-breadcrumbs-item')) {
    return layout.crumb;
  }
  return part.classList.contains('reqore-dropdown-control') ? 40 : 20;
};

const box = (left: number, width: number) =>
  ({ left, right: left + width, width, top: 0, bottom: 20, height: 20, x: left, y: 0, toJSON: () => ({}) }) as DOMRect;

const realRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  layout.row = 1000;
  layout.crumb = 100;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (this.classList.contains('reqore-breadcrumbs-overflow-list')) {
      return box(0, layout.row);
    }
    const row = this.parentElement;
    if (row?.classList.contains('reqore-breadcrumbs-overflow-list')) {
      let left = 0;
      for (const part of Array.from(row.children)) {
        if (part === this) {
          break;
        }
        left += partWidth(part);
      }
      return box(left, partWidth(this));
    }
    return box(0, 0);
  } as typeof realRect;
});

afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
  // React says nothing either: no update while rendering another component, no flushSync from an effect,
  // no update loop (Testing Library's own notice that it still uses react-dom's `act` aside)
  const errors = vi
    .mocked(console.error)
    .mock.calls.filter(([message]) => !String(message).includes('ReactDOMTestUtils.act'));
  vi.mocked(console.error).mockClear();
  expect(errors).toEqual([]);
});

const PAGES = [
  { label: 'Page 1', icon: 'Home3Line' as const },
  { label: 'Page 2', icon: 'Home3Line' as const },
  { label: 'Page 3', icon: 'Home3Line' as const },
  { label: 'Page 4', icon: 'Home3Line' as const },
  { label: 'Page 5', icon: 'Home3Line' as const },
];

const drawnCrumbs = () =>
  Array.from(document.querySelectorAll('.reqore-breadcrumbs-item')).map(
    (crumb) => crumb.querySelector('.reqore-button-text-content')?.textContent
  );

const renderTrail = (items = PAGES) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreBreadcrumbs items={items} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Draws every crumb when the trail has room for them', () => {
  act(() => {
    renderTrail();
  });

  expect(drawnCrumbs()).toEqual(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);
  expect(document.querySelector('.reqore-dropdown-control')).toBeNull();
});

test('Folds crumbs from the start into a "…" menu until the rest fits', () => {
  // "…" 40 + arrow 20 + Page 4 100 + arrow 20 + Page 5 100 = 280: Page 3 as well would take 400
  layout.row = 300;
  act(() => {
    renderTrail();
  });

  expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
  expect(document.querySelectorAll('.reqore-dropdown-control')).toHaveLength(1);
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeNull();
});

test('Folds the current page too, into one dropdown labelled with it, when even it does not fit', () => {
  // "…" 40 + arrow 20 + Page 5 100 = 160
  layout.row = 150;
  act(() => {
    renderTrail();
  });

  // Nothing is left as a bare crumb — the trail folded completely.
  expect(drawnCrumbs()).toEqual([]);
  // Exactly one dropdown, and it is the current-page-labelled one (not a "…").
  expect(document.querySelectorAll('.reqore-dropdown-control')).toHaveLength(1);
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')?.textContent).toContain('Page 5');
});

test('Never drops the current page, however much has to collapse', () => {
  layout.row = 150;
  act(() => {
    renderTrail([
      { label: 'Ancestor 1', icon: 'Home3Line' },
      { label: 'Ancestor 2', icon: 'Home3Line' },
      { label: 'The Current Page', icon: 'Home3Line' },
    ]);
  });

  // The current page becomes the label of the single collapsed dropdown — it is
  // never the thing that gets hidden.
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
  expect(document.body.textContent).toContain('The Current Page');
});

// The folded dropdown stands in for the current page, whose label it may cut with an ellipsis to fit: it is
// named in full by its accessible name and its title - the leaf's own when it gives them, else its label.
test('Names the folded current page in full, by the leaf\'s own words or its label', () => {
  layout.row = 150;
  act(() => {
    renderTrail();
  });
  const byLabel = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLabel.getAttribute('aria-label')).toBe('Page 5');
  expect(byLabel.getAttribute('title')).toBe('Page 5');

  document.body.innerHTML = '';
  act(() => {
    renderTrail([
      ...PAGES.slice(0, 4),
      { label: 'Job 4711', 'aria-label': 'Daily Payment Reconciliation, job 4711', title: 'Daily Payment Reconciliation' },
    ] as typeof PAGES);
  });
  const byLeaf = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLeaf.getAttribute('aria-label')).toBe('Daily Payment Reconciliation, job 4711');
  expect(byLeaf.getAttribute('title')).toBe('Daily Payment Reconciliation');
});

test('A new trail is folded as it is rendered, from the crumbs folded before, unfolding while they fit', () => {
  layout.row = 300;
  const { rerender } = renderTrail();
  expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);

  const shorter = [
    { label: 'Interfaces', icon: 'Home3Line' as const },
    { label: 'New chat', icon: 'Home3Line' as const },
  ];
  act(() => {
    rerender(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs items={shorter} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  // Interfaces 100 + arrow 20 + New chat 100 = 220: nothing folded
  expect(drawnCrumbs()).toEqual(['Interfaces', 'New chat']);
  expect(document.querySelector('.reqore-dropdown-control')).toBeNull();
});

test('A trail drawn alike, with new handlers, is not measured again', () => {
  layout.row = 300;
  const withHandlers = () => PAGES.map((page) => ({ ...page, onClick: () => undefined }));
  const { rerender } = renderTrail(withHandlers());
  const row = document.querySelector('.reqore-breadcrumbs-overflow-list')!;
  const changes = new MutationObserver(() => undefined);
  changes.observe(row, { childList: true, subtree: true });

  act(() => {
    rerender(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs items={withHandlers()} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  // measuring again would draw the folded crumbs to try them
  expect(changes.takeRecords().filter((record) => record.addedNodes.length)).toEqual([]);
  changes.disconnect();
  expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
});

test('Renders the right element in its own region, separate from the trail', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs items={PAGES} rightElement={<div>rail-actions</div>} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  const right = document.querySelector('.reqore-breadcrumbs-right');
  expect(right).toBeTruthy();
  expect(right?.textContent).toContain('rail-actions');
  // The current page is still reachable next to it.
  expect(document.body.textContent).toContain('Page 5');
});

test('Static (non-responsive) trail renders every crumb, with working tooltips', async () => {
  vi.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreBreadcrumbs
        responsive={false}
        items={[
          { label: 'Page 1', icon: 'Home3Line' },
          { label: 'Page 2', icon: 'Home3Line' },
          { label: 'Current', icon: 'Home3Line', tooltip: 'Tooltip' },
        ]}
      />
    </ReqoreUIProvider>
  );

  // No collapse in the static path — every crumb is a visible item.
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-breadcrumbs-item')[2]);
  // the tooltip opens on a timer, an update React is told about
  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  // ...and Popper places it in a promise, which settles inside `act` too
  await act(async () => undefined);
  vi.useRealTimers();
});

test('Folds another crumb rather than squeeze the crumb holding tabs, until that crumb is the first shown', () => {
  // the crumb holding tabs fits by its box, but clips its tabs: 300px of them in 200px
  const { scrollWidth, clientWidth } = Object.getOwnPropertyDescriptors(Element.prototype);
  const tabsSqueezed = (element: Element) => element.classList.contains('reqore-breadcrumbs-tabs');
  Object.defineProperty(Element.prototype, 'scrollWidth', {
    configurable: true,
    get(this: Element) {
      return tabsSqueezed(this) ? 300 : scrollWidth.get!.call(this);
    },
  });
  Object.defineProperty(Element.prototype, 'clientWidth', {
    configurable: true,
    get(this: Element) {
      return tabsSqueezed(this) ? 200 : clientWidth.get!.call(this);
    },
  });

  try {
    act(() => {
      renderTrail([
        ...PAGES.slice(0, 3),
        {
          withTabs: {
            tabs: [
              { label: 'Overview', id: 'overview' },
              { label: 'Code', id: 'code' },
            ],
            activeTab: 'overview',
            onTabChange: () => undefined,
          },
        },
      ] as typeof PAGES);
    });

    // every crumb before the tabs folded into the "…" menu; the tabs are the first crumb shown, and stay
    const tabs = document.querySelector<HTMLElement>('.reqore-breadcrumbs-tabs');
    expect(tabs?.dataset.position).toBe('0');
    expect(drawnCrumbs()).toEqual([]);
    expect(document.querySelectorAll('.reqore-dropdown-control')).toHaveLength(1);
  } finally {
    Object.defineProperty(Element.prototype, 'scrollWidth', scrollWidth);
    Object.defineProperty(Element.prototype, 'clientWidth', clientWidth);
  }
});

/*
 * Widths that change outside React - the trail's own, a part's (a badge arriving, padding animating) - come
 * from a ResizeObserver, which folds the trail again before the frame is painted. It lets go of every part
 * first and takes them up again in the next frame, so a size it changed is never left unreported.
 */
class RecordingResizeObserver {
  static instances: RecordingResizeObserver[] = [];
  readonly observed: Array<{ target: Element; box?: string }> = [];
  readonly unobserved: Element[] = [];
  disconnects = 0;
  constructor(readonly callback: ResizeObserverCallback) {
    RecordingResizeObserver.instances.push(this);
  }
  observe(target: Element, options?: ResizeObserverOptions) {
    this.observed.push({ target, box: options?.box });
  }
  unobserve(target: Element) {
    this.unobserved.push(target);
  }
  disconnect() {
    this.disconnects++;
  }
  report(target: Element, width: number) {
    this.callback(
      [{ target, borderBoxSize: [{ inlineSize: width, blockSize: 20 }] } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver
    );
  }
}

const withRecordingResizeObserver = (run: (frames: FrameRequestCallback[]) => void) => {
  const original = globalThis.ResizeObserver;
  const { requestAnimationFrame, cancelAnimationFrame } = window;
  const frames: FrameRequestCallback[] = [];
  RecordingResizeObserver.instances = [];
  (globalThis as Record<string, unknown>).ResizeObserver = RecordingResizeObserver;
  window.requestAnimationFrame = (callback) => frames.push(callback);
  window.cancelAnimationFrame = () => undefined;
  try {
    run(frames);
  } finally {
    globalThis.ResizeObserver = original;
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;
  }
};

/** The row and the parts it draws. */
const rowParts = (row: Element) => [row, ...Array.from(row.children)];

const trailObserver = () => {
  const observers = RecordingResizeObserver.instances.filter((observer) =>
    observer.observed.some(({ target }) => target.classList.contains('reqore-breadcrumbs-overflow-list'))
  );
  expect(observers).toHaveLength(1);
  return observers[0];
};

test('Observes the row and every part it draws, by its border box, and lets go of a part it folds', () => {
  withRecordingResizeObserver(() => {
    layout.row = 300;
    const { unmount } = renderTrail();
    const observer = trailObserver();
    const row = document.querySelector('.reqore-breadcrumbs-overflow-list')!;
    const observed = observer.observed.map(({ target }) => target);

    for (const part of rowParts(row)) {
      expect(observed).toContain(part);
    }
    // the box a crumb grows by when its padding grows
    expect(observer.observed.every(({ box }) => box === 'border-box')).toBe(true);
    // crumbs drawn while the trail was folding, and folded since, are no longer observed
    const gone = observed.filter((target) => !target.isConnected);
    expect(gone.length).toBeGreaterThan(0);
    for (const target of gone) {
      expect(observer.unobserved).toContain(target);
    }

    unmount();
    expect(observer.disconnects).toBeGreaterThan(0);
  });
});

test('A static trail observes nothing', () => {
  withRecordingResizeObserver(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreBreadcrumbs responsive={false} items={PAGES} />
      </ReqoreUIProvider>
    );

    expect(RecordingResizeObserver.instances.every((observer) => observer.observed.length === 0 ||
      !observer.observed.some(({ target }) => target.closest('.reqore-breadcrumbs-wrapper')))).toBe(true);
  });
});

test('A part that grows past the trail has another crumb folded before the frame is painted', () => {
  withRecordingResizeObserver((frames) => {
    layout.row = 300;
    renderTrail();
    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    const observer = trailObserver();
    const crumb = document.querySelector('.reqore-breadcrumbs-item')!;
    const watched = observer.observed.length;

    // the crumbs grow: "…" 40 + arrow 20 + 120 + arrow 20 + 120 = 320, past the row's 300
    layout.crumb = 120;
    act(() => observer.report(crumb, 120));

    // folded there and then, inside the observer's callback
    expect(drawnCrumbs()).toEqual(['Page 5']);
    // having let go of every part, so no size it changed is left unreported
    expect(observer.disconnects).toBe(1);
    expect(observer.observed).toHaveLength(watched);
    // ...and taking them up again in the next frame
    expect(frames).toHaveLength(1);
    act(() => frames[0](0));
    const row = document.querySelector('.reqore-breadcrumbs-overflow-list')!;
    const observedAgain = observer.observed.slice(watched).map(({ target }) => target);
    expect(observedAgain).toEqual(rowParts(row));
  });
});

test('A trail that gets wider unfolds the crumbs that fit again', () => {
  withRecordingResizeObserver(() => {
    layout.row = 300;
    renderTrail();
    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    const observer = trailObserver();

    layout.row = 1000;
    act(() => observer.report(document.querySelector('.reqore-breadcrumbs-overflow-list')!, 1000));

    expect(drawnCrumbs()).toEqual(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);
  });
});

test('A width that changed by less than half a pixel, or a part that grew and still fits, changes nothing', () => {
  withRecordingResizeObserver((frames) => {
    layout.row = 300;
    renderTrail();
    const observer = trailObserver();
    const row = document.querySelector('.reqore-breadcrumbs-overflow-list')!;

    act(() => observer.report(row, 300.4));
    // "…" 40 + arrow 20 + 110 + arrow 20 + 110 = 300: still inside
    layout.crumb = 110;
    act(() => observer.report(document.querySelector('.reqore-breadcrumbs-item')!, 110));

    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    expect(observer.disconnects).toBe(0);
    expect(frames).toHaveLength(0);
  });
});
