import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { noop, slice } from 'lodash';
import { StyledEffect } from '../../components/Effect';
import { ReqoreEmptyState } from '../../components/EmptyState';
import { IReqoreTableColumn, IReqoreTableProps, IReqoreTableRowData } from '../../components/Table';
import { IReqoreCustomTableBodyCellProps } from '../../components/Table/cell';
import { IReqoreCustomHeaderCellProps } from '../../components/Table/header';
import { IReqoreCustomTableRowProps } from '../../components/Table/row';
import { TReqorePaginationType } from '../../constants/paging';
import { SIZES, SIZE_TO_PX, TEXT_FROM_SIZE } from '../../constants/sizes';
import { sleep } from '../../helpers/utils';
import {
  ReqoreControlGroup,
  ReqoreH3,
  ReqoreH4,
  ReqoreIcon,
  ReqoreInput,
  ReqoreP,
  ReqoreSpan,
  ReqoreTable,
  ReqoreTag,
} from '../../index';
import tableData from '../../mock/tableData';
import { StoryMeta } from '../utils';
import { CustomIntentArg, FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';
import { expectTableContentWithinItsRows } from '../utils/tableGeometry';

const { createArg } = argManager<IReqoreTableProps>();

const defaultColumns: IReqoreTableColumn[] = [
  {
    dataId: 'id',
    intent: 'info',
    header: {
      label: 'ID',
      tooltip: 'Custom ID tooltip nice',
    },
    cell: {
      content: 'number',
    },
    width: 40,
    align: 'center',
    sortable: true,
  },
  {
    hideBelowWidth: 500,

    header: {
      label: 'Name',

      columns: [
        {
          dataId: 'firstName',
          sortable: true,
          minWidth: 50,
          maxWidth: 500,
          header: {
            icon: 'SlideshowLine',
            label: 'First Name',
            effect: {
              gradient: {
                colors: {
                  0: 'success',
                  100: 'info',
                },
              },
            },
          },
          cell: {
            padded: 'both',
            content: ({ firstName, isSelected }) => (
              <ReqoreInput
                icon='PriceTag2Fill'
                size='small'
                value={firstName}
                intent={isSelected ? 'info' : undefined}
              />
            ),
          },
          width: 150,
          grow: 2,
        },
        {
          dataId: 'middleName',
          header: {
            label: 'Middle Name',
            icon: 'SlideshowLine',
            tooltip: 'This is the middle name',
          },
          enabled: false,
        },
        {
          dataId: 'lastName',
          header: {
            icon: 'SlideshowLine',
            label: 'Last Name',
          },
          filterable: true,
          width: 150,
          grow: 1,
          sortable: true,
          cell: {
            onClick: ({ lastName }) => alert(`Clicked last name cell ${lastName}`),
            content: 'title:info',
          },
        },
      ],
    },
    dataId: 'name',
    grow: 3,
  },
  {
    dataId: 'address',
    header: {
      label: 'Address',
      description: 'This is the address',
      onClick: () => alert('clicked address'),
    },
    width: 300,
    grow: 2,
    resizable: false,
  },
  {
    dataId: 'age',
    header: {
      label: 'Really long age header',
      icon: 'User4Line',
      tooltip: 'Custom age tooltip',
      actions: [
        {
          label: 'Do something',
          icon: 'EBike2Fill',
        },
      ],
    },
    width: 100,
    align: 'center',
    sortable: true,

    cell: {
      intent: 'danger',
      content: 'tag:#000000',
      tooltip: (value) => `Age is ${value}`,
      onClick: ({ age }) => alert(`Clicked age cell ${age}`),
    },
  },
  {
    header: {
      label: 'Data',
      columns: [
        {
          dataId: 'occupation',
          header: { label: 'Ocuppation' },
          width: 200,
          cell: { content: 'text:warning' },
          filterable: true,
          filterPlaceholder: 'Search occupation',
        },
        {
          dataId: 'group',
          align: 'right',
          header: { label: <ReqoreTag label='Group' icon='Group2Line' size='small' /> },
          width: 150,
          cell: { intent: 'muted' },
          filterable: true,
          sortable: true,
        },
      ],
    },
    dataId: 'data',
  },
  {
    dataId: 'date',
    header: { label: 'Date' },
    sortable: true,
    grow: 2,
    width: 150,
    cell: {
      content: 'time-ago',
      tooltip: () => ({
        title: 'Custom tooltip',
        content: 'This is a custom tooltip',
        effect: {
          gradient: {
            colors: {
              0: 'warning',
              100: 'info',
            },
          },
        },
      }),
    },
  },
  {
    dataId: 'actions',
    header: {
      icon: 'SettingsLine',
    },
    width: 120,
    align: 'center',
    pin: 'right',

    cell: {
      padded: 'none',
      actions: () => [
        {
          icon: 'AddLine',
          intent: 'info',
        },
        {
          icon: 'EditLine',
          intent: 'warning',
        },
        {
          icon: 'DeleteBinLine',
          intent: 'danger',
        },
      ],
    },
  },
];

const defaultColumnsWithFilters: IReqoreTableColumn[] = defaultColumns.map((column, index) => {
  if (index === 4) {
    return {
      ...column,
      header: {
        ...column.header,
        columns: column.header.columns.map((subColumn, subIndex) =>
          subIndex === 0
            ? {
                ...subColumn,
                filter: 'Advisor',
              }
            : {
                ...subColumn,
                filter: 'net',
              }
        ),
      },
    };
  }

  return column;
});

const defaultColumnsWithHiddenColumns: IReqoreTableColumn[] = defaultColumns.map(
  (column, index) => {
    if (index === 4) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: column.header.columns.map((subColumn, subIndex) =>
            subIndex === 0
              ? {
                  ...subColumn,
                  show: false,
                }
              : subColumn
          ),
        },
      };
    }

    if (index === 2) {
      return {
        ...column,
        show: false,
      };
    }

    return column;
  }
);

const defaultColumnsWithPinnedColumns: IReqoreTableColumn[] = defaultColumns.map(
  (column, index) => {
    if (index === 0) {
      return {
        ...column,
        pin: 'left',
      };
    }

    if (index === 1) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: column.header.columns.map((subColumn, subIndex) =>
            subIndex === 2
              ? {
                  ...subColumn,
                  pin: 'left',
                }
              : subColumn
          ),
        },
      };
    }

    if (index === 3) {
      return {
        ...column,
        pin: 'right',
      };
    }

    return column;
  }
);

const defaultColumnsWithCustomContentHeaders: IReqoreTableColumn[] = defaultColumns.map(
  (column, index) => {
    if (index === 4) {
      return {
        ...column,
        header: {
          ...column.header,
          content: <ReqoreInput icon='PriceTag2Fill' value='Custom input value' rounded={false} />,
        },
      };
    }

    return column;
  }
);

