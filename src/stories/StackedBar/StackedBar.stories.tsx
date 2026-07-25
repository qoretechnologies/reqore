import { StoryFn, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';
import ReqoreStackedBar, {
  IReqoreStackedBarItem,
  IReqoreStackedBarProps,
} from '../../components/StackedBar';
import { ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/StackedBar',
  component: ReqoreStackedBar,
} as StoryMeta<typeof ReqoreStackedBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUS_ITEMS: IReqoreStackedBarItem[] = [
  { id: 'complete', label: 'Complete', value: 124, intent: 'success' },
  { id: 'error', label: 'Error', value: 18, intent: 'danger' },
  { id: 'in-progress', label: 'In-progress', value: 32, intent: 'info' },
  { id: 'waiting', label: 'Waiting', value: 9, intent: 'warning' },
];

const Template: StoryFn<IReqoreStackedBarProps> = (args) => (
  <ReqoreControlGroup vertical gapSize='big' style={{ width: '420px' }}>
    <ReqoreStackedBar {...args} />
  </ReqoreControlGroup>
);

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar in its default configuration.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    items: STATUS_ITEMS,
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '420px' }}>
      <ReqoreStackedBar {...args} size='tiny' />
      <ReqoreStackedBar {...args} size='small' />
      <ReqoreStackedBar {...args} size='normal' />
      <ReqoreStackedBar {...args} size='big' />
      <ReqoreStackedBar {...args} size='huge' />
    </ReqoreControlGroup>
  ),
  args: { fluid: true, items: STATUS_ITEMS },
};

export const WithValues: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with values applied.',
      },
    },
  },
  render: Template,
  args: { fluid: true, showValues: true, items: STATUS_ITEMS },
};

/** `showLabels` stacks each segment's label under its value, in a smaller
 *  uppercase, letter-spaced style — the bar grows taller to fit both lines. */
export const WithLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with labels applied.',
      },
    },
  },
  render: Template,
  args: { fluid: true, showValues: true, showLabels: true, items: STATUS_ITEMS },
};

/** `flat={false}` draws a border around the track. */
export const WithBorder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a border applied.',
      },
    },
  },
  render: Template,
  args: { fluid: true, flat: false, showValues: true, items: STATUS_ITEMS },
};

/** `raised` adds the subtle inset 3D treatment (top highlight + bottom
 *  shadow) shared with Panel, Bubble, and friends. */
export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with the raised effect.',
      },
    },
  },
  render: Template,
  args: { fluid: true, raised: true, showValues: true, items: STATUS_ITEMS },
};

/** The standard `effect` prop works as it does on every Reqore surface —
 *  here a glow. */
export const WithGlow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a glow effect applied.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    showValues: true,
    effect: { glow: { color: 'info', size: 2 } },
    items: STATUS_ITEMS,
  },
};

/** `effect.gradient` fills the track itself, so it shows behind the
 *  *unfilled* remainder — give the bar a `total` well above the sum and
 *  the gradient reads clearly to the right of the segments. */
export const WithGradient: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a gradient effect.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    // sum is 183; a 420 total leaves well over half the track empty.
    total: 420,
    effect: { gradient: { colors: { 0: 'info', 100: 'success' }, direction: 'to right' } },
    items: STATUS_ITEMS,
  },
};

/** `transparent` drops the tinted empty track. */
export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a transparent background.',
      },
    },
  },
  render: Template,
  args: { fluid: true, transparent: true, total: 220, showValues: true, items: STATUS_ITEMS },
};

/** `rounded={false}` squares the corners. */
export const NotRounded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with rounded corners disabled.',
      },
    },
  },
  render: Template,
  args: { fluid: true, rounded: false, showValues: true, items: STATUS_ITEMS },
};

/** `disabled` dims the bar and blocks interaction. */
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar in its disabled state.',
      },
    },
  },
  render: Template,
  args: { fluid: true, disabled: true, showValues: true, items: STATUS_ITEMS },
};

/** A bar-level `tooltip` (in addition to the per-segment tooltips). */
export const WithTooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a tooltip attached.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    showValues: true,
    tooltip: { content: '183 orders in the last 24h', openOnMount: true, placement: 'top' },
    items: STATUS_ITEMS,
  },
  play: async () => {
    userEvent.hover(document.querySelector('.reqore-stacked-bar')!);
  },
};

/** Non-fluid bars fall back to the default fixed width. */
export const FixedWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with a fixed width.',
      },
    },
  },
  render: (args) => <ReqoreStackedBar {...args} />,
  args: { showValues: true, items: STATUS_ITEMS },
};

export const CustomColors: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with custom colors overridden.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    items: [
      { label: 'A', value: 3, color: '#57801a' },
      { label: 'B', value: 5, color: '#81358a' },
      { label: 'C', value: 2, color: 'danger:lighten:2' },
    ],
  },
};

export const PartialOfTotal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar showing a partial value relative to the total.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    // total exceeds the sum (10), so 50% of the track stays empty
    total: 20,
    items: [
      { label: 'Done', value: 7, intent: 'success' },
      { label: 'Failed', value: 3, intent: 'danger' },
    ],
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar in its empty state.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    items: [
      { label: 'Complete', value: 0, intent: 'success' },
      { label: 'Error', value: 0, intent: 'danger' },
    ],
  },
};

/** Tiny values still render at the minimum segment width so they stay
 *  visible and clickable. */
export const TinySegmentsStayVisible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with tiny segments that still stay visible above a minimum threshold.',
      },
    },
  },
  render: Template,
  args: {
    fluid: true,
    minSegmentPercent: 4,
    items: [
      { label: 'Complete', value: 9990, intent: 'success' },
      { label: 'Error', value: 1, intent: 'danger' },
    ],
  },
};

/** Each segment is clickable; the play test confirms a segment click
 *  fires the handler and that zero-value statuses are not rendered. */
export const ClickableSegments: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders StackedBar with clickable segments.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big' style={{ width: '420px' }}>
      <ReqoreStackedBar {...args} />
    </ReqoreControlGroup>
  ),
  args: {
    fluid: true,
    items: [
      { id: 'complete', label: 'Complete', value: 124, intent: 'success', onClick: fn() },
      { id: 'error', label: 'Error', value: 18, intent: 'danger', onClick: fn() },
      { id: 'blocked', label: 'Blocked', value: 0, intent: 'muted', onClick: fn() },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const segments = canvasElement.querySelectorAll('.reqore-stacked-bar-segment');
    // Two positive segments render; the zero-value "Blocked" is dropped.
    await expect(segments.length).toBe(2);
    await userEvent.click(segments[1]!);
    const errorItem = (args.items as IReqoreStackedBarItem[])[1];
    await expect(errorItem.onClick).toHaveBeenCalledTimes(1);
    // The dropped segment's handler never fires.
    const blockedItem = (args.items as IReqoreStackedBarItem[])[2];
    await expect(blockedItem.onClick).not.toHaveBeenCalled();
    void canvas;
  },
};
