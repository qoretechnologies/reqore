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
import { sleep } from '../../helpers/utils';
import {
  ReqoreH3,
  ReqoreH4,
  ReqoreIcon,
  ReqoreInput,
  ReqoreP,
  ReqoreTable,
  ReqoreTag,
} from '../../index';
import tableData from '../../mock/tableData';
import { StoryMeta } from '../utils';
import { CustomIntentArg, FlatArg, IntentArg, SizeArg, argManager } from '../utils/args';

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
          'Renders Table with a default filter applied.',
      },
    },
  },
  args: {
    filterable: true,
    filter: 'Village',
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

    const cellsIn = (index: number) =>
      canvasElement
        .querySelectorAll('.reqore-table-row')
        [index].querySelectorAll('.reqore-table-cell');

    await fireEvent.click(cellsIn(0)[cellsIn(0).length - 1]);
    await fireEvent.click(cellsIn(1)[cellsIn(1).length - 1]);

    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-table-row-expanded').length).toBe(2)
    );
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
    const cellsIn = (index: number) =>
      canvasElement.querySelectorAll('.reqore-table-row')[index].querySelectorAll(
        '.reqore-table-cell'
      );

    await waitFor(() => {
      if (!canvasElement.querySelectorAll('.reqore-table-row').length) {
        throw new Error('table rows not rendered');
      }
    });

    await fireEvent.click(cellsIn(0)[cellsIn(0).length - 1]);
    await fireEvent.click(cellsIn(1)[cellsIn(1).length - 1]);

    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-table-row-expanded').length).toBe(1)
    );
  },
};