const meta = {
  title: 'Collections/Table',
  component: ReqoreTable,
  args: {
    columns: defaultColumns,
    data: tableData.data,
    height: 600,
    selectToggleTooltip: 'Select this row',
    fill: false,
    sort: { by: 'lastName', direction: 'desc' },
    label: 'Table',
  },
  argTypes: {
    ...createArg('rounded', {
      type: 'boolean',
      name: 'Rounded',
      description: 'If the table should have rounded corners',
    }),
    ...createArg('striped', {
      type: 'boolean',
      name: 'Striped',
      description: 'If the table should have striped rows',
    }),
    ...createArg('selectable', {
      type: 'boolean',
      name: 'Selectable',
      description: 'If the table should be selectable',
    }),
    ...createArg('columns', {
      name: 'Columns',
    }),
    ...createArg('width', {
      type: 'number',
      name: 'Width',
      description: 'The width of the table',
    }),
    ...createArg('height', {
      type: 'number',
      name: 'Height',
      description: 'The height of the table',
    }),
    ...createArg('data', {
      type: 'array',
      name: 'Data',
      description: 'The data to be displayed in the table',
      table: {
        disable: true,
      },
    }),
    ...createArg('selectToggleTooltip', {
      type: 'string',
      name: 'Select Toggle Tooltip',
      description: 'The tooltip of the select toggle',
    }),
    ...createArg('fill', {
      type: 'boolean',
      name: 'Fill',
      description: 'Whether the table should fill the parent',
    }),
    ...SizeArg,
    ...FlatArg,
    ...IntentArg,
    ...CustomIntentArg('selectedRowIntent'),
  },
} as StoryMeta<typeof ReqoreTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table in its default configuration.',
      },
    },
  },
  args: {
    showHelp: true,
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const ScrollChange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `onScrollChange` callback fires `true` once the body scrolls down from the top and `false` when it returns to the top — letting a host collapse surrounding chrome (page header, KPI tiles) while scrolling and restore it at the top. The tag reflects the latest value.',
      },
    },
  },
  args: {
    height: 200,
    label: 'Scroll me',
  },
  render: (args) => {
    const [scrolled, setScrolled] = useState(false);
    return (
      <>
        <ReqoreTag
          className='scroll-state'
          label={scrolled ? 'Scrolled: yes' : 'Scrolled: no'}
          intent={scrolled ? 'warning' : 'success'}
        />
        <ReqoreTable {...args} onScrollChange={setScrolled} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const body = await waitFor(() => {
      const el = canvasElement.querySelector('.reqore-table-body') as HTMLElement;
      if (!el) throw new Error('table body not rendered');
      return el;
    });
    const state = () => canvasElement.querySelector('.scroll-state')?.textContent ?? '';
    // At the top the host is told it is not scrolled.
    await waitFor(() => expect(state()).toContain('Scrolled: no'));
    // Scrolling down from the top fires `onScrollChange(true)`.
    Object.defineProperty(body, 'scrollTop', { value: 120, configurable: true });
    fireEvent.scroll(body);
    await waitFor(() => expect(state()).toContain('Scrolled: yes'));
    // Returning to the top fires `onScrollChange(false)` — this drives restore-at-top.
    Object.defineProperty(body, 'scrollTop', { value: 0, configurable: true });
    fireEvent.scroll(body);
    await waitFor(() => expect(state()).toContain('Scrolled: no'));
  },
};

export const GroupedColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with grouped column headers.',
      },
    },
  },
  args: {
    columns: defaultColumns,
    data: tableData.data,
    height: 320,
    label: 'Grouped columns',
  },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll('.reqore-table-column-group').length
      ).toBeGreaterThan(
        0
      );
    });

    const groups = Array.from(
      canvasElement.querySelectorAll('.reqore-table-column-group')
    ) as HTMLElement[];
    const headerRow = groups[0].parentElement as HTMLElement;
    const rowCells = Array.from(
      canvasElement.querySelector('.reqore-table-row')?.children ?? []
    ) as HTMLElement[];
    const leafHeaders: HTMLElement[] = [];

    for (const column of Array.from(headerRow.children)) {
      if (column.classList.contains('reqore-table-column-group')) {
        const groupHeader = column.firstElementChild as HTMLElement;
        const groupLeaves = Array.from(
          column.querySelector('.reqore-table-headers')?.children ?? []
        ) as HTMLElement[];
        const groupRect = column.getBoundingClientRect();
        const groupHeaderRect = groupHeader.getBoundingClientRect();
        const groupLeavesWidth = groupLeaves.reduce(
          (width, leaf) => width + leaf.getBoundingClientRect().width,
          0
        );

        await expect(groupRect.width).toBeGreaterThan(250);
        await expect(groupHeaderRect.width).toBeGreaterThan(250);
        await expect(Math.abs(groupHeaderRect.width - groupRect.width)).toBeLessThanOrEqual(1);
        await expect(Math.abs(groupLeavesWidth - groupRect.width)).toBeLessThanOrEqual(1);

        leafHeaders.push(...groupLeaves);
      } else {
        leafHeaders.push(column as HTMLElement);
      }
    }

    await expect(leafHeaders.length).toBe(rowCells.length);

    for (let index = 0; index < leafHeaders.length; index += 1) {
      const header = leafHeaders[index];
      const headerRect = header.getBoundingClientRect();
      const rowRect = rowCells[index].getBoundingClientRect();

      await expect(headerRect.width).toBeGreaterThanOrEqual(40);
      await expect(Math.abs(rowRect.left - headerRect.left)).toBeLessThanOrEqual(1);
      await expect(Math.abs(rowRect.width - headerRect.width)).toBeLessThanOrEqual(1);
    }
  },
};

export const CompactCenteredRuntimeColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table in a compact, centered layout with runtime-derived columns.',
      },
    },
  },
  args: {
    selectable: true,
    size: 'small',
    wrapperSize: 'small',
    striped: true,
    height: 180,
    columns: [
      {
        dataId: 'name',
        header: { label: 'Name' },
        grow: 2,
        minWidth: 240,
        cell: { content: 'text' },
      },
      {
        dataId: 'up',
        align: 'center',
        header: { label: 'Up' },
        width: 40,
        resizable: false,
        sortable: true,
        cell: {
          content: ({ up }) => (
            <ReqoreIcon
              icon={up ? 'ArrowUpFill' : 'ArrowDownFill'}
              intent={up ? 'success' : 'danger'}
              size='tiny'
            />
          ),
        },
      },
      {
        dataId: 'open',
        align: 'center',
        header: { icon: 'ExternalLinkLine', tooltip: 'Open details' },
        width: 25,
        resizable: false,
        cell: {
          content: () => <ReqoreIcon icon='ExternalLinkLine' size='tiny' />,
        },
      },
      {
        dataId: 'authorization',
        align: 'center',
        header: { label: 'Authorization', icon: 'ShareBoxLine' },
        width: 150,
        resizable: false,
      },
      {
        dataId: 'ping',
        align: 'center',
        pin: 'right',
        header: { icon: 'SignalTowerLine', tooltip: 'Ping connection' },
        width: 25,
        resizable: false,
        cell: {
          actions: () => [{ icon: 'SignalTowerLine', tooltip: 'Ping connection', flat: true }],
        },
      },
      {
        dataId: 'settings',
        align: 'center',
        pin: 'right',
        header: { icon: 'Settings2Line', tooltip: 'Available actions' },
        width: 130,
        resizable: false,
        cell: {
          actions: () => [
            { icon: 'EditLine', tooltip: 'Edit', flat: true },
            { icon: 'InformationLine', tooltip: 'Info', flat: true },
            { icon: 'FileCopyLine', tooltip: 'Duplicate', flat: true },
            { icon: 'DeleteBinLine', tooltip: 'Delete', flat: true },
          ],
        },
      },
    ],
    data: [
      { _selectId: 'voyage', name: 'AI Embeddings voyage', up: true },
      { _selectId: 'bge', name: 'Bge M3 Embeddings', up: false },
      { _selectId: 'gemini', name: 'Gemini', up: true },
      { _selectId: 'supply-chain', name: 'Supply Chain', up: true },
      { _selectId: 'openai', name: 'Openai', up: true },
      { _selectId: 'qdrant', name: 'Qdrant', up: true },
      { _selectId: 'qorus-api', name: 'Qorus Api', up: true },
      { _selectId: 'paddle', name: 'Paddle Sandbox', up: true },
      { _selectId: 'healthcare', name: 'Healthcare Vitalwear', up: true },
      { _selectId: 'supply-chain-2', name: 'Supply Chain 2', up: false },
      { _selectId: 'salesforce', name: 'Salesforce', up: true },
      { _selectId: 'sap', name: 'SAP ERP', up: true },
    ],
  },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(canvasElement.querySelectorAll('.reqore-table-row').length).toBeGreaterThan(0);
    });

    const headerCells = Array.from(
      canvasElement.querySelector('.reqore-table-header-wrapper > *')?.children ?? []
    );
    const rowCells = Array.from(canvasElement.querySelector('.reqore-table-row')?.children ?? []);

    await expect(headerCells.length).toBe(rowCells.length);

    for (let index = 0; index < headerCells.length; index += 1) {
      const header = headerCells[index];
      const headerRect = header.getBoundingClientRect();
      const rowRect = rowCells[index].getBoundingClientRect();

      await expect(Math.abs(rowRect.left - headerRect.left)).toBeLessThanOrEqual(1);
      await expect(Math.abs(rowRect.width - headerRect.width)).toBeLessThanOrEqual(1);
    }
  },
};

