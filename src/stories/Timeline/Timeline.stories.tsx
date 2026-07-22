import { expect, fn, userEvent, within } from 'storybook/test';
import { StoryFn, StoryObj } from '@storybook/react';
import { useCallback, useEffect, useState } from 'react';
import { _testsClickButton } from '../../../__tests__/utils';
import ReqoreTimeline, { IReqoreTimelineProps } from '../../components/Timeline';
import { sleep } from '../../helpers/utils';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Timeline',
  component: ReqoreTimeline,
} as StoryMeta<typeof ReqoreTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: IReqoreTimelineProps['items'] = [
  {
    title: 'Order placed',
    content: 'Your order has been received and is being processed.',
    timestamp: '2024-01-15 09:00',
    icon: 'ShoppingCartLine',
  },
  {
    title: 'Payment confirmed',
    content: 'Payment was successfully processed.',
    timestamp: '2024-01-15 09:05',
    icon: 'BankCardLine',
    intent: 'success',
  },
  {
    title: 'Shipped',
    content: 'Your package has been shipped via express delivery.',
    timestamp: '2024-01-16 14:30',
    icon: 'TruckLine',
    intent: 'info',
  },
  {
    title: 'Delivered',
    content: 'Package has been delivered successfully.',
    timestamp: '2024-01-17 11:00',
    icon: 'CheckboxCircleLine',
    intent: 'success',
  },
];

const Template: StoryFn<IReqoreTimelineProps> = (args) => {
  return <ReqoreTimeline {...args} />;
};

const SizesTemplate: StoryFn<IReqoreTimelineProps> = (args) => {
  return (
    <ReqoreControlGroup vertical gapSize='big'>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Micro</h4>
        <ReqoreTimeline {...args} size='micro' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Tiny</h4>
        <ReqoreTimeline {...args} size='tiny' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Small</h4>
        <ReqoreTimeline {...args} size='small' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Normal</h4>
        <ReqoreTimeline {...args} size='normal' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Big</h4>
        <ReqoreTimeline {...args} size='big' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Huge</h4>
        <ReqoreTimeline {...args} size='huge' />
      </div>
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
  args: {
    items: basicItems,
  },
};

export const WithoutIcons: Story = {
  render: Template,
  args: {
    items: [
      {
        title: 'First event',
        content: 'Something happened here.',
        timestamp: 'Jan 1, 2024',
      },
      {
        title: 'Second event',
        content: 'Another thing occurred.',
        timestamp: 'Jan 5, 2024',
      },
      {
        title: 'Third event',
        content: 'The final event in this sequence.',
        timestamp: 'Jan 10, 2024',
      },
    ],
  },
};

export const WithBadges: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Task completed',
          content: 'All subtasks have been finished.',
          icon: 'CheckLine',
          intent: 'success',
          badge: 'Done',
        },
        {
          title: 'In progress',
          content: 'Working on the implementation.',
          icon: 'CodeLine',
          intent: 'info',
          badge: [3, { label: 'WIP', intent: 'warning' }],
        },
        {
          title: 'Pending review',
          content: 'Waiting for code review.',
          icon: 'TimeLine',
          badge: { label: 'Review', icon: 'EyeLine' },
        },
        {
          title: 'Multiple badges',
          content: 'This item has several badges.',
          icon: 'StarLine',
          badge: ['v2.0', { label: 'New', intent: 'success' }, 42],
        },
      ]}
    />
  ),
};

export const WithRelativeTime: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Just now',
          content: 'This happened moments ago.',
          icon: 'TimeLine',
          timestamp: Date.now(),
          relativeTime: true,
        },
        {
          title: 'Recent',
          content: 'This happened a while ago.',
          icon: 'HistoryLine',
          timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
          relativeTime: true,
          intent: 'info',
        },
        {
          title: 'Yesterday',
          content: 'This happened yesterday.',
          icon: 'CalendarLine',
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          relativeTime: true,
        },
        {
          title: 'Last week',
          content: 'This happened last week.',
          icon: 'CalendarEventLine',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
          relativeTime: true,
          intent: 'warning',
        },
      ]}
    />
  ),
};

