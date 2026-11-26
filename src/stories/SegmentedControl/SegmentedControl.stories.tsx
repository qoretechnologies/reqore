import { StoryFn, StoryObj } from '@storybook/react';
import { getContrast, getLuminance, parseToRgb } from 'polished';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import ReqoreSegmentedControl, {
  IReqoreSegmentedControlItem,
  IReqoreSegmentedControlProps,
} from '../../components/SegmentedControl';
import { ReqoreControlGroup, ReqoreModal, ReqorePanel } from '../../index';
import { StoryMeta } from '../utils';
import {
  DERIVED,
  LIGHT_PAGE,
  Surface,
  THEMED_SURFACE,
  THEMED_SURFACE_LIGHT,
} from '../utils/themedSurface';

const meta = {
  title: 'Form/SegmentedControl',
  component: ReqoreSegmentedControl,
} as StoryMeta<typeof ReqoreSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: IReqoreSegmentedControlProps['items'] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const InteractiveTemplate: StoryFn<IReqoreSegmentedControlProps> = (args) => {
  const [value, setValue] = useState(args.value ?? 'day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={args.items || defaultItems}
      value={value}
      onChange={setValue}
    />
  );
};

/**
 * The highlight is drawn by an absolutely positioned child and placed by measurement, so
 * only a real layout can say whether it sits under the active item. It did not, by
 * `padding - border` px, from the component's first release until the measurement was
 * taken from the padding edge; this is the assertion that keeps it there.
 */
const expectHighlightUnderActiveItem = async () => {
  await waitFor(() => {
    const control = document.querySelector('.reqore-segmented-control')!;
    const highlight = control.querySelector('.reqore-segmented-control-indicator')!;
    const active = control.querySelector('button[aria-checked="true"]')!;
    const a = highlight.getBoundingClientRect();
    const b = active.getBoundingClientRect();
    expect(Math.abs(a.left - b.left)).toBeLessThan(0.5);
    expect(Math.abs(a.top - b.top)).toBeLessThan(0.5);
    expect(Math.abs(a.width - b.width)).toBeLessThan(0.5);
    expect(Math.abs(a.height - b.height)).toBeLessThan(0.5);
  });
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its default configuration.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
  },
  play: expectHighlightUnderActiveItem,
};

export const Pill: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its pill shape.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    pill: true,
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in its flat variant.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    flat: true,
  },
  // No border: the one case where the old measurement was off by the whole padding.
  play: expectHighlightUnderActiveItem,
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with fluid set so it fills the available horizontal space.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    fluid: true,
  },
};

export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with icons on the items.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('list');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'list', label: 'List', icon: 'ListUnordered' },
          { value: 'grid', label: 'Grid', icon: 'GridFill' },
          { value: 'table', label: 'Table', icon: 'Table2' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl showing only an icon (no label).',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('list');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'list', icon: 'ListUnordered', tooltip: 'List view' },
          { value: 'grid', icon: 'GridFill', tooltip: 'Grid view' },
          { value: 'table', icon: 'Table2', tooltip: 'Table view' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => {
    const sizes = ['micro', 'tiny', 'small', 'normal', 'big', 'huge', 'massive'] as const;

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        {sizes.map((size) => (
          <SizeDemo key={size} size={size} args={args} />
        ))}
      </ReqoreControlGroup>
    );
  },
};

const SizeDemo = ({
  size,
  args,
}: {
  size: IReqoreSegmentedControlProps['size'];
  args: IReqoreSegmentedControlProps;
}) => {
  const [value, setValue] = useState('day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={defaultItems}
      size={size}
      value={value}
      onChange={setValue}
    />
  );
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='big'>
      <IntentDemo args={args} />
      <IntentDemo args={args} intent='info' />
      <IntentDemo args={args} intent='success' />
      <IntentDemo args={args} intent='warning' />
      <IntentDemo args={args} intent='danger' />
    </ReqoreControlGroup>
  ),
};

