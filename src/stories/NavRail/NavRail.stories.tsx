import { StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ReactNode, useRef } from 'react';
import ReqoreNavRail, {
  IReqoreNavRailItem,
  IReqoreNavRailProps,
} from '../../components/NavRail';
import { ReqoreControlGroup, ReqoreP, ReqorePanel, ReqoreTag } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Navigation/Nav Rail',
  component: ReqoreNavRail,
} as StoryMeta<typeof ReqoreNavRail>;

export default meta;
type Story = StoryObj<typeof meta>;

const DASHBOARD_SECTIONS: IReqoreNavRailItem['items'] = [
  { id: 'overview', label: 'Overview', icon: 'InformationLine', scrollTargetId: 'sec-overview' },
  { id: 'activity', label: 'Activity', icon: 'RhythmLine', scrollTargetId: 'sec-activity' },
  { id: 'health', label: 'Health', icon: 'HeartPulseLine', scrollTargetId: 'sec-health' },
  { id: 'usage', label: 'Usage', icon: 'LineChartLine', scrollTargetId: 'sec-usage' },
  { id: 'billing', label: 'Billing', icon: 'MoneyDollarCircleLine', scrollTargetId: 'sec-billing' },
  { id: 'history', label: 'History', icon: 'HistoryLine', scrollTargetId: 'sec-history' },
];

const ITEMS: IReqoreNavRailItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DashboardLine', items: DASHBOARD_SECTIONS },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderLine',
    items: [
      { id: 'all', label: 'All projects', icon: 'AppsLine' },
      { id: 'shared', label: 'Shared with me', icon: 'GroupLine' },
      { id: 'archived', label: 'Archived', icon: 'Archive2Line' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'GroupLine',
    items: [
      { id: 'members', label: 'Members', icon: 'User3Line' },
      { id: 'roles', label: 'Roles', icon: 'ShieldUserLine' },
    ],
  },
  { id: 'reports', label: 'Reports', icon: 'BarChartBoxLine' },
  { id: 'automations', label: 'Automations', icon: 'FlowChart' },
  { id: 'integrations', label: 'Integrations', icon: 'PlugLine' },
  { id: 'settings', label: 'Settings', icon: 'Settings3Line' },
];

/** A long list so the `⋮` overflow menu has enough items to exceed its height
 *  cap and become scrollable (see OverflowCapped). */
const MANY_ITEMS: IReqoreNavRailItem[] = [
  ITEMS[0],
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `page-${i}`,
    label: `Page ${i + 1}`,
    icon: 'File2Line' as const,
  })),
];

/** A believable page backdrop so a floating rail can be judged in context. */
const Backdrop = ({
  height = 520,
  width,
  scrollRef,
  scrollId,
  repeat = 1,
  children,
}: {
  height?: number;
  width?: number;
  scrollRef?: React.RefObject<HTMLDivElement>;
  scrollId?: string;
  repeat?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'relative',
      height,
      width,
      margin: width ? '0 auto' : undefined,
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    <div
      ref={scrollRef}
      id={scrollId}
      style={{ position: 'absolute', inset: 0, overflow: 'auto', padding: '18px 72px' }}
    >
      <ReqoreControlGroup vertical gapSize='big' fluid>
        {Array.from({ length: repeat }).flatMap((_, r) =>
          DASHBOARD_SECTIONS!.map((s) => (
            <ReqorePanel key={`${r}-${s.id}`} label={s.label} icon={s.icon} rounded flat id={r === 0 ? s.scrollTargetId : undefined}>
              <ReqoreP style={{ minHeight: 120 }}>
                Content for the {s.label} section. Scroll to move the rail&apos;s highlight.
              </ReqoreP>
            </ReqorePanel>
          ))
        )}
      </ReqoreControlGroup>
    </div>
    {children}
  </div>
);

const Labeled = ({ label, children }: { label: string; children: ReactNode }) => (
  <ReqoreControlGroup vertical gapSize='small' horizontalAlign='center'>
    <ReqoreTag label={label} size='small' minimal />
    {children}
  </ReqoreControlGroup>
);

/** INLINE — the rail on its own (position='static'): a thin pill of circular
 *  page marks with the active page's sections nested in the sub-capsule. */
export const Inline: Story = {
  args: { items: ITEMS, position: 'static', defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the rail on its own (`position='static'`) — a thin pill of circular page marks with the Dashboard page active and its sections nested in the sub-capsule directly beneath it.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
  },
};

/** NO SECTIONS — an active page without sub-items renders a plain mark, and the
 *  rail stays exactly the same width as when the active page has sections
 *  (compare with Inline). */
export const NoSections: Story = {
  args: { items: ITEMS, position: 'static', defaultActiveId: 'reports' },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the inline rail with an active page (Reports) that has no sub-items, so no sub-capsule appears — yet the rail stays exactly the same width as when the active page has sections (compare with Inline).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    await expect(canvas.queryByRole('group')).not.toBeInTheDocument();
  },
};

