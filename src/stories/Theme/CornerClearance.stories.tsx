import { StoryObj } from '@storybook/react';
import { CSSProperties } from 'react';
import { expect } from 'storybook/test';
import { TSizes } from '../../constants/sizes';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreAccordion,
  ReqoreCallout,
  ReqoreCollection,
  ReqoreFeatureCard,
  ReqoreP,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreTestimonial,
} from '../../index';
import { StoryMeta } from '../utils';
import {
  expectLabelsClearTheirCorners,
  expectPanelsShareOneLeftEdge,
} from '../utils/cornerClearance';
import { requiredElement } from '../utils/required';

/** The calm theme's one corner for every card (the admin portal's and the IDE's). */
const THEME_RADIUS = 14;

const meta = {
  title: 'Theme/Corner clearance',
  component: ReqoreUIProvider,
  parameters: {
    docs: {
      description: {
        component:
          'What a rounded container draws at its corner starts clear of it: a panel\'s title, an accordion\'s header, a callout\'s icon and label, a tile\'s text start at least the corner\'s radius in from the container\'s edge (`clearCorner` in `constants/sizes`), whatever the size\'s own padding — the theme\'s `panel.radius` or a `radiusSize` decides the corner, and the size decided the padding, so a 14px corner on a small panel used to put its title 7px in. A panel keeps one left edge: its padded content and its bottom actions move in with its title.',
      },
    },
  },
  args: {
    otherThemeOptions: { panel: { radius: THEME_RADIUS } },
  },
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES: TSizes[] = ['micro', 'small', 'normal', 'big'];

/** Each row's corner: the theme's, or a `radiusSize` from the pronounced scale. */
const CORNERS: { name: string; radiusSize?: TSizes }[] = [
  { name: `theme.panel.radius (${THEME_RADIUS}px)` },
  { name: 'radiusSize big (18px)', radiusSize: 'big' },
  { name: 'radiusSize huge (26px)', radiusSize: 'huge' },
];

const GRID: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 12,
  alignItems: 'start',
};

const ROWS: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };

export const PanelTitles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders panels at four sizes (micro to big), with the theme\'s 14px corner and with `radiusSize` big (18px) and huge (26px), bordered and flat: every title (and its icon) starts at least its panel\'s corner radius in from the panel\'s edge, and the content and the bottom action under it start on the same left edge. The last row is the control: a flat, transparent panel draws no corner and keeps its title flush, and `padded={false}` content stays flush with the panel\'s edge.',
      },
    },
  },
  render: () => (
    <div style={ROWS}>
      {CORNERS.map(({ name, radiusSize }) => (
        <div key={name} style={ROWS}>
          <ReqoreP size='small'>{name}</ReqoreP>
          <div style={GRID}>
            {SIZES.flatMap((size) =>
              [false, true].map((flat) => (
                <ReqorePanel
                  key={`${size}-${flat}`}
                  className='corner-clearance-case'
                  size={size}
                  radiusSize={radiusSize}
                  flat={flat}
                  label={`Weekly revenue · ${size}`}
                  icon={flat ? 'MoneyDollarCircleLine' : undefined}
                  bottomActions={[{ label: 'Open', icon: 'ArrowRightLine', position: 'left' }]}
                >
                  <ReqoreP size={size}>{flat ? 'Flat' : 'Bordered'}</ReqoreP>
                </ReqorePanel>
              ))
            )}
          </div>
        </div>
      ))}
      <ReqoreP size='small'>No corner, and content asked to be flush</ReqoreP>
      <div style={GRID}>
        <ReqorePanel
          className='corner-clearance-bare'
          size='small'
          flat
          transparent
          label='No surface, no edge'
        >
          <ReqoreP size='small'>Its title stays flush.</ReqoreP>
        </ReqorePanel>
        <ReqorePanel className='corner-clearance-flush' size='small' padded={false} label='Photo'>
          <div className='corner-clearance-bleed' style={{ height: 60, background: '#3a3a44' }} />
        </ReqorePanel>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.corner-clearance-case')).toHaveLength(24);
    // Every case is measured — none is skipped as cornerless — and every one clears its corner.
    await expect(expectLabelsClearTheirCorners(canvasElement)).toBe(24 + 1);
    // ...and has one left edge: its content and its bottom action start where its title does.
    await expect(expectPanelsShareOneLeftEdge('.corner-clearance-case', canvasElement)).toBe(24);

    // A container that draws no corner keeps its title where its padding puts it.
    const bare = requiredElement('.corner-clearance-bare', 'the cornerless panel', canvasElement);
    const bareTitle = requiredElement('.reqore-panel-title', 'its title bar', bare);
    await expect(getComputedStyle(bareTitle).paddingLeft).toBe('0px');

    // `padded={false}` is about the content, which stays flush with the panel's inner edge.
    const flush = requiredElement('.corner-clearance-flush', 'the unpadded panel', canvasElement);
    const bleed = requiredElement('.corner-clearance-bleed', 'its full-bleed content', flush);
    const border = parseFloat(getComputedStyle(flush).borderLeftWidth) || 0;
    await expect(
      bleed.getBoundingClientRect().left - flush.getBoundingClientRect().left
    ).toBeCloseTo(border, 1);
  },
};