const IntentDemo = ({
  args,
  intent,
}: {
  args: IReqoreSegmentedControlProps;
  intent?: IReqoreSegmentedControlProps['intent'];
}) => {
  const [value, setValue] = useState('day');

  return (
    <ReqoreSegmentedControl
      {...args}
      items={defaultItems}
      value={value}
      onChange={setValue}
      intent={intent}
    />
  );
};

export const ActiveIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with an intent applied to the active state.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={defaultItems}
        value={value}
        onChange={setValue}
        activeIntent='info'
      />
    );
  },
};

export const PerItemActiveIntent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with a per-item active intent.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('success');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'success', label: 'Success', activeIntent: 'success', icon: 'CheckLine' },
          { value: 'warning', label: 'Warning', activeIntent: 'warning', icon: 'AlertLine' },
          { value: 'danger', label: 'Danger', activeIntent: 'danger', icon: 'CloseLine' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const DisabledItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with individual items marked disabled.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week', disabled: true },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year', disabled: true },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const FullyDisabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl fully disabled.',
      },
    },
  },
  render: InteractiveTemplate,
  args: {
    value: 'day',
    items: defaultItems,
    disabled: true,
  },
};

export const AllowDeselect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl where the selected option can be deselected.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>('day');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={defaultItems}
        value={value}
        onChange={setValue}
        allowDeselect
      />
    );
  },
};

