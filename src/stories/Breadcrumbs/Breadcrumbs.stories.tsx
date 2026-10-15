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
// key derived from `items.indexOf(item)`, which returned -1 for stale item
// objects the trail mapped over during a re-render — collapsing every crumb
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
   (`transition: all`) after it is drawn - a crumb that grew from 151 to 160px over 200ms while the
   trail had measured it once, at the start, left the last crumb clipped by 1-2px. The
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

/** A trail whose current page is too long for a phone's header. */
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
          'Renders a three-crumb trail on a phone (390 px) beside a page action, with a current page too long for the header: the whole trail folds into one dropdown labelled with the current page, its name cut with an ellipsis. The dropdown still names the page in full, by its accessible name, for a screen reader; it has no title of its own (hovering it opens its menu, which names every crumb in full).',
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
      // ...and named in full, with no browser tooltip over its menu
      await expect(current).toHaveAttribute('aria-label', LONG_LEAF_NAME);
      await expect(current).not.toHaveAttribute('title');
    });
  },
};

/* A trail whose crumbs the page changes (qorus#646). The trail folds what does not fit before the browser
   draws it: no frame shows a crumb past the trail's end. It used to fold one crumb per step after the
   browser had drawn the last one, so a page that changed its crumbs showed them all, running past the
   trail, until it had folded enough - on a 390 px phone, "… › New chat" ran 79 px past a 120 px trail for
   50 ms. */

const QONSOLE_TRAIL: IReqoreBreadcrumbItem[] = [
  { label: 'Qonsole', icon: 'TerminalBoxLine' },
  { label: 'Design mode', icon: 'PencilRulerLine' },
  { label: 'New chat', icon: 'ChatNewLine' },
];

const CHAT_TRAIL: IReqoreBreadcrumbItem[] = [
  { icon: 'Home3Line', menuLabel: 'Home' },
  { label: 'Chats', icon: 'ChatHistoryLine' },
  { label: 'New chat', icon: 'ChatNewLine' },
];

/** The parts the trail draws that reach past its end, each as "text left..right past end". */
const partsPastTheTrail = (canvasElement: HTMLElement): string[] => {
  const row = canvasElement.querySelector<HTMLElement>('.reqore-breadcrumbs-overflow-list');
  if (!row) {
    return ['no trail'];
  }
  const end = row.getBoundingClientRect().right;
  return Array.from(row.children)
    .map((part) => ({ part, box: part.getBoundingClientRect() }))
    .filter(({ box }) => box.width > 0 && box.right > end + 0.5)
    .map(({ part, box }) => `${part.textContent?.trim() || part.className} ${box.left}..${box.right} past ${end}`);
};

/**
 * Runs `change` and returns every part the trail drew past its end meanwhile: checked after every change to
 * the trail's DOM - a MutationObserver runs once the task that made the change is done, before any frame
 * can be drawn - and on the first frame after the change, just before it is painted (a
 * requestAnimationFrame callback).
 */
const partsDrawnPastTheTrailWhile = async (
  canvasElement: HTMLElement,
  change: () => Promise<void>
): Promise<string[]> => {
  const row = canvasElement.querySelector<HTMLElement>('.reqore-breadcrumbs-overflow-list')!;
  const past: string[] = [];
  let firstFrame: Promise<void> | undefined;
  let changed: () => void = () => undefined;
  const reached = new Promise<void>((resolve) => {
    changed = resolve;
  });
  const watch = new MutationObserver(() => {
    past.push(...partsPastTheTrail(canvasElement).map((part) => `after a change: ${part}`));
    firstFrame ??= new Promise<void>((resolve) =>
      requestAnimationFrame(() => {
        past.push(...partsPastTheTrail(canvasElement).map((part) => `first frame: ${part}`));
        resolve();
      })
    );
    changed();
  });
  watch.observe(row, { childList: true, subtree: true, characterData: true });
  try {
    await change();
    await reached;
    await firstFrame;
  } finally {
    watch.disconnect();
  }
  return past;
};

const ChangingTrail = () => {
  const [items, setItems] = useState(QONSOLE_TRAIL);
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton
        className='open-chats'
        fixed
        // the new crumbs arrive the way loaded data does, not as the click's own update
        onClick={() => Promise.resolve().then(() => setItems(CHAT_TRAIL))}
      >
        Open the chats
      </ReqoreButton>
      <div style={{ width: 290 }}>
        <ReqoreBreadcrumbs
          flat
          padded={false}
          items={items}
          rightElement={<div className='page-actions' style={{ width: 160, height: 32 }} />}
        />
      </div>
    </ReqoreControlGroup>
  );
};

