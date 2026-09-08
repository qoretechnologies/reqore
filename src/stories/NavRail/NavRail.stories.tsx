import { StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ReactNode, useRef } from 'react';
import ReqoreNavRail, {
  IReqoreNavRailItem,
  IReqoreNavRailProps,
} from '../../components/NavRail';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreP,
  ReqorePanel,
  ReqoreTag,
  ReqoreUIProvider,
} from '../../index';
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

/** A fully-themed item set: per-item effects on the first two marks + a page with
 *  sections — used by the Effects story to show the active page + section marks
 *  against a branded surface. */
const THEMED_ITEMS: IReqoreNavRailItem[] = [
  {
    id: 'qonsole',
    label: 'Qonsole',
    icon: 'Chat3Line',
    effect: {
      gradient: { colors: { 0: '#7b3ff2', 50: '#b83fd6', 100: '#ff5db1' }, direction: 'to bottom right' },
    },
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardLine',
    effect: { gradient: { colors: { 0: '#5a3f86', 100: '#2e2247' }, direction: 'to bottom right' } },
    dividerAfter: true,
  },
  {
    id: 'autohub',
    label: 'Automation Hub',
    icon: 'FlowChart',
    items: [
      { id: 'sec-health', label: 'Health', icon: 'HeartPulseLine', scrollTargetId: 's1' },
      { id: 'sec-conns', label: 'Connections', icon: 'Plug2Line', scrollTargetId: 's2' },
      { id: 'sec-runs', label: 'Recent runs', icon: 'RhythmLine', scrollTargetId: 's3' },
      { id: 'sec-states', label: 'States', icon: 'NodeTree', scrollTargetId: 's4' },
    ],
  },
  { id: 'wfhub', label: 'Workflows Hub', icon: 'GitBranchLine' },
  { id: 'connections', label: 'Connections', icon: 'Plug2Line', dividerAfter: true },
  { id: 'alerts', label: 'Alerts', icon: 'AlarmWarningLine' },
  { id: 'issues', label: 'Outstanding Issues', icon: 'ErrorWarningLine', dividerAfter: true },
  { id: 'jobs', label: 'Jobs', icon: 'CalendarLine' },
  { id: 'services', label: 'Services', icon: 'ServerLine', dividerAfter: true },
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

/** A tiny self-contained logo (a rounded square + a letter) as a `data:` URI, so
 *  the story needs no external asset. */
const logo = (bg: string, letter: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='${bg}'/><text x='12' y='17' font-size='13' font-family='sans-serif' text-anchor='middle' fill='white'>${letter}</text></svg>`
  )}`;

/** A mark can render an image instead of a font icon (`iconImage`), and `props`
 *  forwards any extra `ReqoreButton` prop to a mark. */
const IMAGE_ITEMS: IReqoreNavRailItem[] = [
  {
    id: 'qogs',
    label: 'Qogs',
    iconImage: logo('#7b3ff2', 'Q'),
    items: [
      { id: 'flows', label: 'Flows', icon: 'FlowChart' },
      { id: 'runs', label: 'Runs', icon: 'RhythmLine' },
    ],
  },
  { id: 'apps', label: 'Apps', iconImage: logo('#ff5db1', 'A'), dividerAfter: true },
  { id: 'reports', label: 'Reports', icon: 'BarChartBoxLine', props: { badge: '3' } },
  { id: 'settings', label: 'Settings', icon: 'Settings3Line' },
];

/** IMAGE MARKS — a mark's glyph can be an image (a logo/`data:` URI) via
 *  `iconImage`, and `props` reaches any other `ReqoreButton` prop (marks ARE
 *  buttons) — here a `badge` on Reports. */
export const ImageMarks: Story = {
  args: { items: IMAGE_ITEMS, position: 'static', defaultActiveId: 'qogs' },
  parameters: {
    docs: {
      description: {
        story:
          'A mark renders an image instead of a font icon via `iconImage` (Qogs / Apps show logo images from `data:` URIs), and `props` forwards any extra `ReqoreButton` prop onto a mark — here a `badge` on Reports. Marks ARE `ReqoreButton`s, so anything the button accepts is reachable; the rail keeps its own shape, selection, tooltip and active effect.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    // The two `iconImage` marks render <img> in the mark's icon slot (decorative
    // alt='' keeps them out of the a11y tree, so query the DOM directly).
    await expect(canvasElement.querySelectorAll('img').length).toBeGreaterThanOrEqual(2);
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
          "A fully-themed rail showing the effect system end to end: per-item `effect` gradients on the first two marks, a surface `effect` gradient, a coordinated `activeEffect` gradient + glow, a custom `intent`, a `customTheme` surface, and flat + raised. The active page and its current section render solid + `active` (a lifted, highlighted pill) so they read clearly against the active group's own tinted surface, taking their colour from `activeEffect` / `intent`.",
      },
    },
  },
  render: () => (
    <ReqoreUIProvider
      theme={{ main: '#121212', intents: { success: '#4a7110', custom1: '#762f7e', custom2: '#b34e1d' } }}
      options={{ glowingIcons: true }}
    >
      <div style={{ padding: 24, background: '#0e0b16', minHeight: 380, display: 'flex' }}>
        <ReqoreNavRail
          items={THEMED_ITEMS}
          defaultActiveId='autohub'
          defaultActiveSubId='sec-health'
          position='static'
          flat
          raised
          intent='custom1'
          activeEffect={{
            gradient: { colors: { 0: '#8257e6', 100: '#44287f' }, direction: 'to bottom' },
            glow: { color: '#8257e6', blur: 10, opacity: 0.55 },
          }}
          customTheme={{ main: '#161222' }}
          effect={{ gradient: { colors: { 0: '#2a1e40', 100: '#161222' }, direction: 'to bottom' } }}
        />
      </div>
    </ReqoreUIProvider>
  ),
  play: async ({ canvasElement }) => {
    // The active page + active section marks render (aria-current); the qlip
    // snapshot guards their solid, lifted look.
    await waitFor(() => {
      expect(canvasElement.querySelector('[aria-current="page"]')).toBeInTheDocument();
      expect(canvasElement.querySelector('[aria-current="location"]')).toBeInTheDocument();
    });
  },
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

/** SPACE DIVIDER — `dividerAfter: 'space'` gives the same breathing room WITHOUT
 *  a line, for a quieter break between groups. */
export const SpaceDivider: Story = {
  args: {
    position: 'static',
    defaultActiveId: 'team',
    items: [
      { ...ITEMS[0], dividerAfter: 'space' }, // Dashboard ⟂ (space only)
      ITEMS[1], // Projects
      ITEMS[2], // Team (active)
      { ...ITEMS[3], dividerAfter: 'space' }, // Reports ⟂ (space only)
      ITEMS[4], // Automations
      ITEMS[5], // Integrations
      ITEMS[6], // Settings
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the rail with `dividerAfter: 'space'` on Dashboard and Reports — the same grouping as Dividers but the separation is pure breathing room, with no line drawn (a quieter break). Compare with Dividers (which draws the line).",
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


// ── Expandable ───────────────────────────────────────────────────────────────

/** The rail and its scroll region / box, queried fresh on every call so a
 *  `waitFor` never asserts on a stale capture. */
const railOf = (root: HTMLElement) => root.querySelector('.reqore-nav-rail') as HTMLElement;
const scrollWrapOf = (root: HTMLElement) =>
  root.querySelector('.reqore-nav-rail-scroll') as HTMLElement;
const scrollBoxOf = (root: HTMLElement) =>
  root.querySelector('.reqore-nav-rail-scroll-box') as HTMLElement;

/** EXPANDABLE — hidden pages fold behind an expand toggle (a chevron mark at the
 *  foot of the column) instead of the `⋮` flyout. Collapsed, `maxItems={4}` shows
 *  four pages; the toggle's tooltip counts the rest. */
export const Expandable: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    maxItems: 4,
    expandable: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the inline rail with `expandable` and `maxItems={4}`: four page marks (Dashboard active with its sections) and, in place of the ⋮ menu, a chevron toggle at the foot of the column that folds the other three pages away. The play asserts a folded page is absent and the toggle reads collapsed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: 'More items' })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Show all items' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  },
};

/** EXPANDED — the toggle grows the rail in place: every page (and every section
 *  of the active one) is shown and the toggle flips to "show fewer". */
export const Expanded: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    maxItems: 4,
    expandable: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the expandable rail and clicks its toggle (play): the rail grows in place to show all seven pages, and the toggle flips to a 'Show fewer items' chevron pointing back up.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show all items' }));
    await expect(canvas.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Show fewer items' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  },
};

/** EXPANDED · SCROLLS — past `expandedMaxHeight` the expanded rail scrolls with
 *  a hidden scrollbar; a vignette fades whichever edge still has marks out of
 *  view. The play scrolls it half-way so both edges fade in the snapshot. */
export const ExpandedScrolls: Story = {
  args: {
    items: MANY_ITEMS,
    position: 'static',
    maxItems: 4,
    expandable: true,
    expandedMaxHeight: 360,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders an expandable rail of 23 pages capped at `expandedMaxHeight={360}` and expands it (play). The rail stops at 360px and scrolls with its scrollbar hidden; a vignette fades the bottom edge while marks are out of view below it and the top edge once some have scrolled past. The play checks each edge in turn and leaves the rail scrolled half-way, so the snapshot shows both.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show all items' }));

    // The cap holds…
    await waitFor(() =>
      expect(railOf(canvasElement).getBoundingClientRect().height).toBeLessThanOrEqual(360)
    );
    // …and at the top only the bottom edge fades.
    await waitFor(() => {
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-bottom');
      expect(scrollWrapOf(canvasElement)).not.toHaveClass('reqore-nav-rail-fade-top');
    });

    // At the end, only the top.
    scrollBoxOf(canvasElement).scrollTop = scrollBoxOf(canvasElement).scrollHeight;
    fireEvent.scroll(scrollBoxOf(canvasElement));
    await waitFor(() => {
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-top');
      expect(scrollWrapOf(canvasElement)).not.toHaveClass('reqore-nav-rail-fade-bottom');
    });

    // Half-way: both.
    const box = scrollBoxOf(canvasElement);
    box.scrollTop = Math.round((box.scrollHeight - box.clientHeight) / 2);
    fireEvent.scroll(box);
    await waitFor(() => {
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-top');
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-bottom');
    });
  },
};

/** EXPANDABLE · IN GUTTER — a floating expandable rail grows to the gutter's
 *  height (the positioned ancestor caps it before the default 95vh does) and
 *  scrolls inside it. */
export const ExpandableInGutter: Story = {
  args: {
    items: MANY_ITEMS,
    floating: true,
    position: 'left',
    expandable: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a floating, expandable rail of 23 pages in a 520px-tall page and expands it (play). The rail grows to fill the gutter — capped by the positioned ancestor rather than the default 95vh — and scrolls inside it behind the bottom vignette.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show all items' }));
    await waitFor(() =>
      expect(railOf(canvasElement).getBoundingClientRect().height).toBeLessThanOrEqual(520)
    );
    await waitFor(() =>
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-bottom')
    );
  },
};

/** EXPANDABLE · MOBILE — the same on a phone: the toggle is a tap target, and the
 *  expanded rail is capped by the phone-height page and scrolls. */
export const ExpandableMobile: Story = {
  args: {
    items: MANY_ITEMS,
    floating: true,
    position: 'right',
    expandable: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 760 } },
    docs: {
      description: {
        story:
          'Renders the floating expandable rail in a phone-width frame (captured at 380px) pinned to the right gutter, and expands it (play): the toggle is a plain tap target, the expanded rail is capped by the page and scrolls behind the bottom vignette.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop height={560}>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show all items' }));
    await waitFor(() =>
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-bottom')
    );
  },
};

// ── Labels ───────────────────────────────────────────────────────────────────

/** LABELLED — `showLabels` widens the rail into a column of labelled pills. */
export const Labelled: Story = {
  args: { items: ITEMS, position: 'static', showLabels: true, defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the inline rail with `showLabels`: every page and section mark is a fluid pill reading its icon and label, the active group spans the rail's width, and the surface keeps the icon rail's corner radius rather than rounding its caps into a stadium.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Dashboard' })).toHaveTextContent('Dashboard');
    await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveTextContent('Overview');
  },
};

/** LABELLED · RIGHT GUTTER — pinned by its right edge, a labelled rail grows
 *  leftward over the page. */
export const LabelledInGutter: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'right',
    showLabels: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a floating, labelled rail pinned to the right gutter of a page: pinned by its right edge, the wider rail grows leftward over the content, tooltips gone (the labels replace them).',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** LABELS ON HOVER — icons only until the pointer has rested on the rail for
 *  1.5s (the default `showLabelsDelay`); the labels hide again when it leaves. */
export const LabelsOnHover: Story = {
  args: { items: ITEMS, position: 'static', showLabels: 'hover', defaultActiveId: 'dashboard' },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the inline rail with `showLabels='hover'`. The play asserts it starts icon-only, hovers the rail and waits out the default 1.5s dwell, after which every mark shows its label — the state the snapshot captures.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector('.reqore-nav-rail') as HTMLElement;
    await expect(canvas.getByRole('button', { name: 'Dashboard' }).textContent).toBe('');
    await userEvent.hover(nav);
    await waitFor(
      () => expect(canvas.getByRole('button', { name: 'Dashboard' })).toHaveTextContent('Dashboard'),
      { timeout: 4000 }
    );
  },
};

