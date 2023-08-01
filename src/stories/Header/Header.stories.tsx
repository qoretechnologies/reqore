import { StoryFn, StoryObj } from '@storybook/react';
import { ReqoreControlGroup, ReqoreHeading } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Heading/Stories',
  component: ReqoreHeading,
  argTypes: {
    ...IntentArg,
  },
} as StoryMeta<typeof ReqoreHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreHeading> = (args) => {
  return (
    <ReqoreControlGroup gapSize='big' vertical>
      <ReqoreHeading size={1} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={2} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={3} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={4} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={5} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={6} {...args}>
        This is a heading
      </ReqoreHeading>
      <ReqoreHeading size={1} {...args} tooltip={{ content: 'Nice tooltip', openOnMount: true }}>
        This is a heading with tooltip
      </ReqoreHeading>
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
};

export const Success: Story = {
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Danger: Story = {
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Warning: Story = {
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Info: Story = {
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Pending: Story = {
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Muted: Story = {
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  render: Template,

  args: {
    effect: {
      gradient: { colors: { 0: '#5e0acc', 100: '#c008c0' } },
      spaced: 4,
      weight: 'bold',
      uppercase: true,
    },
  },
};
