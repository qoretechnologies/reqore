import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import {
  IReqoreStatisticGroupItem,
  ReqoreStatisticGroup,
} from '../../components/StatisticGroup';
import { ReqoreControlGroup, ReqoreP, ReqorePanel } from '../../index';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';
import { PHONE_STORY, PHONE_VIEWPORT } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';

const meta = {
  title: 'Display/Statistic Group',
  component: ReqoreStatisticGroup,
  argTypes: {
    ...SizeArg,
  },
} as StoryMeta<typeof ReqoreStatisticGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A list page's five headline figures, each with the line that says what it counts. */
const FIGURES: IReqoreStatisticGroupItem[] = [
  { label: 'Running', value: 12, description: 'workflows with orders in flight' },
  {
    label: 'Failing',
    value: 2,
    description: 'stopped on an error in the last hour',
    valueEffect: { color: '#e5484d' },
  },
  { label: 'Success rate', value: 98.2, suffix: '%', description: 'last 24 hours' },
  { label: 'Orders today', value: '4,204', description: 'since midnight' },
  { label: 'Last order', value: '2 min', description: 'ago, Order Fulfilment' },
];

const items = (group: HTMLElement) =>
  Array.from(group.querySelectorAll<HTMLElement>(':scope > .reqore-statistic-group-item'));

const groupIn = (canvasElement: HTMLElement, selector = '.reqore-statistic-group') =>
  canvasElement.querySelector<HTMLElement>(selector)!;

/** The figures' rows: how many distinct tops their cells have. */
const rowsOf = (group: HTMLElement) =>
  new Set(items(group).map((item) => Math.round(item.getBoundingClientRect().top))).size;

/** The hairline drawn by a box shadow, or none. */
const drawsHairline = (element: HTMLElement) => {
  const shadow = getComputedStyle(element).boxShadow;

  return shadow !== 'none' && !/rgba\(0, 0, 0, 0\)|transparent/.test(shadow);
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a list page\'s five headline figures in one row: each figure over its label and the line saying what it counts, a hairline between the figures and one above and below the strip. The first figure starts on the strip\'s edge. With room for every figure, nothing scrolls.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 960 }}>
      <ReqoreStatisticGroup {...args} items={FIGURES} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(items(group)).toHaveLength(5));
    expect(rowsOf(group)).toBe(1);
    // A wide strip shares its row; it scrolls only when its figures do not fit.
    expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth + 1);
    expect(drawsHairline(group)).toBe(true);
    // A hairline before every figure but the first, which starts on the edge.
    expect(drawsHairline(items(group)[0])).toBe(false);
    items(group)
      .slice(1)
      .forEach((item) => expect(drawsHairline(item)).toBe(true));
    expect(
      Math.abs(
        items(group)[0].querySelector('.reqore-statistic')!.getBoundingClientRect().left -
          group.getBoundingClientRect().left
      )
    ).toBeLessThanOrEqual(1);
  },
};

export const NarrowFoldsToTwoPerRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same five figures in a 360px box with `narrowLayout="wrap"`: narrower than 480px, the strip folds to two figures a row (three rows), a hairline between the two of a row and above every row after the first. An opt-in kept for a host that asks for it; the default stays one row and scrolls.',
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <ReqoreStatisticGroup items={FIGURES} narrowLayout='wrap' />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(group.getAttribute('data-narrow')).toBe('true'));
    expect(rowsOf(group)).toBe(3);
    const [first, second, third] = items(group);
    // Two to a row, the first of each on the edge.
    expect(Math.round(first.getBoundingClientRect().top)).toBe(
      Math.round(second.getBoundingClientRect().top)
    );
    expect(Math.round(third.getBoundingClientRect().left)).toBe(
      Math.round(first.getBoundingClientRect().left)
    );
    // Nothing reaches past the box.
    expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth + 1);
  },
};

export const NarrowScrollsSideways: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the five figures in a 360px box: one row that scrolls sideways, each figure at least 96px wide, the scrollbar hidden. The default: a strip never breaks into two rows.',
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <ReqoreStatisticGroup items={FIGURES} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(group.getAttribute('data-narrow')).toBe('true'));
    expect(rowsOf(group)).toBe(1);
    expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
    items(group).forEach((item) =>
      expect(item.getBoundingClientRect().width).toBeGreaterThanOrEqual(95)
    );
  },
};

