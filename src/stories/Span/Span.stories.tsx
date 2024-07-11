import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreSpanProps, ReqoreSpan } from '../../components/Span';
import { ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Span/Stories',
  component: ReqoreSpan,
  argTypes: {
    ...IntentArg,
  },
} as StoryMeta<typeof ReqoreSpan>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreSpanProps> = (args) => {
  return (
    <>
      <ReqoreSpan size='tiny' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='small' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='normal' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='big' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='huge' {...args}>
        This is a span with some text
      </ReqoreSpan>
    </>
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
      textSize: '40px',
    },
  },
};