export const WithBadges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl with multiple badges.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('inbox');

    return (
      <ReqoreSegmentedControl
        {...args}
        items={[
          { value: 'inbox', label: 'Inbox', icon: 'MailLine', badge: 12 },
          { value: 'sent', label: 'Sent', icon: 'SendPlaneLine', badge: 3 },
          { value: 'drafts', label: 'Drafts', icon: 'DraftLine' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SegmentedControl in a responsive layout.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('overview');
    const manyItems = [
      { value: 'overview', label: 'Overview', icon: 'DashboardLine' as const },
      { value: 'analytics', label: 'Analytics', icon: 'BarChartLine' as const },
      { value: 'reports', label: 'Reports', icon: 'FileTextLine' as const },
      { value: 'settings', label: 'Settings', icon: 'Settings3Line' as const },
      { value: 'users', label: 'Users', icon: 'UserLine' as const },
      { value: 'billing', label: 'Billing', icon: 'BankCardLine' as const },
    ];

    return (
      <ReqoreControlGroup vertical gapSize='big'>
        <div style={{ width: '100%' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
        <div style={{ width: '400px' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
        <div style={{ width: '250px' }}>
          <ReqoreSegmentedControl
            {...args}
            items={manyItems}
            value={value}
            onChange={setValue}
            fluid
          />
        </div>
      </ReqoreControlGroup>
    );
  },
};

// `data-value` lets the play find each segment by its value.
const FILTER_ITEMS: IReqoreSegmentedControlProps['items'] = (
  [
    ['all', 'All', '13'],
    ['failing', 'Failing', '3'],
    ['look', 'Needs a look', '4'],
    ['healthy', 'Healthy', '3'],
    ['idle', 'No orders', '1'],
    ['disabled', 'Disabled', '1'],
    ['drafts', 'Drafts', '1'],
  ] as const
).map(([value, label, count]) => ({
  value,
  label,
  badge: { label: count, appearance: 'text' as const },
  props: { 'data-value': value },
}));

export const FoldToFit: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a seven-segment filter with counts, folding to fit the room its slot is given: at full width every segment shows at its own width; at 520px and 320px the segments that do not fit move into "More", each with its count. Asserts that no segment is cut off at the control\'s edge and that the narrow controls fold. Then picks a folded segment ("Drafts"): "More" takes its label and its count and is marked the way a visible selection is — the same highlight, never a fill.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('all');

    return (
      <ReqoreControlGroup vertical gapSize='big' fluid>
        {[undefined, 520, 320].map((width) => (
          <div key={width ?? 'full'} style={{ display: 'flex', width: width ?? '100%' }}>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <ReqoreSegmentedControl
                {...args}
                items={FILTER_ITEMS}
                value={value}
                onChange={setValue}
                foldToFit
                overflowLabel='More'
              />
            </div>
          </div>
        ))}
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const controls = () =>
      Array.from(canvasElement.querySelectorAll<HTMLElement>('.reqore-segmented-control'));
    const width = (element: Element) => element.getBoundingClientRect().width;
    const itemsOf = (control: HTMLElement) =>
      Array.from(control.querySelectorAll<HTMLElement>('.reqore-segmented-control-item'));
    // Folds only what does not fit: nothing is cut off at the control's edge, and the first
    // folded segment (at the width the full row draws it) would not have fitted beside the
    // ones shown. The frame is 3px of padding and a 1px border on each side.
    const expectFoldsOnlyWhatDoesNotFit = () => {
      const [full, ...narrow] = controls();
      expect(narrow.length).toBe(2);
      const drawn = Object.fromEntries(
        itemsOf(full).map((item) => [item.dataset.value, width(item.parentElement!)])
      );
      for (const control of narrow) {
        const room = width(control.parentElement!) - 8;
        const shown = itemsOf(control).filter(
          (item) => !item.classList.contains('reqore-segmented-control-more')
        );
        const more = control.querySelector('.reqore-segmented-control-more');
        expect(more).toBeTruthy();
        const used =
          shown.reduce((sum, item) => sum + width(item.parentElement!), 0) +
          width(more!.parentElement!);
        expect(used).toBeLessThanOrEqual(room + 0.5);
        const firstFolded = FILTER_ITEMS[shown.length].value;
        expect(used + drawn[firstFolded]).toBeGreaterThan(room);
      }
    };

    await waitFor(() => expectFoldsOnlyWhatDoesNotFit());

    // Pick a folded segment: "More" takes its label, and the fold is measured again with it.
    const more = controls()[1].querySelector<HTMLElement>('.reqore-segmented-control-more')!;
    fireEvent.mouseEnter(more);
    fireEvent.click(more);
    const drafts = await waitFor(() => {
      const item = Array.from(document.querySelectorAll<HTMLElement>('.reqore-menu-item')).find(
        (menuItem) => menuItem.textContent?.includes('Drafts')
      );
      expect(item).toBeTruthy();
      return item!;
    });
    fireEvent.click(drafts);
    await waitFor(() => {
      expect(controls()[1].querySelector('.reqore-segmented-control-more')?.textContent).toContain(
        'Drafts'
      );
      expectFoldsOnlyWhatDoesNotFit();
    });

    // A folded selection is marked the way a visible one is: the highlight moves under "More",
    // and "More" itself stays unfilled — never a second look for the same state.
    await waitFor(() => {
      const control = controls()[1];
      const more = control.querySelector<HTMLElement>('.reqore-segmented-control-more')!;
      const indicator = control.querySelector<HTMLElement>('.reqore-segmented-control-indicator');
      expect(indicator).toBeTruthy();
      const moreRect = more.parentElement!.getBoundingClientRect();
      const indicatorRect = indicator!.getBoundingClientRect();
      expect(Math.abs(indicatorRect.left - moreRect.left)).toBeLessThan(1);
      expect(Math.abs(indicatorRect.width - moreRect.width)).toBeLessThan(1);
      expect(getComputedStyle(more).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      // and it keeps the segment's count, as the visible "Drafts 1" does
      expect(more.textContent).toContain('1');
    });
  },
};

const METHOD_FILTERS: IReqoreSegmentedControlProps['items'] = (
  [
    ['all', 'All', '5'],
    ['public', 'Public', '4'],
    ['internal', 'Internal', '1'],
  ] as const
).map(([value, label, count]) => ({
  value,
  label,
  badge: { label: count, appearance: 'text' as const },
}));

export const FoldToFitBesideATitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a folding filter as the action of a 330px panel titled "Methods", the width of a section heading on a phone. The title keeps its whole word and the filter folds into the room left beside it, the bar kept on one line (`wrapActionsBelowTitle={false}`). Asserts the title is not squeezed and the filter folded: a fold slot used to report the full row of segments as the least it could do with, which left the title 0px wide.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState('all');

    return (
      <div style={{ width: 330 }}>
        <ReqorePanel
          label='Methods'
          transparent
          flat
          minimal
          padded={false}
          collapsible
          responsiveActions={false}
          // the filter folds into the room beside the title, the bar kept on one line
          wrapActionsBelowTitle={false}
          actions={[
            {
              as: ReqoreSegmentedControl,
              props: {
                ...args,
                items: METHOD_FILTERS,
                value,
                onChange: setValue,
                foldToFit: true,
                overflowLabel: 'More',
              },
            },
          ]}
        >
          {null}
        </ReqorePanel>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const title = canvasElement.querySelector<HTMLElement>('.reqore-panel-title-header')!;
      const heading = title.querySelector<HTMLElement>('.reqore-heading')!;
      // The whole word, on one line: not squeezed below what it needs.
      expect(title.getBoundingClientRect().width).toBeGreaterThanOrEqual(heading.scrollWidth - 0.5);
      expect(heading.getBoundingClientRect().height).toBeLessThan(30);
      // and the filter folded into what was left, rather than holding the row
      expect(canvasElement.querySelector('.reqore-segmented-control-more')).toBeTruthy();
    });
  },
};

const QOG_FILTERS = (
  [
    ['all', 'All'],
    ['running', 'Running'],
    ['failing', 'Failing'],
    ['never-run', 'Never run'],
    ['disabled', 'Disabled'],
  ] as const
).map(([value, label]) => ({ value, label }));

/**
 * Names the folded segments, as `overflowLabel` worded from them: the first one and how many more. A label listing
 * every folded segment would be as wide as they are, so folding would never make room; this one stays about one
 * segment wide.
 */
const nameTheFolded = (folded: { label?: string | number }[]) =>
  folded.length > 1 ? `${folded[0].label} +${folded.length - 1}` : String(folded[0]?.label ?? '');

export const FoldNamesWhatItHolds: Story = {
  tags: ['touch'],
  parameters: {
    docs: {
      description: {
        story: `Renders a five-segment filter on a phone (390px) whose overflow label is worded from the segments
          folded into it: the first one and how many more ("Never run +1"). The segments that do not fit fold behind
          a button that says what it holds, never a bare "More", and the control still fits its row.`,
      },
    },
    qlip: { viewport: { width: 390, height: 844 } },
  },
  render: (args) => {
    const [value, setValue] = useState('all');

    return (
      <div style={{ display: 'flex', boxSizing: 'border-box', width: 340, maxWidth: '100%' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <ReqoreSegmentedControl
            {...args}
            items={QOG_FILTERS}
            value={value}
            onChange={setValue}
            foldToFit
            overflowLabel={nameTheFolded}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const control = canvasElement.querySelector<HTMLElement>('.reqore-segmented-control')!;
      const more = control.querySelector<HTMLElement>('.reqore-segmented-control-more');
      expect(more).toBeTruthy();
      const shown = Array.from(
        control.querySelectorAll<HTMLElement>('.reqore-segmented-control-item')
      ).filter((item) => !item.classList.contains('reqore-segmented-control-more'));
      const folded = QOG_FILTERS.slice(shown.length);
      expect(folded.length).toBeGreaterThan(0);
      // the button names what it holds, not "More"
      expect(more!.textContent).toContain(nameTheFolded(folded));
      expect(more!.textContent).not.toContain('More');
      // and the control still fits its row
      expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(
        control.parentElement!.getBoundingClientRect().right + 0.5
      );
    });
  },
};

const ATTENTION_FILTERS = (
  [
    ['all', 'All', 48],
    ['running', 'Running', 21],
    ['failing', 'Failing', 16],
    ['never-run', 'Never run', 7],
    ['disabled', 'Disabled', 3],
    ['archived', 'Archived', 1],
  ] as const
).map(([value, label, count]) => ({
  value,
  label,
  // the count that needs a person is red; the rest are plain figures
  badge:
    value === 'failing'
      ? { label: count, appearance: 'text' as const, intent: 'danger' as const }
      : { label: count, appearance: 'text' as const },
  props: { 'data-value': value },
}));

export const FoldKeepsTheCountThatNeedsAttention: Story = {
  tags: ['touch'],
  parameters: {
    docs: {
      description: {
        story: `Renders a six-segment filter on a phone (390px) in a 360px slot, its "Failing 16" count in red. The
          segments that do not fit fold behind "More", but the one whose count needs attention folds last:
          "Failing 16" stays on screen beside "All", and the plain segments after and between them fold first.`,
      },
    },
    qlip: { viewport: { width: 390, height: 844 } },
  },
  render: (args) => {
    const [value, setValue] = useState('all');

    return (
      <div style={{ display: 'flex', boxSizing: 'border-box', width: 360, maxWidth: '100%' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <ReqoreSegmentedControl
            {...args}
            items={ATTENTION_FILTERS}
            value={value}
            onChange={setValue}
            foldToFit
            overflowLabel={nameTheFolded}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const control = canvasElement.querySelector<HTMLElement>('.reqore-segmented-control')!;
      expect(control.querySelector('.reqore-segmented-control-more')).toBeTruthy();
      const shown = Array.from(
        control.querySelectorAll<HTMLElement>('.reqore-segmented-control-item[data-value]')
      ).map((item) => item.dataset.value);
      // the red count and the chosen segment stay on screen; a plain one between them folded
      expect(shown).toContain('failing');
      expect(shown).toContain('all');
      expect(shown).not.toContain('running');
      expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(
        control.parentElement!.getBoundingClientRect().right + 0.5
      );
    });
  },
};

/* ------------------------------------------------------------------------------------------------
 * Per-item props
 * ---------------------------------------------------------------------------------------------- */

const CYCLE_ITEMS: IReqoreSegmentedControlProps['items'] = [
  {
    value: 'monthly',
    label: 'Monthly',
    props: { 'data-track-click': 'pricing-cycle', 'data-track-label': 'monthly' },
  },
  {
    value: 'yearly',
    label: 'Yearly',
    badge: '-20%',
    props: { 'data-track-click': 'pricing-cycle', 'data-track-label': 'yearly' },
  },
];

const VIEW_ITEMS: IReqoreSegmentedControlProps['items'] = [
  { value: 'list', icon: 'ListCheck', props: { 'aria-label': 'List view' } },
  { value: 'grid', icon: 'LayoutGridLine', props: { 'aria-label': 'Grid view' } },
  { value: 'board', icon: 'LayoutColumnLine', props: { 'aria-label': 'Board view' } },
];

export const ItemProps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a billing-cycle control whose segments carry `data-track-*` attributes through their `props`, and an icon-only view switcher whose segments are named by an `aria-label` each. Clicking Yearly selects it; the segments stay a radio group.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <InteractiveTemplate items={CYCLE_ITEMS} value='monthly' pill />
      <InteractiveTemplate items={VIEW_ITEMS} value='grid' />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const [cycle, view] = Array.from(
      canvasElement.querySelectorAll('.reqore-segmented-control')
    ) as HTMLElement[];
    const yearly = cycle.querySelector('[data-track-label="yearly"]') as HTMLElement;

    await expect(cycle.querySelectorAll('[data-track-click="pricing-cycle"]')).toHaveLength(2);
    await expect(yearly.getAttribute('role')).toBe('radio');
    await expect(yearly.getAttribute('aria-checked')).toBe('false');

    yearly.click();
    await waitFor(() => expect(yearly.getAttribute('aria-checked')).toBe('true'));

    const names = Array.from(view.querySelectorAll('[role="radio"]')).map((segment) =>
      segment.getAttribute('aria-label')
    );
    await expect(names).toEqual(['List view', 'Grid view', 'Board view']);
  },
};

export const InsideModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the control in a modal, which zooms in from half size as it opens. The control measures its highlight while that zoom runs; once the modal has opened, the highlight sits exactly under Week, as wide as it.',
      },
    },
  },
  render: (args) => (
    <ReqoreModal isOpen label='Report period' width='420px'>
      <InteractiveTemplate {...args} />
    </ReqoreModal>
  ),
  args: {
    value: 'week',
    items: defaultItems,
  },
  play: async () => {
    // Wait for the zoom to end: the active item is drawn at its layout width again. Before
    // the highlight was measured in layout pixels, it kept the half size it was measured at.
    await waitFor(
      () => {
        const active = document.querySelector<HTMLElement>(
          '.reqore-segmented-control button[aria-checked="true"]'
        )!;
        expect(Math.abs(active.getBoundingClientRect().width - active.offsetWidth)).toBeLessThan(
          0.5
        );
      },
      { timeout: 3000 }
    );
    await expectHighlightUnderActiveItem();
  },
};

