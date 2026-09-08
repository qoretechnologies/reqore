import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreNavRail,
  ReqoreUIProvider,
} from '../src';
import { IReqoreNavRailItem } from '../src/components/NavRail';

const ITEMS: IReqoreNavRailItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardLine',
    items: [
      { id: 'overview', label: 'Overview', icon: 'InformationLine' },
      { id: 'activity', label: 'Activity', icon: 'RhythmLine' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'GroupLine',
    items: [{ id: 'members', label: 'Members', icon: 'User3Line' }],
  },
  { id: 'settings', label: 'Settings', icon: 'Settings3Line' },
];

const renderRail = (ui: React.ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

beforeAll(() => {
  // jsdom has no layout engine; the scroll helper must not throw.
  Element.prototype.scrollIntoView = vi.fn();
});

test('Renders <NavRail /> with the primary marks', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);

  expect(document.querySelectorAll('.reqore-nav-rail').length).toBe(1);
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
});

test('Nests the active item’s sections in a distinct sub-capsule', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);

  expect(screen.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Activity' })).toBeInTheDocument();
});

test('Navigating a primary item swaps the sub-capsule and fires onItemClick', () => {
  const onItemClick = vi.fn();
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' onItemClick={onItemClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Team' }));

  expect(onItemClick).toHaveBeenCalledWith('team', expect.objectContaining({ id: 'team' }));
  expect(screen.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Members' })).toBeInTheDocument();
});

test('Selecting a sub-item fires onSubClick', () => {
  const onSubClick = vi.fn();
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' onSubClick={onSubClick} />);

  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));

  expect(onSubClick).toHaveBeenCalledWith('activity', expect.objectContaining({ id: 'activity' }));
});

test('Honours a controlled activeId', () => {
  renderRail(<ReqoreNavRail items={ITEMS} activeId='team' />);

  expect(screen.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Dashboard sections' })).not.toBeInTheDocument();
});

test('Renders with the standard prop contract (size/intent/effect/flat/raised/radiusSize)', () => {
  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      size='big'
      intent='success'
      flat
      raised
      radiusSize='small'
      padded='small'
      effect={{ gradient: { colors: { 0: '#222222', 100: '#000000' } } }}
    />
  );

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
});

test('maxItems caps the visible primary marks and folds the rest into the ⋮ menu', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} />);

  // Only the first two marks show; the third folds away behind the overflow.
  expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Team' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'More items' })).toBeInTheDocument();
});

test('maxItems keeps the active mark visible by windowing around it', () => {
  // Active 'settings' (index 2) is outside the first two — the window slides so
  // it stays visible and an earlier mark folds away instead.
  renderRail(<ReqoreNavRail items={ITEMS} activeId='settings' maxItems={2} />);

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
});

