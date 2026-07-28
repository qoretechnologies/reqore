import { StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ReactNode, useRef } from 'react';
import ReqoreNavRail, {
  IReqoreNavRailItem,
  IReqoreNavRailProps,
} from '../../components/NavRail';
import { ReqoreControlGroup, ReqoreH2, ReqoreP, ReqorePanel } from '../../index';
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
  scrollRef,
  children,
}: {
  height?: number;
  scrollRef?: React.RefObject<HTMLDivElement>;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'relative',
      height,
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  >
    <div ref={scrollRef} style={{ position: 'absolute', inset: 0, overflow: 'auto', padding: '18px 72px' }}>
      <ReqoreControlGroup vertical gapSize='big' fluid>
        {DASHBOARD_SECTIONS!.map((s) => (
          <ReqorePanel key={s.id} label={s.label} icon={s.icon} rounded flat id={s.scrollTargetId}>
            <ReqoreP style={{ minHeight: 120 }}>
              Content for the {s.label} section. Scroll to move the rail&apos;s highlight.
            </ReqoreP>
          </ReqorePanel>
        ))}
      </ReqoreControlGroup>
    </div>
    {children}
  </div>
);

/** INLINE — the rail on its own (position='static'): a thin column of circular
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

/** IDLE REVEAL — rests dim, fades fully in on approach (hover the gutter). */
export const IdleReveal: Story = {
  args: { items: ITEMS, floating: true, position: 'left', idleReveal: true, defaultActiveId: 'dashboard' },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** OVERFLOW — a tight height cap folds each group's extras into a `⋮` flyout
 *  that never widens the rail. */
export const Overflow: Story = {
  args: { items: ITEMS, floating: true, position: 'left', maxHeight: 300, defaultActiveId: 'dashboard' },
  render: (args: IReqoreNavRailProps) => (
    <Backdrop height={340}>
      <ReqoreNavRail {...args} />
    </Backdrop>
  ),
};

/** SCROLL-SPY — the sub-items carry `scrollTargetId`s; clicking scrolls to a
 *  section and scrolling highlights the current one automatically. */
export const ScrollSpy: Story = {
  args: { items: ITEMS, floating: true, position: 'left', scrollSpy: true, defaultActiveId: 'dashboard' },
  render: (args: IReqoreNavRailProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    return (
      <Backdrop scrollRef={scrollRef}>
        <ReqoreNavRail {...args} scrollContainer={scrollRef} />
      </Backdrop>
    );
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
