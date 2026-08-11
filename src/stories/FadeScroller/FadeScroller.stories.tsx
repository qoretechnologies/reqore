import { StoryFn, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { IReqoreFadeScrollerProps } from '../../components/FadeScroller';
import { DEFAULT_INTENTS, TReqoreIntent } from '../../constants/theme';
import {
  ReqoreControlGroup,
  ReqoreFadeScroller,
  ReqoreStatistic,
  ReqoreTag,
} from '../../index';
import { StoryMeta } from '../utils';
import { GapSizeArg, IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreFadeScrollerProps>();

const TAGS = [
  'order-sync:1.2',
  'invoice-export:2.0',
  'partner-recon:1.1',
  'nightly-recon',
  'sla-report',
  'sftp-partner',
  'salesforce-prod',
  'csv-to-order',
];

/* A narrow column, so the row genuinely overflows and the right-hand fade appears.
   At full width the same row fits and both fades stay hidden — which is the point
   of measuring rather than always painting them. */
const NarrowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 360, maxWidth: '100%' }}>{children}</div>
);

const Chips = ({ count = TAGS.length }: { count?: number }) => (
  <>
    {TAGS.slice(0, count).map((label) => (
      <ReqoreTag key={label} label={label} size='small' />
    ))}
  </>
);

const meta = {
  title: 'Layout/Fade Scroller',
  component: ReqoreFadeScroller,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
  argTypes: {
    ...IntentArg,
    ...GapSizeArg,
    ...createArg('verticalAlign', {
      control: 'select',
      options: ['flex-start', 'center', 'flex-end', 'stretch'],
      name: 'Vertical align',
      defaultValue: 'center',
    }),
    ...createArg('rigid', {
      type: 'boolean',
      name: 'Rigid',
      defaultValue: true,
    }),
    ...createArg('fade', {
      type: 'boolean',
      name: 'Fade',
      defaultValue: true,
    }),
    ...createArg('fluid', {
      type: 'boolean',
      name: 'Fluid',
      defaultValue: true,
    }),
  },
} as StoryMeta<typeof ReqoreFadeScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreFadeScrollerProps> = (args) => (
  <NarrowWrapper>
    <ReqoreFadeScroller {...args}>
      <Chips />
    </ReqoreFadeScroller>
  </NarrowWrapper>
);

/** More chips than fit: one row, scrolled to the start, fading on the right only. */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row of chips wider than its container. The row stays on one line and fades on the right, where the remaining chips are scrolled out of view.',
      },
    },
  },
  render: Template,
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector('.reqore-fade-scroller-content');

    await waitFor(() => expect(scroller).toBeTruthy());
    // it really does overflow — otherwise this story proves nothing
    await expect(scroller!.scrollWidth).toBeGreaterThan(scroller!.clientWidth);
    // and it is one line, not a wrapped block
    await expect(getComputedStyle(scroller!).flexWrap).toBe('nowrap');
  },
};

/** Scrolled into the middle: both edges have content out of view, so both fade. */
export const ScrolledToTheMiddle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the row scrolled away from both ends — content is hidden to the left and the right, so a fade appears on each edge.',
      },
    },
  },
  render: Template,
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector('.reqore-fade-scroller-content') as HTMLElement;

    await waitFor(() => expect(scroller).toBeTruthy());
    scroller.scrollLeft = Math.round((scroller.scrollWidth - scroller.clientWidth) / 2);
    scroller.dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(scroller.scrollLeft).toBeGreaterThan(0));
    await expect(scroller.scrollLeft + scroller.clientWidth).toBeLessThan(scroller.scrollWidth);
  },
};

/** Content that fits: no overflow, so neither edge fades. */
export const FitsWithoutScrolling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row short enough to fit its container — nothing is out of view, so neither edge shows a fade.',
      },
    },
  },
  render: (args) => (
    <NarrowWrapper>
      <ReqoreFadeScroller {...args}>
        <Chips count={2} />
      </ReqoreFadeScroller>
    </NarrowWrapper>
  ),
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector('.reqore-fade-scroller-content') as HTMLElement;

    await waitFor(() => expect(scroller).toBeTruthy());
    await expect(scroller.scrollWidth).toBeLessThanOrEqual(scroller.clientWidth + 1);
  },
};

/** `rigid={false}` lets self-sizing children share the width instead of overflowing. */
export const NonRigidChildren: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the row with `rigid` off, so self-sizing children (a stat rail, grow-tiles) keep their own flex behaviour and share the width rather than overflowing at their natural size.',
      },
    },
  },
  render: (args) => (
    <NarrowWrapper>
      <ReqoreFadeScroller {...args} rigid={false}>
        <Chips count={3} />
      </ReqoreFadeScroller>
    </NarrowWrapper>
  ),
};