export const OnAPhone: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders the five figures on a phone (390 px) with a 16px gutter: one row that scrolls sideways inside the strip, every figure at least 96px wide, and nothing past the screen.',
      },
    },
  },
  render: () => (
    <div style={{ padding: '0 16px', maxWidth: PHONE_VIEWPORT.width, boxSizing: 'border-box' }}>
      <ReqoreStatisticGroup items={FIGURES} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await withViewport(PHONE_VIEWPORT.width, PHONE_VIEWPORT.height, async (narrowed) => {
      const group = groupIn(canvasElement);

      await waitFor(() => expect(group.getAttribute('data-narrow')).toBe('true'));
      expect(rowsOf(group)).toBe(1);
      // The strip scrolls inside itself; the page does not.
      expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
      if (narrowed) {
        await waitFor(() =>
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
        );
      }
    });
  },
};

export const ActiveFilterFigure: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a strip whose "Failing" figure is a filter that is on: a 2px line in the info blue under it (blue says a filter is on). The figure is a button that toggles the filter (`onClick`, `aria-pressed`).',
      },
    },
  },
  render: () => (
    <div style={{ width: 960 }}>
      <ReqoreStatisticGroup
        items={FIGURES.map((figure) =>
          figure.label === 'Failing'
            ? {
                ...figure,
                active: true,
                role: 'button',
                tabIndex: 0,
                'aria-pressed': true,
                tooltip: 'Show every workflow again',
              }
            : figure
        )}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);
    const active = await waitFor(() => {
      const item = group.querySelector<HTMLElement>('[data-active="true"]');

      expect(item).toBeTruthy();

      return item!;
    });

    expect(active.textContent).toContain('Failing');
    expect(getComputedStyle(active, '::after').height).toBe('2px');
    expect(group.querySelectorAll('[data-active="true"]')).toHaveLength(1);
  },
};

export const WithoutDividers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the five figures with `dividers={false}`: the same row and the same room between the figures, and no hairline drawn anywhere.',
      },
    },
  },
  render: () => (
    <div style={{ width: 960 }}>
      <ReqoreStatisticGroup items={FIGURES} dividers={false} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(items(group)).toHaveLength(5));
    expect(drawsHairline(group)).toBe(false);
    items(group).forEach((item) => expect(drawsHairline(item)).toBe(false));
  },
};

export const AtMostFiveFigures: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a strip given seven figures: it draws the first five (a strip shows at most five headline figures; the rest belong in the detail) and says so in the console.',
      },
    },
  },
  render: () => (
    <div style={{ width: 960 }}>
      <ReqoreStatisticGroup
        items={[
          ...FIGURES,
          { label: 'Drafts', value: 3 },
          { label: 'Total versions', value: 26 },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(items(group)).toHaveLength(5));
    expect(group.textContent).not.toContain('Drafts');
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the strip at small, normal and big: the figures, their labels and the room around them scale with `size`.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big' fluid>
      {(['small', 'normal', 'big'] as const).map((size) => (
        <div key={size} data-size={size} style={{ width: 960 }}>
          <ReqoreP size='small' style={{ opacity: 0.6, margin: 0 }}>
            {size}
          </ReqoreP>
          <ReqoreStatisticGroup items={FIGURES.slice(0, 4)} size={size} />
        </div>
      ))}
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const height = (size: string) =>
      groupIn(canvasElement, `[data-size="${size}"] .reqore-statistic-group`).getBoundingClientRect()
        .height;

    await waitFor(() => expect(height('small')).toBeGreaterThan(0));
    expect(height('small')).toBeLessThan(height('normal'));
    expect(height('normal')).toBeLessThan(height('big'));
  },
};

export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the strip on a custom theme (`customTheme={{ main: "#0e2a47" }}`): its hairlines are a step off that main colour, not the default theme\'s.',
      },
    },
  },
  render: () => (
    <div style={{ width: 960, padding: 16, background: '#0e2a47' }}>
      <ReqoreStatisticGroup items={FIGURES.slice(0, 3)} customTheme={{ main: '#0e2a47' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(drawsHairline(group)).toBe(true));
    // The hairline is bluish: taken from the custom main colour.
    const [r, , b] = getComputedStyle(group).boxShadow.match(/\d+/g)!.map(Number);

    expect(b).toBeGreaterThan(r);
  },
};

export const InACardDividersBetween: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the strip inside a titled card with `dividers="between"`: hairlines between the figures only. The card\'s title divider and its edge are the strip\'s top and bottom lines, so no second line is drawn 6px inside them.',
      },
    },
  },
  render: () => (
    <div style={{ width: 960 }}>
      <ReqorePanel label='Deliveries, last 30 days' flat={false} padded>
        <ReqoreStatisticGroup items={FIGURES.slice(0, 4)} dividers='between' />
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = groupIn(canvasElement);

    await waitFor(() => expect(items(group)).toHaveLength(4));
    // No line of its own above or below; the lines between the figures stay.
    expect(drawsHairline(group)).toBe(false);
    items(group)
      .slice(1)
      .forEach((item) => expect(drawsHairline(item)).toBe(true));
  },
};
