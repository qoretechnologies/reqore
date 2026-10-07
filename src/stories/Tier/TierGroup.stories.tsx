import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreTier, ReqoreTierGroup } from '../..';
import { IReqoreTierGroupProps } from '../../components/Tier/group';
import { StoryMeta } from '../utils';
import {
  expectModernRow,
  expectNoHorizontalOverflow,
  FOUR_PLANS,
  phoneParameters,
  THREE_PLANS,
} from './plans';

const meta = {
  title: 'Other/Tier Group',
  component: ReqoreTierGroup,
  args: {
    appearance: 'modern',
  },
} as StoryMeta<typeof ReqoreTierGroup>;

type Story = StoryObj<typeof meta>;

export default meta;

const Plans = ({
  plans = THREE_PLANS,
  ...props
}: Partial<IReqoreTierGroupProps> & { plans?: typeof THREE_PLANS }) => (
  <ReqoreTierGroup {...props}>
    {plans.map((plan) => (
      <ReqoreTier key={plan.name} {...plan} />
    ))}
  </ReqoreTierGroup>
);

/* ------------------------------------------------------------------------------------------------
 * Play helpers
 * ---------------------------------------------------------------------------------------------- */

const findGroup = (root: HTMLElement, layout: 'row' | 'stack') =>
  waitFor(() => {
    const group = root.querySelector('.reqore-tier-group') as HTMLElement;

    expect(group?.getAttribute('data-layout')).toBe(layout);

    return group;
  });

const frontName = (group: HTMLElement) =>
  group.querySelector('.reqore-tier-group-item-front .reqore-tier-name')?.textContent;

const expectFront = (group: HTMLElement, name: string) =>
  waitFor(() => {
    expect(frontName(group)).toBe(name);
    expect(group.querySelector('.reqore-tier-group-dot-active')?.getAttribute('aria-label')).toBe(
      name
    );
  });

/** The stack's promises at rest: one tier in front, the rest inert, the page no wider. */
const expectStack = async (group: HTMLElement) => {
  const items = Array.from(group.querySelectorAll('.reqore-tier-group-item')) as HTMLElement[];
  const front = group.querySelector('.reqore-tier-group-item-front') as HTMLElement;

  await expect(front).toBeTruthy();
  await expect(front.hasAttribute('inert')).toBe(false);

  for (const item of items) {
    if (item !== front) {
      await expect(item.hasAttribute('inert')).toBe(true);
    }
  }

  await expectNoHorizontalOverflow();
};

/** Waits for the stack's switch to settle (it animates unless motion is reduced). */
const settled = async (group: HTMLElement) => {
  await Promise.all(
    group
      .getAnimations({ subtree: true })
      .map((animation) => animation.finished.catch(() => undefined))
  );
};

/** A horizontal swipe across the stack, the way a finger does it. */
const swipe = (group: HTMLElement, distance: number) => {
  const viewport = group.querySelector('.reqore-tier-group-viewport') as HTMLElement;
  const rect = viewport.getBoundingClientRect();
  const y = rect.top + rect.height / 2;
  const startX = rect.left + rect.width / 2;
  const fire = (type: string, x: number, buttons: number) =>
    viewport.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerId: 11,
        pointerType: 'touch',
        isPrimary: true,
        button: 0,
        buttons,
      })
    );

  fire('pointerdown', startX, 1);

  for (let step = 1; step <= 6; step++) {
    fire('pointermove', startX + (distance * step) / 6, 1);
  }

  fire('pointerup', startX + distance, 0);
};

/** A key pressed with the carousel focused, as a keyboard user does it. */
const press = (group: HTMLElement, key: string) => {
  group.focus();
  group.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
};

const control = (group: HTMLElement, selector: string) =>
  group.querySelector(selector) as HTMLButtonElement;

/* ------------------------------------------------------------------------------------------------
 * Row
 * ---------------------------------------------------------------------------------------------- */

export const Row: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders four modern plans in a `ReqoreTierGroup` on a wide screen: one row of equal-height cards with every button on one line at the bottom, the highlighted Pro plan among them, and no stack controls.',
      },
    },
  },
  render: (args) => (
    <div style={{ maxWidth: 1240 }}>
      <Plans {...args} plans={FOUR_PLANS} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'row');

    await expectModernRow(canvasElement, 4);
    await expect(group.querySelector('.reqore-tier-group-controls')).toBeNull();

    // One row: every card starts on the same line.
    const tops = Array.from(group.querySelectorAll('.reqore-tier')).map(
      (tier) => tier.getBoundingClientRect().top
    );
    await expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
  },
};