/** The fade takes the surface's colour, so it reads as a dissolve, not a smudge. */
export const CustomFadeColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row of `ReqoreStatistic` cards — each with its own background so the fade dissolving *between and past* the cards into the plum surface is unmistakable — over a non-default background with `fadeColor` matched to it. The effect is easy to miss when the overflowing content is small (chips, tags), so the demo is intentionally KPI-sized.',
      },
    },
  },
  render: (args) => (
    <div style={{ background: '#2a1a2e', padding: 16, width: 480 }}>
      <ReqoreFadeScroller {...args} fadeColor='#2a1a2e' gapSize='normal'>
        <ReqoreStatistic
          label='Orders'
          value='12,438'
          icon='ShoppingCart2Line'
          flat={false}
          padded
          rounded
          style={{ minWidth: 140 }}
        />
        <ReqoreStatistic
          label='Success rate'
          value='99.4'
          suffix='%'
          intent='success'
          icon='CheckLine'
          flat={false}
          padded
          rounded
          style={{ minWidth: 140 }}
        />
        <ReqoreStatistic
          label='Errors'
          value='74'
          intent='danger'
          icon='AlertLine'
          flat={false}
          padded
          rounded
          style={{ minWidth: 140 }}
        />
        <ReqoreStatistic
          label='Avg duration'
          value='1.2s'
          icon='TimerLine'
          flat={false}
          padded
          rounded
          style={{ minWidth: 140 }}
        />
        <ReqoreStatistic
          label='In flight'
          value='9'
          intent='info'
          icon='LoaderLine'
          flat={false}
          padded
          rounded
          style={{ minWidth: 140 }}
        />
      </ReqoreFadeScroller>
    </div>
  ),
};

/**
 * The fade is this component's only surface, so an intent colours the fade itself —
 * there is no border or background here for it to tint instead.
 */
export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same overflowing row once per intent. The fade is the only surface the component paints, so the intent colours the gradient the content dissolves into.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <NarrowWrapper key={intent}>
          <ReqoreTag label={intent} size='tiny' intent={intent as TReqoreIntent} />
          <ReqoreFadeScroller {...args} intent={intent as TReqoreIntent}>
            <Chips />
          </ReqoreFadeScroller>
        </NarrowWrapper>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    /* The fades live on ::before / ::after, which jsdom doesn't compute — this is
       the only place the intent wiring can actually be asserted, so it is asserted
       here rather than left to the eye. */
    const scrollers = canvasElement.querySelectorAll('.reqore-fade-scroller');

    await waitFor(() => expect(scrollers.length).toBeGreaterThan(1));

    const gradients = Array.from(scrollers).map(
      (element) => getComputedStyle(element, '::after').backgroundImage
    );

    // Every intent paints a gradient, and the intents that carry distinct colours
    // paint distinct ones. Not all-distinct: `muted` and `custom1`–`custom5` all
    // alias Colors.GRAY, so they legitimately render the same fade.
    await expect(gradients.every((gradient) => gradient.includes('gradient'))).toBe(true);
    await expect(new Set(gradients).size).toBeGreaterThan(1);
  },
};

/** `customTheme.main` sets the surface the fade dissolves into. */
export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the scroller with a customTheme, so the fade dissolves into that theme\'s main colour instead of the app background.',
      },
    },
  },
  render: (args) => (
    <div style={{ background: '#1d3b2a', padding: 12, width: 384 }}>
      <ReqoreFadeScroller {...args} customTheme={{ main: '#1d3b2a' }}>
        <Chips />
      </ReqoreFadeScroller>
    </div>
  ),
};

/** Every component takes a tooltip. */
export const Tooltip: Story = {
  parameters: {
    // Tooltip only becomes visible on hover — the static Qlip capture would
    // just re-photograph the Default story's overflowing row, so opt this
    // story out of visual regression.
    qlip: { skip: true },
    docs: {
      description: {
        story:
          'Renders the scroller with a tooltip — hovering the row explains what the hidden overflow contains.',
      },
    },
  },
  render: (args) => (
    <NarrowWrapper>
      <ReqoreFadeScroller {...args} tooltip='Scroll sideways for the rest'>
        <Chips />
      </ReqoreFadeScroller>
    </NarrowWrapper>
  ),
};

/** Beside other content: `fluid={false}` keeps the row to the width it needs. */
export const NonFluidBesideContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a non-fluid scroller sitting beside a label in a flex row — it takes only the width it needs instead of forcing itself onto its own line.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup verticalAlign='center' gapSize='small'>
      <ReqoreTag label='References' size='small' />
      <ReqoreFadeScroller {...args} fluid={false}>
        <Chips count={4} />
      </ReqoreFadeScroller>
    </ReqoreControlGroup>
  ),
};