/** LABELS ON HOVER · DELAY — `showLabelsDelay` sets the dwell (here 300ms). The
 *  play also proves the labels hide when the pointer leaves. */
export const LabelsOnHoverDelay: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    showLabels: 'hover',
    showLabelsDelay: 300,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders the hover-labelled rail with `showLabelsDelay={300}`. The play hovers and expects the labels within a second — well inside the default 1.5s, which would fail this wait — then moves the pointer away (icons again) and back (labels again), which is what the snapshot captures.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector('.reqore-nav-rail') as HTMLElement;
    const dashboard = () => canvas.getByRole('button', { name: 'Dashboard' });

    await userEvent.hover(nav);
    await waitFor(() => expect(dashboard()).toHaveTextContent('Dashboard'), { timeout: 1000 });

    await userEvent.unhover(nav);
    await waitFor(() => expect(dashboard().textContent).toBe(''));

    await userEvent.hover(nav);
    await waitFor(() => expect(dashboard()).toHaveTextContent('Dashboard'), { timeout: 1000 });
  },
};

/** LABELLED · EXPANDABLE — with labels the toggle spells itself out: "3 more"
 *  while collapsed, instead of relying on a tooltip. */
export const LabelledExpandable: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    maxItems: 4,
    expandable: true,
    showLabels: true,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders a labelled, expandable rail collapsed to `maxItems={4}`: the toggle is a fluid pill at the foot of the column spelling out '3 more' rather than relying on a tooltip.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Show all items' })).toHaveTextContent('3 more');
  },
};

