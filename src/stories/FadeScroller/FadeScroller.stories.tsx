import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { IReqoreFadeScrollerProps } from '../../components/FadeScroller';
import { DEFAULT_INTENTS, TReqoreIntent } from '../../constants/theme';
import {
  ReqoreControlGroup,
  ReqoreFadeScroller,
  ReqoreP,
  ReqoreStatistic,
  ReqoreTag,
} from '../../index';
import { StoryMeta } from '../utils';
import { GapSizeArg, IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreFadeScrollerProps>();

/* A narrow column, so the row genuinely overflows and the right-hand fade appears.
   At full width the same row fits and both fades stay hidden — which is the point
   of measuring rather than always painting them. */
const NarrowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: 360, maxWidth: '100%' }}>{children}</div>
);

/* Card-shaped row of KPI stats — the standard scroller payload across every
   story so the demos read as one coherent artefact instead of a mix of chips
   and cards. Each card is min 140px wide by default, so 5 × 140 = 700px
   overflows any of the 360-480px containers below — that overflow is what
   makes the fade visible. `count` trims the row for the "fits" demo;
   `flexible` drops the minWidth so `rigid={false}` can actually share width. */
const ALL_CARDS: Array<{
  label: string;
  value: string;
  suffix?: string;
  icon: any;
  intent?: TReqoreIntent;
}> = [
  { label: 'Orders', value: '12,438', icon: 'ShoppingCart2Line' },
  { label: 'Success rate', value: '99.4', suffix: '%', intent: 'success', icon: 'CheckLine' },
  { label: 'Errors', value: '74', intent: 'danger', icon: 'AlertLine' },
  { label: 'Avg duration', value: '1.2s', icon: 'TimerLine' },
  { label: 'In flight', value: '9', intent: 'info', icon: 'LoaderLine' },
];

const KpiCards = ({
  count = ALL_CARDS.length,
  flexible = false,
  onCardClick,
}: {
  count?: number;
  flexible?: boolean;
  /* Makes each card interactive. Only the drag story passes it: the click/drag
     pairing is the thing that needs a clickable target to be exercised against,
     and the other stories are about fades, not about what a card does. */
  onCardClick?: (label: string) => void;
}) => (
  <>
    {ALL_CARDS.slice(0, count).map((card) => (
      <ReqoreStatistic
        key={card.label}
        label={card.label}
        value={card.value}
        suffix={card.suffix}
        intent={card.intent}
        icon={card.icon}
        flat={false}
        padded
        rounded
        onClick={onCardClick ? () => onCardClick(card.label) : undefined}
        style={flexible ? undefined : { minWidth: 140 }}
      />
    ))}
  </>
);

/* The drag story's payload: the same KPI rail, but every card is clickable and the
   last click is displayed. That readout is the point — the interesting behaviour
   here is a PAIR (a drag must not activate a card, a plain click must), and
   without somewhere for a click to show up, only one half of it can be checked by
   hand. It doubles as the target for the story's own play assertions. */
const DragToScrollDemo = (args: IReqoreFadeScrollerProps) => {
  const [clicked, setClicked] = useState<string | undefined>(undefined);

  return (
    <NarrowWrapper>
      <ReqoreFadeScroller {...args}>
        <KpiCards onCardClick={setClicked} />
      </ReqoreFadeScroller>
      <ReqoreP
        size='small'
        className='fade-scroller-click-readout'
        style={{ marginTop: 12 }}
        data-clicked={clicked ?? ''}
      >
        {clicked ? `Clicked: ${clicked}` : 'Click a card — dragging past one must not count.'}
      </ReqoreP>
    </NarrowWrapper>
  );
};

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
      <KpiCards />
    </ReqoreFadeScroller>
  </NarrowWrapper>
);

/** More cards than fit: one row, scrolled to the start, fading on the right only. */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row of KPI cards wider than its container. The row stays on one line and fades on the right, where the remaining cards are scrolled out of view.',
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

