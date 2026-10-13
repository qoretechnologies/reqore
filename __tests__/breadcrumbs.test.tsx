import { act, fireEvent, render } from '@testing-library/react';
import { Profiler } from 'react';
import { ReqoreBreadcrumbs, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { getTabsLength } from '../src/components/Tabs/list';

/*
 * jsdom lays nothing out, so these tests lay the trail out themselves: its row is `layout.row` wide
 * from 0 (or the bar's `maxWidth`, when it is narrower), and its parts sit side by side from the
 * row's start - a crumb `layout.crumb` wide, an arrow 20px, the "…" menu 40px, the dropdown that
 * stands in for the current page as wide as the row (it fills it) but never narrower than its 5em
 * floor, `STAND_IN_FLOOR`, and the crumb holding tabs at the end of the trail as wide as the room
 * the other parts leave it. Every box is scaled by `layout.scale`, as a transform on an ancestor
 * scales what `getBoundingClientRect` gives. The trail folds crumbs from its start until no part
 * reaches past the row's end. The same, in a real browser and before the browser paints, is covered
 * by the Breadcrumbs stories.
 */
const layout = { row: 1000, crumb: 100, scale: 1 };

const STAND_IN_FLOOR = 70;

/** The row's width: the trail's, or the bar's `maxWidth` when that is less. */
const rowWidth = (row: Element): number => {
  const bar = row.closest<HTMLElement>('.reqore-breadcrumbs-wrapper');
  const maxWidth = parseFloat(bar?.style.maxWidth ?? '');

  return Number.isNaN(maxWidth) ? layout.row : Math.min(layout.row, maxWidth);
};

/** A part's width, `left` from the start of `row`. */
const partWidth = (part: Element, row: Element, left: number): number => {
  if (part.classList.contains('reqore-breadcrumbs-overflow-current')) {
    return Math.max(rowWidth(row), STAND_IN_FLOOR);
  }
  if (part.classList.contains('reqore-breadcrumbs-tabs')) {
    return Math.max(0, rowWidth(row) - left);
  }
  if (part.classList.contains('reqore-breadcrumbs-item')) {
    return layout.crumb;
  }
  return part.classList.contains('reqore-dropdown-control') ? 40 : 20;
};

const box = (left: number, width: number) =>
  ({
    left: left * layout.scale,
    right: (left + width) * layout.scale,
    width: width * layout.scale,
    top: 0,
    bottom: 20,
    height: 20,
    x: left * layout.scale,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

const realRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  layout.row = 1000;
  layout.crumb = 100;
  layout.scale = 1;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (this.classList.contains('reqore-breadcrumbs-overflow-list')) {
      return box(0, rowWidth(this));
    }
    const row = this.parentElement;
    if (row?.classList.contains('reqore-breadcrumbs-overflow-list')) {
      let left = 0;
      for (const part of Array.from(row.children)) {
        if (part === this) {
          break;
        }
        left += partWidth(part, row, left);
      }
      return box(left, partWidth(this, row, left));
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
// named in full by its accessible name - the leaf's own when it gives one, else its label, else the
// label its menu row has (an icon-only leaf). It takes no title of its own: hovering it opens its
// menu, which names every crumb in full, and a browser's tooltip would cover that menu.
test("Names the folded current page in full: the leaf's own name, its label or menu label", () => {
  layout.row = 150;
  act(() => {
    renderTrail();
  });
  const byLabel = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLabel.getAttribute('aria-label')).toBe('Page 5');
  expect(byLabel.hasAttribute('title')).toBe(false);

  document.body.innerHTML = '';
  act(() => {
    renderTrail([
      ...PAGES.slice(0, 4),
      {
        label: 'Job 4711',
        'aria-label': 'Daily Payment Reconciliation, job 4711',
        title: 'Daily Payment Reconciliation',
      },
    ] as typeof PAGES);
  });
  const byLeaf = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLeaf.getAttribute('aria-label')).toBe('Daily Payment Reconciliation, job 4711');
  // a title the leaf gives itself is the leaf's, as on its crumb
  expect(byLeaf.getAttribute('title')).toBe('Daily Payment Reconciliation');

  document.body.innerHTML = '';
  act(() => {
    renderTrail([...PAGES.slice(0, 4), { icon: 'Home3Line', menuLabel: 'Home' }] as typeof PAGES);
  });
  const byMenuLabel = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byMenuLabel.getAttribute('aria-label')).toBe('Home');
  expect(byMenuLabel.hasAttribute('title')).toBe(false);
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
  /** A report of `target`'s border box: its layout size, which a transform does not scale. */
  report(target: Element, width: number, height = 20) {
    this.callback(
      [
        {
          target,
          borderBoxSize: [{ inlineSize: width, blockSize: height }],
          contentRect: { width, height },
        } as unknown as ResizeObserverEntry,
      ],
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

    layout.row = 300.4;
    act(() => observer.report(row, 300.4));
    // "…" 40 + arrow 20 + 110 + arrow 20 + 110 = 300: still inside
    layout.crumb = 110;
    act(() => observer.report(document.querySelector('.reqore-breadcrumbs-item')!, 110));

    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    expect(observer.disconnects).toBe(0);
    expect(frames).toHaveLength(0);
  });
});

const trailOf = (items: typeof PAGES, props: Record<string, unknown> = {}) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreBreadcrumbs items={items} {...props} />
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const trailRow = () => document.querySelector<HTMLElement>('.reqore-breadcrumbs-overflow-list')!;

// The bar made wider by its own props - a right element that shrinks or goes, a `maxWidth` lifted
// (the IDE's page going full screen) - draws the trail wider in the same render; the observer
// reports it after that render, and the trail unfolds what fits, as it does when it gets wider any
// other way.
test('A trail its own props make wider unfolds the crumbs that fit again', () => {
  withRecordingResizeObserver(() => {
    const { rerender } = render(trailOf(PAGES, { style: { maxWidth: '300px' } }));
    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);

    act(() => {
      rerender(trailOf(PAGES, { style: { maxWidth: 'none' } }));
    });
    act(() => trailObserver().report(trailRow(), 1000));

    expect(drawnCrumbs()).toEqual(['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5']);
  });
});