test('A per-item effect paints the mark regardless of active state', () => {
  const items: IReqoreNavRailItem[] = [
    ITEMS[0],
    {
      id: 'special',
      label: 'Special',
      icon: 'Sparkling2Line',
      effect: { gradient: { colors: { 0: '#7b3ff2', 100: '#ff5db1' } } },
    },
  ];

  renderRail(<ReqoreNavRail items={items} defaultActiveId='dashboard' />);

  // 'special' is NOT the active item, yet it renders as a mark — its own effect
  // paints it independently of the active accent (Dashboard is active here).
  expect(screen.getByRole('button', { name: 'Special' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
});

test('dividerAfter draws a separator after the marked item (and none without it)', () => {
  // Active 'settings' has no sections, so the only spacer in the rail would be a
  // requested divider — making the count an exact assertion.
  const withDivider: IReqoreNavRailItem[] = [
    { ...ITEMS[0], dividerAfter: true },
    ITEMS[1],
    ITEMS[2],
  ];
  const { container } = renderRail(<ReqoreNavRail items={withDivider} activeId='settings' />);
  expect(container.querySelectorAll('.reqore-nav-rail .reqore-spacer').length).toBe(1);

  const { container: plain } = renderRail(<ReqoreNavRail items={ITEMS} activeId='settings' />);
  expect(plain.querySelectorAll('.reqore-nav-rail .reqore-spacer').length).toBe(0);
});

test("dividerAfter='space' still reserves breathing room (a line-less separator)", () => {
  const items: IReqoreNavRailItem[] = [
    { ...ITEMS[0], dividerAfter: 'space' },
    ITEMS[1],
    ITEMS[2],
  ];
  const { container } = renderRail(<ReqoreNavRail items={items} activeId='settings' />);
  // The space-only divider is still a spacer (breathing room), just without a
  // visible line — the render doesn't throw and the separator is present.
  expect(container.querySelectorAll('.reqore-nav-rail .reqore-spacer').length).toBe(1);
});

test('Clicking a sub-item with a scrollTargetId scrolls to that element', () => {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  const items: IReqoreNavRailItem[] = [
    {
      id: 'a',
      label: 'A',
      icon: 'DashboardLine',
      items: [{ id: 's1', label: 'Section one', icon: 'InformationLine', scrollTargetId: 'target-s1' }],
    },
  ];

  renderRail(
    <>
      <div id='target-s1'>target</div>
      <ReqoreNavRail items={items} defaultActiveId='a' />
    </>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Section one' }));

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
});

// ── expandable ───────────────────────────────────────────────────────────────

/** An item with enough sections for a short height budget to fold some. */
const SECTIONED: IReqoreNavRailItem[] = [
  {
    ...ITEMS[0],
    items: [
      { id: 's1', label: 'Section one', icon: 'InformationLine' },
      { id: 's2', label: 'Section two', icon: 'InformationLine' },
      { id: 's3', label: 'Section three', icon: 'InformationLine' },
      { id: 's4', label: 'Section four', icon: 'InformationLine' },
    ],
  },
  ITEMS[1],
  ITEMS[2],
];

/*
 * jsdom reports every layout measurement as 0, so nothing overflows on its own
 * and the metrics have to be stated outright. Which edge fades is carried by a
 * class on the scroll wrapper, and that is plain DOM — assertable here even
 * though the gradient paint is not (the browser stories cover the look).
 */
const setScrollMetrics = (
  element: HTMLElement,
  { scrollTop = 0, clientHeight = 200, scrollHeight = 600 } = {}
) => {
  Object.defineProperty(element, 'clientHeight', { value: clientHeight, configurable: true });
  Object.defineProperty(element, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    configurable: true,
    writable: true,
  });
  fireEvent.scroll(element);
};

const scrollWrap = () => document.querySelector('.reqore-nav-rail-scroll') as HTMLElement;
const scrollBox = () => document.querySelector('.reqore-nav-rail-scroll-box') as HTMLElement;
const fades = () => ({
  top: scrollWrap().classList.contains('reqore-nav-rail-fade-top'),
  bottom: scrollWrap().classList.contains('reqore-nav-rail-fade-bottom'),
});

test('expandable folds the capped-out marks behind an expand toggle instead of the ⋮ menu', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable />);

  expect(screen.queryByRole('button', { name: 'More items' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();

  const toggle = screen.getByRole('button', { name: 'Show all items' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveClass('reqore-nav-rail-expand');
});

test('Expanding shows every mark; collapsing folds them again', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable />);

  fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show fewer items' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );

  fireEvent.click(screen.getByRole('button', { name: 'Show fewer items' }));

  expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show all items' })).toBeInTheDocument();
});

test('Hidden sections of the active page fold behind the toggle too — never a ⋮ sections menu', () => {
  // Control: the same short budget on a plain rail DOES fold sections into a ⋮.
  const { unmount } = renderRail(
    <ReqoreNavRail items={SECTIONED} defaultActiveId='dashboard' maxHeight={120} />
  );
  expect(screen.getByRole('button', { name: 'More sections' })).toBeInTheDocument();
  unmount();

  renderRail(
    <ReqoreNavRail items={SECTIONED} defaultActiveId='dashboard' maxHeight={120} expandable />
  );

  expect(screen.queryByRole('button', { name: 'More sections' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Section four' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));

  expect(screen.getByRole('button', { name: 'Section four' })).toBeInTheDocument();
});

test('No toggle is offered when collapsing would fold nothing', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' expandable />);

  expect(screen.queryByRole('button', { name: 'Show all items' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Show fewer items' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
});

test('defaultExpanded starts the rail open', () => {
  renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable defaultExpanded />
  );

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show fewer items' })).toBeInTheDocument();
});

test('A controlled `expanded` is reported through onExpandedChange, never flipped internally', () => {
  const onExpandedChange = vi.fn();
  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      maxItems={2}
      expandable
      expanded={false}
      onExpandedChange={onExpandedChange}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));

  expect(onExpandedChange).toHaveBeenCalledWith(true);
  // Still collapsed: the parent owns the state.
  expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show all items' })).toBeInTheDocument();
});

test('The toggle labels are overridable', () => {
  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      maxItems={2}
      expandable
      expandLabel='Zobrazit vše'
      collapseLabel='Zobrazit méně'
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Zobrazit vše' }));
  expect(screen.getByRole('button', { name: 'Zobrazit méně' })).toBeInTheDocument();
});

test('Expanded, the rail fades whichever edge still has marks out of view', () => {
  renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable defaultExpanded />
  );

  // At the top: only the bottom edge hides marks.
  setScrollMetrics(scrollBox(), { scrollTop: 0 });
  expect(fades()).toEqual({ top: false, bottom: true });

  // Half-way: both.
  setScrollMetrics(scrollBox(), { scrollTop: 200 });
  expect(fades()).toEqual({ top: true, bottom: true });

  // At the end: only the top.
  setScrollMetrics(scrollBox(), { scrollTop: 400 });
  expect(fades()).toEqual({ top: true, bottom: false });

  // Everything fits: neither — a rail with nothing out of view must not
  // advertise that there is more.
  setScrollMetrics(scrollBox(), { scrollTop: 0, clientHeight: 600, scrollHeight: 600 });
  expect(fades()).toEqual({ top: false, bottom: false });
});

test('Collapsed, the vignette stays off even when the box reports overflow', () => {
  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable />);

  setScrollMetrics(scrollBox(), { scrollTop: 200 });

  expect(fades()).toEqual({ top: false, bottom: false });
});

// ── showLabels ───────────────────────────────────────────────────────────────

test('Icon-only marks carry no text; showLabels puts the label in every mark', () => {
  const { unmount } = renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);
  expect(screen.getByRole('button', { name: 'Dashboard' }).textContent).toBe('');
  expect(screen.getByRole('button', { name: 'Overview' }).textContent).toBe('');
  unmount();

  renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' showLabels />);

  expect(screen.getByRole('button', { name: 'Dashboard' })).toHaveTextContent('Dashboard');
  expect(screen.getByRole('button', { name: 'Settings' })).toHaveTextContent('Settings');
  // Sections too.
  expect(screen.getByRole('button', { name: 'Overview' })).toHaveTextContent('Overview');
});

test('A labelled expandable rail spells out its toggle', () => {
  renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable showLabels />
  );

  expect(screen.getByRole('button', { name: 'Show all items' })).toHaveTextContent('1 more');

  fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));

  expect(screen.getByRole('button', { name: 'Show fewer items' })).toHaveTextContent(
    'Show fewer items'
  );
});