export const Collapsible: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Expanded by default',
          content:
            'This content is visible by default. Click the arrow to collapse it. This is a longer description to show how the collapse animation works with more content.',
          timestamp: '2024-01-15',
          icon: 'FolderOpenLine',
          collapsible: true,
          intent: 'info',
        },
        {
          title: 'Collapsed by default',
          content: 'This content is hidden by default. Click the arrow to expand it.',
          timestamp: '2024-01-14',
          icon: 'FolderLine',
          collapsible: true,
          isCollapsed: true,
        },
        {
          title: 'Another collapsible item',
          content: 'More hidden content here. Expand to see it!',
          timestamp: '2024-01-13',
          icon: 'ArchiveLine',
          collapsible: true,
          isCollapsed: true,
          intent: 'success',
        },
        {
          title: 'Non-collapsible item',
          content: 'This item cannot be collapsed.',
          timestamp: '2024-01-12',
          icon: 'LockLine',
        },
      ]}
    />
  ),
};

export const WithIntents: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Default',
          content: 'This item has no intent.',
          icon: 'InformationLine',
        },
        {
          title: 'Info',
          content: 'This item has info intent.',
          icon: 'InformationLine',
          intent: 'info',
        },
        {
          title: 'Success',
          content: 'This item has success intent.',
          icon: 'CheckLine',
          intent: 'success',
        },
        {
          title: 'Warning',
          content: 'This item has warning intent.',
          icon: 'AlertLine',
          intent: 'warning',
        },
        {
          title: 'Danger',
          content: 'This item has danger intent.',
          icon: 'ErrorWarningLine',
          intent: 'danger',
        },
        {
          title: 'Pending',
          content: 'This item has pending intent.',
          icon: 'TimeLine',
          intent: 'pending',
        },
        {
          title: 'Muted',
          content: 'This item has muted intent.',
          icon: 'SubtractLine',
          intent: 'muted',
        },
      ]}
    />
  ),
};

export const GlobalIntent: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Info Intent</h4>
        <ReqoreTimeline
          {...args}
          intent='info'
          items={[
            { title: 'Step 1', content: 'First step', icon: 'Number1' },
            { title: 'Step 2', content: 'Second step', icon: 'Number2' },
            { title: 'Step 3', content: 'Third step', icon: 'Number3' },
          ]}
        />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Success Intent</h4>
        <ReqoreTimeline
          {...args}
          intent='success'
          items={[
            { title: 'Step 1', content: 'First step', icon: 'Number1' },
            { title: 'Step 2', content: 'Second step', icon: 'Number2' },
            { title: 'Step 3', content: 'Third step', icon: 'Number3' },
          ]}
        />
      </div>
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: SizesTemplate,
  args: {
    items: [
      {
        title: 'Event one',
        content: 'Description of the first event.',
        icon: 'StarLine',
      },
      {
        title: 'Event two',
        content: 'Description of the second event.',
        icon: 'HeartLine',
        intent: 'success',
      },
      {
        title: 'Event three',
        content: 'Description of the third event.',
        icon: 'ThumbUpLine',
        intent: 'info',
      },
    ],
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
      <ReqoreControlGroup vertical gapSize='normal'>
        <p>Selected: {selected !== null ? `Item ${selected + 1}` : 'None'}</p>
        <ReqoreTimeline
          {...args}
          items={[
            {
              title: 'Clickable item 1',
              content: 'Click me to select.',
              icon: 'CursorLine',
              onClick: () => setSelected(0),
              intent: selected === 0 ? 'info' : undefined,
            },
            {
              title: 'Clickable item 2',
              content: 'Click me to select.',
              icon: 'CursorLine',
              onClick: () => setSelected(1),
              intent: selected === 1 ? 'info' : undefined,
            },
            {
              title: 'Clickable item 3',
              content: 'Click me to select.',
              icon: 'CursorLine',
              onClick: () => setSelected(2),
              intent: selected === 2 ? 'info' : undefined,
            },
            {
              title: 'Disabled item',
              content: 'This item is disabled.',
              icon: 'ForbidLine',
              onClick: () => setSelected(3),
              disabled: true,
            },
          ]}
        />
      </ReqoreControlGroup>
    );
  },
};

