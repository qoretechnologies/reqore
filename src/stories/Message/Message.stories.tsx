import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreMessage, { IReqoreMessageProps } from '../../components/Message';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreMessageProps>();

const meta = {
  title: 'Other/Message',
  component: ReqoreMessage,
  argTypes: {
    ...SizeArg,
    ...FlatArg,
    ...IntentArg,
    ...createArg('title', {
      defaultValue: 'This is a test',
      name: 'Message Header',
      type: 'string',
      description: 'The title of the message',
    }),
    ...createArg('minimal', {
      defaultValue: false,
      name: 'Minimal',
      description: 'If the message should be minimal',
      type: 'boolean',
    }),
  },
  args: {
    title: 'This is a test',
    minimal: false,
  },
} as StoryMeta<typeof ReqoreMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreMessageProps> = (args: IReqoreMessageProps) => {
  return (
    <>
      <ReqoreMessage {...args} onClick={noop}>
        {args.children ||
          'In to am attended desirous raptures declared diverted confined at. Collected instantly remaining up certainly to necessary as. Over walk dull into son boy door went new. At or happiness commanded daughters as. Is handsome an declared at received in extended vicinity subjects. Into miss on he over been late pain an. Only week bore boy what fat case left use. Match round scale now sex style far times. Your me past an much.'}
      </ReqoreMessage>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message in its default configuration.',
      },
    },
  },
  render: Template,
};

export const NoTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message without a title.',
      },
    },
  },
  render: Template,
  args: {
    icon: 'InformationFill',
    flat: true,
    title: undefined,
    children: 'This is a test',
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message in its flat variant.',
      },
    },
  },
  render: Template,

  args: {
    flat: true,
    intent: 'success',
  },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    intent: 'danger',
    size: 'small',
  },
};

export const WithIconColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with a custom icon color.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    intent: 'success',
    iconColor: '#00fd9f',
  },
};

export const NonOpaque: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with a non-opaque background.',
      },
    },
  },
  render: Template,

  args: {
    opaque: false,
    intent: 'info',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with intent="pending".',
      },
    },
  },
  render: Template,

  args: {
    opaque: true,
    intent: 'pending',
  },
};

export const Muted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    opaque: true,
    intent: 'muted',
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with a custom theme override applied.',
      },
    },
  },
  render: Template,

  args: {
    customTheme: {
      main: '#6e1295',
    },
  },
};

export const WithMargin: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with margin applied.',
      },
    },
  },
  render: () => (
    <>
      <ReqoreMessage margin='both' title='Bottom & top margin'>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into son boy door went new. At or
        happiness commanded daughters as.
      </ReqoreMessage>
      <ReqoreMessage margin='top' title='Top margin'>
        In to am attended desirous raptures declared diverted confined at.
      </ReqoreMessage>
      <ReqoreMessage margin='bottom' size='big' title='Bottom margin'>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into son boy door went new. At or
        happiness commanded daughters as.
      </ReqoreMessage>
      <ReqoreMessage margin='bottom' size='small' title='Bottom small margin'>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into son boy door went new. At or
        happiness commanded daughters as.
      </ReqoreMessage>
    </>
  ),
};

export const Effect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        colors: {
          0: '#eb0e8c',
          100: 'danger:darken:2',
        },
      },
    },
  },
};

export const WithBackgroundBlur: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with a blurred background.',
      },
    },
  },
  render: (args) => (
    <>
      <ReqoreMessage {...args}>
        In to am attended desirous raptures declared diverted confined at. Collected instantly
        remaining up certainly to necessary as. Over walk dull into son boy door went new. At or
        happiness commanded daughters as.
      </ReqoreMessage>
    </>
  ),

  args: {
    backgroundBlur: 10,
    intent: 'info',
    opaque: false,
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Message with the raised effect.',
      },
    },
  },
  args: {
    title: 'Raised message',
    children: 'Subtle inset highlight on top + inset shadow on bottom for a tactile surface.',
    intent: 'info',
    flat: true,
    raised: true,
  },
};
