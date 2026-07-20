import { StoryFn, StoryObj } from '@storybook/react';
import { ReqoreBubble, ReqoreBubbleGroup, IReqoreBubbleProps } from '../../components/Bubble';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, MinimalArg, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreBubbleProps>();

const meta = {
  title: 'Other/Bubble',
  component: ReqoreBubble,
  argTypes: {
    ...SizeArg,
    ...FlatArg,
    ...MinimalArg,
    ...IntentArg,
    ...RadiusSizeArg,
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

export const WithHeader: Story = {
  render: Template,
  args: {
    label: 'Ada Lovelace',
    timestamp: '2h ago',
    flat: false,
    minimal: true,
    // wash the body a step below the bold label — `contentEffect` hits only the
    // children, so the label stays at full strength.
    contentEffect: { opacity: 0.72 },
    children: 'Adept programmer of the Analytical Engine, author of the first algorithm.',
  },
};

export const WithAvatar: Story = {
  render: Template,
  args: {
    avatar: { icon: 'User3Line' },
    label: 'Ada Lovelace',
    timestamp: '2h ago',
    flat: false,
    minimal: true,
    contentEffect: { opacity: 0.72 },
    children: 'Adept programmer of the Analytical Engine, author of the first algorithm.',
  },
};

/**
 * `avatar.circle` swaps the default squircle for a circle — conventional for a
 * person, where the squircle reads as an app tile. The image is clipped to the
 * new shape, so a photo works as well as a glyph.
 */
export const WithCircleAvatar: Story = {
  render: Template,
  args: {
    avatar: { icon: 'User3Line', circle: true },
    label: 'Ada Lovelace',
    timestamp: '2h ago',
    flat: false,
    minimal: true,
    contentEffect: { opacity: 0.72 },
    children: 'Adept programmer of the Analytical Engine, author of the first algorithm.',
  },
};

/**
 * A comment feed: an avatar + a bordered, accent-tinted card per message, each side
 * hugging its own edge. `customTheme` tints the border, the fill and the avatar
 * together, so the pair reads as one object under any app's theme. All three bubbles
 * carry a `timestamp`, but the two right-side ones form a run — so only the last of
 * them prints a time. `contentEffect={{ opacity }}` washes each body a step below its
 * bold label (the label sits outside `contentEffect`, so it stays bright).
 */
export const AvatarFeed: Story = {
  render: () => (
    <ReqoreBubbleGroup>
      <ReqoreBubble
        align='left'
        avatar={{ icon: 'User3Line' }}
        label='ops@acme.io'
        timestamp='2h ago'
        contentEffect={{ opacity: 0.72 }}
        customTheme={{ main: '#3b2d63' }}
        maxWidth='76%'
        flat={false}
        minimal
      >
        Our nightly transfer times out after ~30s since the 3.2 upgrade.
      </ReqoreBubble>
      <ReqoreBubble
        align='right'
        avatar={{ icon: 'CustomerService2Line' }}
        label='Support'
        timestamp='1h ago'
        contentEffect={{ opacity: 0.72 }}
        customTheme={{ main: '#3b2d63' }}
        maxWidth='76%'
        flat={false}
        minimal
      >
        Reproduced — a fix is in review. Can you confirm the pool size?
      </ReqoreBubble>
      <ReqoreBubble
        align='right'
        avatar={{ icon: 'EyeOffLine' }}
        label='Internal note'
        timestamp='35m ago'
        contentEffect={{ opacity: 0.72 }}
        intent='warning'
        maxWidth='76%'
        flat={false}
        minimal
      >
        The pool default dropped from 4 to 1 in the 3.2 migration.
      </ReqoreBubble>
    </ReqoreBubbleGroup>
  ),
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
