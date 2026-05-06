import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreEntityRow from '../../components/EntityRow';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Entity Row/Stories',
  component: ReqoreEntityRow,
} as StoryMeta<typeof ReqoreEntityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    label: 'Process Incoming Order',
    description: 'Routes incoming Shopify orders into the warehouse pipeline',
    metadata: 'Last run: success · just now · 384ms',
    icon: 'PlayCircleLine',
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
};

export const WithBadge: Story = {
  args: {
    label: 'Reconcile Payments',
    description: 'Daily reconciliation between Stripe and the ledger',
    metadata: 'Last run: failed · 1.5s',
    icon: 'ErrorWarningLine',
    intent: 'danger',
    badge: { label: 'Failed', intent: 'danger' },
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

export const WithMultipleBadges: Story = {
  args: {
    label: 'Process Incoming Order',
    description: 'Routes incoming Shopify orders into the warehouse pipeline',
    metadata: 'Last run: success · just now',
    icon: 'PlayCircleLine',
    intent: 'success',
    badge: [
      { label: 'v2', minimal: true },
      { label: 'on-demand', intent: 'info', minimal: true },
    ],
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
};

export const WithIntents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreEntityRow
        {...args}
        label='Process Incoming Order'
        description='Routes Shopify orders to warehouse'
        metadata='Last run: success · just now'
        icon='CheckLine'
        intent='success'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
      <ReqoreEntityRow
        {...args}
        label='Reconcile Payments'
        description='Daily reconciliation between Stripe and the ledger'
        metadata='Last run: failed · 1.5s'
        icon='ErrorWarningLine'
        intent='danger'
        badge={{ label: 'Failed', intent: 'danger' }}
        actions={[{ label: 'Investigate', intent: 'danger' }]}
      />
      <ReqoreEntityRow
        {...args}
        label='Onboard New Customer'
        description='Creates downstream accounts and welcome email'
        metadata='Last run: success · 2 hours ago'
        icon='UserAddLine'
        intent='info'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
    </ReqoreControlGroup>
  ),
};

export const WithImage: Story = {
  args: {
    label: 'Stripe payment integration',
    description: 'OAuth2 connected · Last sync 5 minutes ago',
    iconImage: 'https://stripe.com/img/v3/home/social.png',
    actions: [{ label: 'Manage' }],
  },
};

export const WithoutIcon: Story = {
  args: {
    label: 'Plain row, no icon tile',
    description: 'Useful for very compact lists where the entity speaks for itself',
    metadata: 'just now',
    actions: [{ icon: 'ArrowRightSLine', minimal: true, flat: true }],
  },
};

export const Sizes: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {(['tiny', 'small', 'normal', 'big'] as const).map((size) => (
        <ReqoreEntityRow
          key={size}
          size={size}
          label={`${size[0].toUpperCase()}${size.slice(1)} entity row`}
          description='Description scales with size'
          metadata='Metadata scales too'
          icon='SettingsLine'
          intent='info'
          actions={[{ label: 'Open' }]}
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  args: {
    label: 'Bordered entity row',
    description: 'flat={false} renders an intent-coloured border',
    metadata: 'just now',
    icon: 'SettingsLine',
    intent: 'info',
    flat: false,
  },
};

export const Square: Story = {
  args: {
    label: 'Square entity row',
    description: 'rounded={false} removes the corner radius',
    metadata: 'just now',
    icon: 'SettingsLine',
    intent: 'success',
    rounded: false,
  },
};

export const WithEffects: Story = {
  args: {
    label: 'Effects on label, description, metadata',
    description: 'Description with custom italic effect',
    metadata: 'Metadata with custom uppercase effect',
    icon: 'SparklingLine',
    intent: 'info',
    labelEffect: { weight: 'bold', uppercase: true, spaced: 1 },
    descriptionEffect: { italic: true, opacity: 0.8 },
    metadataEffect: { uppercase: true, spaced: 2, opacity: 0.6 },
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to right',
      },
    },
  },
};

export const Clickable: Story = {
  args: {
    label: 'Inventory Reorder Trigger',
    description: 'Watches stock thresholds and fires reorder workflows',
    metadata: 'Last run: success · 16 hours ago',
    icon: 'StackLine',
    onClick: () => alert('Row clicked'),
    actions: [{ icon: 'ArrowRightSLine', minimal: true, flat: true }],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Archived integration',
    description: 'This automation has been archived',
    icon: 'ArchiveLine',
    disabled: true,
    actions: [{ label: 'Restore' }],
  },
};

export const NoWrap: Story = {
  args: {
    label: 'Process Incoming Order',
    description:
      'Routes incoming Shopify orders into the warehouse pipeline with full validation against the SKU registry',
    metadata: 'Last run: success · just now · 384ms · attempt 1 of 3',
    icon: 'PlayCircleLine',
    intent: 'success',
    wrap: false,
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export const Transparent: Story = {
  args: {
    label: 'Transparent entity row',
    description: 'Even with intent set, the background stays transparent',
    icon: 'SettingsLine',
    intent: 'info',
    transparent: true,
    actions: [{ label: 'Open' }],
  },
};
