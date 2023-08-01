import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreParagraphProps } from '../../components/Paragraph';
import { ReqoreParagraph, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Paragraph/Stories',
  component: ReqoreParagraph,
  argTypes: {
    ...IntentArg,
  },
} as StoryMeta<typeof ReqoreParagraph>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreParagraphProps> = (args) => {
  return (
    <>
      <ReqoreParagraph size='tiny' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='small' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='normal' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='big' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreParagraph size='huge' {...args}>
        This is a paragraph of some text
      </ReqoreParagraph>
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