/** The same controls on a panel, in each theme the chosen segment has to read in. */
const PANEL_SURFACES = [
  { className: 'story-default', label: 'Derived from main (default)', theme: DERIVED },
  { className: 'story-calm', label: 'Calm theme, dark', theme: THEMED_SURFACE },
  {
    className: 'story-calm-light',
    label: 'Calm theme, light',
    theme: THEMED_SURFACE_LIGHT,
    page: LIGHT_PAGE,
  },
] as const;

const MATCH_ITEMS: IReqoreSegmentedControlItem[] = [
  { value: 'any', label: 'Any condition' },
  { value: 'all', label: 'All conditions' },
];

const STATUS_ITEMS: IReqoreSegmentedControlItem[] = [
  { value: 'all', label: 'All' },
  { value: 'failing', label: 'Failing', icon: 'ErrorWarningLine' },
  { value: 'healthy', label: 'Healthy', icon: 'CheckLine' },
];

const ControlsOnAPanel = () => {
  const [period, setPeriod] = useState<string | undefined>('week');
  const [match, setMatch] = useState<string | undefined>('all');
  const [status, setStatus] = useState<string | undefined>('failing');

  return (
    <ReqorePanel
      label='Report period'
      contentStyle={{ display: 'flex', flexFlow: 'column', alignItems: 'flex-start', gap: 12 }}
    >
      <ReqoreSegmentedControl
        className='story-period'
        items={defaultItems}
        value={period}
        onChange={setPeriod}
      />
      <ReqoreSegmentedControl
        className='story-match'
        fitSize
        items={MATCH_ITEMS}
        value={match}
        onChange={setMatch}
      />
      <ReqoreSegmentedControl
        className='story-status'
        fitSize
        activeIntent='info'
        items={STATUS_ITEMS}
        value={status}
        onChange={setStatus}
      />
    </ReqorePanel>
  );
};