export const WithDotNotation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with dot-notation keys.',
      },
    },
  },
  args: {
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID' },
        width: 40,
        align: 'center',
        cell: { content: 'number' },
      },
      {
        dataId: 'address.city',
        header: { label: 'City' },
        cell: { content: 'text' },
      },
      {
        dataId: 'address.country',
        header: { label: 'Country' },
        cell: { content: 'title' },
      },
      {
        dataId: 'address.street',
        header: { label: 'Street' },
        cell: { content: 'text:info' },
      },
    ],
    data: [
      {
        id: 1,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: 'USA',
        },
      },
    ],
  },
};

export const NoLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table without a label.',
      },
    },
  },
  args: {
    label: undefined,
  },
};

export const CustomWidth: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a custom width.',
      },
    },
  },
  args: {
    width: 400,
  },
  play: async () => {
    await sleep(1000);
    await expect(document.querySelectorAll('.reqore-table-column-group').length).toBe(1);
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with flat={false} so the elevated look is applied.',
      },
    },
  },
  args: {
    flat: false,
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const NoHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table without an intrinsic height.',
      },
    },
  },
  args: {
    height: undefined,
    data: slice(tableData.data, 0, 150),
  },
};

export const InteractiveRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with interactive rows.',
      },
    },
  },
  args: {
    onRowClick: noop,
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(canvasElement.querySelectorAll('.reqore-table-row')[2]);
  },
};

export const Striped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with striped rows.',
      },
    },
  },
  args: {
    striped: true,
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const Filterable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with filter controls enabled.',
      },
    },
  },
  args: {
    filterable: true,
  },
};

export const DefaultFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a default filter applied; the catalogue\'s last-name sort stays in charge of the order, since a chosen sort outranks relevance.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'Village',
  },
};

const relevanceColumns: IReqoreTableColumn[] = [
  { dataId: 'name', header: { label: 'Connection' }, grow: 1 },
  { dataId: 'description', header: { label: 'Description' }, grow: 2 },
];

/* Alphabetical on purpose: with the query "telegram" the rows called Telegram
   sit in the middle of this order, which is what the filter used to show. */
const relevanceData = [
  { id: 1, name: 'Alerts to Telegram', description: 'Forwards alerts' },
  { id: 2, name: 'Gmail', description: 'Reads the inbox, posts a digest to telegram' },
  { id: 3, name: 'Slack', description: 'Ops workspace', token: 'telegram-token' },
  { id: 4, name: 'Telegram', description: 'The bot connection' },
  { id: 5, name: 'Telegram Support', description: 'Support channel bot' },
  { id: 6, name: 'Untelegrammed', description: 'A name that only contains the word' },
];

const firstRowNames = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.reqore-table-row')).map(
    (row) => row.querySelector('.reqore-table-cell')?.textContent
  );

export const FilterRelevance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table filtered by "telegram" that opted into `filterRanking="relevance"` — the row called Telegram first, then names starting with it, then names and descriptions merely mentioning it, and a row matched only through hidden data last.',
      },
    },
  },
  args: {
    columns: relevanceColumns,
    data: relevanceData,
    filterable: true,
    filter: 'telegram',
    filterRanking: 'relevance',
    // The catalogue's default args sort by last name, which these rows do not have.
    sort: undefined,
    height: 400,
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(firstRowNames(canvasElement)).toEqual([
        'Telegram',
        'Telegram Support',
        'Alerts to Telegram',
        'Untelegrammed',
        'Gmail',
        'Slack',
      ])
    );
  },
};

export const FilterArrivingOrder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same filtered table without opting into ranking — the default: the matching rows keep the order they arrived in.',
      },
    },
  },
  args: {
    ...FilterRelevance.args,
    filterRanking: undefined,
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(firstRowNames(canvasElement)[0]).toBe('Alerts to Telegram'));
  },
};

export const EmptyData: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with no data so the empty state is visible.',
      },
    },
  },
  args: {
    columns: [{ dataId: 'id', header: { label: 'ID' } }],
    data: [],
    responsiveActions: false,
    responsiveTitle: false,
    fluid: true,
    rounded: true,
    selectable: true,
    fill: true,
    actions: [{ icon: 'AddLine', intent: 'info', label: 'Should be shown!', minimal: true }],
  },
};

export const NoDataMessage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a custom no-data message.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'asjkghakshgjkashg',
  },
};

export const FilterableColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with filter controls on the columns.',
      },
    },
  },
  args: {
    columns: defaultColumnsWithFilters,
  },
};

export const AllFiltersActive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with every filter turned on to prove all filter states render together.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'Road',
    columns: defaultColumnsWithFilters,
  },
};

export const HiddenColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with some columns hidden.',
      },
    },
  },
  args: {
    showColumnsOptions: true,
    columns: defaultColumnsWithHiddenColumns,
  },
};

export const PinnedColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with pinned columns.',
      },
    },
  },
  args: {
    columns: defaultColumnsWithPinnedColumns,
    zoomable: true,
    filterable: true,
    showHelp: true,
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const Selectable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with selection enabled.',
      },
    },
  },
  args: {
    selectable: true,
    striped: true,
  },
};

export const PreselectedRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with rows pre-selected.',
      },
    },
  },
  args: {
    selected: ['274', '280'],
    selectable: true,
  },
};

