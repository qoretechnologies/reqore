import { StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import styled from 'styled-components';
import { IReqoreTableColumn, IReqoreTableProps, IReqoreTableRowData } from '../../components/Table';
import { ReqoreControlGroup, ReqoreIcon, ReqoreP, ReqoreSpan, ReqoreTable, ReqoreTag } from '../../index';
import { StoryMeta } from '../utils';
import { THEMED_SURFACE, ThemedSurface } from '../utils/themedSurface';

/**
 * A list page's table the way a calm product draws it: a status dot, the name
 * with its version and a category line under it, a slim activity bar, tabular
 * figures that are coloured only when they are a problem, a recency column and
 * quiet row actions. This story exists to find out what `ReqoreTable` can do
 * from props alone and what it still needs — every rule it has to break to
 * look like this is a prop the table should grow.
 */

type THex = `#${string}`;
const TEXT: THex = '#ededf0';
const TEXT_2: THex = '#a6a6af';
const TEXT_3: THex = '#80808a';
const TEXT_4: THex = '#43434b';
const BAR: THex = '#3f3f47';
const BAR_RUN: THex = '#5b5b65';
const DANGER: THex = '#e5484d';
const WARNING: THex = '#e0a73a';

type TStatus = 'bad' | 'warn' | 'quiet' | 'idle' | 'draft';

interface IWorkflow extends IReqoreTableRowData {
  name: string;
  version: string;
  category: string;
  status: TStatus;
  done: number;
  run: number;
  err: number;
  success: number | null;
  anomalies: number;
  last: string;
  draft?: boolean;
}

const rows: IWorkflow[] = [
  { _selectId: 1, name: 'Chargeback Handler', version: '2.1', category: 'Payment Processing', status: 'warn', done: 46, run: 0, err: 5, success: 90.0, anomalies: 0, last: '4 min ago' },
  { _selectId: 2, name: 'Fraud Screening', version: '4.0', category: 'Compliance & Audit', status: 'bad', done: 0, run: 0, err: 8, success: 0, anomalies: 1, last: '12 min ago' },
  { _selectId: 3, name: 'Legacy Batch Import', version: '0.9', category: 'Qorus Operations', status: 'idle', done: 0, run: 0, err: 0, success: null, anomalies: 0, last: '3 months ago' },
  { _selectId: 4, name: 'Manual Recon Queue', version: '1.0', category: 'Financial Operations', status: 'quiet', done: 63, run: 1, err: 1, success: 96.8, anomalies: 0, last: '22 min ago' },
  { _selectId: 5, name: 'Never-Fired Experimental', version: '0.1', category: 'No business category', status: 'draft', done: 0, run: 0, err: 0, success: null, anomalies: 0, last: 'Never', draft: true },
  { _selectId: 6, name: 'Nightly Reporting', version: '1.5', category: 'Financial Operations', status: 'quiet', done: 4, run: 0, err: 0, success: 100, anomalies: 0, last: '10 h ago' },
  { _selectId: 7, name: 'Order Fulfilment', version: '3.1', category: 'Supply Chain', status: 'warn', done: 784, run: 12, err: 10, success: 97.3, anomalies: 1, last: '1 min ago' },
  { _selectId: 8, name: 'Payment Capture', version: '2.4', category: 'Payment Processing', status: 'quiet', done: 4204, run: 0, err: 4, success: 99.9, anomalies: 0, last: 'Just now' },
  { _selectId: 9, name: 'Supplier Payment Release', version: '1.0', category: 'Supply Chain', status: 'bad', done: 4, run: 0, err: 2, success: 66.7, anomalies: 4, last: '52 min ago' },
];

const dotColor: Record<TStatus, THex> = {
  bad: DANGER,
  warn: WARNING,
  quiet: TEXT_3,
  idle: TEXT_3,
  draft: TEXT_4,
};

const Dot = ({ status }: { status: TStatus }) => (
  <ReqoreIcon
    icon={status === 'idle' || status === 'draft' ? 'CircleLine' : 'CircleFill'}
    size='10px'
    color={dotColor[status]}
    glow={status === 'bad' || status === 'warn' ? dotColor[status] : undefined}
  />
);

/* The activity bar: completed grey, in progress a step lighter, failed red;
   its length is the row's volume against the busiest row (log scale). */
const StyledBar = styled.div<{ $width: number }>`
  display: flex;
  height: 6px;
  width: ${({ $width }) => $width}%;
  min-width: 6px;
  gap: 1px;
  border-radius: 3px;
  overflow: hidden;
  > i {
    display: block;
    height: 100%;
  }
`;

const busiest = Math.max(...rows.map((r) => r.done + r.run + r.err));

const ActivityBar = ({ row }: { row: IWorkflow }) => {
  const total = row.done + row.run + row.err;
  if (!total) {
    return <ReqoreSpan effect={{ color: TEXT_3 }}>No orders in 24 hours</ReqoreSpan>;
  }
  const width = Math.max(8, (Math.log(total + 1) / Math.log(busiest + 1)) * 100);
  const part = (n: number, color: string) =>
    n ? <i style={{ flex: n, background: color }} /> : null;
  return (
    <StyledBar $width={width} title={`${row.done} complete · ${row.run} in progress · ${row.err} failed`}>
      {part(row.done, BAR)}
      {part(row.run, BAR_RUN)}
      {part(row.err, DANGER)}
    </StyledBar>
  );
};

/* Reqore hands a cell renderer the generic row; these rows are workflows. */
const wf = (data: IReqoreTableRowData) => data as IWorkflow;

const figure = (value: number | null, suffix = '') =>
  value === null ? (
    <ReqoreSpan effect={{ color: TEXT_4 }}>—</ReqoreSpan>
  ) : (
    <ReqoreSpan effect={{ tabularNums: true }}>{`${value.toLocaleString('en-US')}${suffix}`}</ReqoreSpan>
  );

const successColor = (value: number | null) =>
  value === null ? TEXT_4 : value < 75 ? DANGER : value < 95 ? WARNING : TEXT;

const columns: IReqoreTableColumn[] = [
  {
    dataId: 'name',
    grow: 3,
    minWidth: 280,
    sortable: true,
    header: { label: 'Name' },
    cell: {
      content: (data) => {
        const row = wf(data);
        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <ReqoreControlGroup gapSize='small' verticalAlign='center'>
            <Dot status={row.status} />
            <ReqoreSpan effect={{ weight: 'bold', color: TEXT }}>{row.name}</ReqoreSpan>
            <ReqoreSpan size='small' effect={{ color: TEXT_3 }} style={{ fontFamily: 'monospace' }}>
              {`v${row.version}`}
            </ReqoreSpan>
            {row.draft ? <ReqoreTag size='tiny' label='Draft' minimal /> : null}
          </ReqoreControlGroup>
          <ReqoreSpan size='small' effect={{ color: TEXT_3 }} style={{ paddingLeft: 18 }}>
            {row.category}
          </ReqoreSpan>
        </div>
        );
      },
    },
  },
  {
    dataId: 'activity',
    grow: 2,
    minWidth: 200,
    header: { label: 'Orders, last 24 hours' },
    cell: { content: (data) => <ActivityBar row={wf(data)} /> },
  },
  {
    dataId: 'orders',
    width: 90,
    align: 'right',
    sortable: true,
    header: { label: 'Orders' },
    cell: { content: (data) => figure(wf(data).done + wf(data).run + wf(data).err) },
  },
  {
    dataId: 'success',
    width: 100,
    align: 'right',
    sortable: true,
    header: { label: 'Success' },
    cell: {
      content: (data) => (
        <ReqoreSpan effect={{ tabularNums: true, color: successColor(wf(data).success) }}>
          {wf(data).success === null ? '—' : `${wf(data).success!.toFixed(1)}%`}
        </ReqoreSpan>
      ),
    },
  },
  {
    dataId: 'anomalies',
    width: 110,
    align: 'right',
    header: { label: 'Anomalies' },
    cell: {
      content: (data) =>
        wf(data).anomalies ? (
          <ReqoreTag size='tiny' icon='PulseLine' label={wf(data).anomalies} intent='warning' minimal />
        ) : (
          <ReqoreSpan effect={{ color: TEXT_4 }}>—</ReqoreSpan>
        ),
    },
  },
  {
    dataId: 'last',
    width: 130,
    sortable: true,
    header: { label: 'Last order' },
    cell: { content: (data) => <ReqoreSpan effect={{ color: TEXT_2 }}>{wf(data).last}</ReqoreSpan> },
  },
  {
    dataId: 'actions',
    width: 120,
    align: 'right',
    header: { label: '' },
    cell: {
      padded: 'none',
      actions: (data) =>
        wf(data).draft
          ? [{ icon: 'PencilLine', tooltip: 'Continue editing', flat: true, transparent: true, size: 'small' }]
          : [
              { icon: 'PlayLine', tooltip: 'Run now', flat: true, transparent: true, size: 'small' },
              { icon: 'PencilLine', tooltip: 'Edit', flat: true, transparent: true, size: 'small' },
              { icon: 'MoreLine', tooltip: 'More', flat: true, transparent: true, size: 'small' },
            ],
    },
  },
];

