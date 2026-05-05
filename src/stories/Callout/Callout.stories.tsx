import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreCalloutProps, ReqoreCallout } from '../../components/Callout';
import ReqoreControlGroup from '../../components/ControlGroup';
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
    effect: {
      frost: true,
    },
  },
};