export const PreselectedRowsWithActiveFilter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with rows pre-selected while a global filter narrows the visible rows. ' +
          'The select-all header toggle reads the filtered row set, so it shows the ' +
          'indeterminate icon rather than claiming everything is selected.',
      },
    },
  },
  args: {
    selected: ['274', '280'],
    selectable: true,
    filterable: true,
    filter: 'Road',
  },
};

export const Zoomable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with zooming controls enabled.',
      },
    },
  },
  args: {
    zoomable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);
    await fireEvent.click(document.querySelector('.reqore-table-more'));
    await waitFor(() => canvas.findAllByText('Zoom in'), { timeout: 5000 });
  },
};

export const Exportable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with the export controls enabled.',
      },
    },
  },
  args: {
    exportable: true,
    filterable: true,
    paging: 'buttons',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(1000);
    await fireEvent.click(document.querySelector('.reqore-table-more'));
    await waitFor(() => canvas.findAllByText('Export current view'), { timeout: 5000 });
  },
};

export const FillParent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table filling its parent container.',
      },
    },
  },
  args: {
    fill: true,
  },
};

export const FillParentWithBottomPaging: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table that fills its panel above bottom paging controls. The scrollable body ' +
          'stays fully visible instead of extending behind the controls.',
      },
    },
  },
  args: {
    fill: true,
    height: undefined,
    // The default story decorator wraps children in `ReqoreContent`, which is `height: 100%`
    // with an inline `padding: 20px` and no `border-box`, so it always overflows its parent by
    // 40px. Other table stories never notice because they pin an explicit `height`; this one
    // measures against the viewport, so it renders without that wrapper.
    withoutContent: true,
    paging: {
      itemsPerPage: 100,
      showLabels: true,
    } as TReqorePaginationType<IReqoreTableRowData>,
  },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      const body = canvasElement.querySelector('.reqore-table-body');
      const wrapper = canvasElement.querySelector('.reqore-table-wrapper');
      const pagingControls = canvasElement.querySelector('.reqore-pagination-wrapper');

      await expect(body).toBeTruthy();
      await expect(wrapper).toBeTruthy();
      await expect(pagingControls).toBeTruthy();
      await expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        wrapper.getBoundingClientRect().bottom + 1
      );
      await expect(wrapper.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        pagingControls.getBoundingClientRect().top + 1
      );
      await expect(pagingControls.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        canvasElement.getBoundingClientRect().bottom + 1
      );
    });
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  args: {
    size: 'small',
    filterable: true,
    wrapperSize: 'big',
    selectable: true,
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const DefaultPaging: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with the default paging control.',
      },
    },
  },
  args: {
    paging: 'buttons',
  },
};

export const CustomPaging: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a custom paging control.',
      },
    },
  },
  args: {
    paging: {
      fluid: true,
      loadMoreLabel: 'Load more rows...',
      showLabels: true,
      infinite: true,
      itemsPerPage: 100,
    } as TReqorePaginationType<IReqoreTableRowData>,
  },
};

export const CustomHeaderContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with custom content in the header.',
      },
    },
  },
  args: {
    columns: defaultColumnsWithCustomContentHeaders,
  },
};

const CustomHeaderCell = (props: IReqoreCustomHeaderCellProps) => {
  if (props.hasColumns) {
    return <ReqoreH3 intent='success'>{props.label}</ReqoreH3>;
  }

  return (
    <ReqoreH4 style={{ width: props.width, flexGrow: props.grow }}>
      <ReqoreIcon icon={props.icon} />
      {props.label}
    </ReqoreH4>
  );
};

const CustomCell = (props: IReqoreCustomTableBodyCellProps) => {
  return (
    <ReqoreP style={{ width: props.width, flexGrow: props.grow }} block={false}>
      {props.children}
    </ReqoreP>
  );
};

const CustomRow = (props: IReqoreCustomTableRowProps) => {
  return <StyledEffect style={props.style}>{props.children}</StyledEffect>;
};

export const CustomCellsAndRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with custom cell and row renderers.',
      },
    },
  },
  args: {
    headerCellComponent: CustomHeaderCell,
    bodyCellComponent: CustomCell,
    rowComponent: CustomRow,
  },
};

export const CustomEmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a custom empty-state message.',
      },
    },
  },
  args: {
    data: [],
    flat: false,
    children: (
      <ReqoreEmptyState
        transparent
        icon='InboxLine'
        title='No data available'
        description='There are no records to display in this table yet.'
      />
    ),
  },
};

const longTextColumns: IReqoreTableColumn[] = [
  {
    dataId: 'id',
    header: { label: 'ID' },
    width: 60,
    align: 'center',
    cell: { content: 'number' },
  },
  {
    dataId: 'title',
    header: { label: 'Title' },
    width: 200,
    cell: { content: 'title' },
  },
  {
    dataId: 'description',
    header: { label: 'Description' },
    grow: 3,
    cell: { content: 'text' },
  },
  {
    dataId: 'status',
    header: { label: 'Status' },
    width: 120,
    cell: { content: 'tag:info' },
  },
];

const longTextData = [
  {
    id: 1,
    title: 'Release v1.0',
    description:
      'Initial production release. Includes the core API surface, theming, accessible components, and a migration guide for the preview users who have been on v0.x builds since October.',
    status: 'shipped',
  },
  {
    id: 2,
    title: 'Compact mode',
    description:
      'Short description.',
    status: 'in progress',
  },
  {
    id: 3,
    title: 'Variable row height',
    description:
      'Support rows whose natural content dictates their height. Replaces the three-table sticky-pin architecture with a single scroller, lets cells wrap text, and cuts DOM node count by roughly two-thirds on wide tables.',
    status: 'review',
  },
  {
    id: 4,
    title: 'Trackpad-native scroll',
    description:
      'Drops the manual wheel handler so horizontal and vertical scroll both use real momentum scrolling. Users on macOS trackpads and touch screens get the behavior they expect from every other native list.',
    status: 'shipped',
  },
];

export const NonVirtualized: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with virtualization disabled.',
      },
    },
  },
  args: {
    virtualized: false,
    data: longTextData,
    columns: longTextColumns,
    height: 400,
    label: 'Non-virtualized table',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const Wrapped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with content wrapping enabled.',
      },
    },
  },
  args: {
    wrap: true,
    data: longTextData,
    columns: longTextColumns,
    height: 400,
    label: 'Wrapped rows',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const WrappedWithPinnedColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with content wrapping and pinned columns.',
      },
    },
  },
  args: {
    wrap: true,
    data: longTextData,
    columns: [
      { ...longTextColumns[0], pin: 'left' },
      longTextColumns[1],
      longTextColumns[2],
      { ...longTextColumns[3], pin: 'right' },
    ],
    width: 520,
    height: 400,
    label: 'Wrapped with pinned columns',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const PerColumnWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with wrapping configured on specific columns.',
      },
    },
  },
  args: {
    virtualized: false,
    data: longTextData,
    columns: [
      longTextColumns[0],
      longTextColumns[1],
      { ...longTextColumns[2], cell: { ...longTextColumns[2].cell, wrap: true } },
      longTextColumns[3],
    ],
    height: 400,
    label: 'Description column wraps, others truncate',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const WrappedWithMaxCellHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with content wrapping and a max cell height.',
      },
    },
  },
  args: {
    wrap: true,
    maxCellHeight: 80,
    data: longTextData,
    columns: longTextColumns,
    height: 500,
    label: 'Max cell height with Show more overlay',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const PerColumnMaxHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a max height configured on specific columns.',
      },
    },
  },
  args: {
    virtualized: false,
    data: longTextData,
    columns: [
      longTextColumns[0],
      longTextColumns[1],
      {
        ...longTextColumns[2],
        cell: { ...longTextColumns[2].cell, wrap: true, maxHeight: 60 },
      },
      longTextColumns[3],
    ],
    height: 500,
    label: 'Only Description column clips at 60px',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const CustomExpandHeightButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a custom expand-height button.',
      },
    },
  },
  args: {
    wrap: true,
    maxCellHeight: 80,
    data: longTextData,
    columns: longTextColumns,
    height: 500,
    label: 'Custom "Show more" button via expandHeightButtonProps',
    customTheme: { main: '#321e5c' },
    expandHeightButtonProps: {
      intent: 'info',
      rightIcon: 'ArrowDownLine',
      children: 'Reveal rest',
    },
  },
};

