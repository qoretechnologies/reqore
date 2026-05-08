import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreCalloutProps, ReqoreCallout } from '../../components/Callout';
import ReqoreControlGroup from '../../components/ControlGroup';
import { TSizes } from '../../constants/sizes';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreCalloutProps>();

const meta = {
  title: 'Display/Callout/Stories',
  component: ReqoreCallout,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  args: {
    children: 'No records match the current filters.',
  },
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...SizeArg,
    ...createArg('children', {
      type: 'string',
      name: 'Content',
      defaultValue: 'No records match the current filters.',
    }),
    ...createArg('accentPosition', {
      control: 'select',
      options: ['left', 'top'],
      name: 'Accent position',
      defaultValue: 'left',
    }),
    ...createArg('accentSize', {
      type: 'number',
      name: 'Accent size',
      defaultValue: 5,
    }),
    ...createArg('contentEffect', {
      name: 'Content effect',
    }),
  },
} as StoryMeta<typeof ReqoreCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreCalloutProps> = (args) => (
  <div style={{ width: 1160, maxWidth: '100%' }}>
    <ReqoreCallout {...args} />
  </div>
);

export const Default: Story = {
  render: Template,
};

export const TopAccent: Story = {
  render: Template,
  args: {
    accentPosition: 'top',
    children: 'Review the configuration before continuing.',
  },
};

export const Flat: Story = {
  render: Template,
  args: {
    flat: true,
  },
};

export const Fluid: Story = {
  render: (args) => <ReqoreCallout {...args} fluid />,
};

export const Intents: Story = {
  render: (args) => (
    <ReqoreControlGroup vertical fluid gapSize='normal'>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <ReqoreCallout
          key={intent}
          {...args}
          intent={intent as IReqoreCalloutProps['intent']}
          fluid
        >
          {intent} callout accent
        </ReqoreCallout>
      ))}
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup vertical fluid gapSize='normal'>
        {sizes.map((size) => (
          <ReqoreCallout key={size} {...args} size={size} fluid>
            {size} callout
          </ReqoreCallout>
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Frosted: Story = {
  render: Template,
  args: {
    children: 'Important context can use the frosted text effect.',
    contentEffect: {
      frost: true,
    },
  },
};

export const BackgroundEffect: Story = {
  render: Template,
  args: {
    children: 'Container effects apply to the callout surface.',
    effect: {
      gradient: {
        colors: {
          0: 'info:darken:2',
          100: 'success:darken:2',
        },
        borderColor: 'info',
      },
    },
  },
};

export const ContentEffect: Story = {
  render: Template,
  args: {
    children: 'Content effects apply only to the callout text.',
    contentEffect: {
      frost: true,
      uppercase: true,
      spaced: 1,
    },
  },
};

export const WithLabel: Story = {
  render: Template,
  args: {
    label: 'Configuration required',
    description:
      'Set up your AI provider before publishing this Qog. The build will succeed but runs will fail at execution time.',
    intent: 'warning',
  },
};

export const WithIcon: Story = {
  render: Template,
  args: {
    label: 'Heads up',
    description: 'Icons inherit the intent colour automatically.',
    icon: 'InformationLine',
    intent: 'info',
  },
};

export const WithBadge: Story = {
  render: Template,
  args: {
    label: 'New release available',
    description: 'A new version of the platform is ready to install.',
    icon: 'AlertLine',
    intent: 'info',
    badge: { label: 'v7.2', intent: 'info' },
  },
};

export const WithMultipleBadges: Story = {
  render: Template,
  args: {
    label: 'Pending approvals',
    description: 'Three workflows are waiting for review across two business areas.',
    icon: 'TimeLine',
    intent: 'pending',
    badge: [3, { label: 'high priority', intent: 'danger' }],
  },
};

export const Closable: Story = {
  render: Template,
  args: {
    label: 'Cookie notice',
    description: 'We use cookies to improve your experience. Dismiss to acknowledge.',
    icon: 'InformationLine',
    intent: 'info',
    onClose: () => alert('Closed'),
  },
};

export const Bordered: Story = {
  render: Template,
  args: {
    label: 'Bordered callout',
    description: 'flat={false} renders an intent-coloured border in addition to the accent.',
    icon: 'InformationLine',
    intent: 'info',
    flat: false,
  },
};

export const Square: Story = {
  render: Template,
  args: {
    label: 'Square corners',
    description: 'rounded={false} removes the corner radius.',
    rounded: false,
  },
};

export const Transparent: Story = {
  render: Template,
  args: {
    label: 'Transparent surface',
    description: 'transparent={true} drops the surface colour, leaving the accent strip visible.',
    icon: 'InformationLine',
    intent: 'info',
    transparent: true,
  },
};

export const Clickable: Story = {
  render: Template,
  args: {
    label: 'Whole-callout click',
    description: 'Provide onClick (or interactive) to enable hover/lift behaviour.',
    icon: 'CursorLine',
    intent: 'info',
    onClick: () => alert('Callout clicked'),
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    label: 'Disabled callout',
    description: 'Disabled callouts dim and do not respond to hover or click.',
    icon: 'CloseCircleLine',
    disabled: true,
  },
};

export const Tooltip: Story = {
  render: Template,
  args: {
    children: 'Hover me to see a tooltip.',
    tooltip: 'Callouts expose the same tooltip prop as every other Reqore component.',
  },
};

export const Fixed: Story = {
  render: (args) => <ReqoreCallout {...args} fixed />,
  args: {
    label: 'Fixed width callout',
    description: 'fixed={true} prevents the callout from stretching.',
    icon: 'InformationLine',
    intent: 'info',
  },
};

export const CustomTheme: Story = {
  render: Template,
  args: {
    label: 'Branded callout',
    description: 'customTheme overrides the surface colour while keeping the accent strip.',
    icon: 'InformationLine',
    customTheme: { main: '#1a1142' },
  },
};

export const FullyComposed: Story = {
  render: Template,
  args: {
    label: 'New deploy ready · staging',
    description:
      'Promotion to production is gated on the staging smoke tests; pass them then click Promote.',
    icon: 'RocketLine',
    intent: 'success',
    badge: { label: 'v7.2', intent: 'success' },
    onClose: () => alert('Dismissed'),
    accentSize: 4,
  },
};

export const Raised: Story = {
  render: Template,
  args: {
    label: 'Raised callout',
    description: 'Pairs the accent strip with a subtle inset highlight for a tactile surface.',
    icon: 'InformationLine',
    intent: 'info',
    flat: true,
    raised: true,
  },
};

const CALLOUT_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderCalloutMatrix = (variantArgs: Partial<IReqoreCalloutProps>) =>
  CALLOUT_SIZES.map((size) => (
    <ReqoreCallout
      key={size}
      label={`size=${size}`}
      description='No records match the current filters.'
      icon='InformationLine'
      intent='info'
      size={size}
      {...variantArgs}
    />
  ));

export const Unpadded: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {CALLOUT_SIZES.map((size) => (
        <ReqoreCallout
          key={size}
          label={`size=${size}, paddingSize='small'`}
          description='Padding scales independently from text scale'
          icon='InformationLine'
          intent='info'
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