const meta = {
  title: 'Display/Table/Calm list',
  component: ReqoreTable,
  parameters: {
    chromatic: { viewports: [1440] },
  },
} as StoryMeta<typeof ReqoreTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const TABLE_PROPS: Partial<IReqoreTableProps> = {
  columns,
  data: rows,
  selectable: true,
  rowHeight: 56,
  flat: true,
  rounded: true,
  height: 620,
  renderExpandedRow: (row) => (
    <ReqoreP size='small'>{`${(row as IWorkflow).name} — the opened row would show the object's summary here.`}</ReqoreP>
  ),
};

const Template = (args: Partial<IReqoreTableProps>) => (
  <ThemedSurface>
    <ReqoreTable {...TABLE_PROPS} {...args} />
  </ThemedSurface>
);

/**
 * What `ReqoreTable` gives from props alone, before any table change. The
 * gaps a calm list needs closed are documented on `Calm`.
 */
export const FromPropsAlone: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The concept list drawn with today’s props only: the header is upper-case and tracked, selection is a round glyph, the expander takes its own column, and the row actions are always on. Everything the Calm story changes is a prop the table grew for it.',
      },
    },
  },
  render: () => <Template />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Chargeback Handler')).toBeInTheDocument());
    // Two-line primary cells sit inside their 56px rows (the rowHeight fix).
    const cell = canvas.getByText('Compliance & Audit').closest('.reqore-table-cell');
    expect(cell).toBeTruthy();
  },
};

