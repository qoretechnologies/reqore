import { StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
  CONTROL_TEXT_FROM_SIZE,
  SIZE_TO_PX,
  TAG_TEXT_FROM_SIZE,
  TEXT_FROM_SIZE,
} from '../../constants/sizes';
import { IReqoreTheme, IReqoreTypeScale } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreP,
  ReqoreSpan,
  ReqoreTable,
  ReqoreTabs,
  ReqoreTag,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Theme/Type scale',
  component: ReqoreUIProvider,
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A calm scale: 13px running text at line height 1.45, 12px table headers, smaller controls. */
const CALM_TYPE_SCALE: IReqoreTypeScale = {
  text: { micro: 10, tiny: 12, small: 13, normal: 14, big: 16, huge: 20, massive: 28 },
  control: { micro: 10, tiny: 11, small: 12, normal: 13, big: 15, huge: 18, massive: 21 },
  tag: { micro: 10, tiny: 11, small: 12, normal: 13, big: 15, huge: 18, massive: 21 },
  lineHeight: 1.45,
};

const DEFAULT_THEME: Partial<IReqoreTheme> = { main: '#121212' };
const CALM_THEME: Partial<IReqoreTheme> = { main: '#121212', typeScale: CALM_TYPE_SCALE };

const TABLE_DATA = [
  { id: 1, order: 'Order #48213', carrier: 'Parcel', status: 'Shipped' },
  { id: 2, order: 'Order #48214', carrier: 'Freight', status: 'Waiting' },
];

const TABLE_COLUMNS = [
  { dataId: 'order', header: { label: 'Order' }, grow: 2 },
  { dataId: 'carrier', header: { label: 'Carrier' }, grow: 1 },
  { dataId: 'status', header: { label: 'Status' }, grow: 1 },
];

const Specimen = () => (
  <ReqoreControlGroup vertical gapSize='big' fluid>
    <ReqoreP size='small' className='specimen-paragraph'>
      Two labels were printed for one order thirty seconds apart. The second one replaced the
      first at the carrier, so the parcel left with the label the warehouse never saw.
    </ReqoreP>
    <ReqoreP size='small'>
      <ReqoreSpan size='small' className='specimen-span'>
        A span inside the paragraph
      </ReqoreSpan>
    </ReqoreP>
    <ReqoreControlGroup fluid={false}>
      <ReqoreButton size='small' className='specimen-button-small' icon='PlayLine'>
        Resume
      </ReqoreButton>
      <ReqoreButton size='small' intent='info'>
        Resend label
      </ReqoreButton>
      <ReqoreButton className='specimen-button-normal'>Normal button</ReqoreButton>
    </ReqoreControlGroup>
    <ReqoreControlGroup fluid={false}>
      <ReqoreTag size='tiny' label='Duplicate' intent='danger' className='specimen-tag-tiny' />
      <ReqoreTag size='small' label='Carrier: Parcel' className='specimen-tag-small' />
      <ReqoreTag label='L-20931' className='specimen-tag-normal' />
    </ReqoreControlGroup>
    <ReqoreTabs
      size='small'
      className='specimen-tabs'
      activeTab='overview'
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'history', label: 'History' },
        { id: 'labels', label: 'Labels' },
      ]}
    />
    <ReqoreInput
      size='small'
      className='specimen-input'
      value='Resend the label'
      onChange={() => undefined}
    />
    <ReqoreTable
      size='small'
      className='specimen-table'
      columns={TABLE_COLUMNS as any}
      data={TABLE_DATA}
      height={140}
    />
  </ReqoreControlGroup>
);

const Side = ({
  label,
  className,
  theme,
  children,
}: {
  label: string;
  className: string;
  theme: Partial<IReqoreTheme>;
  children: ReactNode;
}) => (
  <div className={className} style={{ padding: 24, flex: '1 1 420px', minWidth: 0 }}>
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReqoreP size='tiny' effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}>
            {label}
          </ReqoreP>
          {children}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

/** Each element the play measures: its selector, the size it renders at, and its scale. */
const MEASURED: {
  name: string;
  selector: string;
  kind: keyof Omit<IReqoreTypeScale, 'lineHeight'>;
  size: keyof typeof TEXT_FROM_SIZE;
}[] = [
  { name: 'paragraph', selector: '.specimen-paragraph', kind: 'text', size: 'small' },
  { name: 'span', selector: '.specimen-span', kind: 'text', size: 'small' },
  { name: 'small button', selector: '.specimen-button-small', kind: 'control', size: 'small' },
  { name: 'normal button', selector: '.specimen-button-normal', kind: 'control', size: 'normal' },
  { name: 'tiny tag', selector: '.specimen-tag-tiny', kind: 'tag', size: 'tiny' },
  { name: 'small tag', selector: '.specimen-tag-small', kind: 'tag', size: 'small' },
  {
    name: 'tab',
    selector: '.specimen-tabs .reqore-tabs-list-item',
    kind: 'control',
    size: 'small',
  },
  { name: 'input', selector: '.specimen-input', kind: 'control', size: 'small' },
  // A table's header cells are one size below the table's: `tiny` for a `small` table.
  {
    name: 'table header cell',
    selector: '.specimen-table .reqore-table-header-cell .reqore-button-text-content.reqore-active',
    kind: 'text',
    size: 'tiny',
  },
  {
    name: 'table cell',
    selector: '.specimen-table .reqore-table-cell',
    kind: 'text',
    size: 'small',
  },
];

