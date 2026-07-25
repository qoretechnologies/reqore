import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreSpanProps, ReqoreSpan } from '../../components/Span';
import { ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Span',
  component: ReqoreSpan,
  argTypes: {
    ...IntentArg,
  },
  args: {
    tooltip: 'This is a tooltip',
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span in its default configuration.',
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
          'Renders Span with intent="success".',
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
          'Renders Span with intent="danger".',
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
          'Renders Span with intent="warning".',
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
          'Renders Span with intent="info".',
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
          'Renders Span with intent="pending".',
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
          'Renders Span with intent="muted".',
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
          'Renders Span with a gradient/typography effect applied.',
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