/**
 * `minimal` strips the tinted background and the cell border from every header
 * cell (each header becomes `transparent` + `flat`). Per-column `header.flat`
 * or `header.transparent` still wins, so a single column can opt back into the
 * bordered look while the rest of the table stays minimal.
 */
export const MinimalHeader: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a minimal header.',
      },
    },
  },
  args: {
    minimal: true,
    label: 'minimal header — no tinted background, no cell border',
    data: longTextData,
    columns: longTextColumns,
    height: 400,
  },
};

/**
 * Same as `MinimalHeader`, but the Status column opts back into the default
 * non-minimal look via `header: { flat: false, transparent: false }`. Confirms
 * that per-column overrides win over the table-wide `minimal` defaults.
 */
export const MinimalHeaderWithOverride: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a minimal header plus an override applied.',
      },
    },
  },
  args: {
    minimal: true,
    label: 'minimal table with one bordered column',
    data: longTextData,
    columns: [
      longTextColumns[0],
      longTextColumns[1],
      longTextColumns[2],
      {
        ...longTextColumns[3],
        header: {
          ...(longTextColumns[3].header || { label: 'Status' }),
          flat: false,
          transparent: false,
        },
      },
    ],
    height: 400,
  },
};

/**
 * `rowHeight` lets a virtualized table pin every row to a fixed pixel height
 * larger than the size-derived default — useful when one column renders
 * multi-line content (e.g. a name plus a row of metadata badges) and you want
 * the table to keep virtualizing AND keep `fill` working. Pair with custom
 * cell content that lays itself out vertically.
 */
export const RowHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Table with a specific row-height applied.',
      },
    },
  },
  args: {
    rowHeight: 72,
    height: 400,
    label: 'rowHeight=72 for stacked content',
    data: longTextData,
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID' },
        width: 60,
        align: 'center',
        cell: { content: 'number' },
      },
      {
        dataId: 'title',
        header: { label: 'Title + description' },
        grow: 3,
        cell: {
          padded: 'none',
          content: ({ title, description }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>
              <span style={{ fontWeight: 500 }}>{title}</span>
              <span
                style={{
                  opacity: 0.7,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  maxWidth: 320,
                }}
              >
                {description}
              </span>
            </div>
          ),
        },
      },
      {
        dataId: 'status',
        header: { label: 'Status' },
        width: 120,
        cell: { content: 'tag:info' },
      },
    ],
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

export const OverscanRowCount: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a scrollable table with the overscan pinned to a single row, so the ' +
          'blank strip a fast scroll leaves at the leading edge is visible on purpose. ' +
          'Left unset, the table renders one viewport of rows beyond the visible band in ' +
          'each direction and no strip appears.',
      },
    },
  },
  args: {
    // One row of cover is deliberately far too little: react-window advances its
    // window from a `setState` in a passive scroll handler, so the browser paints
    // the scrolled container before React commits the rows that belong there.
    // Anything the overscan does not already cover is empty space for a frame.
    // This story is the control for the default, which is `max(8, one viewport)`.
    overscanRowCount: 1,
    height: 400,
    label: 'Overscan pinned to one row',
  },
};

/**
 * Rows that open.
 *
 * A table is the right shape for a list you filter, sort and scan; a panel of
 * detail is the right shape for the one row you have picked out of it. Before
 * this the two could not be the same component, so a surface that wanted both
 * became a list of cards and gave up filtering and sorting to keep its detail.
 *
 * The panel's height is measured rather than declared — it can be anything, and
 * it can change while open — so this works inside the virtualised body too.
 */
export const ExpandableRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table whose rows open into a detail panel. Clicking anywhere on a ' +
          'row toggles it, and the prepended expander column says which rows can open — ' +
          'a row whose `renderExpandedRow` returns nothing gets neither, and its click ' +
          'falls through to whatever the table would otherwise do with it. Two rows are ' +
          'opened here and both stay open; compare with `Expandable Rows Single`, which ' +
          'makes the same two clicks and ends with one.',
      },
    },
  },
  args: {
    height: 500,
    label: 'Expandable rows',
    renderExpandedRow: (row: any) => (
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexFlow: 'column',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <ReqoreH3>{`${row.firstName} ${row.lastName}`}</ReqoreH3>
        <ReqoreP>
          {`Everything the table had no room for lives here — the full address, the ` +
            `exact date, whatever this row is actually about. The panel is ordinary ` +
            `content: any height, and free to change height while it is open.`}
        </ReqoreP>
        <ReqoreTag label={row.occupation} />
      </div>
    ),
  },
  /* Opens TWO rows, and the story below opens the same two. That pairing is the
     point: identical gestures, two panels here and one there, so the pair shows
     what `expandSingle` does rather than asserting it in prose.

     Opened by the story rather than by `defaultExpanded` so the picture holds
     whatever the fixture sorts into the top rows — which id lands first is not
     knowable from here. */
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      if (!canvasElement.querySelectorAll('.reqore-table-row').length) {
        throw new Error('table rows not rendered');
      }
    });

    /* The rows that actually offer an expander, not the first two on screen:
       the fixture disables some rows and a disabled row does not expand, so
       taking them by position opened one panel and quietly asserted two. */
    const expandableRows = () =>
      Array.from(canvasElement.querySelectorAll('.reqore-table-row')).filter((row) =>
        row.querySelector('[data-reqore-table-column-id="expander"] button')
      );

    const clickRow = async (row: Element) => {
      const cells = row.querySelectorAll('.reqore-table-cell');
      await fireEvent.click(cells[cells.length - 1]);
    };

    await clickRow(expandableRows()[0]);
    await clickRow(expandableRows()[1]);

    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-table-row-expanded').length).toBe(2)
    );

    // An open row is still a row: its header must contain its own cells, and the
    // panel below it is not licence for either to spill.
    await expectTableContentWithinItsRows(canvasElement);
  },
};

