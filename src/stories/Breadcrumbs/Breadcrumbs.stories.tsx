import { StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { IReqoreBreadcrumbItem } from '../../components/Breadcrumbs';
import { ReqoreBreadcrumbs, ReqoreButton, ReqoreControlGroup } from '../../index';
import breadcrumbs, { breadcrumbsTabs, specialbreadcrumbs } from '../../mock/breadcrumbs';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: ReqoreBreadcrumbs,
  argTypes: {
    withTabs: {
      name: 'With tabs',
      description: 'Whether tabs should be shown alongside the breadcrumbs',
      control: 'boolean',
    },
    ...SizeArg,
  },
  args: { items: breadcrumbs },
} as StoryMeta<typeof ReqoreBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its default configuration.',
      },
    },
  },};
export const WithTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with tabs rendered inside.',
      },
    },
  }, args: { items: [...breadcrumbs, breadcrumbsTabs] } };
export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its flat variant.',
      },
    },
  }, args: { flat: true } };
export const Special: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in a special configuration.',
      },
    },
  }, args: { items: specialbreadcrumbs } };
export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with a custom theme override applied.',
      },
    },
  },
  args: {
    items: breadcrumbs,
    customTheme: {
      main: '#ff69b4',
    },
  },
};

// A right-hand action rail next to a long trail in a width-constrained bar. The
// responsive collapse RESERVES the rail's width (so items never overrun it), the
// ancestors fold into a "…" group, and the last (current-page) crumb stays
// visible and truncates with an ellipsis rather than clipping into the rail.
export const WithReservedRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A right element (action rail) has its width reserved by the responsive collapse, so the trail never overruns it; the leaf crumb stays visible and truncates instead of clipping.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '640px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
};

// Regression guard for the no-overlap invariant: in a width-constrained bar the
// trail and the right-hand element (an action rail) must never overlap, at any
// width. The trail collapses ancestors into the "…" menu and truncates the
// current page; the right element keeps its full width. The play asserts, via
// `getBoundingClientRect`, that the trail's right edge never crosses into the
// right element — the core guarantee of the flex layout.
export const NoOverlapWithRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The trail (breadcrumbs) and a right-hand action rail share a narrow bar. They must never overlap: the trail collapses + truncates, the right element stays fully visible. The play asserts trail.right <= rightElement.left.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '480px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Wait until the overflow measurement has run — the "…" menu appears once
    // the ancestors collapse, which only happens after a real layout pass.
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-dropdown-control')).toBeInTheDocument()
    );

    const trail = canvasElement.querySelector('.reqore-breadcrumbs-trail') as HTMLElement;
    const right = canvasElement.querySelector('.reqore-breadcrumbs-right') as HTMLElement;
    await expect(trail).toBeInTheDocument();
    await expect(right).toBeInTheDocument();

    // The invariant: the trail never crosses into the right element (1px slack
    // for sub-pixel rounding). This is impossible to violate with the flex
    // `flex-shrink: 0` right region — the guard makes regressions loud.
    const trailRect = trail.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    await expect(trailRect.right).toBeLessThanOrEqual(rightRect.left + 1);

    // The current page stays reachable — either as an inline crumb (wider bars)
    // or, once the bar is this tight, as the single dropdown LABELLED with it.
    // Never folded away to nothing.
    await expect(
      canvasElement.querySelector('.reqore-breadcrumbs-overflow-current, .reqore-breadcrumbs-item')
    ).toBeInTheDocument();
  },
};

// Regression guard: re-rendering with a NEW `items` array identity (as an
// unstable upstream `useMemo` would) must NOT accumulate crumbs. The bug was a
// key derived from `items.indexOf(item)`, which returned -1 for the stale item
// objects OverflowList maps over during a re-render — collapsing every crumb
// onto one key so React appended a fresh (duplicate) crumb on every render. The
// play re-renders repeatedly and asserts the crumb count stays put.
const ReRenderStress = () => {
  const [n, setN] = useState(0);
  // Deliberately a new array + new objects every render.
  const items = [
    { icon: 'Home3Line' as const },
    { label: 'Current Page', icon: 'CalendarLine' as const, badge: [9] },
  ];
  return (
    <div>
      <ReqoreButton data-testid='rerender' onClick={() => setN(n + 1)}>
        re-render ({n})
      </ReqoreButton>
      <div style={{ width: '700px', marginTop: '10px' }}>
        <ReqoreBreadcrumbs items={items} />
      </div>
    </div>
  );
};