const DEFAULT_SCALE = {
  text: TEXT_FROM_SIZE,
  control: CONTROL_TEXT_FROM_SIZE,
  tag: TAG_TEXT_FROM_SIZE,
};

/** The fixed-height boxes the line height must not grow, and the height each keeps. */
const FIXED_HEIGHTS: [string, string][] = [
  ['.specimen-button-small', `${SIZE_TO_PX.small}px`],
  ['.specimen-button-normal', `${SIZE_TO_PX.normal}px`],
  ['.specimen-input', `${SIZE_TO_PX.small}px`],
];

const find = (root: HTMLElement, selector: string) => {
  const element = root.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`${selector} is not rendered`);
  }

  return element;
};

/** How far the centre of `inner`'s text sits from the centre of `outer`, in px. */
const offCentre = (outer: HTMLElement, inner: HTMLElement) => {
  const o = outer.getBoundingClientRect();
  const i = inner.getBoundingClientRect();

  return Math.abs(o.top + o.height / 2 - (i.top + i.height / 2));
};

export const CalmScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a paragraph, a span, buttons, tags, tabs, an input and a small table twice: on the left at Reqore's own type scale, on the right under `theme.typeScale` with 13px running text at line height 1.45, 12px controls and 12px table headers. Buttons, inputs, tags and table rows keep their heights on both sides, with their text centred.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', background: '#0c0c0e' }}>
      <Side label="Reqore's own scale (default)" className='story-default' theme={DEFAULT_THEME}>
        <Specimen />
      </Side>
      <Side label='theme.typeScale' className='story-calm' theme={CALM_THEME}>
        <Specimen />
      </Side>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sides = await waitFor(() => ({
      default: find(canvasElement, '.story-default'),
      calm: find(canvasElement, '.story-calm'),
      // Wait for the table, the last thing to mount, on both sides.
      tables: [
        find(canvasElement, '.story-default .specimen-table .reqore-table-cell'),
        find(canvasElement, '.story-calm .specimen-table .reqore-table-cell'),
      ],
    }));

    for (const { name, selector, kind, size } of MEASURED) {
      await expect(
        getComputedStyle(find(sides.calm, selector)).fontSize,
        `${name} on the calm scale`
      ).toBe(`${CALM_TYPE_SCALE[kind][size]}px`);
      await expect(
        getComputedStyle(find(sides.default, selector)).fontSize,
        `${name} on the default scale`
      ).toBe(`${DEFAULT_SCALE[kind][size]}px`);
    }

    // Running text takes the theme's line height on the calm side; the default names none.
    await expect(
      parseFloat(getComputedStyle(find(sides.calm, '.specimen-paragraph')).lineHeight),
      'paragraph line height on the calm scale'
    ).toBeCloseTo(13 * 1.45, 1);
    await expect(
      getComputedStyle(find(sides.default, '.specimen-paragraph')).lineHeight,
      'paragraph line height on the default scale'
    ).toBe('normal');

    // A box with a fixed height keeps it, and its text stays centred in it, on both sides.
    for (const side of [sides.default, sides.calm]) {
      for (const [selector, height] of FIXED_HEIGHTS) {
        await expect(getComputedStyle(find(side, selector)).height, selector).toBe(height);
      }

      /* A button's label slides in (a transform on the label itself), so its line box is
         measured on the label's wrapper. */
      for (const [box, text] of [
        ['.specimen-button-small', '.reqore-button-text-content.reqore-active'],
        ['.specimen-button-normal', '.reqore-button-text-content.reqore-active'],
      ]) {
        const outer = find(side, box);
        const label = find(outer, text).parentElement as HTMLElement;

        await expect(offCentre(outer, label), `${box} label centred`).toBeLessThan(1.5);
      }

      for (const box of ['.specimen-tag-tiny', '.specimen-tag-small', '.specimen-tag-normal']) {
        const outer = find(side, box);

        await expect(
          offCentre(outer, find(outer, '.reqore-tag-content')),
          `${box} label centred`
        ).toBeLessThan(1.5);
      }

      const tableRow = find(side, '.specimen-table .reqore-table-row');
      await expect(Math.round(tableRow.getBoundingClientRect().height), 'table row').toBe(
        SIZE_TO_PX.small + 1
      );
    }
  },
};
