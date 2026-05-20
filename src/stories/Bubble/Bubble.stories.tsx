import { StoryFn, StoryObj } from '@storybook/react';
import { ReqoreBubble, ReqoreBubbleGroup, IReqoreBubbleProps } from '../../components/Bubble';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, MinimalArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreBubbleProps>();

const meta = {
  title: 'Other/Bubble/Stories',
  component: ReqoreBubble,
  argTypes: {
    ...SizeArg,
    ...FlatArg,
    ...MinimalArg,
    ...IntentArg,
    ...createArg('align', {
      defaultValue: 'left',
      name: 'Align',
      description: 'Side the bubble hugs within its container',
      type: 'string',
    }),
    ...createArg('maxWidth', {
      defaultValue: '85%',
      name: 'Max width',
      description: 'Upper bound on the bubble width',
      type: 'string',
    }),
    ...createArg('rounded', {
      defaultValue: true,
      name: 'Rounded',
      description: 'Whether the bubble has rounded corners',
      type: 'boolean',
    }),
    ...createArg('raised', {
      defaultValue: false,
      name: 'Raised',
      description: 'Subtle 3D inset highlight + shadow (flat, non-intent bubbles only)',
      type: 'boolean',
    }),
  },
  args: {
    align: 'left',
    maxWidth: '85%',
    rounded: true,
    raised: false,
  },
} as StoryMeta<typeof ReqoreBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreBubbleProps> = (args: IReqoreBubbleProps) => (
  <ReqoreBubble {...args}>
    {args.children ?? 'Hello — this is a chat bubble. It sizes to its own content.'}
  </ReqoreBubble>
);

export const Basic: Story = {
  render: Template,
};

export const Minimal: Story = {
  render: Template,
  args: {
    minimal: true,
  },
};

export const WithBorder: Story = {
  render: Template,
  args: {
    flat: false,
  },
};

export const Raised: Story = {
  render: Template,
  args: {
    raised: true,
  },
};

export const Intent: Story = {
  render: Template,
  args: {
    intent: 'info',
    align: 'right',
  },
};

export const WithGradient: Story = {
  render: Template,
  args: {
    align: 'right',
    effect: {
      gradient: { colors: { 0: '#7b68ee', 100: '#c008c0' }, direction: 'to right' },
      color: '#ffffff',
    },
  },
};

export const WithContentEffect: Story = {
  render: Template,
  args: {
    contentEffect: {
      gradient: { colors: { 0: '#5e0acc', 100: '#c008c0' }, direction: 'to right' },
      weight: 'bold',
    },
  },
};

export const WithTimestamp: Story = {
  render: Template,
  args: {
    timestamp: '10:45 AM',
  },
};

export const Clickable: Story = {
  render: Template,
  args: {
    onClick: () => alert('Bubble clicked'),
    children: 'Click me — interactive bubbles get hover feedback.',
  },
};

export const Group: Story = {
  render: () => (
    <ReqoreBubbleGroup>
      <ReqoreBubble align='left' minimal timestamp='10:40 AM'>
        Hi! How can I help you today?
      </ReqoreBubble>
      <ReqoreBubble
        align='right'
        effect={{
          gradient: { colors: { 0: '#7b68ee', 100: '#5a48c4' }, direction: 'to bottom right' },
          color: '#ffffff',
        }}
      >
        I want to automate my lead sync.
      </ReqoreBubble>
      <ReqoreBubble
        align='right'
        effect={{
          gradient: { colors: { 0: '#7b68ee', 100: '#5a48c4' }, direction: 'to bottom right' },
          color: '#ffffff',
        }}
        timestamp='10:41 AM'
      >
        Salesforce to our ERP, ideally hourly.
      </ReqoreBubble>
      <ReqoreBubble align='left' minimal>
        Got it — connectors on both ends.
      </ReqoreBubble>
      <ReqoreBubble align='left' minimal timestamp='10:42 AM'>
        I can wire that up. Want a dry run first?
      </ReqoreBubble>
    </ReqoreBubbleGroup>
  ),
};