export const StableAcrossReRenders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Re-rendering with a fresh items array must not accumulate crumbs (a keying regression once appended a new crumb on every render). The play re-renders 8 times and asserts the crumb count is unchanged.',
      },
    },
  },
  render: () => <ReRenderStress />,
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector('[data-testid="rerender"]') as HTMLElement;
    for (let i = 0; i < 8; i++) {
      btn.click();
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    // Two crumbs in, two crumbs out — never a growing pile.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(2)
    );
  },
};

// A per-item-themed trail (each crumb its OWN customTheme + uppercase effect +
// icon + badge; NO top-level breadcrumbs customTheme — the shape a host like a
// page-header builds) squeezed until it fully collapses. The single current-page
// dropdown must READ AS the leaf crumb: adopt its customTheme, effect, icon and
// badge — not fall back to a plain, unthemed, normal-cased button.
export const CollapsedAdoptsLeafTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When a per-item-themed trail collapses fully, the single current-page dropdown reads as the leaf CRUMB — it adopts the leaf’s customTheme, effect (e.g. uppercase), icon, badge AND its chip styling (an active leaf ⇒ a solid active chip). Its menu presents the crumbs as a clean navigation list (left-aligned labelled rows), not a stack of breadcrumb pills. The play opens the menu to check the rows.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '320px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { menuLabel: 'Home', icon: 'Home4Fill', customTheme: { main: '#1b101b' }, raised: true, minimal: true, flat: true },
          {
            label: 'Jobs',
            icon: 'CalendarLine',
            customTheme: { main: '#100b10' },
            effect: { uppercase: true, spaced: 1, textSize: 'small' },
            raised: true,
            minimal: true,
            flat: true,
          },
          {
            label: 'Bbm Data Provider Create Processor Test',
            icon: 'CalendarLine',
            badge: ['#50'],
            customTheme: { main: '#100b10' },
            effect: { uppercase: true, spaced: 1, textSize: 'small' },
            active: true,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const control = await waitFor(() => {
      const el = canvasElement.querySelector('.reqore-breadcrumbs-overflow-current');
      if (!el) throw new Error('trail has not collapsed yet');
      return el;
    });
    // The collapsed button carries the leaf's label, badge and an icon.
    await expect(control.textContent).toContain('Bbm');
    await expect(control.textContent).toContain('#50');
    await expect(control.querySelector('svg')).toBeInTheDocument();

    // Its menu is a clean navigation list: every crumb is a labelled row —
    // including the Home crumb (a label-less icon would render as a lone,
    // centred icon; here it reads "Home").
    /* Hover INSIDE the wait, and pick the menu by its contents.
    
       The menu is a hover popover in a portal, so it cannot be scoped to the
       canvas — and the story suite runs parallel and NOT isolated, so every
       file shares one document. Hovering once and then waiting made two
       assumptions that do not hold under that load: that the popover was still
       open by the time the assertion ran (a neighbouring story's click can
       dismiss it), and that whatever `.reqore-menu` the document held was ours.
       Re-hovering on each attempt re-opens it, and matching on the leaf label
       picks THIS trail's menu rather than whichever one happens to be up. */
    const findTrailMenu = () =>
      Array.from(document.querySelectorAll('.reqore-menu')).find((el) =>
        (el.textContent ?? '').includes('Bbm')
      );

    let trailMenu: Element | undefined;

    /* One hover per ATTEMPT, not per poll: the popover opens on a timer, and
       re-hovering on every `waitFor` tick restarts that timer, so it never
       elapses. Three attempts, because the thing being guarded against is a
       neighbour dismissing the popover between the hover and the assertion —
       one more hover fixes that, where retrying the assertion alone cannot. */
    for (let attempt = 0; attempt < 3 && !trailMenu; attempt++) {
      const trigger = canvasElement.querySelector('.reqore-breadcrumbs-overflow-current');

      if (trigger) {
        fireEvent.mouseEnter(trigger);
      }

      try {
        trailMenu = await waitFor(() => {
          const menu = findTrailMenu();
          if (!menu) {
            throw new Error('the collapsed trail has not opened its menu yet');
          }
          return menu;
        });
      } catch {
        // Not up yet — hover again rather than keep waiting on a closed popover.
      }
    }

    await expect(trailMenu, 'the collapsed trail never opened its menu').toBeTruthy();

    const menuText = trailMenu?.textContent ?? '';
    await expect(menuText).toContain('Home');
    await expect(menuText).toContain('Jobs');
    await expect(menuText).toContain('Bbm');
  },
};