export const WithTooltips: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Hover me',
          content: 'This item has a simple tooltip.',
          icon: 'QuestionLine',
          tooltip: 'This is a simple tooltip',
        },
        {
          title: 'Rich tooltip',
          content: 'This item has a rich tooltip.',
          icon: 'InformationLine',
          intent: 'info',
          tooltip: {
            content: 'This is a rich tooltip with more options',
            intent: 'info',
          },
        },
      ]}
    />
  ),
};

export const Fluid: Story = {
  render: (args) => (
    <div style={{ width: '100%', border: '1px dashed gray', padding: '16px' }}>
      <ReqoreTimeline {...args} fluid />
    </div>
  ),
  args: {
    items: basicItems,
  },
};

export const SingleItem: Story = {
  render: Template,
  args: {
    items: [
      {
        title: 'Only item',
        content: 'This is the only item in the timeline.',
        timestamp: 'Today',
        icon: 'FlagLine',
        intent: 'success',
      },
    ],
  },
};

export const TitleOnly: Story = {
  render: Template,
  args: {
    items: [
      { title: 'First milestone', icon: 'FlagLine' },
      { title: 'Second milestone', icon: 'RocketLine' },
      { title: 'Third milestone', icon: 'TrophyLine', intent: 'success' },
    ],
  },
};

