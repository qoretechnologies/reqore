import { StoryFn, StoryObj } from '@storybook/react';
import { ReqoreControlGroup, ReqoreHeading } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Heading',
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Heading in its default configuration.',
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
          'Renders Heading with intent="success".',
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
          'Renders Heading with intent="danger".',
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
          'Renders Heading with intent="warning".',
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
          'Renders Heading with intent="info".',
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
          'Renders Heading with intent="pending".',
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
          'Renders Heading with intent="muted".',
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
          'Renders Heading with a gradient/typography effect applied.',
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
    },
  },
};