/* A crumb that changes width after the trail measured it (qorus#646). The trail decides what fits from
   the crumbs' widths, and a crumb can grow after that: its size changes, or its padding animates
   (`transition: all`) after its page has loaded - in the IDE a crumb grew from 151 to 160px over 200ms
   while the trail had measured it once, at the start, so the last crumb stayed clipped by 1-2px. The
   trail measures again whenever a crumb's width changes. */

const GROWING_TRAIL: IReqoreBreadcrumbItem[] = [
  { label: 'Interfaces', icon: 'Home3Line' },
  { label: 'Jobs', icon: 'CalendarLine' },
  { label: 'order-sync', icon: 'CalendarLine' },
];

const trailParts = (canvasElement: HTMLElement) => {
  const trail = canvasElement.querySelector('.reqore-breadcrumbs-trail') as HTMLElement;
  const list = canvasElement.querySelector('.reqore-breadcrumbs-overflow-list') as HTMLElement;
  return { trail, list, crumbs: Array.from(list.querySelectorAll<HTMLElement>('.reqore-breadcrumbs-item')) };
};

/** Every crumb fits: the last one ends inside the trail, and nothing in the trail reaches past it. */
const expectTrailFits = (canvasElement: HTMLElement) => {
  const { trail, list, crumbs } = trailParts(canvasElement);
  const last = crumbs[crumbs.length - 1];
  expect(last).toBeTruthy();
  expect(last.textContent).toContain('order-sync');
  expect(last.getBoundingClientRect().right).toBeLessThanOrEqual(trail.getBoundingClientRect().right + 0.5);
  expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 0.5);
};

/** The box narrowed to the trail's own width, plus `slack`: every crumb fits, with no room to spare. */
const fitBoxToTrail = async (canvasElement: HTMLElement, slack: number) => {
  const box = canvasElement.querySelector('.growing-trail-box') as HTMLElement;
  const { list, crumbs } = await waitFor(() => {
    const parts = trailParts(canvasElement);
    expect(parts.crumbs).toHaveLength(GROWING_TRAIL.length);
    return parts;
  });
  const needed = crumbs[crumbs.length - 1].getBoundingClientRect().right - list.getBoundingClientRect().left;
  box.style.width = `${Math.ceil(needed) + slack}px`;
  await waitFor(() => {
    expect(trailParts(canvasElement).crumbs).toHaveLength(GROWING_TRAIL.length);
    expectTrailFits(canvasElement);
  });
};

const GrowingSizeTrail = () => {
  const [size, setSize] = useState<'small' | 'normal'>('small');
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton className='grow-crumbs' fixed onClick={() => setSize('normal')}>
        Make the crumbs bigger
      </ReqoreButton>
      <div className='growing-trail-box' style={{ width: 900 }}>
        <ReqoreBreadcrumbs items={GROWING_TRAIL} size={size} padded={false} />
      </div>
    </ReqoreControlGroup>
  );
};

export const RemeasuredWhenACrumbGrows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a three-crumb trail in a box just wide enough for it at small size. When the crumbs become normal size, the trail measures them again: the first crumbs fold into the "…" menu and "order-sync" is whole, inside the trail.',
      },
    },
  },
  render: () => <GrowingSizeTrail />,
  play: async ({ canvasElement }) => {
    await fitBoxToTrail(canvasElement, 2);
    await userEvent.click(canvasElement.querySelector('.grow-crumbs') as HTMLElement);
    await waitFor(() => {
      expect(canvasElement.querySelector('.reqore-dropdown-control')).toBeInTheDocument();
      expectTrailFits(canvasElement);
    });
  },
};