describe("showLabels='hover'", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const dashboard = () => screen.getByRole('button', { name: 'Dashboard' });

  test('Reveals the labels once the pointer has rested on the rail for 1.5s, and hides them when it leaves', () => {
    renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' showLabels='hover' />);
    const nav = screen.getByRole('navigation');

    expect(dashboard().textContent).toBe('');

    fireEvent.mouseEnter(nav);
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    // A moment short of the dwell: still icons.
    expect(dashboard().textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(dashboard()).toHaveTextContent('Dashboard');

    fireEvent.mouseLeave(nav);
    expect(dashboard().textContent).toBe('');
  });

  test('showLabelsDelay sets the dwell', () => {
    renderRail(
      <ReqoreNavRail
        items={ITEMS}
        defaultActiveId='dashboard'
        showLabels='hover'
        showLabelsDelay={300}
      />
    );

    fireEvent.mouseEnter(screen.getByRole('navigation'));
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(dashboard()).toHaveTextContent('Dashboard');
  });

  test('Leaving before the dwell elapses never shows the labels', () => {
    renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' showLabels='hover' />);
    const nav = screen.getByRole('navigation');

    fireEvent.mouseEnter(nav);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.mouseLeave(nav);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(dashboard().textContent).toBe('');
  });
});

test('The ⋮ trigger is a direct child of its column, not boxed in a popover wrapper', () => {
  // The trigger is the one mark rendered through ReqorePopover. Unless the
  // popover is told the trigger is a Reqore component it wraps it in a span
  // with overflow:hidden — which becomes the flex child in the trigger's place,
  // so a labelled (fluid) trigger has nothing to stretch inside and the mark's
  // raised shadow is clipped. Qlip build #253 caught the first.
  const { unmount } = renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} showLabels />
  );
  const items = screen.getByRole('button', { name: 'More items' });
  expect(items.closest('.reqore-popover-wrapper')).toBeNull();
  expect(items).toHaveTextContent('1 more');
  unmount();

  renderRail(<ReqoreNavRail items={SECTIONED} defaultActiveId='dashboard' maxHeight={120} />);
  const sections = screen.getByRole('button', { name: 'More sections' });
  expect(sections.closest('.reqore-popover-wrapper')).toBeNull();
  expect(sections.parentElement).toHaveClass('reqore-nav-rail-active');
});