/* ------------------------------------------------------------------------------------------------
 * Stack
 * ---------------------------------------------------------------------------------------------- */

export const Stack: Story = {
  args: { mobileLayout: 'stack' },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders three plans with `mobileLayout="stack"` on a 360px phone: the highlighted Pro plan in front, Starter and Enterprise behind it on either side (scaled down, dimmed and turned a little away), and under it the previous and next buttons with a dot per plan, Pro\'s a wider pill. Nothing is wider than the screen.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');

    await expectFront(group, 'Pro');
    await expectStack(group);
    await expect(group.getAttribute('aria-roledescription')).toBe('carousel');
    await expect(group.querySelectorAll('.reqore-tier-group-dot')).toHaveLength(3);
    await expect(control(group, '.reqore-tier-group-previous').disabled).toBe(false);
    await expect(control(group, '.reqore-tier-group-next').disabled).toBe(false);

    // The neighbours show past the front card on either side.
    const [left, front, right] = Array.from(group.querySelectorAll('.reqore-tier-group-item')).map(
      (item) => item.getBoundingClientRect()
    );
    await expect(left.left).toBeLessThan(front.left);
    await expect(right.right).toBeGreaterThan(front.right);
  },
};

export const StackLight: Story = {
  args: { mobileLayout: 'stack', mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders the plan stack on a 360px phone on a light theme: the highlighted Pro plan in front on a white card washed in blue, Starter and Enterprise dimmed behind it on either side, and dark controls under it.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');

    await expectFront(group, 'Pro');
    await expectStack(group);
  },
};

export const StackSwipe: Story = {
  args: { mobileLayout: 'stack' },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders the plan stack on a 360px phone after a swipe to the left: Enterprise has come to the front with Pro behind it on the left, its dot is the pill and the next button is disabled. A second swipe to the left, past the last plan, gives a little and springs back.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');

    await expectFront(group, 'Pro');

    swipe(group, -160);
    await expectFront(group, 'Enterprise');
    await expect(control(group, '.reqore-tier-group-next').disabled).toBe(true);

    // The last plan is an end: a swipe past it changes nothing.
    swipe(group, -160);
    await settled(group);
    await expectFront(group, 'Enterprise');
    await expect(group.getAttribute('data-active-index')).toBe('2');
    await expectStack(group);
  },
};

export const StackKeyboard: Story = {
  args: { mobileLayout: 'stack' },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders the plan stack on a 360px phone after it was driven from the keyboard and its controls: the arrow keys, Home and End, the next and previous buttons and a dot each change the plan in front. It ends on Starter, the first plan, so the previous button is disabled and only Pro shows behind it, on the right.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');

    await expectFront(group, 'Pro');

    press(group, 'ArrowRight');
    await expectFront(group, 'Enterprise');
    press(group, 'Home');
    await expectFront(group, 'Starter');
    press(group, 'ArrowLeft');
    await expectFront(group, 'Starter');
    press(group, 'End');
    await expectFront(group, 'Enterprise');

    control(group, '.reqore-tier-group-previous').click();
    await expectFront(group, 'Pro');
    (group.querySelector('.reqore-tier-group-dot[aria-label="Starter"]') as HTMLElement).click();
    await expectFront(group, 'Starter');
    control(group, '.reqore-tier-group-next').click();
    await expectFront(group, 'Pro');
    press(group, 'ArrowLeft');
    await expectFront(group, 'Starter');

    await expect(control(group, '.reqore-tier-group-previous').disabled).toBe(true);
    await settled(group);
    await expectStack(group);
  },
};

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export const StackReducedMotion: Story = {
  args: { mobileLayout: 'stack' },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders the plan stack on a 360px phone for a user who asked for reduced motion, after a swipe to the left: Enterprise is in front, switched at once with no animation, and the plan behind it is neither turned nor followed the finger.',
      },
    },
  },
  beforeEach: () => {
    const matchMedia = window.matchMedia;

    window.matchMedia = (query: string) =>
      query === REDUCED_MOTION
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
          } as MediaQueryList)
        : matchMedia.call(window, query);

    return () => {
      window.matchMedia = matchMedia;
    };
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');
    const items = () =>
      Array.from(group.querySelectorAll('.reqore-tier-group-item')) as HTMLElement[];

    await expectFront(group, 'Pro');

    for (const item of items()) {
      await expect(getComputedStyle(item).transitionDuration).toBe('0s');
      await expect(item.style.transform).not.toContain('rotateY');
    }

    swipe(group, -160);
    await expectFront(group, 'Enterprise');
    // Switched at once: no card is animating.
    await expect(items().flatMap((item) => item.getAnimations())).toHaveLength(0);
    await expectStack(group);
  },
};