/**
 * The same list with the props the table grew for it: a sentence-case header
 * with no dividers at rest, checkbox selection, no expander column (the row
 * itself opens), and row actions that rest dimmed until their row is hovered.
 */
export const Calm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The concept list on `ReqoreTable`: `minimal` takes the fill and border off the header cells, `headerEffect` makes the header sentence case and quiet, `headerDividers={false}` hides the column handles until the header is hovered, `selectionStyle=\'checkbox\'` draws square boxes, `expanderPosition=\'none\'` drops the caret column (a row still opens from its own click), `actionsRevealOn=\'hover\'` rests the row actions at half strength until their row is hovered or focused, and `sortIndicator=\'arrow\'` marks the sorted column with an arrow instead of the blue wash — blue is a filter here, and sorting narrows nothing.',
      },
    },
  },
  render: () => (
    <Template
      minimal
      headerEffect={{ uppercase: false, spaced: 0, weight: 'bold', color: TEXT_3 }}
      headerDividers={false}
      selectionStyle='checkbox'
      expanderPosition='none'
      actionsRevealOn='hover'
      sortIndicator='arrow'
      sort={{ by: 'name', direction: 'asc' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Chargeback Handler')).toBeInTheDocument());

    // Sentence case: the header label is not transformed.
    // A header label is drawn twice (the marquee keeps a hidden copy); either will do.
    const header = canvas.getAllByText('Last order')[0];
    expect(getComputedStyle(header).textTransform).not.toBe('uppercase');

    // No expander column: the first body cell after the select box is the name.
    const firstRow = canvasElement.querySelector('.reqore-table-row')!;
    const cells = firstRow.querySelectorAll('.reqore-table-cell');
    expect(cells[1].textContent).toContain('Chargeback Handler');
    expect(firstRow.querySelector('[aria-expanded]')).toBeNull();

    // Row actions rest at half strength and come up with the row.
    const actions = firstRow.querySelector<HTMLElement>('.reqore-table-cell-actions');
    expect(actions).toBeTruthy();
    expect(getComputedStyle(actions!).opacity).toBe('0.5');
    (firstRow as HTMLElement).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    firstRow.querySelector<HTMLButtonElement>('.reqore-table-cell-actions button')!.focus();
    await waitFor(() => expect(getComputedStyle(actions!).opacity).toBe('1'));

    // The sorted column carries an arrow and no wash: its header has no gradient painted on it.
    const sortedHeader = canvas.getAllByText('Name')[0].closest('.reqore-table-header-cell')!;
    expect(getComputedStyle(sortedHeader).backgroundImage).toBe('none');

    // The column handles are still there — columns still resize — just not drawn at rest.
    const handle = canvasElement.querySelector<HTMLElement>('.reqore-table-header-resize');
    expect(handle).toBeTruthy();
    expect(getComputedStyle(handle!).opacity).toBe('0');
  },
};

/** The expander at the row's end, for a list that wants the caret but not in front of the name. */
export const ExpanderAtEnd: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`expanderPosition='end'`: the caret column is appended after the last column and pinned to the right edge, so the name column leads and the control sits beside the row actions.",
      },
    },
  },
  render: () => (
    <Template
      minimal
      headerEffect={{ uppercase: false, spaced: 0, weight: 'bold', color: TEXT_3 }}
      headerDividers={false}
      selectionStyle='checkbox'
      expanderPosition='end'
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Chargeback Handler')).toBeInTheDocument());
    const firstRow = canvasElement.querySelector('.reqore-table-row')!;
    const cells = firstRow.querySelectorAll('.reqore-table-cell');
    expect(cells[cells.length - 1].querySelector('[aria-expanded]')).toBeTruthy();
    expect(cells[0].querySelector('[aria-expanded]')).toBeNull();
  },
};