// ── header / footer slots ────────────────────────────────────────────────────

test('header and footer render props receive the labelled / expanded state', () => {
  const slot = ({ labelled, expanded }: { labelled: boolean; expanded: boolean }) => (
    <span data-testid='slot'>
      {labelled ? 'labelled' : 'icons'} {expanded ? 'expanded' : 'collapsed'}
    </span>
  );

  const { unmount } = renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' header={slot} />
  );
  expect(screen.getByTestId('slot')).toHaveTextContent('icons collapsed');
  unmount();

  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      maxItems={2}
      expandable
      defaultExpanded
      showLabels
      footer={slot}
    />
  );
  expect(screen.getByTestId('slot')).toHaveTextContent('labelled expanded');

  // Collapsing re-renders the slot with the new state.
  fireEvent.click(screen.getByRole('button', { name: 'Show fewer items' }));
  expect(screen.getByTestId('slot')).toHaveTextContent('labelled collapsed');
});

test('A plain node header / footer still renders as-is', () => {
  renderRail(
    <ReqoreNavRail
      items={ITEMS}
      defaultActiveId='dashboard'
      header={<span data-testid='h'>top</span>}
      footer={<span data-testid='f'>bottom</span>}
    />
  );
  expect(screen.getByTestId('h')).toHaveTextContent('top');
  expect(screen.getByTestId('f')).toHaveTextContent('bottom');
});

test('The nav carries class hooks for the labelled and expanded states', () => {
  const { unmount } = renderRail(<ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' />);
  const nav = () => screen.getByRole('navigation');
  expect(nav()).not.toHaveClass('reqore-nav-rail-labelled');
  expect(nav()).not.toHaveClass('reqore-nav-rail-expanded');
  unmount();

  renderRail(
    <ReqoreNavRail items={ITEMS} defaultActiveId='dashboard' maxItems={2} expandable showLabels />
  );
  expect(nav()).toHaveClass('reqore-nav-rail-labelled');
  expect(nav()).not.toHaveClass('reqore-nav-rail-expanded');

  fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));
  expect(nav()).toHaveClass('reqore-nav-rail-expanded');
});
