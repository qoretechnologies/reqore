import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreSegmentedControl, {
  IReqoreSegmentedControlProps,
} from '../../components/SegmentedControl';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/SegmentedControl',
  component: ReqoreSegmentedControl,
} as StoryMeta<typeof ReqoreSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: IReqoreSegmentedControlProps['items'] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const InteractiveTemplate: StoryFn<IReqoreSegmentedControlProps> = (args) => {
  const [value, setValue] = useState(args.value ?? 'day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={args.items || defaultItems}
      value={value}
      onChange={setValue}
    />
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its default configuration.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
  },
};

export const Pill: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its pill shape.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    pill: true,
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its flat variant.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    flat: true,
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    fluid: true,
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with icons on the items.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('list');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'list', label: 'List', icon: 'ListUnordered' },
          { value: 'grid', label: 'Grid', icon: 'GridFill' },
          { value: 'table', label: 'Table', icon: 'Table2' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl showing only an icon (no label).',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('list');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'list', icon: 'ListUnordered', tooltip: 'List view' },
          { value: 'grid', icon: 'GridFill', tooltip: 'Grid view' },
          { value: 'table', icon: 'Table2', tooltip: 'Table view' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => {
    const sizes = ['micro', 'tiny', 'small', 'normal', 'big', 'huge', 'massive'] as const;

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        {sizes.map((size) => (
          <SizeDemo key={size} size={size} args={args} />
        ))}
      </ReqoreControlGroup>
    );
  },
};

const SizeDemo = ({
  size,
  args,
}: {
  size: IReqoreSegmentedControlProps['size'];
  args: IReqoreSegmentedControlProps;
}) => {
  const [value, setValue] = useState('day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={defaultItems}
      size={size}
      value={value}
      onChange={setValue}
    />
  );
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <IntentDemo args={args} />
      <IntentDemo args={args} intent='info' />
      <IntentDemo args={args} intent='success' />
      <IntentDemo args={args} intent='warning' />
      <IntentDemo args={args} intent='danger' />
    </ReqoreControlGroup>
  ),
};

const IntentDemo = ({
  args,
  intent,
}: {
  args: IReqoreSegmentedControlProps;
  intent?: IReqoreSegmentedControlProps['intent'];
}) => {
  const [value, setValue] = useState('day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={defaultItems}
      value={value}
      onChange={setValue}
      intent={intent}
    />
  );
};

export const ActiveIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with an intent applied to the active state.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={defaultItems}
        value={value}
        onChange={setValue}
        activeIntent='info'
      />
    );
  },
};

export const PerItemActiveIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with a per-item active intent.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('success');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'success', label: 'Success', activeIntent: 'success', icon: 'CheckLine' },
          { value: 'warning', label: 'Warning', activeIntent: 'warning', icon: 'AlertLine' },
          { value: 'danger', label: 'Danger', activeIntent: 'danger', icon: 'CloseLine' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const DisabledItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with individual items marked disabled.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week', disabled: true },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year', disabled: true },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const FullyDisabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl fully disabled.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    disabled: true,
  },
};

export const AllowDeselect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl where the selected option can be deselected.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={defaultItems}
        value={value}
        onChange={setValue}
        allowDeselect
      />
    );
  },
};

export const WithBadges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with multiple badges.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('inbox');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'inbox', label: 'Inbox', icon: 'MailLine', badge: 12 },
          { value: 'sent', label: 'Sent', icon: 'SendPlaneLine', badge: 3 },
          { value: 'drafts', label: 'Drafts', icon: 'DraftLine' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in a responsive layout.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('overview');
    const manyItems = [
      { value: 'overview', label: 'Overview', icon: 'DashboardLine' as const },
      { value: 'analytics', label: 'Analytics', icon: 'BarChartLine' as const },
      { value: 'reports', label: 'Reports', icon: 'FileTextLine' as const },
      { value: 'settings', label: 'Settings', icon: 'Settings3Line' as const },
      { value: 'users', label: 'Users', icon: 'UserLine' as const },
      { value: 'billing', label: 'Billing', icon: 'BankCardLine' as const },
    ];

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        <div style={{ width: '100%' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
        <div style={{ width: '400px' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
        <div style={{ width: '250px' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
      </ReqoreControlGroup>
    );
  },
};