const customContentItems: IReqoreTimelineProps['items'] = [
  {
    title: 'String content',
    content: 'This is plain string content rendered in a ReqoreP.',
    icon: 'TextWrap',
  },
  {
    title: 'Custom component content',
    icon: 'CodeLine',
    intent: 'info',
    content: (
      <div>
        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
          <li>Custom React elements are rendered directly</li>
          <li>String and number content uses ReqoreP</li>
          <li>Mix both freely across items</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Mixed usage',
    content: 'You can mix string and component content across items.',
    icon: 'Exchange2Line',
    intent: 'success',
  },
];

export const CustomContent: Story = {
  render: (args) => <ReqoreTimeline {...args} items={customContentItems} />,
};

export const DynamicItemCount: Story = {
  render: (args) => {
    const fiveItems: IReqoreTimelineProps['items'] = Array.from({ length: 5 }, (_, i) => ({
      title: `Event ${i + 1}`,
      content: `Description for event ${i + 1}.`,
      icon: 'TimeLine' as const,
    }));

    const tenItems: IReqoreTimelineProps['items'] = Array.from({ length: 10 }, (_, i) => ({
      title: `Event ${i + 1}`,
      content: `Description for event ${i + 1}.`,
      icon: 'TimeLine' as const,
      intent: i >= 5 ? ('info' as const) : undefined,
    }));

    const [items, setItems] = useState(fiveItems);

    useEffect(() => {
      const timer = setTimeout(() => setItems(tenItems), 1000);
      return () => clearTimeout(timer);
    }, []);

    return <ReqoreTimeline {...args} items={items} />;
  },
};

const largeCollapsibleItems: IReqoreTimelineProps['items'] = [
  {
    title: 'Tall content (expanded)',
    icon: 'FileTextLine',
    intent: 'info',
    collapsible: true,
    content:
      'This collapsible item has no max-height cap, so arbitrarily tall content will display fully without scrollbars or clipping. '.repeat(
        80
      ),
  },
  {
    title: 'Tall content (collapsed by default)',
    icon: 'FileTextLine',
    collapsible: true,
    isCollapsed: true,
    content: 'Expand to see content. No height limit applied. '.repeat(20),
  },
  {
    title: 'Normal item after collapsible items',
    content: 'Timeline renders correctly after collapsible items.',
    icon: 'CheckLine',
    intent: 'success',
  },
];

export const LargeCollapsibleContent: Story = {
  render: Template,
  args: {
    items: largeCollapsibleItems,
  },
};

export const ControlledCollapse: Story = {
  render: (args) => {
    const collapsibleItems: IReqoreTimelineProps['items'] = [
      {
        title: 'Request Submitted',
        content: 'User submitted a new feature request via the portal.',
        timestamp: '2024-01-10 09:00',
        icon: 'FileAddLine',
        collapsible: true,
      },
      {
        title: 'Under Review',
        content: 'The request is being evaluated by the product team.',
        timestamp: '2024-01-11 14:00',
        icon: 'SearchEyeLine',
        intent: 'info',
        collapsible: true,
      },
      {
        title: 'Approved',
        content: 'The feature request has been approved for development.',
        timestamp: '2024-01-14 11:30',
        icon: 'CheckDoubleLine',
        intent: 'success',
        collapsible: true,
      },
      {
        title: 'In Progress',
        content: 'Development has started. Expected completion: 2 weeks.',
        timestamp: '2024-01-15 09:00',
        icon: 'Progress1Fill',
        intent: 'pending',
        collapsible: true,
      },
    ];

    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({
      1: true,
      3: true,
    });

    const handleCollapseChange = useCallback((index: number, isCollapsed: boolean) => {
      setCollapsed((prev) => ({ ...prev, [index]: isCollapsed }));
    }, []);

    const expandAll = useCallback(() => {
      setCollapsed(
        collapsibleItems.reduce<Record<number, boolean>>(
          (acc, _, i) => ({ ...acc, [i]: false }),
          {}
        )
      );
    }, []);

    const collapseAll = useCallback(() => {
      setCollapsed(
        collapsibleItems.reduce<Record<number, boolean>>((acc, _, i) => ({ ...acc, [i]: true }), {})
      );
    }, []);

    return (
      <ReqoreControlGroup vertical gapSize='normal'>
        <ReqoreControlGroup>
          <ReqoreButton onClick={expandAll} icon='ArrowDownSLine'>
            Expand all
          </ReqoreButton>
          <ReqoreButton onClick={collapseAll} icon='ArrowUpSLine'>
            Collapse all
          </ReqoreButton>
        </ReqoreControlGroup>
        <ReqoreTimeline
          {...args}
          items={collapsibleItems}
          collapsedState={collapsed}
          onCollapseChange={handleCollapseChange}
        />
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText('User submitted a new feature request via the portal.')
    ).toBeVisible();

    await expect(
      canvas.queryByText('The request is being evaluated by the product team.')
    ).not.toBeVisible();

    await _testsClickButton({ label: 'Expand all' });

    await sleep(500); // Wait for animation

    await expect(
      canvas.queryByText('The request is being evaluated by the product team.')
    ).toBeVisible();
  },
};

const horizontalProgressItems: IReqoreTimelineProps['items'] = [
  {
    title: 'Cart',
    timestamp: 'Step 1',
    icon: 'ShoppingCartLine',
    intent: 'success',
  },
  {
    title: 'Address',
    timestamp: 'Step 2',
    icon: 'MapPinLine',
    intent: 'success',
  },
  {
    title: 'Payment',
    timestamp: 'Step 3',
    icon: 'BankCardLine',
    intent: 'info',
  },
  {
    title: 'Confirmation',
    timestamp: 'Step 4',
    icon: 'CheckboxCircleLine',
  },
];

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ width: '100%', padding: '24px 0' }}>
      <ReqoreTimeline {...args} direction='horizontal' items={horizontalProgressItems} />
    </div>
  ),
};

export const HorizontalWithBadges: Story = {
  render: (args) => (
    <div style={{ width: '100%', padding: '24px 0' }}>
      <ReqoreTimeline
        {...args}
        direction='horizontal'
        items={[
          {
            title: 'Created',
            timestamp: '09:00',
            icon: 'AddLine',
            badge: { label: 'New', intent: 'info' },
          },
          {
            title: 'Reviewed',
            timestamp: '11:30',
            icon: 'EyeLine',
            intent: 'info',
            badge: 3,
          },
          {
            title: 'Approved',
            timestamp: '14:00',
            icon: 'CheckLine',
            intent: 'success',
            badge: { label: 'Done' },
          },
          {
            title: 'Shipped',
            timestamp: '16:45',
            icon: 'TruckLine',
            intent: 'pending',
          },
        ]}
      />
    </div>
  ),
};

export const HorizontalSizes: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Small</h4>
        <ReqoreTimeline {...args} direction='horizontal' size='small' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Normal</h4>
        <ReqoreTimeline {...args} direction='horizontal' size='normal' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Big</h4>
        <ReqoreTimeline {...args} direction='horizontal' size='big' />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px' }}>Huge</h4>
        <ReqoreTimeline {...args} direction='horizontal' size='huge' />
      </div>
    </ReqoreControlGroup>
  ),
  args: {
    items: horizontalProgressItems,
  },
};

