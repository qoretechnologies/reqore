import { StoryFn, StoryObj } from '@storybook/react';
import ReqoreControlGroup from '../../components/ControlGroup';
import { IReqoreFeatureCardProps, ReqoreFeatureCard } from '../../components/FeatureCard';
import { TSizes } from '../../constants/sizes';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { ALL_SIZES, FlatArg, IntentArg, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreFeatureCardProps>();

const meta = {
  title: 'Display/Feature Card',
  component: ReqoreFeatureCard,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  args: {
    label: 'Getting started',
    description:
      'A focused summary card for onboarding steps, feature explanations, or product highlights.',
    marker: 'line',
  },
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...SizeArg,
    ...RadiusSizeArg,
    ...createArg('label', {
      type: 'string',
      name: 'Label',
      defaultValue: 'Getting started',
    }),
    ...createArg('description', {
      type: 'string',
      name: 'Description',
      defaultValue:
        'A focused summary card for onboarding steps, feature explanations, or product highlights.',
    }),
    ...createArg('marker', {
      control: 'select',
      options: ['line', 'number', 'none'],
      name: 'Marker',
      defaultValue: 'line',
    }),
    ...createArg('markerLabel', {
      type: 'string',
      name: 'Marker label',
      defaultValue: '01',
    }),
  },
} as StoryMeta<typeof ReqoreFeatureCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreFeatureCardProps> = (args) => (
  <div style={{ width: 760, maxWidth: '100%' }}>
    <ReqoreFeatureCard {...args} />
  </div>
);

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Numbered: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with items numbered.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Define the goal',
    description:
      'Capture the user need, current state, and desired outcome before choosing the next action.',
    marker: 'number',
    markerLabel: '01',
  },
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup wrap gapSize='normal'>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <div key={intent} style={{ width: 320 }}>
          <ReqoreFeatureCard
            {...args}
            intent={intent as IReqoreFeatureCardProps['intent']}
            label={`${intent} card`}
            description='Intent changes the marker color while preserving the card surface.'
            marker='line'
          />
        </div>
      ))}
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => {
    const sizes = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

    return (
      <ReqoreControlGroup wrap gapSize='normal'>
        {sizes.map((size) => (
          <div key={size} style={{ width: 320 }}>
            <ReqoreFeatureCard
              {...args}
              size={size}
              label={`${size} card`}
              description='The card adapts padding, label, marker, and description sizing.'
              marker='line'
            />
          </div>
        ))}
      </ReqoreControlGroup>
    );
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in its flat variant.',
      },
    },
  },
  render: Template,
  args: {
    flat: true,
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: (args) => <ReqoreFeatureCard {...args} fluid />,
};

export const FrostedLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a frosted-effect label.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Glass label treatment',
    description: 'Frosted text effect can be used on card labels through regular effect props.',
    marker: 'line',
    labelEffect: {
      frost: true,
    },
  },
};

export const Bordered: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a border applied.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Bordered card',
    description: 'flat={false} renders an intent-coloured border around the card.',
    intent: 'info',
    flat: false,
  },
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in square (chip) mode — a fixed-size slot with no horizontal padding.',
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
          'Renders FeatureCard with a transparent background.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Transparent surface',
    description: 'transparent={true} drops the tinted background, leaving the border + marker.',
    intent: 'warning',
    transparent: true,
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Clickable card',
    description: 'Provide onClick (or interactive) to enable hover/lift behaviour.',
    onClick: () => alert('Card clicked'),
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in its disabled state.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Disabled card',
    description: 'Disabled cards dim and do not respond to hover or click.',
    disabled: true,
    onClick: () => {
      // no-op while disabled
    },
  },
};

export const Tooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a tooltip attached.',
      },
    },
  },
  render: Template,
  args: {
    label: 'With tooltip',
    description: 'Hover the card to see a contextual tooltip.',
    tooltip: 'Cards expose the same tooltip prop as every other Reqore component.',
  },
};

export const Fixed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard in a fixed-position layout.',
      },
    },
  },
  render: (args) => <ReqoreFeatureCard {...args} fixed />,
  args: {
    label: 'Fixed width card',
    description: 'fixed={true} prevents the card from stretching.',
  },
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a badge.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Just shipped',
    description: 'Badges render to the right of the label using the standard TReqoreBadge type.',
    badge: { label: 'New', intent: 'success' },
    intent: 'success',
  },
};

export const WithMultipleBadges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with multiple badges.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Pricing tier',
    description: 'Pass an array of badges to surface several pieces of metadata at once.',
    badge: [
      { label: 'v2', minimal: true },
      { label: 'beta', intent: 'warning', minimal: true },
    ],
  },
};

export const NoWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with content forced onto a single line.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <ReqoreFeatureCard {...args} />
    </div>
  ),
  args: {
    label: 'Process incoming order with strict SKU validation',
    description:
      'Routes Shopify orders into the warehouse pipeline and validates each line against the master catalog before fulfilment.',
    wrap: false,
  },
};

export const WithEffects: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a set of visual effects applied to different items.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Effects everywhere',
    description: 'Background gradient, label uppercase, italic description.',
    intent: 'info',
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to right',
      },
    },
    labelEffect: { weight: 'bold', uppercase: true, spaced: 1 },
    descriptionEffect: { italic: true },
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a custom theme override applied.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Branded card',
    description: 'customTheme overrides the surface colour while keeping the same primitives.',
    customTheme: { main: '#1a1142' },
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with the raised effect.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Raised card',
    description:
      'Inset top highlight + bottom shadow. Pairs with `flat={true}` to add depth without a hard border.',
    intent: 'info',
    flat: true,
    raised: true,
  },
};

const FEATURE_CARD_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderFeatureCardMatrix = (variantArgs: Partial<IReqoreFeatureCardProps>) =>
  FEATURE_CARD_SIZES.map((size) => (
    <ReqoreFeatureCard
      key={size}
      label={`size=${size}`}
      description='Spotlight a feature with a marker, label and description.'
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
          'Renders FeatureCard with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderFeatureCardMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderFeatureCardMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderFeatureCardMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {ALL_SIZES.map((radiusSize) => (
        <ReqoreFeatureCard
          key={radiusSize}
          icon='StarLine'
          marker='icon'
          size='normal'
          radiusSize={radiusSize}
          label={`radiusSize="${radiusSize}"`}
          description='radiusSize decouples corner roundness from the size prop.'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const MultipleGradients: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with layered gradient effects.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Layered gradients',
    description:
      'effect.gradient accepts an array — each entry is stacked as a CSS background-image layer in order.',
    radiusSize: 'huge',
    effect: {
      gradient: [
        {
          type: 'radial',
          shape: 'ellipse',
          direction: 'at 0% 0%',
          colors: {
            0: '#0066ff:darken:1:0.6',
            60: '#0066ff:darken:1:0',
            100: '#0066ff:darken:1:0',
          },
        },
        {
          type: 'radial',
          shape: 'ellipse',
          direction: 'at 100% 100%',
          colors: {
            0: '#ff3da6:darken:1:0.55',
            60: '#ff3da6:darken:1:0',
            100: '#ff3da6:darken:1:0',
          },
        },
        {
          type: 'linear',
          direction: '180deg',
          colors: { 0: '#15151c', 100: '#0b0b10' },
        },
      ],
    },
  },
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders FeatureCard with a custom padding size.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {FEATURE_CARD_SIZES.map((size) => (
        <ReqoreFeatureCard
          key={size}
          label={`size=${size}, paddingSize='small'`}
          description='Padding scales independently from text scale'
          intent='info'
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};