/** One at a time — for detail heavy enough that two open at once is a scroll. */
export const ExpandableRowsSingle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same table and the same two clicks as `Expandable Rows`, with ' +
          '`expandSingle` set: opening the second row closes the first, so the reader is ' +
          'always looking at exactly one detail panel.',
      },
    },
  },
  args: {
    ...ExpandableRows.args,
    expandSingle: true,
    label: 'Expandable rows, one at a time',
  },
  /* The same two clicks as the story above. Two panels there, one here — that
     difference IS this story. */
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      if (!canvasElement.querySelectorAll('.reqore-table-row').length) {
        throw new Error('table rows not rendered');
      }
    });

    // Same selection as the story above — expandable rows, not the first two on
    // screen, since a disabled row offers no expander.
    const expandableRows = () =>
      Array.from(canvasElement.querySelectorAll('.reqore-table-row')).filter((row) =>
        row.querySelector('[data-reqore-table-column-id="expander"] button')
      );

    const clickRow = async (row: Element) => {
      const cells = row.querySelectorAll('.reqore-table-cell');
      await fireEvent.click(cells[cells.length - 1]);
    };

    await clickRow(expandableRows()[0]);
    await clickRow(expandableRows()[1]);

    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-table-row-expanded').length).toBe(1)
    );

    await expectTableContentWithinItsRows(canvasElement);
  },
};

/**
 * The same feature on a table that sizes itself.
 *
 * No `height`, so the body grows to its content — which is the case that broke:
 * a body sized as `rowCount * rowHeight` is only correct while every row is the
 * same height, and an open panel is not. The row showed as expanded and its
 * detail was clipped clean off the bottom.
 */
/** The row `Static Row` makes static — by id, so sorting cannot move it. The
 *  story sorts by id, so this is the fourth row on screen, inside the
 *  virtualised window; the default sort would put it anywhere in the list. */
const STATIC_ROW_ID = [...tableData.data].sort((a, b) => a.id - b.id)[3].id;

/** A row that opens nothing, among rows that do. */
export const StaticRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every row opens on click (`onRowClick`), except one, which `getRowProps` ' +
          'answers with `interactive: false`: it takes no click and shows no pointer or ' +
          'hover, but it is not dimmed the way a `_disabled` row is — it is a row to read, ' +
          'not a control that is off. For the fixed entry in a table of openable rows: a ' +
          "total, a provider's own namespace, the one the reader may only look at. Said " +
          'once, by the mapper, with nothing marked on the data; the controls inside its ' +
          'cells still work, so it can still be selected.',
      },
    },
  },
  args: {
    selectable: true,
    sort: { by: 'id', direction: 'asc' },
    onRowClick: noop,
    // By identity, not position: a sorted table's fourth row of DATA is
    // not its fourth row on screen.
    getRowProps: ({ id }) => ({ interactive: id !== STATIC_ROW_ID }),
  },
  play: async ({ canvasElement }) => {
    const rows = await waitFor(() => {
      const found = Array.from(canvasElement.querySelectorAll('.reqore-table-row'));
      expect(found.length).toBeGreaterThan(4);
      return found;
    });
    const cellsOf = (row: Element) => Array.from(row.querySelectorAll<HTMLElement>('.reqore-table-cell'));
    const carries = (row: Element, id: number) =>
      cellsOf(row).some((cell) => cell.textContent?.trim() === String(id));
    const staticRow = rows.find((row) => carries(row, STATIC_ROW_ID));
    const otherRow = rows.find((row) => !carries(row, STATIC_ROW_ID));
    expect(staticRow).toBeDefined();
    expect(otherRow).toBeDefined();
    // the static row's cells carry the default cursor; its neighbours the pointer
    expect(getComputedStyle(cellsOf(staticRow!)[2]).cursor).toBe('default');
    expect(getComputedStyle(cellsOf(otherRow!)[2]).cursor).toBe('pointer');
  },
};

export const ExpandableRowsAutoHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A short expandable table with no `height` of its own, so it grows to fit its ' +
          'content. The open row makes the body taller by exactly the panel it reveals, ' +
          'rather than clipping it.',
      },
    },
  },
  args: {
    height: undefined,
    label: 'Expandable rows, self-sizing',
    data: slice(tableData.data as IReqoreTableRowData[], 0, 4),
    /* Opened declaratively: this story is about the body's HEIGHT, and a click
       is a second thing that can go wrong in a picture of the first.

       Index 2, not 1 — row 1 of the fixture is `_disabled`, and a disabled row
       does not expand. The four rows shown include it, so the picture also
       shows a row with no expander at all, which is the other half of the
       contract. */
    defaultExpanded: [(tableData.data as IReqoreTableRowData[])[2]._selectId],
    renderExpandedRow: ExpandableRows.args?.renderExpandedRow,
  },
};

/** Opens-and-scrolls check shared by the two narrow stories below. */
const expectPanelStaysInView = async (canvasElement: HTMLElement) => {
  const panel = await waitFor(() => {
    const el = canvasElement.querySelector<HTMLElement>('.reqore-table-row-expanded');
    if (!el) throw new Error('panel not rendered');
    return el;
  });
  const body = canvasElement.querySelector<HTMLElement>('.reqore-table-body')!;
  const row = panel
    .closest('.reqore-table-row-group')!
    .querySelector<HTMLElement>('.reqore-table-row')!;
  const cell = (id: string) =>
    row.querySelector<HTMLElement>(`[data-reqore-table-column-id="${id}"]`)!;
  const near = (actual: number, expected: number) =>
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);

  // The columns need far more room than the table has…
  const rowWidth = row.getBoundingClientRect().width;
  await expect(rowWidth).toBeGreaterThan(body.clientWidth * 2);
  // …and every column can be scrolled to. A row clipped to the visible width
  // left the body nothing to scroll: the columns past the edge were unreachable.
  await expect(body.scrollWidth).toBeGreaterThanOrEqual(rowWidth - 1);

  // As wide as what the reader can see — not as wide as the columns.
  await waitFor(() => near(panel.getBoundingClientRect().width, body.clientWidth));

  // Move the columns partway. A scroll offset is applied to layout at once,
  // so every position below is already the scrolled one.
  body.scrollLeft = Math.round((body.scrollWidth - body.clientWidth) / 2);
  fireEvent.scroll(body);
  await expect(body.scrollLeft).toBeGreaterThan(0);

  const visible = body.getBoundingClientRect();
  // The open row's pinned columns stayed pinned…
  near(cell('expander').getBoundingClientRect().left, visible.left);
  near(cell('actions').getBoundingClientRect().right, visible.left + body.clientWidth);
  // …and the panel did not go with the rest.
  near(panel.getBoundingClientRect().left, visible.left);
};

/**
 * An open row in a table narrower than its columns — a phone, or a narrow pane.
 *
 * The panel is free-form detail, not a cell, so it is laid out for what the
 * reader can SEE and stays there while the columns scroll under it. It used to
 * be as wide as all the columns together and scroll with them: content that
 * sizes itself to its box laid out for a width nobody could see, and most of it
 * sat off to the right. The same box also clipped the row, which unpinned its
 * pinned columns — they scrolled away like any other.
 */