export const CrumbChangeIsFoldedBeforeItIsDrawn: Story = {
  parameters: {
    qlip: { viewport: { width: 390, height: 844 } },
    docs: {
      description: {
        story:
          'Renders a phone\'s trail (390 px) with about 120 px beside the page\'s actions, ending in "New chat", and changes its crumbs the way a page does when its data arrives. The trail folds what does not fit before the browser draws it: after the change and on the first frame after it, no part of the trail reaches past its end, and with no room for the folded crumbs\' "…" menu beside "New chat", the trail is one dropdown labelled "New chat".',
      },
    },
  },
  render: () => <ChangingTrail />,
  play: async ({ canvasElement }) => {
    const { withViewport } = await import('../utils/viewport');
    await withViewport(390, 844, async () => {
      await waitFor(() =>
        expect(canvasElement.querySelector('.reqore-breadcrumbs-overflow-current')).toBeTruthy()
      );
      await expect(partsPastTheTrail(canvasElement)).toEqual([]);

      const past = await partsDrawnPastTheTrailWhile(canvasElement, async () => {
        await userEvent.click(canvasElement.querySelector('.open-chats')!);
      });

      await expect(past).toEqual([]);
      const current = canvasElement.querySelector('.reqore-breadcrumbs-overflow-current');
      await expect(current).toHaveAttribute('aria-label', 'New chat');
      await expect(current).toHaveTextContent('New chat');
    });
  },
};

/* A trail holding tabs folds crumbs rather than squeeze its tabs (qorus#646). The crumb holding the tabs
   can be squeezed - it clips them - so the trail folds another crumb whenever it would be: the tabs keep
   their room and stay tabs, rather than folding into their "More" menu. Checked as the trail is first
   drawn, before the tabs measure the room they were given. */

const TabsTrail = () => {
  const [shown, setShown] = useState(false);
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton className='show-trail' fixed onClick={() => setShown(true)}>
        Show the trail
      </ReqoreButton>
      <div className='tabs-trail-box' style={{ width: 1100 }}>
        {shown && <ReqoreBreadcrumbs items={[...breadcrumbs, breadcrumbsTabs]} />}
      </div>
    </ReqoreControlGroup>
  );
};

/** The crumb holding the tabs, and whether it clips them: its content wider than its own box. */
const squeezedTabs = (canvasElement: HTMLElement): string[] => {
  const tabs = canvasElement.querySelector<HTMLElement>('.reqore-breadcrumbs-overflow-list .reqore-tabs-list');
  if (!tabs) {
    return ['no tabs'];
  }
  const crumb = tabs.parentElement!;
  return crumb.scrollWidth > crumb.clientWidth + 0.5
    ? [`tabs ${crumb.scrollWidth}px wide in a crumb of ${crumb.clientWidth}px`]
    : [];
};

export const CrumbsFoldBeforeTheirTabsAreSqueezed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a trail whose last crumb holds tabs, in a box too narrow for all of it. The trail folds crumbs into its "…" menu rather than squeeze the crumb holding the tabs, so the tabs keep their room - checked as the trail is first drawn, after its commit and on its first frame, before the tabs measure the room they were given.',
      },
    },
  },
  render: () => <TabsTrail />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector<HTMLElement>('.tabs-trail-box')!;
    const seen: string[] = [];
    let firstFrame: Promise<void> | undefined;
    let drawn: () => void = () => undefined;
    const reached = new Promise<void>((resolve) => {
      drawn = resolve;
    });
    const watch = new MutationObserver(() => {
      if (!canvasElement.querySelector('.reqore-tabs-list')) {
        return;
      }
      seen.push(...squeezedTabs(canvasElement).map((tabs) => `after the commit: ${tabs}`));
      firstFrame ??= new Promise<void>((resolve) =>
        requestAnimationFrame(() => {
          seen.push(...squeezedTabs(canvasElement).map((tabs) => `first frame: ${tabs}`));
          resolve();
        })
      );
      drawn();
    });
    watch.observe(box, { childList: true, subtree: true });
    try {
      await userEvent.click(canvasElement.querySelector('.show-trail')!);
      await reached;
      await firstFrame;
    } finally {
      watch.disconnect();
    }

    await expect(seen).toEqual([]);
    // the room came from folding crumbs
    await expect(box.querySelector('.reqore-breadcrumbs-overflow-list .reqore-dropdown-control')).toBeTruthy();
  },
};