export const StackLoop: Story = {
  args: { mobileLayout: 'stack', loop: true, defaultActiveIndex: 0 },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders four plans in a stack with `loop` on a 360px phone, starting on the first: Starter in front with Enterprise, the last plan, behind it on the left and Pro on the right; the previous and next buttons are never disabled, and stepping past either end wraps round.',
      },
    },
  },
  render: (args) => <Plans {...args} plans={FOUR_PLANS} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');

    await expectFront(group, 'Starter');
    await expect(control(group, '.reqore-tier-group-previous').disabled).toBe(false);

    press(group, 'ArrowLeft');
    await expectFront(group, 'Enterprise');
    press(group, 'ArrowRight');
    await expectFront(group, 'Starter');

    const offsets = Array.from(group.querySelectorAll('.reqore-tier-group-item')).map((item) =>
      item.getAttribute('data-offset')
    );
    // Starter in front, Pro on the right, Team two away (hidden), Enterprise on the left.
    await expect(offsets).toEqual(['0', '1', '2', '-1']);

    await settled(group);
    await expectStack(group);
  },
};

export const StackThemed: Story = {
  args: {
    mobileLayout: 'stack',
    customTheme: { main: '#10233a' },
    intent: 'success',
    size: 'small',
  },
  parameters: {
    ...phoneParameters(),
    docs: {
      description: {
        story:
          'Renders the plan stack on a 360px phone with the group\'s `customTheme` (a navy main), `intent="success"` and `size="small"`: every plan is drawn on the navy theme, the front dot and the previous and next buttons are green, and the plans, the dots and the buttons are one size smaller.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'stack');
    const front = group.querySelector('.reqore-tier-group-item-front .reqore-tier') as HTMLElement;
    const dot = group.querySelector('.reqore-tier-group-dot-active') as HTMLElement;

    await expectFront(group, 'Pro');
    // The group's theme reached its tiers: a navy surface, not the page's grey.
    const [r, g, b] = (
      getComputedStyle(
        group.querySelector(
          '.reqore-tier-group-item:not(.reqore-tier-group-item-front) .reqore-tier'
        )!
      ).backgroundColor.match(/\d+/g) || []
    ).map(Number);
    await expect(b).toBeGreaterThan(r + 10);
    await expect(b).toBeGreaterThan(g);
    // The group's size reached them too.
    await expect(getComputedStyle(front.querySelector('.reqore-tier-price-value')!).fontSize).toBe(
      '32px'
    );
    await expect(getComputedStyle(dot).width).toBe('24px');
    // The intent colours the front dot: green, not the text colour.
    const [dr, dg, db] = (
      getComputedStyle(dot, '::before').backgroundColor.match(/\d+/g) || []
    ).map(Number);
    await expect(dg).toBeGreaterThan(dr);
    await expect(dg).toBeGreaterThan(db);
    await expectStack(group);
  },
};

export const NarrowColumns: Story = {
  parameters: {
    ...phoneParameters(1900),
    docs: {
      description: {
        story:
          'Renders the three plans on a 360px phone with the default `mobileLayout` ("columns"): one plan under the other, full width, each with its button at its bottom, and no stack controls.',
      },
    },
  },
  render: (args) => <Plans {...args} />,
  play: async ({ canvasElement }) => {
    const group = await findGroup(canvasElement, 'row');
    const tiers = Array.from(group.querySelectorAll('.reqore-tier')).map((tier) =>
      tier.getBoundingClientRect()
    );

    await expect(tiers).toHaveLength(3);
    await expect(tiers[1].top).toBeGreaterThan(tiers[0].bottom);
    await expect(tiers[2].top).toBeGreaterThan(tiers[1].bottom);
    await expect(group.querySelector('.reqore-tier-group-controls')).toBeNull();
    await expectNoHorizontalOverflow();
  },
};
