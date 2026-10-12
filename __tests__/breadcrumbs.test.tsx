import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreBreadcrumbs, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

// jsdom has no layout, so `OverflowList` measures a width of 0 and collapses the
// WHOLE trail (minVisibleItems=0). That fully-collapsed shape — ONE dropdown
// LABELLED with the current page, every crumb in its menu, never an unreadable
// stub and never a bare "…" — is exactly what these tests pin down. The
// width-driven intermediate states (full trail, "… > current page") and the
// no-overlap invariant next to a right element are covered by the Breadcrumbs
// stories, which run in a real browser. The static (`responsive={false}`) trail
// is used where a test needs every crumb rendered (e.g. tooltips).

const PAGES = [
  { label: 'Page 1', icon: 'Home3Line' as const },
  { label: 'Page 2', icon: 'Home3Line' as const },
  { label: 'Page 3', icon: 'Home3Line' as const },
  { label: 'Page 4', icon: 'Home3Line' as const },
  { label: 'Page 5', icon: 'Home3Line' as const },
];

test('Collapses the whole trail into one dropdown labelled with the current page', () => {
  act(() => {
    render(
      <div style={{ width: '1000px' }}>
        <ReqoreUIProvider>
          <ReqoreLayoutContent>
            <ReqoreBreadcrumbs items={PAGES} />
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      </div>
    );
  });

  expect(document.querySelectorAll('.reqore-breadcrumbs-wrapper').length).toBe(1);
  // Nothing is left as a bare crumb — the trail folded completely.
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(0);
  // Exactly one dropdown, and it is the current-page-labelled one (not a "…").
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(1);
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
  // Labelled with the current page — always legible, never just "…".
  expect(document.body.textContent).toContain('Page 5');
});

test('Never drops the current page, however much has to collapse', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            items={[
              { label: 'Ancestor 1', icon: 'Home3Line' },
              { label: 'Ancestor 2', icon: 'Home3Line' },
              { label: 'The Current Page', icon: 'Home3Line' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  // The current page becomes the label of the single collapsed dropdown — it is
  // never the thing that gets hidden.
  expect(document.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy();
  expect(document.body.textContent).toContain('The Current Page');
});

// The folded dropdown stands in for the current page, whose label it may cut with an ellipsis to fit: it is
// named in full by its accessible name and its title - the leaf's own when it gives them, else its label.
test('Names the folded current page in full, by the leaf\'s own words or its label', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs items={PAGES} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });
  const byLabel = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLabel.getAttribute('aria-label')).toBe('Page 5');
  expect(byLabel.getAttribute('title')).toBe('Page 5');

  document.body.innerHTML = '';
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            items={[
              ...PAGES.slice(0, 4),
              { label: 'Job 4711', 'aria-label': 'Daily Payment Reconciliation, job 4711', title: 'Daily Payment Reconciliation' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });
  const byLeaf = document.querySelector('.reqore-breadcrumbs-overflow-current')!;
  expect(byLeaf.getAttribute('aria-label')).toBe('Daily Payment Reconciliation, job 4711');
  expect(byLeaf.getAttribute('title')).toBe('Daily Payment Reconciliation');
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

test('Static (non-responsive) trail renders every crumb, with working tooltips', () => {
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
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

/*
 * A crumb that changes width after the trail measured it has the trail measured again (qorus#646): each
 * crumb's border box is observed while it is drawn, and no longer once it is folded or gone.
 */
class RecordingResizeObserver {
  static instances: RecordingResizeObserver[] = [];
  readonly observed: Array<{ target: Element; box?: string }> = [];
  readonly unobserved: Element[] = [];
  disconnected = false;
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
    this.disconnected = true;
  }
}

const withRecordingResizeObserver = (run: () => void) => {
  const original = globalThis.ResizeObserver;
  RecordingResizeObserver.instances = [];
  (globalThis as Record<string, unknown>).ResizeObserver = RecordingResizeObserver;
  try {
    run();
  } finally {
    globalThis.ResizeObserver = original;
  }
};

test('Observes each drawn crumb by its border box, and lets go of it once it is folded', () => {
  withRecordingResizeObserver(() => {
    const { unmount } = render(
      <ReqoreUIProvider>
        <ReqoreBreadcrumbs items={PAGES} />
      </ReqoreUIProvider>
    );

    const crumbObservers = RecordingResizeObserver.instances.filter((observer) =>
      observer.observed.some(({ target }) => target.classList.contains('reqore-breadcrumbs-item'))
    );
    expect(crumbObservers).toHaveLength(1);
    const [observer] = crumbObservers;
    const crumbs = observer.observed.filter(({ target }) =>
      target.classList.contains('reqore-breadcrumbs-item')
    );
    // every crumb, by the box a crumb grows by when its padding grows
    expect(crumbs.length).toBeGreaterThanOrEqual(PAGES.length);
    expect(crumbs.every(({ box }) => box === 'border-box')).toBe(true);
    // jsdom has no width, so the whole trail folds: no crumb drawn is still observed
    for (const { target } of crumbs) {
      expect(observer.unobserved).toContain(target);
    }

    unmount();
    expect(observer.disconnected).toBe(true);
  });
});

test('A static trail observes nothing', () => {
  withRecordingResizeObserver(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreBreadcrumbs responsive={false} items={PAGES} />
      </ReqoreUIProvider>
    );

    const crumbObserved = RecordingResizeObserver.instances.some((observer) =>
      observer.observed.some(({ target }) => target.classList.contains('reqore-breadcrumbs-item'))
    );
    expect(crumbObserved).toBe(false);
  });
});

test('A crumb that changed width before the observer first reported it has the trail measured again', () => {
  /* Every box is 100px wide and the trail has room, until the crumbs grow: then the spacer that
     `OverflowList` reads is squeezed to nothing and the trail overflows. */
  let grown = false;
  const rect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const spacer = this.style?.width === '1px';
    const width = spacer ? (grown ? 0 : 1) : 100;
    return { width, height: 20, top: 0, left: 0, right: width, bottom: 20, x: 0, y: 0, toJSON: () => ({}) };
  } as typeof rect;

  try {
    withRecordingResizeObserver(() => {
      render(
        <ReqoreUIProvider>
          <ReqoreBreadcrumbs items={PAGES} />
        </ReqoreUIProvider>
      );

      // the whole trail fits: every crumb is drawn, nothing folded
      expect(document.querySelectorAll('.reqore-breadcrumbs-item')).toHaveLength(PAGES.length);
      expect(document.querySelector('.reqore-dropdown-control')).toBeNull();

      const observer = RecordingResizeObserver.instances.find((each) =>
        each.observed.some(({ target }) => target.classList.contains('reqore-breadcrumbs-item'))
      )!;
      const list = document.querySelector('.reqore-breadcrumbs-overflow-list') as HTMLElement;
      Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 600 });
      Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 });
      grown = true;

      // the observer's FIRST report of each crumb: already 120px, not the 100px it was measured at
      act(() =>
        observer.callback(
          observer.observed.map(
            ({ target }) =>
              ({ target, borderBoxSize: [{ inlineSize: 120, blockSize: 20 }] }) as unknown as ResizeObserverEntry
          ),
          observer as unknown as ResizeObserver
        )
      );

      expect(document.querySelector('.reqore-dropdown-control')).not.toBeNull();
    });
  } finally {
    Element.prototype.getBoundingClientRect = rect;
  }
});