/** IN GUTTER — floating in the left gutter of a page, over scrolling content. */
export const InGutter: Story = {
  args: { items: ITEMS, floating: true, position: 'left', defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the rail floating in the left gutter of a page (`floating`, `position='left'`) over scrolling content, Dashboard active.",
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** RIGHT GUTTER — the same rail pinned to the right gutter. */
export const RightGutter: Story = {
  args: { items: ITEMS, floating: true, position: 'right', defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the same floating rail pinned to the right gutter (`position='right'`), Dashboard active.",
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** SIZES — the standard `size` scale drives the marks, spacing and pill radius. */
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the rail at each `size` in the standard scale (tiny, small, normal, big) side by side, showing how size drives the marks, spacing and pill radius.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      {(['tiny', 'small', 'normal', 'big'] as const).map((size) => (
        <Labeled key={size} label={size}>
          <ReqoreNavRail items={ITEMS} position='static' size={size} defaultActiveId='dashboard' />
        </Labeled>
      ))}
    </ReqoreControlGroup>
  ),
};

/** INTENTS — `intent` sets the active-mark accent (per-item `intent` overrides). */
export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the rail at each `intent` (info, success, warning, danger, muted) side by side, showing how intent sets the active-mark accent (a per-item `intent` would override it).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      {(['info', 'success', 'warning', 'danger', 'muted'] as const).map((intent) => (
        <Labeled key={intent} label={intent}>
          <ReqoreNavRail items={ITEMS} position='static' intent={intent} defaultActiveId='dashboard' />
        </Labeled>
      ))}
    </ReqoreControlGroup>
  ),
};

/** EFFECTS — the standard `effect` prop paints the rail surface. */
export const Effects: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the rail with the standard `effect` prop painting the surface — a gradient variant (paired with a coordinated `activeEffect` on the active group) and a glow variant.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      <Labeled label='gradient'>
        <ReqoreNavRail
          items={ITEMS}
          position='static'
          defaultActiveId='dashboard'
          effect={{ gradient: { colors: { 0: '#2e1a47', 100: '#160c24' }, direction: 'to bottom' } }}
          activeEffect={{ gradient: { colors: { 0: '#7c46c8', 100: '#3f2472' }, direction: 'to bottom' } }}
        />
      </Labeled>
      <Labeled label='glow'>
        <ReqoreNavRail
          items={ITEMS}
          position='static'
          intent='info'
          defaultActiveId='dashboard'
          effect={{ glow: { color: '#2e6bff', size: 2, blur: 6 } }}
        />
      </Labeled>
    </ReqoreControlGroup>
  ),
};

/** FLAT & RAISED — `flat` drops the border, `raised` adds the 3D inset. */
export const FlatAndRaised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the rail in three surface treatments side by side — bordered (default), `flat` (border dropped), and `flat` + `raised` (the 3D inset).',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      <Labeled label='bordered (default)'>
        <ReqoreNavRail items={ITEMS} position='static' defaultActiveId='dashboard' />
      </Labeled>
      <Labeled label='flat'>
        <ReqoreNavRail items={ITEMS} position='static' flat defaultActiveId='dashboard' />
      </Labeled>
      <Labeled label='flat + raised'>
        <ReqoreNavRail items={ITEMS} position='static' flat raised defaultActiveId='dashboard' />
      </Labeled>
    </ReqoreControlGroup>
  ),
};