/* The leaf crumb's page loads: the crumb goes from compact to full padding, which a crumb animates
   (`transition: all 0.2s`). */
const LoadingLeafTrail = () => {
  const [loaded, setLoaded] = useState(false);
  const items = useMemo(
    () => GROWING_TRAIL.map((item, index) => (index === 2 ? { ...item, compact: !loaded } : item)),
    [loaded]
  );
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton className='load-page' fixed onClick={() => setLoaded(true)}>
        Load the page
      </ReqoreButton>
      <div className='growing-trail-box' style={{ width: 900 }}>
        <ReqoreBreadcrumbs items={items} padded={false} />
      </div>
    </ReqoreControlGroup>
  );
};

export const RemeasuredAfterACrumbsTransition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a three-crumb trail in a box just wide enough for it while its last crumb is compact. When the page loads, the crumb animates to full padding, and the trail measures it again as it grows: the first crumb folds into the "…" menu and "order-sync" ends whole, inside the trail.',
      },
    },
  },
  render: () => <LoadingLeafTrail />,
  play: async ({ canvasElement }) => {
    // The capture's no-transition stylesheet, left by an earlier story's capture in this file: this
    // story is about a transition, so it runs with them (the capture puts the stylesheet back).
    document.getElementById('__qlip-capture-style-overrides')?.remove();
    await fitBoxToTrail(canvasElement, 2);
    await userEvent.click(canvasElement.querySelector('.load-page') as HTMLElement);
    await waitFor(
      () => {
        expect(canvasElement.querySelector('.reqore-dropdown-control')).toBeInTheDocument();
        expectTrailFits(canvasElement);
      },
      { timeout: 2000 }
    );
  },
};

/** A detail page's trail with a current page too long for a phone's header, as qorus-ide builds it. */
const LONG_LEAF_TRAIL: IReqoreBreadcrumbItem[] = [
  { icon: 'Home4Fill', menuLabel: 'Home', minimal: true, flat: true },
  { label: 'ML models', icon: 'BrainLine', minimal: true, flat: true },
  {
    label: 'Sentiment classifier for customer support tickets',
    icon: 'BrainLine',
    badge: '#14',
    active: true,
    minimal: false,
    flat: false,
  },
];

const LONG_LEAF_NAME = 'Sentiment classifier for customer support tickets';

export const FoldedCurrentPageIsNamedInFull: Story = {
  parameters: {
    qlip: { viewport: { width: 390, height: 844 } },
    docs: {
      description: {
        story:
          'Renders a detail page\'s trail on a phone (390 px) beside a page action, with a current page too long for the header: the whole trail folds into one dropdown labelled with the current page, its name cut with an ellipsis. The dropdown still names the page in full, by its accessible name and its title, for a screen reader and a long press.',
      },
    },
  },
  render: () => (
    <div style={{ width: 'min(330px, 100%)' }}>
      <ReqoreBreadcrumbs
        flat
        padded={false}
        items={LONG_LEAF_TRAIL}
        rightElement={<ReqoreButton icon='MoreLine' minimal flat aria-label='Page actions' />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const { withViewport } = await import('../utils/viewport');
    await withViewport(390, 844, async () => {
      const current = await waitFor(() => {
        const button = canvasElement.querySelector<HTMLElement>(
          '.reqore-breadcrumbs-overflow-current'
        );
        expect(button).toBeTruthy();
        return button!;
      });
      // cut to fit...
      const text = current.querySelector<HTMLElement>('.reqore-button-text-content')!;
      await waitFor(() => expect(text.scrollWidth).toBeGreaterThan(text.clientWidth));
      // ...and named in full
      await expect(current).toHaveAttribute('aria-label', LONG_LEAF_NAME);
      await expect(current).toHaveAttribute('title', LONG_LEAF_NAME);
    });
  },
};