/** The actions column pinned to the right edge, as every list in a product pins it. */
export const PinnedActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pinning is a behaviour, not a look. At rest a pinned column paints the same surface as its neighbours — no darker base, no filled header cell, no shadow at its edge. The edge shadow is drawn only while a column really is hidden under it, which the body says through the `data-reqore-table-overflow` attribute on its scroll containers; the play narrows the host to make that happen.',
      },
    },
  },
  render: () => (
    <ThemedSurface>
      {/* A table is drawn inside a panel, and that surface (`theme.panel.main`)
          is what a pinned cell paints — so the host here is that surface. */}
      <div className='pinned-host' style={{ width: '100%', background: THEMED_SURFACE.panel!.main }}>
        <ReqoreTable
          {...TABLE_PROPS}
          columns={columns.map((column) =>
            column.dataId === 'actions' ? { ...column, pin: 'right' } : column
          )}
          minimal
          headerEffect={{ uppercase: false, spaced: 0, weight: 'bold', color: TEXT_3 }}
          headerDividers={false}
          selectionStyle='checkbox'
          expanderPosition='none'
          actionsRevealOn='hover'
          sortIndicator='arrow'
        />
      </div>
    </ThemedSurface>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Chargeback Handler')).toBeInTheDocument());
    const firstRow = canvasElement.querySelector('.reqore-table-row')!;
    const cells = Array.from(firstRow.querySelectorAll<HTMLElement>('.reqore-table-cell'));
    const pinned = cells[cells.length - 1];
    const unpinned = cells[cells.length - 2];
    // Everything fits, so the pinned column is marked with nothing…
    const body = canvasElement.querySelector('.reqore-table-body')!;
    const header = canvasElement.querySelector('.reqore-table-header-wrapper')!;
    expect(body.getAttribute('data-reqore-table-overflow')).toBeNull();
    expect(header.getAttribute('data-reqore-table-overflow')).toBeNull();
    // …its edge shadow is not drawn…
    expect(getComputedStyle(pinned, '::after').opacity).toBe('0');
    // …and its paint is the panel surface (`theme.panel.main`), which its
    // neighbour shows through to.
    const host = canvasElement.querySelector<HTMLElement>('.pinned-host')!;
    const panelSurface = THEMED_SURFACE.panel!.main;
    const asRgb = (hex: string) =>
      `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;
    expect(getComputedStyle(unpinned).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(pinned).backgroundColor).toBe(asRgb(panelSurface));
    expect(getComputedStyle(host).backgroundColor).toBe(asRgb(panelSurface));
    // The header cell of a pinned column is not a filled button either.
    const pinnedHeaderButton = header.querySelector<HTMLElement>(
      '[data-reqore-table-column-id="actions"] .reqore-table-header-cell'
    );
    expect(pinnedHeaderButton).toBeTruthy();
    expect(getComputedStyle(pinnedHeaderButton!).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    // Narrow the host until columns are hidden under the pinned edge: now the
    // shadow says so, on the body and on the header, and goes away again when
    // the row is scrolled all the way to the right.
    host.style.width = '640px';
    await waitFor(() => expect(body.getAttribute('data-reqore-table-overflow')).toBe('right'));
    expect(header.getAttribute('data-reqore-table-overflow')).toBe('right');
    await waitFor(() => expect(getComputedStyle(pinned, '::after').opacity).toBe('1'));
    body.scrollLeft = body.scrollWidth;
    await waitFor(() => expect(body.getAttribute('data-reqore-table-overflow')).toBe('left'));
    await waitFor(() => expect(getComputedStyle(pinned, '::after').opacity).toBe('0'));
    host.style.width = '100%';
    await waitFor(() => expect(body.getAttribute('data-reqore-table-overflow')).toBeNull());
  },
};
