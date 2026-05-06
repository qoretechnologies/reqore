import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSeverityRow from '../../components/SeverityRow';
import ReqoreTag from '../../components/Tag';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Severity Row/Stories',
  component: ReqoreSeverityRow,
} as StoryMeta<typeof ReqoreSeverityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Payment Processing · stripe-webhook-receiver',
    description: 'Avg duration 4.7s exceeded 3.5s threshold · just now',
    intent: 'danger',
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [
      { label: 'Investigate', intent: 'danger' },
      { icon: 'CloseLine', tooltip: 'Dismiss', minimal: true, flat: true },
    ],
  },
};

export const WithBadge: Story = {
  args: {
    label: 'Payment Processing',
    description: 'Three open detector flags from the last summary cycle',
    intent: 'danger',
    badge: [3, { label: 'mad', intent: 'danger', minimal: true }],
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreSeverityRow
        {...args}
        intent='danger'
        label='Critical · Stripe webhook'
        description='Avg duration 4.7s exceeded 3.5s threshold'
        leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
        actions={[{ label: 'Investigate', intent: 'danger' }]}
      />
      <ReqoreSeverityRow
        {...args}
        intent='warning'
        label='Warning · Reconcile payments'
        description='Error count 3.8 over 168-period baseline'
        leading={<ReqoreTag size='tiny' intent='warning' label='Warning' />}
        actions={[{ label: 'Investigate', intent: 'warning' }]}
      />
      <ReqoreSeverityRow
        {...args}
        intent='info'
        label='Info · Detector recalibrated'
        description='Seasonal model refit after 168-cycle window'
        leading={<ReqoreTag size='tiny' intent='info' label='Info' />}
      />
      <ReqoreSeverityRow
        {...args}
        intent='success'
        label='Resolved · Order processing'
        description='Issue cleared automatically 2 hours ago'
        leading={<ReqoreTag size='tiny' intent='success' label='Resolved' />}
      />
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreSeverityRow
        size='tiny'
        intent='danger'
        label='Tiny row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='small'
        intent='danger'
        label='Small row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='normal'
        intent='danger'
        label='Normal row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='big'
        intent='danger'
        label='Big row'
        description='Compact summary line'
      />
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  args: {
    label: 'Bordered row',
    description: 'flat={false} renders an intent-coloured border',
    intent: 'warning',
    flat: false,
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

export const Square: Story = {
  args: {
    label: 'Square row',
    description: 'rounded={false} removes the corner radius',
    intent: 'info',
    rounded: false,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const WithEffects: Story = {
  args: {
    label: 'Effects on label and description',
    description: 'Description with custom effect',
    intent: 'info',
    labelEffect: { weight: 'bold', uppercase: true, spaced: 1 },
    descriptionEffect: { italic: true, opacity: 0.8 },
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to right',
      },
    },
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const Clickable: Story = {
  args: {
    label: 'Customer Support · zendesk-ticket-sync',
    description: 'Avg duration scored 3.2 (threshold 3.0)',
    intent: 'warning',
    onClick: () => alert('Row clicked'),
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

export const NoStrip: Story = {
  args: {
    label: 'Customer Onboarding · onboard-new-customer',
    description: 'No issues — operating within baseline',
    intent: 'success',
    showStrip: false,
    leading: <ReqoreTag size='tiny' intent='success' label='Healthy' />,
  },
};

export const Transparent: Story = {
  args: {
    label: 'Inventory Management · stock-sync',
    description: 'Operating normally — strip only, no tinted background',
    intent: 'info',
    transparent: true,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const NoWrap: Story = {
  args: {
    label: 'Payment Processing · stripe-webhook-receiver-fallback',
    description:
      'Avg duration 4.7s exceeded 3.5s threshold over the 14-period rolling baseline measured by the mad detector · just now',
    intent: 'danger',
    wrap: false,
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    label: 'Disabled row',
    description: 'No actions allowed',
    intent: 'warning',
    disabled: true,
    leading: <ReqoreTag size='tiny' intent='warning' label='Disabled' />,
    actions: [{ label: 'Investigate' }],
  },
};

export const Raised: Story = {
  args: {
    label: 'Raised severity row',
    description:
      'Subtle inset highlight on top + inset shadow on bottom — best paired with `flat={true}` (default).',
    intent: 'danger',
    raised: true,
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};