/** `dragToScroll`: grab the row and pull it sideways. */
export const DragToScroll: Story = {
  parameters: {
    /* No visual snapshot: a drag is a gesture, and a single still frame of one
       carries no information — the row simply sits at whatever scroll offset the
       play function last left it, which is not a design decision anyone reviews.
       What matters here is behavioural and is asserted below and in
       `__tests__/fadeScroller-drag.test.tsx`. */
    qlip: { skip: true },
    docs: {
      description: {
        story:
          'Renders an overflowing row of CLICKABLE KPI cards with `dragToScroll` — pressing anywhere on it and pulling sideways scrolls it, and the cursor reads `grab` (then `grabbing`) while there is somewhere to go. A mouse has no horizontal axis, so without this the row is reachable only by shift+wheel or a trackpad gesture. The cards are interactive on purpose: the readout underneath shows the last one clicked, because the behaviour worth checking is a PAIR — pulling past a card must NOT activate it, while a plain press-and-release must. Selecting text is preserved: hold **Shift** and drag to select, and on touch the drag never engages so native panning and long-press-to-select both apply unchanged. The drag also survives the pointer leaving the row, and ends even if the button comes up outside the window.',
      },
    },
  },
  args: { dragToScroll: true },
  render: (args) => <DragToScrollDemo {...args} />,
  play: async ({ canvasElement }) => {
    /* Queried INSIDE waitFor, not before it: capturing the result once and then
       asserting on it cannot recover from a delayed mount, because the null is
       already in hand. */
    const find = async <T extends HTMLElement>(root: ParentNode, selector: string): Promise<T> =>
      waitFor(() => {
        const node = root.querySelector(selector) as T | null;
        expect(node).toBeTruthy();
        return node as T;
      });

    const scroller = await find<HTMLElement>(canvasElement, '.reqore-fade-scroller-content');

    // The drag is a no-op on a row that fits, so the story has to overflow.
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    await expect(getComputedStyle(scroller).cursor).toBe('grab');

    const readout = await find<HTMLElement>(canvasElement, '.fade-scroller-click-readout');
    const card = await find<HTMLElement>(scroller, '.reqore-statistic');

    const rect = scroller.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const from = rect.left + rect.width - 20;
    /* `buttons` is the bitmask of what is held right now, and the component reads
       it to notice a release it never saw. A move without it is a drag with
       nothing held down — impossible, and the component correctly ignores it. */
    const event = (target: EventTarget, type: string, x: number, buttons: number) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          pointerId: 1,
          pointerType: 'mouse',
          button: 0,
          buttons,
        })
      );

    // 1. A real drag scrolls the row...
    event(scroller, 'pointerdown', from, 1);
    event(scroller, 'pointermove', from - 120, 1);

    await waitFor(() => expect(scroller.scrollLeft).toBeGreaterThan(0));
    // Held down, the row is the control rather than selectable text.
    await expect(getComputedStyle(scroller).cursor).toBe('grabbing');

    event(scroller, 'pointerup', from - 120, 0);
    await waitFor(() => expect(getComputedStyle(scroller).cursor).toBe('grab'));

    /* 2. A release the page never saw — the button coming up outside the window —
       must not leave the row stuck to the pointer. `buttons: 0` on a move is the
       tell: during a drag it can only be non-zero. */
    event(scroller, 'pointerdown', from, 1);
    event(scroller, 'pointermove', from - 60, 1);
    await expect(getComputedStyle(scroller).cursor).toBe('grabbing');

    const frozenAt = scroller.scrollLeft;

    event(scroller, 'pointermove', from - 200, 0);

    await waitFor(() => expect(getComputedStyle(scroller).cursor).toBe('grab'));
    await expect(scroller.scrollLeft).toBe(frozenAt);

    /* 3. The cards are genuinely clickable, which is what makes the readout — and
       hand-testing the click/drag pairing — possible at all. The other half of
       that pairing (a drag must NOT activate the card it ends on) is asserted in
       `__tests__/fadeScroller-drag.test.tsx`, where a click can be driven exactly
       and in isolation rather than through a real browser's event sequencing. */
    await userEvent.click(card);
    await waitFor(() => expect(readout.getAttribute('data-clicked')).not.toBe(''));
  },
};

/** Content that fits: no overflow, so neither edge fades. */
export const FitsWithoutScrolling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row short enough to fit its container (two cards inside a 360px column) — nothing is out of view, so neither edge shows a fade.',
      },
    },
  },
  render: (args) => (
    <NarrowWrapper>
      <ReqoreFadeScroller {...args}>
        <KpiCards count={2} />
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
          'Renders the row with `rigid` off. The cards drop their `minWidth` (via the `flexible` variant of the KPI row) so the flex system can share the container width across them instead of overflowing at their natural size. Container is 500px (wider than the other stories) so each of the three shrunk cards still renders its value legibly — narrow enough that `rigid={false}` visibly shares width, wide enough that the value doesn\'t wrap.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 500, maxWidth: '100%' }}>
      <ReqoreFadeScroller {...args} rigid={false}>
        <KpiCards count={3} flexible />
      </ReqoreFadeScroller>
    </div>
  ),
};

/** The fade takes the surface's colour, so it reads as a dissolve, not a smudge. */
export const CustomFadeColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the standard KPI-card row over a non-default background with `fadeColor` matched to it, so the overflow dissolves into the surface instead of fading to a mismatched colour.',
      },
    },
  },
  render: (args) => (
    <div style={{ background: '#2a1a2e', padding: 16, width: 480 }}>
      <ReqoreFadeScroller {...args} fadeColor='#2a1a2e' gapSize='normal'>
        <KpiCards />
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
          'Renders the same overflowing KPI-card row once per intent. The fade is the only surface the component paints, so the intent colours the gradient the content dissolves into.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      {Object.keys(DEFAULT_INTENTS).map((intent) => (
        <NarrowWrapper key={intent}>
          <ReqoreTag label={intent} size='tiny' intent={intent as TReqoreIntent} />
          <ReqoreFadeScroller {...args} intent={intent as TReqoreIntent}>
            <KpiCards />
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
          "Renders the standard KPI-card row with a `customTheme`, so the fade dissolves into that theme's `main` colour instead of the app background. Same shape as `CustomFadeColor` — the difference is that `customTheme` also colours the cards and any of the scroller's own affordances, where `fadeColor` colours only the fade.",
      },
    },
  },
  render: (args) => (
    <div style={{ background: '#1d3b2a', padding: 16, width: 480 }}>
      <ReqoreFadeScroller {...args} customTheme={{ main: '#1d3b2a' }} gapSize='normal'>
        <KpiCards />
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
        <KpiCards />
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
        <KpiCards count={4} />
      </ReqoreFadeScroller>
    </ReqoreControlGroup>
  ),
};