export const ExpandableRowsNarrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A 380px-wide table — a phone — whose columns need far more than that, with one ' +
          'row open, scrolled partway to the right. The open panel is exactly as wide as ' +
          'the table shows and stays in view while the columns move under it, so its text ' +
          'wraps to the width it is read at. The pinned expander column stays on the left ' +
          'and the pinned actions column on the right, in the open row as in every other.',
      },
    },
  },
  args: {
    width: 380,
    height: 500,
    label: 'Expandable rows, narrow',
    data: slice(tableData.data as IReqoreTableRowData[], 0, 6),
    defaultExpanded: [(tableData.data as IReqoreTableRowData[])[2]._selectId],
    renderExpandedRow: ExpandableRows.args?.renderExpandedRow,
  },
  play: async ({ canvasElement }) => expectPanelStaysInView(canvasElement),
};

/**
 * The same, with wrapping cells — which renders every row rather than a
 * virtualised window, so the row and its panel are laid out by a different
 * body and have to come out the same.
 */
export const ExpandableRowsNarrowWrapped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same narrow table, open row and partway scroll as `Expandable Rows Narrow`, ' +
          'with `wrap` set, so cell text wraps and the body renders every row instead of a ' +
          'window of them. The open panel is again exactly as wide as the table shows and ' +
          'stays in view, and the open row keeps its pinned columns at either edge.',
      },
    },
  },
  args: {
    ...ExpandableRowsNarrow.args,
    wrap: true,
    label: 'Expandable rows, narrow, wrapping',
  },
  play: async ({ canvasElement }) => expectPanelStaysInView(canvasElement),
};

/** A long address, so its row wraps to more than one line. */
const WRAPPING_ROWS = slice(tableData.data as IReqoreTableRowData[], 0, 4).map((row, index) =>
  index === 1
    ? {
        ...row,
        address:
          'Flat 4, The Old Granary, 17 Long Meadow Lane, Little Snoring, Fakenham, Norfolk, ' +
          'NR21 0HP, United Kingdom — deliveries to the side door only',
      }
    : row
);

/**
 * A wrapping table given more height than its rows need.
 *
 * A table that wraps renders every row at its own height, so how tall its rows
 * are is known only once they are drawn. The body was sized by a guess instead —
 * rows × `rowHeight` — which is wrong both ways at once: rows shorter than the
 * guess left a blank band under the last one, and a row that wrapped taller
 * than it cut the body short and scrolled it for no reason.
 */
export const WrappedRowsFitTheirBody: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A four-row table with `wrap` set and a `height` of 600, far more than four rows ' +
          'need; the second row has a long address that wraps onto several lines. The body ' +
          'is exactly as tall as its rows — no blank band under the last one and nothing to ' +
          'scroll — whatever `rowHeight` the table was also given, since wrapped rows take ' +
          'their height from their content. The `height` is the most the body may take.',
      },
    },
  },
  args: {
    wrap: true,
    height: 600,
    rowHeight: 52,
    label: 'Wrapped rows fit their body',
    data: WRAPPING_ROWS,
  },
  play: async ({ canvasElement }) => {
    const body = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>('.reqore-table-body');
      if (!el?.querySelectorAll('.reqore-table-row').length) throw new Error('rows not rendered');
      return el;
    });
    const rows = Array.from(body.querySelectorAll<HTMLElement>('.reqore-table-row'));
    const heights = rows.map((row) => row.getBoundingClientRect().height);
    // The premise: the wrapped row is taller than the others.
    await expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights) + 10);

    const lastRow = rows[rows.length - 1].getBoundingClientRect();
    const bodyBox = body.getBoundingClientRect();
    // No blank band under the last row…
    await expect(Math.abs(bodyBox.bottom - lastRow.bottom)).toBeLessThanOrEqual(1);
    // …and nothing to scroll: every row is in view.
    await expect(body.scrollHeight).toBeLessThanOrEqual(body.clientHeight + 1);

    await expectTableContentWithinItsRows(canvasElement);
  },
};

/* ------------------------------------------------------------------------- */
/* A row's box contains its content — whatever the content is                 */
/* ------------------------------------------------------------------------- */

/**
 * Prose of the kind a real description column holds: a sentence, a paragraph,
 * and one that is neither — the lengths that differ are the point.
 */
const PROSE = [
  'Authorise a card payment with the issuer and return an authorisation handle the caller ' +
    'can pass to capture. The handle is valid for seven days; after that the authorisation ' +
    'expires at the issuer and a fresh one has to be taken before any money moves.',
  'Idempotent on the auth handle.',
  'Reverse a captured payment, partially or in full. Every reversal is audited, the audit ' +
    'record carries the operator who asked for it, and a partial reversal leaves the ' +
    'remainder capturable until the original authorisation expires.',
  'Return the issuer-side status of a payment.',
  'Internal reconciliation helper called by the daily-recon job. It walks yesterday’s ' +
    'settled batch, matches each line against the local ledger, and raises a discrepancy ' +
    'event for anything it cannot account for. Not part of the public REST surface, and ' +
    'not safe to call while a batch is being written.',
];

/** Addresses long enough that one has nowhere to go inside its column. */
const ADDRESSES = [
  'https://payments.internal.example.com:8443/api/v3/gateway/authorisations/pending-review',
  'https://gw.example.com/hook',
  'https://payments.internal.example.com:8443/api/v3/gateway/settlement/reconciliation/daily',
  'amqps://broker-eu-west-1.messaging.example.com:5671/vhost-payments/queues/capture-retry',
  'https://payments.internal.example.com:8443/api/v3/gateway/refunds/partial/authorisations',
];

const STATES = ['Unauthenticated', 'Running', 'Stopped', 'Running', 'Unauthenticated'];

const methodRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    _selectId: index + 1,
    name: ['authorize', 'capture', 'refund', 'status', '_reconcile'][index % 5],
    address: ADDRESSES[index % ADDRESSES.length],
    state: STATES[index % STATES.length],
    description: PROSE[index % PROSE.length],
  }));

/**
 * Columns whose `content` returns an ELEMENT of the caller's own choosing,
 * which is how every real table does it — and the case the table used to get
 * wrong, because the only containment rule it had named the paragraph its own
 * built-in renderers produce.
 */
const customContentColumns: IReqoreTableColumn[] = [
  {
    dataId: 'name',
    header: { label: 'Method' },
    width: 140,
    align: 'left',
    cell: {
      content: ({ name }: any) => (
        <ReqoreSpan effect={{ weight: 'bold', fontFamily: 'mono' }}>{name}</ReqoreSpan>
      ),
    },
  },
  {
    dataId: 'address',
    header: { label: 'Address' },
    width: 220,
    align: 'left',
    cell: {
      content: ({ address }: any) => (
        <ReqoreSpan size='small' effect={{ fontFamily: 'mono' }} tooltip={address}>
          {address}
        </ReqoreSpan>
      ),
    },
  },
  {
    dataId: 'state',
    header: { label: 'State' },
    width: 160,
    align: 'left',
    cell: {
      content: ({ state }: any) => (
        <ReqoreControlGroup gapSize='small' wrap>
          <ReqoreTag
            size='tiny'
            minimal
            intent={state === 'Unauthenticated' ? 'warning' : undefined}
            label={state}
          />
        </ReqoreControlGroup>
      ),
    },
  },
  {
    dataId: 'description',
    header: { label: 'Description' },
    grow: 3,
    minWidth: 220,
    align: 'left',
    cell: {
      content: ({ description }: any) => (
        <ReqoreSpan size='small' effect={{ opacity: 0.7 }} tooltip={description}>
          {description}
        </ReqoreSpan>
      ),
    },
  },
];