// A transform on an ancestor (an app that scales its page, a scale-in animation) scales what the
// trail measures but not the boxes the observer reports, so the two are compared as the trail
// measures them: a report of the size the trail was drawn at changes nothing, rather than folding
// again on every frame.
test('Under a scaled ancestor, a report of the size the trail was drawn at changes nothing', () => {
  withRecordingResizeObserver((frames) => {
    layout.row = 300;
    layout.scale = 0.5;
    renderTrail();
    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    const observer = trailObserver();

    // the layout's own sizes: twice what the trail measures at half the scale
    act(() => observer.report(trailRow(), 300));
    act(() => observer.report(document.querySelector('.reqore-breadcrumbs-item')!, 100));

    expect(drawnCrumbs()).toEqual(['Page 4', 'Page 5']);
    expect(observer.disconnects).toBe(0);
    expect(frames).toHaveLength(0);
  });
});

// With every crumb folded, the dropdown standing in for the current page keeps 5em of it, so in a
// trail narrower than that it reaches past the end for good: there is nothing left to fold, and the
// observer leaves it so, rather than render the trail again on every frame.
test("A trail narrower than the current page's dropdown is not rendered on every frame", () => {
  withRecordingResizeObserver((frames) => {
    layout.row = 50;
    const renders = vi.fn();
    render(<Profiler id='trail' onRender={renders}>{trailOf(PAGES)}</Profiler>);
    expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
    const observer = trailObserver();
    renders.mockClear();

    // ten frames, each reporting the trail as a part taken up again is reported
    for (let frame = 0; frame < 10; frame++) {
      act(() => observer.report(trailRow(), 50));
      for (const next of frames.splice(0)) {
        act(() => next(0));
      }
    }

    expect(renders).not.toHaveBeenCalled();
    expect(observer.disconnects).toBe(0);
  });
});

