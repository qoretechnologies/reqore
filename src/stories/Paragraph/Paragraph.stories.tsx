import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreParagraphProps } from '../../components/Paragraph';
import { ReqoreParagraph, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Paragraph',
  component: ReqoreParagraph,
  argTypes: {
    ...IntentArg,
  },
  args: {
    tooltip: 'This is a tooltip',
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="success".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Danger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="danger".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="warning".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="info".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="pending".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Muted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Paragraph with a gradient/typography effect applied.',
      },
    },
  },
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