/**
 * The defect this guard exists for, in the shape it arrived in.
 *
 * A description column holding paragraphs, in a table that does not wrap — so
 * every row is drawn at one height, decided before the content is laid out.
 * Content laid out taller than that height has nowhere to go: it used to be
 * painted over the rows beneath, two and three descriptions overprinting each
 * other, and a long address was painted across the State chip beside it.
 *
 * Nothing here opts in to anything. A cell contains what it is given because
 * that is what a cell does.
 */
export const LongContentFitsItsRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A description column of paragraphs and an address column of long URLs, with ' +
          'cell content supplied as elements rather than through the built-in renderers. ' +
          'Every cell truncates to the one line its row has room for and keeps its full ' +
          'text on hover; nothing is painted over the row beneath or the column beside.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(12),
    // Narrow on purpose: a description column of about 240px turns each of
    // these paragraphs into six to nine lines, against a row 38px tall. A wide
    // table hides the defect behind two-line prose.
    width: 780,
    height: 400,
    label: 'Long descriptions, fixed-height rows',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};

/** The same content at every size the table offers — the row heights differ,
 *  the invariant does not. */
export const LongContentAtEverySize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same paragraphs at all seven sizes, `micro` through `massive`, so the ' +
          'scale reads end to end: each size is taller and larger-texted than the one ' +
          'above it, and in each the content is laid out to fit the height it has. ' +
          '`micro` and `massive` used to render as `normal` — the size-to-zoom map the ' +
          'table converts through held only the middle five sizes.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(5),
    width: 780,
    height: undefined,
    label: undefined,
  },
  render: (args) => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16 }}>
      {SIZES.map((size) => (
        <ReqoreTable key={size} {...(args as any)} size={size} label={`size: ${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tables = await waitFor(() => {
      const found = Array.from(
        canvasElement.querySelectorAll<HTMLElement>('.reqore-table-wrapper')
      );
      if (found.length !== SIZES.length) {
        throw new Error(`expected ${SIZES.length} tables, found ${found.length}`);
      }
      return found;
    });

    /* The scale, measured. Each table must paint at ITS size — the row at
       `SIZE_TO_PX` (plus the separator line, since these are not `flat`) and the
       cell text at `TEXT_FROM_SIZE` — which is the assertion that fails when a
       size falls off the size-to-zoom map and silently renders as `normal`. */
    for (const [index, size] of SIZES.entries()) {
      const row = tables[index].querySelector<HTMLElement>('.reqore-table-row');
      const cell = tables[index].querySelector<HTMLElement>('.reqore-table-cell');

      await expect(
        Math.round(row.getBoundingClientRect().height),
        `row height at size "${size}"`
      ).toBe(SIZE_TO_PX[size] + 1);
      await expect(getComputedStyle(cell).fontSize, `cell font size at size "${size}"`).toBe(
        `${TEXT_FROM_SIZE[size]}px`
      );
    }

    await expectTableContentWithinItsRows(canvasElement);
  },
};

/**
 * The same content with `wrap`, which is the other honest answer: the table
 * stops virtualising and every row takes the height its content needs, so the
 * whole description is on screen instead of one line of it.
 */
export const LongContentWrapped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same paragraphs with `wrap` set. The rows are no longer one height — each ' +
          'takes the height of its tallest cell — and the full description is readable ' +
          'without a hover. Long addresses break rather than run into the column beside them.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(6),
    wrap: true,
    width: 780,
    height: 500,
    label: 'Long descriptions, wrapped rows',
  },
  play: async ({ canvasElement }) => {
    const rows = await waitFor(() => {
      const found = Array.from(
        canvasElement.querySelectorAll<HTMLElement>('.reqore-table-row')
      );
      if (!found.length) throw new Error('table rows not rendered');
      return found;
    });
    // The premise of this story: wrapped rows are NOT all one height.
    const heights = rows.map((row) => row.getBoundingClientRect().height);
    await expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights) + 10);
    await expectTableContentWithinItsRows(canvasElement);
  },
};

/** `wrap` with a `maxCellHeight`: the deliberate clamp, with its "Show more". */
export const LongContentClampedToMaxCellHeight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Paragraphs with `wrap` and `maxCellHeight`, the middle answer: rows grow, but ' +
          'only so far, and a cell with more to say offers "Show more" rather than ' +
          'letting one row take a screen.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(6),
    wrap: true,
    maxCellHeight: 60,
    width: 780,
    height: 500,
    label: 'Long descriptions, clamped',
  },
  play: async ({ canvasElement }) => {
    /* The clamp knows to offer "Show more" by asking whether its content is
       TALLER than the cell, so anything that pre-shrinks the content to fit
       silently takes the affordance away — the cell then looks like a cell with
       nothing more in it, and the rest of the value is unreachable. That is
       what this asserts; the containment check below would pass either way. */
    await waitFor(() => {
      const overlays = canvasElement.querySelectorAll('.reqore-table-cell-expand');
      if (!overlays.length) throw new Error('no "Show more" overlay rendered');
    });

    await expectTableContentWithinItsRows(canvasElement);
  },
};

/**
 * The virtualised path at the scale it exists for.
 *
 * Five thousand rows of the same content: the window is what is rendered, so
 * the guard measures the rows on screen, scrolls into the middle of the list,
 * and measures again. A fix that only holds for the first screen is not a fix.
 */
export const LongContentAtScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Five thousand rows of the same long content, virtualised. The guard measures ' +
          'the rendered window, scrolls deep into the list, and measures the new window.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(5000),
    width: 780,
    height: 500,
    label: '5,000 rows',
  },
  play: async ({ canvasElement }) => {
    await expectTableContentWithinItsRows(canvasElement);

    const body = canvasElement.querySelector<HTMLElement>('.reqore-table-body');
    if (!body) throw new Error('table body not rendered');
    body.scrollTop = Math.floor(body.scrollHeight / 2);
    await waitFor(() => {
      if (body.scrollTop === 0) throw new Error('body did not scroll');
    });
    await sleep(200);

    await expectTableContentWithinItsRows(canvasElement);
  },
};

/**
 * `wrap` together with an explicit `virtualized`, which the table warns about:
 * a virtualised list positions each row absolutely and has to know its height
 * before its content is laid out, so wrapping cannot make a row taller.
 *
 * The warning is about the wrapping having no effect, not about the row losing
 * hold of its content — that part holds here as everywhere: what does not fit
 * the row is bounded by it rather than painted over the row beneath.
 */
export const LongContentWrappedAndVirtualized: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The contradiction the table warns about — `wrap` with `virtualized` explicitly on. ' +
          'The rows stay one height, so the wrapping buys nothing, and what does not fit is ' +
          'held inside the row rather than drawn over the rows below it.',
      },
    },
  },
  args: {
    columns: customContentColumns,
    data: methodRows(8),
    wrap: true,
    virtualized: true,
    width: 780,
    height: 400,
    label: 'Wrapped rows in a virtualized body',
  },
  play: async ({ canvasElement }) => expectTableContentWithinItsRows(canvasElement),
};