const CONTROLS = ['story-period', 'story-match', 'story-status'] as const;

/** `#1c1c20` as the browser reports it: `rgb(28, 28, 32)`. */
const rgbString = (color: string) => {
  const { red, green, blue } = parseToRgb(color);
  return `rgb(${red}, ${green}, ${blue})`;
};

const measureChosenSegment = (surface: Element, control: string) => {
  const root = surface.querySelector(`.${control}`)!;
  const thumb = root.querySelector('.reqore-segmented-control-indicator')!;
  const chosen = root.querySelector('button[aria-checked="true"]')!;
  const other = root.querySelector('button[aria-checked="false"]')!;
  const style = (element: Element) => getComputedStyle(element);

  return {
    track: style(root).backgroundColor,
    trackEdge: style(root).borderTopColor,
    thumb: style(thumb).backgroundColor,
    thumbEdge: style(thumb).borderTopColor,
    thumbEdgeWidth: style(thumb).borderTopWidth,
    chosenText: style(chosen).color,
    otherText: style(other).color,
    otherIcon: other.querySelector('.reqore-icon')
      ? style(other.querySelector('.reqore-icon')!).color
      : undefined,
  };
};

export const TheChosenSegmentReadsOnAPanel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Segmented controls on a panel, in the default theme and in a calm theme that names its panel and button surfaces (dark and light); the last one narrows a list, so its chosen segment has an intent. In the calm theme each control sits on the button surface, edged with the panel hairline. The chosen segment is a step lighter than the control, edged in a line that stands 3:1 against it (in the intent where it has one), and the other segments say their words in a quieter grey. The default theme draws them as before.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {PANEL_SURFACES.map((surface) => (
        <Surface key={surface.className} {...surface}>
          <ControlsOnAPanel />
        </Surface>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('.reqore-segmented-control-indicator').length
      ).toBe(PANEL_SURFACES.length * CONTROLS.length)
    );

    for (const { className, theme } of PANEL_SURFACES) {
      const surface = canvasElement.querySelector(`.${className}`)!;

      for (const control of CONTROLS) {
        const seen = measureChosenSegment(surface, control);
        const where = `${control} in ${className}`;

        if (!theme.panel) {
          // The default theme keeps the look derived from main: the thumb is main, unedged.
          await expect(seen.thumb, `${where}: thumb`).toBe('rgb(18, 18, 18)');
          await expect(seen.thumbEdgeWidth, `${where}: thumb edge`).toBe('0px');
          continue;
        }

        await expect(seen.track, `${where}: the track is the button surface`).toBe(
          rgbString(theme.buttons!.main!)
        );
        await expect(seen.trackEdge, `${where}: edged with the panel hairline`).toBe(
          rgbString(theme.panel.border!)
        );
        await expect(
          getLuminance(seen.thumb),
          `${where}: the thumb is a step lighter than its track`
        ).toBeGreaterThan(getLuminance(seen.track));
        await expect(seen.thumbEdgeWidth, `${where}: the thumb is edged`).toBe('1px');
        await expect(
          getContrast(seen.thumbEdge, seen.track),
          `${where}: the thumb's edge stands 3:1 against the track`
        ).toBeGreaterThanOrEqual(3);
        if (control === 'story-status') {
          // Words in an intent read on the thumb, on a light theme as on a dark one.
          await expect(
            getContrast(seen.chosenText, seen.thumb),
            `${where}: the chosen words in their intent read on the thumb`
          ).toBeGreaterThanOrEqual(4.5);
        } else {
          await expect(
            getContrast(seen.chosenText, seen.thumb),
            `${where}: the chosen words are the bright ones`
          ).toBeGreaterThan(getContrast(seen.otherText, seen.track));
        }
        if (seen.otherIcon) {
          await expect(seen.otherIcon, `${where}: an icon follows its words`).toBe(
            seen.otherText
          );
        }
      }

      if (theme.panel) {
        // A narrowing filter's chosen segment is edged and worded in its intent, not in grey.
        const { thumbEdge, chosenText } = measureChosenSegment(surface, 'story-status');
        for (const [part, color] of [
          ['edge', thumbEdge],
          ['words', chosenText],
        ]) {
          const { red, green, blue } = parseToRgb(color);
          await expect(blue - red, `the info ${part} in ${className} is blue`).toBeGreaterThan(40);
          await expect(blue - green, `the info ${part} in ${className} is blue`).toBeGreaterThan(20);
        }
      }
    }
  },
};