/** LABELLED · EXPANDED — the labelled rail already expanded (`defaultExpanded`)
 *  past its cap: the toggle reads "Show fewer items" and the column scrolls
 *  behind the vignette like the icon rail does. */
export const LabelledExpanded: Story = {
  args: {
    items: MANY_ITEMS,
    position: 'static',
    maxItems: 4,
    expandable: true,
    showLabels: true,
    defaultExpanded: true,
    expandedMaxHeight: 360,
    defaultActiveId: 'dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders a labelled rail of 23 pages already expanded (`defaultExpanded`) and capped at 360px: the toggle reads 'Show fewer items', and the labelled column scrolls behind the bottom vignette exactly as the icon rail does.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Show fewer items' })).toHaveTextContent(
      'Show fewer items'
    );
    await waitFor(() =>
      expect(scrollWrapOf(canvasElement)).toHaveClass('reqore-nav-rail-fade-bottom')
    );
  },
};

/** LABELLED · SLOTS — `header` / `footer` as render props: a control that
 *  follows the marks, a labelled pill while the rail is labelled. */
export const LabelledSlots: Story = {
  args: {
    items: ITEMS,
    position: 'static',
    showLabels: true,
    defaultActiveId: 'dashboard',
    footer: ({ labelled }) => (
      <ReqoreButton
        icon='MenuUnfoldLine'
        flat
        minimal
        raised
        circle={!labelled}
        pill={labelled}
        fluid={labelled}
        aria-label='Open sidebar'
        tooltip={labelled ? undefined : { content: 'Open sidebar', placement: 'right' }}
        label={labelled ? 'Open sidebar' : undefined}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders a labelled rail whose footer is a render prop: told the rail is labelled, the sidebar control renders as a fluid pill reading 'Open sidebar' like the marks above it, instead of an icon-only circle stranded under a column of labels.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Open sidebar' })).toHaveTextContent(
      'Open sidebar'
    );
  },
};

/** RAISED · GLOW — a flat + raised rail casting a drop shadow through
 *  `effect.glow`: the raised highlight and the glow compose into one shadow. */
export const RaisedGlow: Story = {
  args: {
    items: ITEMS,
    floating: true,
    position: 'left',
    flat: true,
    raised: true,
    defaultActiveId: 'dashboard',
    effect: {
      gradient: { colors: { 0: '#2a1e40', 100: '#161222' }, direction: 'to bottom' },
      glow: { color: '#000000', blur: 28, size: 6, opacity: 0.6 },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders a flat, raised rail floating over a page with a soft black `effect.glow` — a drop shadow. The raised inset highlight and the glow are composed into one `box-shadow`, so the rail keeps its lift AND casts the shadow; before, the raised rule silently overrode any glow on a raised rail.',
      },
    },
  },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};
