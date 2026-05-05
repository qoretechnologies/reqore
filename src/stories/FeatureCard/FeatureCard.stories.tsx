import { StoryFn, StoryObj } from '@storybook/react';
import { ReqoreFeatureCard, IReqoreFeatureCardProps } from '../../components/FeatureCard';
import ReqoreControlGroup from '../../components/ControlGroup';
import { DEFAULT_INTENTS } from '../../constants/theme';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreFeatureCardProps>();

const meta = {
  title: 'Display/FeatureCard/Stories',
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
  render: Template,
};

export const Numbered: Story = {
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
  render: Template,
  args: {
    flat: true,
  },
};

export const Fluid: Story = {
  render: (args) => <ReqoreFeatureCard {...args} fluid />,
};

export const FrostedLabel: Story = {
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
