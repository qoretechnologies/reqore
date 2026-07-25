import { StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSeverityRow, { IReqoreSeverityRowProps } from '../../components/SeverityRow';
import ReqoreTag from '../../components/Tag';
import { TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Severity Row',
  component: ReqoreSeverityRow,
} as StoryMeta<typeof ReqoreSeverityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in its default configuration.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a badge.',
      },
    },
  },
  args: {
    label: 'Payment Processing',
    description: 'Three open detector flags from the last summary cycle',
    intent: 'danger',
    badge: [3, { label: 'mad', intent: 'danger', minimal: true }],
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a border applied.',
      },
    },
  },
  args: {
    label: 'Bordered row',
    description: 'flat={false} renders an intent-coloured border',
    intent: 'warning',
    flat: false,
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in square (chip) mode — a fixed-size slot with no horizontal padding.',
      },
    },
  },
  args: {
    label: 'Square row',
    description: 'rounded={false} removes the corner radius',
    intent: 'info',
    rounded: false,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const WithEffects: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a set of visual effects applied to different items.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  args: {
    label: 'Customer Support · zendesk-ticket-sync',
    description: 'Avg duration scored 3.2 (threshold 3.0)',
    intent: 'warning',
    onClick: () => alert('Row clicked'),
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

export const NoStrip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow without the strip decoration.',
      },
    },
  },
  args: {
    label: 'Customer Onboarding · onboard-new-customer',
    description: 'No issues — operating within baseline',
    intent: 'success',
    showStrip: false,
    leading: <ReqoreTag size='tiny' intent='success' label='Healthy' />,
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a transparent background.',
      },
    },
  },
  args: {
    label: 'Inventory Management · stock-sync',
    description: 'Operating normally — strip only, no tinted background',
    intent: 'info',
    transparent: true,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const NoWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with content forced onto a single line.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in its disabled state.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with the raised effect.',
      },
    },
  },
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

const SEVERITY_ROW_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderSeverityRowMatrix = (variantArgs: Partial<IReqoreSeverityRowProps>) =>
  SEVERITY_ROW_SIZES.map((size) => (
    <ReqoreSeverityRow
      key={size}
      label={`size=${size}`}
      description='Threshold exceeded · just now'
      intent='danger'
      leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
      size={size}
      {...variantArgs}
    />
  ));

export const Unpadded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a custom padding size.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {SEVERITY_ROW_SIZES.map((size) => (
        <ReqoreSeverityRow
          key={size}
          label={`size=${size}, paddingSize='small'`}
          description='Padding scales independently from text scale'
          intent='danger'
          leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
