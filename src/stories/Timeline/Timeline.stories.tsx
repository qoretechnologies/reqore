import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreTimeline, { IReqoreTimelineProps } from '../../components/Timeline';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Timeline/Stories',
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
          title: 'Under Review',
          content: 'The request is being reviewed by the product team.',
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
          icon: 'CodeLine',
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