export const OtherContainers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the other containers that draw at a corner, small, with the theme\'s 14px corner or a `radiusSize` well above their padding: callouts (micro and tiny, accent left and top), an accordion, a statistic, a feature card, a testimonial, and a stacked collection (its square rows clipped into one block that takes the theme\'s corner). Each starts its icon and its text at least its corner radius in from its edge; each stacked row\'s body starts where its title does.',
      },
    },
  },
  render: () => (
    <div style={GRID}>
      <ReqoreCallout size='micro' icon='InformationLine' label='Micro callout' intent='info' />
      <ReqoreCallout
        size='tiny'
        icon='InformationLine'
        label='Tiny callout, accent on top'
        accentPosition='top'
      />
      <ReqoreAccordion
        size='small'
        items={[
          { label: 'First question', content: 'An answer.' },
          { label: 'Second question', content: 'Another answer.' },
        ]}
      />
      <ReqoreStatistic
        size='small'
        rounded
        flat={false}
        radiusSize='massive'
        paddingSize='micro'
        label='Orders'
        value={1284}
      />
      <ReqoreFeatureCard
        size='small'
        radiusSize='huge'
        paddingSize='micro'
        label='Connect a source'
        description='Pick where the orders come from.'
      />
      <ReqoreTestimonial
        size='small'
        radiusSize='massive'
        paddingSize='micro'
        quote='It just works.'
        author='Dana'
        role='Operations'
      />
      <ReqoreCollection
        className='corner-clearance-stack'
        stacked
        showAs='list'
        filterable={false}
        sortable={false}
        zoomable={false}
        showLayoutSwitch={false}
        minimal
        transparent
        flat
        padded={false}
        items={[
          { label: 'Orders', content: 'Every order today.' },
          { label: 'Refunds', content: 'What went back.' },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Two callouts, the accordion, the statistic, the feature card and the testimonial — and the
    // testimonial's attribution row is not a container of its own.
    await expect(expectLabelsClearTheirCorners(canvasElement)).toBe(6);

    // A stacked collection draws its corner with its rows: the block takes the theme's 14px
    // corner, and the first row's title starts at least that far in.
    const stack = requiredElement(
      '.corner-clearance-stack .reqore-collection-content',
      'the stacked rows',
      canvasElement
    );
    await expect(getComputedStyle(stack).borderTopLeftRadius).toBe(`${THEME_RADIUS}px`);
    const firstTitle = requiredElement(
      '.reqore-collection-item .reqore-panel-title-header',
      "the first row's title",
      stack
    );
    const range = document.createRange();
    range.selectNodeContents(firstTitle);
    await expect(
      range.getBoundingClientRect().left - stack.getBoundingClientRect().left
    ).toBeGreaterThanOrEqual(THEME_RADIUS - 0.5);
    // Each row has one left edge: its body starts where its title does.
    await expect(expectPanelsShareOneLeftEdge('.reqore-collection-item', stack)).toBe(2);

  },
};