/** IDLE REVEAL — rests dim, fades fully in on approach (hover the gutter). */
export const IdleReveal: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    idleReveal: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the floating rail with `idleReveal`. The play function asserts the full behaviour: it rests dimmed (opacity 0.34), fades fully in when the gutter is hovered, and dims again when the mouse leaves.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('.reqore-nav-rail') as HTMLElement;
    // Rests dimmed…
    await expect(getComputedStyle(nav).opacity).toBe('0.34');
    // …fades fully in when approached…
    await userEvent.hover(nav);
    await waitFor(() => expect(getComputedStyle(nav).opacity).toBe('1'));
    // …and dims again once the mouse leaves.
    await userEvent.unhover(nav);
    await waitFor(() => expect(getComputedStyle(nav).opacity).toBe('0.34'));
  },
};

/** IDLE · RESTING — the default idle appearance with NO interaction: `idleReveal`
 *  leaves the rail dimmed until approached. This story just captures that resting
 *  dim state (the play only asserts it — it does not hover). */
export const IdleResting: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    idleReveal: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the floating `idleReveal` rail with NO interaction, capturing its resting dimmed state (opacity 0.34) — the play only asserts the dim, it never hovers.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('.reqore-nav-rail') as HTMLElement;
    await expect(getComputedStyle(nav).opacity).toBe('0.34');
  },
};

/** COLLAPSED — a short viewport folds each group's extras into a `⋮` flyout that
 *  never widens the rail. */
export const Collapsed: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    maxHeight: 280,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the floating rail in a short viewport (`maxHeight: 280`) so each group folds its extras into a `⋮` flyout that never widens the rail.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop height={320}>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** OVERFLOW MENU — the collapsed `⋮` opens a floating menu of the hidden items.
 *  This story opens it (play) so the flyout is captured in every Qlip build. */
export const OverflowMenu: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    maxHeight: 280,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the collapsed rail and opens its `⋮` flyout (play), capturing the floating menu of hidden items — ending with 'Settings' visible in the menu.",
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop height={320}>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More items' }));
    await waitFor(() => expect(document.body.textContent).toContain('Settings'));
  },
};

/** MAX ITEMS — a hard cap on how many primary marks show at once (here 4),
 *  independent of viewport height; the rest fold into the `⋮` menu. Opening the
 *  menu (play) reveals a capped-out page. */
export const MaxItems: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    maxItems: 4,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the inline rail with `maxItems={4}`, capping it to four primary marks (Dashboard active, its sections nested beneath) regardless of viewport height. The remaining three pages — Automations, Integrations, Settings — fold into the ⋮ overflow menu, which the play function opens so they appear in the snapshot.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A capped-out page is absent from the rail until the ⋮ menu is opened.
    await expect(canvas.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'More items' }));
    await waitFor(() => expect(document.body.textContent).toContain('Settings'));
  },
};

/** TALL CONTENT — clicking a section scrolls the page to it (and `scrollSpy`
 *  highlights the section you scroll to). */
export const TallContent: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    scrollSpy: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the floating rail with `scrollSpy` over tall (doubled) content. The play asserts the current section follows the scroll position and that clicking a section scrolls the page to it.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <Backdrop height={620} repeat={2} scrollRef={scrollRef} scrollId='nav-scroll'>
        <ReqoreNavRail {...args} scrollContainer={scrollRef} />
      </Backdrop>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller = canvasElement.querySelector('#nav-scroll') as HTMLElement;
    // scroll-spy: the first section is current at the top…
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'location')
    );
    // …and the current section follows the scroll position.
    scroller.scrollTop = scroller.scrollHeight;
    fireEvent.scroll(scroller);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'History' })).toHaveAttribute('aria-current', 'location')
    );
    // click-to-scroll: clicking a section scrolls the page to it.
    await userEvent.click(canvas.getByRole('button', { name: 'Health' }));
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
  },
};

