import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreCalloutProps, ReqoreCallout } from '../../components/Callout';
import ReqoreButton from '../../components/Button';
import ReqoreControlGroup from '../../components/ControlGroup';
import { TSizes } from '../../constants/sizes';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { ALL_SIZES, FlatArg, IntentArg, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreCalloutProps>();

const meta = {
  title: 'Display/Callout',
  component: ReqoreCallout,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...SizeArg,
    ...RadiusSizeArg,
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
      description: "Pixels, or a TSizes name ('normal' = the 5px default)",
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in its default configuration.',
      },
    },
  },
  render: Template,
  args: {
    children: 'No records match the current filters.',
  },
};

export const TopAccent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a top accent line.',
      },
    },
  },
  render: Template,
  args: {
    accentPosition: 'top',
    children: 'Review the configuration before continuing.',
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in its flat variant.',
      },
    },
  },
  render: Template,
  args: {
    children: 'No records match the current filters.',
    flat: true,
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: (args) => <ReqoreCallout {...args} fluid />,
  args: {
    children: 'No records match the current filters.',
  },
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with the frosted (translucent + blur) effect.',
      },
    },
  },
  render: Template,
  args: {
    children: 'Important context can use the frosted text effect.',
    contentEffect: {
      frost: true,
    },
  },
};

export const BackgroundEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a background effect.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a visual effect on the content.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a label.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Configuration required',
    description:
      'Set up your AI provider before publishing this Qog. The build will succeed but runs will fail at execution time.',
    intent: 'warning',
  },
};

export const WithLabelAndRichBody: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a label and a body given as children rather than a ' +
          '`description`. The description is a paragraph and takes text; children go in ' +
          'the content block, so a body that carries its own blocks — a button row, a ' +
          'list — renders under the label without invalid markup.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Build with Qonsole',
    icon: 'Robot2Line',
    intent: 'info',
    children: (
      <>
        Prefer natural language? Open Qonsole and describe what you need — it can build and
        edit this service for you, step by step.
        <ReqoreControlGroup style={{ marginTop: '10px' }}>
          <ReqoreButton icon='Robot2Line' intent='info' fixed>
            Create with Qonsole
          </ReqoreButton>
          <ReqoreButton icon='BookOpenLine' fixed>
            Read the guide
          </ReqoreButton>
        </ReqoreControlGroup>
      </>
    ),
  },
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with an icon.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Heads up',
    description: 'Icons inherit the intent colour automatically.',
    icon: 'InformationLine',
    intent: 'info',
  },
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a badge.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with multiple badges.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in a closable mode.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a border applied.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in square (chip) mode — a fixed-size slot with no horizontal padding.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Square corners',
    description: 'rounded={false} removes the corner radius.',
    rounded: false,
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a transparent background.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in a clickable variant so hover and press states are exercised.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in its disabled state.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Disabled callout',
    description: 'Disabled callouts dim and do not respond to hover or click.',
    icon: 'CloseCircleLine',
    disabled: true,
  },
};

export const Tooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a tooltip attached.',
      },
    },
  },
  render: Template,
  args: {
    children: 'Hover me to see a tooltip.',
    tooltip: 'Callouts expose the same tooltip prop as every other Reqore component.',
  },
};

export const Fixed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in a fixed-position layout.',
      },
    },
  },
  render: (args) => <ReqoreCallout {...args} fixed />,
  args: {
    label: 'Fixed width callout',
    description: 'fixed={true} prevents the callout from stretching.',
    icon: 'InformationLine',
    intent: 'info',
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a custom theme override applied.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Branded callout',
    description: 'customTheme overrides the surface colour while keeping the accent strip.',
    icon: 'InformationLine',
    customTheme: { main: '#1a1142' },
  },
};

export const FullyComposed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout in a fully composed configuration.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with the raised effect.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderCalloutMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout with a custom padding size.',
      },
    },
  },
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

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Callout at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {ALL_SIZES.map((radiusSize) => (
        <ReqoreCallout
          key={radiusSize}
          label={`radiusSize="${radiusSize}"`}
          description='radiusSize lets the callout corner roundness scale independently from its size prop.'
          icon='InformationLine'
          intent='info'
          radiusSize={radiusSize}
          size='normal'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