const TABS = {
  tabs: [
    { label: 'Overview', id: 'overview' },
    { label: 'Code', id: 'code' },
  ],
  activeTab: 'overview',
  onTabChange: () => undefined,
};

/** The room the tabs list has: the crumb holding it, less the arrow before it. */
const withTabsRoom = (run: () => void) => {
  const computed = window.getComputedStyle.bind(window);
  const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
    const style = computed(element, pseudo);
    const crumb = element.closest<HTMLElement>('.reqore-breadcrumbs-tabs');
    if (crumb && element.classList.contains('reqore-tabs-list')) {
      const arrow = crumb.dataset.position === '0' ? 0 : 20;
      const room = crumb.getBoundingClientRect().width / layout.scale - arrow;
      Object.defineProperty(style, 'width', { value: `${room}px` });
    }
    return style;
  });
  try {
    run();
  } finally {
    spy.mockRestore();
  }
};

// At the end of the trail, the crumb holding tabs takes the room the other parts leave, and a crumb
// before it is shown only while that room is what all its tabs need - by the tabs list's own
// reckoning, not by the tabs it draws now, which are fewer once some are in "More". A trail made
// wider again unfolds its crumbs only once the tabs have their room back, as a trail first drawn at
// that width shows them.
test('A trail made wider unfolds a crumb only while its tabs keep the room they all need', () => {
  const need = getTabsLength(TABS.tabs, 'width', TABS.activeTab, 'normal');
  const items = [...PAGES.slice(0, 3), { withTabs: TABS }] as typeof PAGES;

  withTabsRoom(() =>
    withRecordingResizeObserver(() => {
      // "…" 40 + arrow 20, then the crumb holding the tabs, first shown: 10px less than they need
      layout.row = 60 + need - 10;
      renderTrail(items);
      const tabs = () => document.querySelector<HTMLElement>('.reqore-breadcrumbs-tabs')!;
      expect(tabs().dataset.position).toBe('0');
      expect(drawnCrumbs()).toEqual([]);
      const observer = trailObserver();

      // room for one crumb: "…" 40 + arrow 20 + Page 3 100, the tabs' arrow 20, and 10px spare
      layout.row = 180 + need + 10;
      act(() => observer.report(trailRow(), layout.row));

      expect(drawnCrumbs()).toEqual(['Page 3']);
      expect(tabs().dataset.position).toBe('1');

      // narrower with the trail, the crumb holding the tabs leaves no room for anything else
      const disconnects = observer.disconnects;
      layout.row -= 5;
      act(() => observer.report(tabs(), 0));
      expect(observer.disconnects).toBe(disconnects);
      expect(drawnCrumbs()).toEqual(['Page 3']);
    })
  );
});

// A fold made inside the observer's callback changes the trail's layout there and then. Its width
// does not change (the trail takes the room the bar gives it), but its height can: a crumb with a
// description is taller than the others. A height changed there would change the size of what holds
// the trail - watched, perhaps, by another observer, which the browser would leave unreported and
// report as an error - so the trail keeps the height the observer last reported until the next
// frame.
test('A fold made inside the observer keeps the trail\'s height until the next frame', () => {
  withRecordingResizeObserver((frames) => {
    layout.row = 300;
    renderTrail();
    const observer = trailObserver();
    const row = trailRow();

    act(() => observer.report(row, 300, 46));
    expect(row.style.height).toBe('');

    layout.crumb = 120;
    act(() => observer.report(document.querySelector('.reqore-breadcrumbs-item')!, 120));

    expect(drawnCrumbs()).toEqual(['Page 5']);
    expect(row.style.height).toBe('46px');
    act(() => frames[0](0));
    expect(row.style.height).toBe('');
  });
});