/** MOBILE — hidden by default; appears while the user scrolls, then hides again
 *  after they stop. (This story keeps it revealed after one scroll so the frame
 *  is stable; the live default hides ~1.1s after scrolling stops.) */
export const Mobile: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'right',
    revealOnScroll: true,
    scrollHideDelay: 60000,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the floating rail with `revealOnScroll` in a phone-width frame — hidden at rest (opacity 0), revealed while the user scrolls. The play asserts both states.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <Backdrop width={390} height={560} repeat={2} scrollRef={scrollRef} scrollId='mobile-scroll'>
        <ReqoreNavRail {...args} scrollContainer={scrollRef} />
      </Backdrop>
    );
  },
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('.reqore-nav-rail') as HTMLElement;
    // Hidden at rest.
    await expect(getComputedStyle(nav).opacity).toBe('0');
    // Scrolling reveals it.
    const scroller = canvasElement.querySelector('#mobile-scroll') as HTMLElement;
    scroller.scrollTop = 120;
    fireEvent.scroll(scroller);
    await waitFor(() => expect(getComputedStyle(nav).opacity).toBe('1'));
  },
};

/** INTERACTION — navigating a primary item swaps its nested section sub-capsule. */
export const Interaction: Story = {
  args: { items: ITEMS, position: 'static', defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the inline rail and navigates from Dashboard to Team (play), asserting the nested section sub-capsule swaps to the Team sections.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Team' }));
    await expect(canvas.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Members' })).toBeInTheDocument();
  },
};

/** SPECIAL ITEM — a single item painted with its own `effect` (a purple→pink
 *  gradient). Unlike the rail-wide `effect`/`activeEffect`, a per-item `effect`
 *  paints that one mark regardless of active state, so a "special" destination
 *  always stands out among the neutral marks. */
export const SpecialItem: Story = {
  args: {
    position: 'static',
    defaultActiveId: 'dashboard',
    items: [
      ITEMS[0],
      {
        id: 'assistant',
        label: 'Assistant',
        icon: 'Sparkling2Line',
        effect: {
          gradient: {
            colors: { 0: '#7b3ff2', 50: '#b83fd6', 100: '#ff5db1' },
            direction: 'to bottom right',
          },
        },
      },
      ...ITEMS.slice(1),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the inline rail with one item (Assistant) carrying its own `effect` — a purple→pink gradient that paints the mark regardless of active state, so a "special" destination stands out among the neutral marks (Dashboard is the active page here, Assistant is not).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Assistant' })).toBeInTheDocument();
  },
};

/** DIVIDERS — `dividerAfter` on an item draws a subtle separator beneath its
 *  mark to group items with a little breathing room. */
export const Dividers: Story = {
  args: {
    position: 'static',
    defaultActiveId: 'team',
    items: [
      { ...ITEMS[0], dividerAfter: true }, // Dashboard ──
      ITEMS[1], // Projects
      ITEMS[2], // Team (active)
      { ...ITEMS[3], dividerAfter: true }, // Reports ──
      ITEMS[4], // Automations
      ITEMS[5], // Integrations
      ITEMS[6], // Settings
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the inline rail with `dividerAfter` on two items (Dashboard and Reports), drawing a separator beneath each — extra vertical space plus a short line — to group the marks with breathing room. Team is the active page, so its section sub-capsule sits between the two divided groups.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
  },
};

/** OVERFLOW CAPPED — with many hidden pages the `⋮` menu would run off the
 *  viewport, so it is height-capped (`min(70vh, 480px)`) and scrolls. The play
 *  opens it; in a real viewport the long list is clipped to the cap. */
export const OverflowCapped: Story = {
  args: {
    items: MANY_ITEMS,
    position: 'static',
    maxItems: 4,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the inline rail with a long item list capped to `maxItems={4}`, folding ~19 pages into the `⋮` menu. The play opens the menu; because the list exceeds the menu's height cap (`min(70vh, 480px)`) it clips and scrolls rather than running off the viewport — the safeguard for long overflow lists on short / mobile screens.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More items' }));
    await waitFor(() => expect(document.body.textContent).toContain('Page 22'));
  },
};