/** The labels of the crumbs the trail draws, in order. */
const drawnLabels = (canvasElement: HTMLElement): string[] =>
  trailParts(canvasElement).crumbs.map((crumb) => crumb.textContent?.trim() ?? '');

/** The trail's "…" menu, or the dropdown standing in for its current page: what it folded. */
const trailMenu = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('.reqore-breadcrumbs-overflow-list .reqore-dropdown-control');

/* A trail made wider by its own props (qorus#646). The trail unfolds what fits when it gets wider,
   and so when the render that changes its bar's props draws it wider: a right element that goes, a
   `maxWidth` lifted (a page that goes full width lifts its 1280px). That
   render used to be taken as the width the trail had been measured at, so its observer saw no
   change and the crumbs stayed folded with room to spare. */

const WIDENING_TRAIL: IReqoreBreadcrumbItem[] = [
  { label: 'Interfaces', icon: 'Home3Line' },
  { label: 'Jobs', icon: 'CalendarLine' },
  { label: 'order-sync', icon: 'CalendarLine' },
  { label: 'Execution 4711', icon: 'CalendarLine' },
];

const WideningTrail = () => {
  const [actions, setActions] = useState(true);
  const [fullWidth, setFullWidth] = useState(false);
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton className='hide-actions' fixed onClick={() => setActions(false)}>
        Hide the page actions
      </ReqoreButton>
      <ReqoreButton className='full-width' fixed onClick={() => setFullWidth(true)}>
        Go full width
      </ReqoreButton>
      <div style={{ width: 900 }}>
        <ReqoreBreadcrumbs
          items={WIDENING_TRAIL}
          padded={false}
          style={{ maxWidth: fullWidth ? 'none' : 440 }}
          rightElement={actions ? <div style={{ width: 200, height: 32 }} /> : undefined}
        />
      </div>
    </ReqoreControlGroup>
  );
};

export const UnfoldsWhenItsPropsMakeItWider: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a four-crumb trail in a bar 440 px wide at most, beside 200 px of page actions, so its first crumbs are folded into the "…" menu. When the page actions go, and again when the bar\'s `maxWidth` is lifted (a page going full width), the render that changes the bar draws the trail wider, and the trail unfolds the crumbs that now fit: more of them without the actions, and all four, with no "…" menu, at full width.',
      },
    },
  },
  render: () => <WideningTrail />,
  play: async ({ canvasElement }) => {
    const folded = await waitFor(() => {
      expect(trailMenu(canvasElement)).toBeInTheDocument();
      expect(partsPastTheTrail(canvasElement)).toEqual([]);
      return drawnLabels(canvasElement);
    });

    await userEvent.click(canvasElement.querySelector('.hide-actions') as HTMLElement);
    await waitFor(() => {
      expect(drawnLabels(canvasElement).length).toBeGreaterThan(folded.length);
      expect(partsPastTheTrail(canvasElement)).toEqual([]);
    });

    await userEvent.click(canvasElement.querySelector('.full-width') as HTMLElement);
    await waitFor(() => {
      expect(drawnLabels(canvasElement)).toEqual(WIDENING_TRAIL.map(({ label }) => label));
      expect(trailMenu(canvasElement)).toBeNull();
    });
  },
};

/* The tabs get their room back when the trail widens again (qorus#646). Squeezed, the tabs put some
   of theirs in a "More" menu and draw narrower; a crumb only as wide as the tabs it draws kept them
   there however wide the trail got again, while the trail unfolded its crumbs into the room
   instead. At the end of the trail, the crumb holding tabs takes the room the other parts leave,
   and a crumb is shown only while the tabs keep all the room they need: as when the trail is first
   drawn at that width. */

const ResizedTabsTrail = () => (
  <div className='resized-tabs-trail-box' style={{ width: 1100 }}>
    <ReqoreBreadcrumbs items={[...breadcrumbs, breadcrumbsTabs]} />
  </div>
);

const tabsInMore = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('.reqore-breadcrumbs-tabs .reqore-tabs-list-item-menu');