export const HorizontalInteractive: Story = {
  render: (args) => {
    const [step, setStep] = useState(1);

    const items: IReqoreTimelineProps['items'] = [
      'Cart',
      'Address',
      'Payment',
      'Review',
      'Confirmation',
    ].map((label, i) => ({
      title: label,
      icon: 'CheckLine',
      intent: i < step ? 'success' : i === step ? 'info' : undefined,
      onClick: () => setStep(i),
    }));

    return (
      <ReqoreControlGroup vertical gapSize='normal' fluid>
        <p>Current step: {items[step]?.title}</p>
        <ReqoreTimeline {...args} direction='horizontal' items={items} />
      </ReqoreControlGroup>
    );
  },
};

export const HorizontalIgnoresContentAndCollapse: Story = {
  render: (args) => (
    <div style={{ width: '100%', padding: '24px 0' }}>
      <ReqoreTimeline
        {...args}
        direction='horizontal'
        items={[
          {
            title: 'First',
            icon: 'Number1',
            // content and collapsible are intentionally ignored in horizontal mode
            content: 'This content should NOT render in horizontal mode.',
            collapsible: true,
            isCollapsed: false,
          },
          {
            title: 'Second',
            icon: 'Number2',
            intent: 'info',
            content: 'Hidden too.',
            collapsible: true,
          },
          {
            title: 'Third',
            icon: 'Number3',
            intent: 'success',
            content: 'And this one.',
          },
        ]}
      />
    </div>
  ),
};

export const WorkflowExample: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Request Submitted',
          content: 'User submitted a new feature request.',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
          relativeTime: true,
          icon: 'FileAddLine',
          badge: 'REQ-123',
          collapsible: true,
        },
        {
          title:
            'Under Review because this is a very long title that should wrap but not go under the arrow. Under Review because this is a very long title that should wrap but not go under the arrow. Under Review because this is a very long title that should wrap but not go under the arrow. Under Review because this is a very long title that should wrap but not go under the arrow.',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
          relativeTime: true,
          icon: 'SearchEyeLine',
          intent: 'info',
          badge: [{ label: '2 comments', icon: 'Chat1Line' }],
          collapsible: true,
        },
        {
          title: 'Approved',
          content: 'The feature request has been approved for development.',
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
          relativeTime: true,
          icon: 'CheckDoubleLine',
          intent: 'success',
          badge: { label: 'High Priority', intent: 'danger' },
          collapsible: true,
        },
        {
          title: 'In Progress',
          content: 'Development has started. Expected completion: 2 weeks.',
          timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
          relativeTime: true,
          icon: 'Progress1Fill',
          iconProps: { animation: 'spin' },
          intent: 'pending',
          badge: ['Sprint 42', { label: '30%', intent: 'info' }],
          collapsible: true,
        },
        {
          title: 'Pending Deployment',
          content: 'Waiting for the next release cycle.',
          icon: 'TimeLine',
          intent: 'warning',
          collapsible: true,
          isCollapsed: true,
        },
      ]}
    />
  ),
};

