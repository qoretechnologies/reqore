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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation')).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
  },
};

/** IN GUTTER — floating in the left gutter of a page, over scrolling content. */
export const InGutter: Story = {
  args: { items: ITEMS, floating: true, position: 'left', defaultActiveId: 'dashboard' },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** RIGHT GUTTER — the same rail pinned to the right gutter. */
export const RightGutter: Story = {
  args: { items: ITEMS, floating: true, position: 'right', defaultActiveId: 'dashboard' },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** SIZES — the standard `size` scale drives the marks, spacing and pill radius. */
export const Sizes: Story = {
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
  render: () => (
    <ReqoreControlGroup gapSize='big' verticalAlign='flex-start'>
      <Labeled label='gradient'>
        <ReqoreNavRail
          items={ITEMS}
          position='static'
          defaultActiveId='dashboard'
          effect={{ gradient: { colors: { 0: '#2e1a47', 100: '#160c24' }, direction: 'to bottom' } }}
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
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
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
  render: (args: IReqoreNavRailProps) => (
    <Backdrop height={320}>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
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
    await expect(scroller.scrollTop).toBe(0);
    // Click a section further down the page.
    await userEvent.click(canvas.getByRole('button', { name: 'Billing' }));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('group', { name: 'Dashboard sections' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Team' }));
    await expect(canvas.getByRole('group', { name: 'Team sections' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Members' })).toBeInTheDocument();
  },
};