export const TabsGetTheirRoomBackWhenTheTrailWidens: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a trail whose last crumb holds tabs in a box 1100 px wide, where it folds some crumbs so that its tabs are all drawn. Narrowed to 420 px, every crumb folds and the tabs put some of theirs in their "More" menu. Widened to 1100 px again, the tabs are all drawn again, unclipped, and the trail shows the same crumbs as when it was first drawn at that width - rather than unfolding its crumbs and leaving the tabs in "More".',
      },
    },
  },
  render: () => <ResizedTabsTrail />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector<HTMLElement>('.resized-tabs-trail-box')!;
    const firstDrawn = await waitFor(() => {
      expect(trailParts(canvasElement).list.querySelector('.reqore-tabs-list')).toBeTruthy();
      expect(tabsInMore(canvasElement)).toBeNull();
      expect(squeezedTabs(canvasElement)).toEqual([]);
      return drawnLabels(canvasElement);
    });

    box.style.width = '420px';
    await waitFor(() => expect(tabsInMore(canvasElement)).toBeTruthy());

    box.style.width = '1100px';
    await waitFor(() => {
      expect(tabsInMore(canvasElement)).toBeNull();
      expect(squeezedTabs(canvasElement)).toEqual([]);
      expect(drawnLabels(canvasElement)).toEqual(firstDrawn);
      expect(partsPastTheTrail(canvasElement)).toEqual([]);
    });
  },
};

/* A fold made inside the trail's ResizeObserver keeps the trail's height for that frame
   (qorus#646). The trail folds what no longer fits there and then, before the frame is painted. A
   crumb with a description is taller than the others, so folding it makes the trail lower, and with
   it whatever holds the trail: a size another observer watches (a panel's, a page layout's) changed
   inside an observer's callback is left unreported until the next frame, and the browser reports a
   ResizeObserver loop. The trail keeps its height until the next frame, and only then ends as tall
   as what it draws. */

const DESCRIBED_TRAIL: IReqoreBreadcrumbItem[] = [
  { label: 'Jobs', icon: 'CalendarLine', description: 'Scheduled every hour' },
  { label: 'order-sync', icon: 'CalendarLine' },
  { label: 'Execution 4711', icon: 'CalendarLine' },
];

const WatchedTrail = () => {
  const [shown, setShown] = useState(false);
  return (
    <ReqoreControlGroup vertical>
      <ReqoreButton className='show-watched-trail' fixed onClick={() => setShown(true)}>
        Show the trail
      </ReqoreButton>
      <div className='watched-trail-box' style={{ width: 900 }}>
        {shown && <ReqoreBreadcrumbs items={DESCRIBED_TRAIL} padded={false} />}
      </div>
    </ReqoreControlGroup>
  );
};

export const FoldKeepsTheTrailsHeightForAFrame: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a three-crumb trail whose first crumb has a description, which makes it taller than the others, in a box watched by a ResizeObserver from before the trail is drawn (as a panel or a page layout watches what it holds). When the box narrows, the crumb with the description folds into the "…" menu inside the trail\'s own observer; the trail keeps its height until the next frame and then ends as tall as the crumbs it draws, so the box never changes size inside an observer and the browser reports no ResizeObserver loop.',
      },
    },
  },
  render: () => <WatchedTrail />,
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector<HTMLElement>('.watched-trail-box')!;
    const watcher = new ResizeObserver(() => undefined);
    watcher.observe(box);
    try {
      await userEvent.click(canvasElement.querySelector('.show-watched-trail') as HTMLElement);
      const { list, crumbs } = await waitFor(() => {
        const parts = trailParts(canvasElement);
        expect(parts.crumbs).toHaveLength(DESCRIBED_TRAIL.length);
        return parts;
      });
      const tall = list.getBoundingClientRect().height;
      const needed =
        crumbs[crumbs.length - 1].getBoundingClientRect().right - list.getBoundingClientRect().left;

      // too narrow for the crumb with the description: it folds
      box.style.width = `${Math.floor(needed) - 10}px`;
      await waitFor(() => {
        const parts = trailParts(canvasElement);
        expect(parts.crumbs).toHaveLength(DESCRIBED_TRAIL.length - 1);
        expect(trailMenu(canvasElement)).toBeInTheDocument();
        expect(parts.list.style.height).toBe('');
        expect(parts.list.getBoundingClientRect().height).toBeLessThan(tall);
      });
    } finally {
      watcher.disconnect();
    }
  },
};