// A folded run of uneventful items (GitHub-diff style): only the noteworthy
// entries stay visible, the rest collapse behind an "N hidden" marker that
// expands on click. Runs can sit between normal entries as well as at the
// ends, and their connector line is dotted to read as "skipped".
export const CollapsedRange: Story = {
  render: (args) => (
    <ReqoreTimeline
      {...args}
      items={[
        {
          title: 'Build #18 · reviewing now',
          timestamp: 'Jul 15',
          icon: 'TimeLine',
          intent: 'info',
        },
        {
          // Expanded to show both states in one view: this run reveals its
          // items + a "Hide" control; the later runs stay folded.
          label: '6 read-only builds',
          defaultExpanded: true,
          collapsedItems: [
            { title: 'Build #17', timestamp: 'Jul 15', icon: 'TimeLine' },
            { title: 'Build #16', timestamp: 'Jul 15', icon: 'TimeLine' },
            { title: 'Build #15', timestamp: 'Jul 15', icon: 'TimeLine' },
            { title: 'Build #14', timestamp: 'Jul 15', icon: 'TimeLine' },
            { title: 'Build #13', timestamp: 'Jul 14', icon: 'TimeLine' },
            { title: 'Build #12', timestamp: 'Jul 14', icon: 'TimeLine' },
          ],
        },
        {
          title: 'Build #11',
          content: 'Rejected — empty render.',
          timestamp: 'Jul 9',
          icon: 'CloseCircleLine',
          intent: 'danger',
          badge: [{ label: '1', icon: 'Chat1Line' }],
          collapsible: true,
        },
        {
          // A run sandwiched between two normal entries (#11 above, #7 below).
          label: '2 read-only builds',
          collapsedItems: [
            { title: 'Build #10', timestamp: 'Jul 9', icon: 'TimeLine' },
            { title: 'Build #1', timestamp: 'Jul 9', icon: 'TimeLine' },
          ],
        },
        {
          title: 'Build #7',
          content: 'Accepted',
          timestamp: 'Jul 8',
          icon: 'CheckLine',
          intent: 'success',
          collapsible: true,
        },
        {
          label: '3 read-only builds',
          collapsedItems: [
            { title: 'Build #6', timestamp: 'Jul 8', icon: 'TimeLine' },
            { title: 'Build #5', timestamp: 'Jul 7', icon: 'TimeLine' },
            { title: 'Build #4', timestamp: 'Jul 7', icon: 'TimeLine' },
          ],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The first run is expanded (defaultExpanded): its items render inline
    // with a "Hide" control.
    await expect(canvas.getByText('Hide')).toBeInTheDocument();
    await expect(canvas.getByText('Build #14')).toBeInTheDocument();
    // The later runs stay folded — labels show, their hidden builds don't.
    await expect(canvas.getByText('2 read-only builds')).toBeInTheDocument();
    await expect(canvas.queryByText('Build #10')).not.toBeInTheDocument();
    // Noteworthy entries stay visible — including a normal entry sandwiched
    // between two collapsed runs.
    await expect(canvas.getByText('Build #11')).toBeInTheDocument();
    await expect(canvas.getByText('Build #7')).toBeInTheDocument();
  },
};

// Icon markers with no title/content/timestamp — a compact "section rail". The
// `spacing` prop is what keeps the connector line visible here; without it every
// row collapses to the marker height and the line vanishes.
const onOverviewClick = fn();
const iconOnlyItems: IReqoreTimelineProps['items'] = [
  { icon: 'FlagLine', tooltip: 'Overview', onClick: onOverviewClick },
  { icon: 'ShoppingCartLine', tooltip: 'Orders', onClick: fn() },
  { icon: 'BankCardLine', tooltip: 'Billing', onClick: fn() },
  { icon: 'TruckLine', tooltip: 'Shipping', onClick: fn() },
  { icon: 'CheckboxCircleLine', tooltip: 'Done', onClick: fn() },
];

export const IconsOnlyVertical: Story = {
  render: Template,
  args: {
    direction: 'vertical',
    size: 'small',
    spacing: 'normal',
    items: iconOnlyItems,
  },
  play: async ({ canvasElement }) => {
    // Every marker renders even though the rows carry no text.
    const markers = canvasElement.querySelectorAll('.reqore-timeline-marker');
    await expect(markers.length).toBe(iconOnlyItems.length);

    // The connector line has real length thanks to `spacing`. Without the prop
    // an icons-only vertical timeline collapses each row to the marker height,
    // so the line is 0px tall — this assertion is the regression guard.
    const line = canvasElement.querySelector('.reqore-timeline-line') as HTMLElement;
    await expect(line).toBeTruthy();
    await expect(line.getBoundingClientRect().height).toBeGreaterThan(0);

    // Icon markers are clickable — the section-switcher use case relies on it.
    const firstItem = canvasElement.querySelector('.reqore-timeline-item') as HTMLElement;
    await userEvent.click(firstItem);
    await expect(onOverviewClick).toHaveBeenCalled();

    // Release focus so the story doesn't end with the item's focus-visible
    // outline lingering as a rectangle over the timeline (Storybook captures
    // the story after `play` runs).
    firstItem.blur();
  },
};
