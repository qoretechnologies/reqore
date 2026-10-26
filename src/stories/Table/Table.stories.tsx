import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { noop, slice } from 'lodash';
import { StyledEffect } from '../../components/Effect';
import { ReqoreEmptyState } from '../../components/EmptyState';
import {
  IReqoreTableColumn,
  IReqoreTableProps,
  IReqoreTableRowData,
  TReqoreTableCellAction,
} from '../../components/Table';
import { IReqoreCustomTableBodyCellProps } from '../../components/Table/cell';
import { IReqoreCustomHeaderCellProps } from '../../components/Table/header';
import { IReqoreCustomTableRowProps } from '../../components/Table/row';
import { TReqorePaginationType } from '../../constants/paging';
import { SIZES, SIZE_TO_PX, TEXT_FROM_SIZE, TOUCH_TARGET_PX } from '../../constants/sizes';
import { sleep } from '../../helpers/utils';
import {
  ReqoreControlGroup,
  ReqorePanel,
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
import {
  expectControlsInside,
  expectWordsWhole,
  wordsBrokenAcrossLines,
} from '../utils/controlsInside';
import {
  expectRowActionsMenuClosed,
  expectRowActionsMenuItems,
  openRowActionsMenuItems,
  rowActionsMenuButtons,
} from '../utils/rowActionsMenu';
import {
  findCoveredPinnedHeaders,
  findDrawnOverStickyHeader,
  findSeeThroughPinnedHeaders,
  stickyHeaderOf,
} from '../utils/stickyStacking';
import { buttonSays } from '../utils/buttonSays';
import { requiredElement } from '../utils/required';
import { PHONE_STORY, withTouchScreen } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';

import { ThemedSurfaceComparison } from '../utils/themedSurface';
const { createArg } = argManager<IReqoreTableProps>();

/* What each row's three actions do: the stories that use them check the one picked ran, and no other. */
const onAddClick = fn();
const onEditClick = fn();
const onDeleteClick = fn();
const clearRowActionSpies = () =>
  [onAddClick, onEditClick, onDeleteClick].forEach((spy) => spy.mockClear());

/**
 * An input in a cell or a header that can be typed into: it starts with `initialValue` and keeps what is
 * typed. Given a `value` and no `onChange`, it was a field React reports as read-only by mistake.
 */
const EditableInput = ({
  initialValue,
  ...rest
}: Omit<React.ComponentProps<typeof ReqoreInput>, 'value' | 'onChange'> & { initialValue: string }) => {
  const [value, setValue] = useState(initialValue);
  return (
    <ReqoreInput
      {...rest}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  );
};

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
              <EditableInput
                icon='PriceTag2Fill'
                size='small'
                initialValue={firstName}
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
      // Icon buttons: a tooltip is each one's accessible name, and its words in a narrow menu.
      actions: () => [
        {
          icon: 'AddLine',
          intent: 'info',
          tooltip: 'Add',
          onClick: onAddClick,
        },
        {
          icon: 'EditLine',
          intent: 'warning',
          tooltip: 'Edit',
          onClick: onEditClick,
        },
        {
          icon: 'DeleteBinLine',
          intent: 'danger',
          tooltip: 'Delete',
          onClick: onDeleteClick,
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
          content: (
            <EditableInput icon='PriceTag2Fill' initialValue='Custom input value' rounded={false} />
          ),
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

/** A press-and-pull on the table, by the browser's own pointer events (the story runner's mouse moves
 *  the real pointer, so the table sees them as a person's drag). */
const pullSideways = (element: Element, from: number, to: number, pointerType = 'mouse') => {
  const box = element.getBoundingClientRect();
  const y = box.top + box.height / 2;
  const fire = (type: string, x: number, buttons: number) =>
    element.dispatchEvent(
      new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7, pointerType, button: 0, buttons })
    );
  fire('pointerdown', from, 1);
  fire('pointermove', (from + to) / 2, 1);
  fire('pointermove', to, 1);
  fire('pointerup', to, 0);
};

export const DragToScroll: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table wider than its 400px frame with `dragToScroll`. Pulled sideways by its header or its rows, it scrolls; a swipe on the header scrolls it on a touch screen too.',
      },
    },
  },
  args: {
    dragToScroll: true,
    width: 400,
    height: 300,
    label: 'Pull me sideways',
  },
  play: async ({ canvasElement }) => {
    const body = await waitFor(() => {
      const el = canvasElement.querySelector('.reqore-table-body') as HTMLElement | null;
      expect(el).not.toBeNull();
      expect(el!.scrollWidth).toBeGreaterThan(el!.clientWidth);
      return el!;
    });
    const headerCell = canvasElement.querySelector('.reqore-table-header-wrapper .reqore-table-header-cell') as HTMLElement;
    // by the header, with the mouse
    pullSideways(headerCell, 300, 200);
    await waitFor(() => expect(body.scrollLeft).toBe(100));
    // by the header, with a finger
    pullSideways(headerCell, 300, 250, 'touch');
    await waitFor(() => expect(body.scrollLeft).toBe(150));
    // and the header follows the body
    const header = canvasElement.querySelector('.reqore-table-header-wrapper') as HTMLElement;
    await waitFor(() => expect(header.scrollLeft).toBe(150));
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

/* A pinned column at each side, and more columns between them than the box shows. */
const stickyLayerColumns: IReqoreTableColumn[] = [
  { dataId: 'id', header: { label: 'ID' }, width: 70, align: 'center', pin: 'left' },
  { dataId: 'firstName', header: { label: 'First name' }, width: 220 },
  { dataId: 'lastName', header: { label: 'Last name' }, width: 220 },
  { dataId: 'address', header: { label: 'Address' }, width: 320 },
  { dataId: 'occupation', header: { label: 'Occupation' }, width: 220 },
  { dataId: 'age', header: { label: 'Age' }, width: 90, align: 'center', pin: 'right' },
];

export const StickyHeaderAbovePinnedColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A table with a sticky header, a label and a menu, a pinned column at each side and 30 rows, in a box ' +
          '400px high and narrower than its columns. Scrolled, its column headers and then its rows pass under ' +
          'its header, and the header with its label and its menu stays above all of them, the pinned columns ' +
          'too. Scrolled sideways, the column headers between the pinned ones pass under the pinned headers, ' +
          'which hide them.',
      },
    },
  },
  args: {
    label: 'Orders',
    stickyHeader: true,
    actions: [
      {
        label: 'With selected',
        icon: 'CheckboxMultipleLine',
        actions: [{ label: 'Delete', icon: 'DeleteBinLine' }],
      },
    ],
    columns: stickyLayerColumns,
    data: slice(tableData.data, 0, 30),
    height: undefined,
  },
  render: (args) => (
    <div data-testid='sticky-layers-scroller' style={{ height: 400, width: 600, overflow: 'auto' }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectTableContentWithinItsRows(canvasElement);

    const table = canvasElement.querySelector<HTMLElement>('.reqore-table');
    const columnHeaders = table.querySelector('.reqore-table-header-wrapper');
    const firstRow = table.querySelector('.reqore-table-row');

    await expect(stickyHeaderOf(table)).toHaveTextContent('Orders');
    // under the header, its column headers and then its rows
    await expect(findDrawnOverStickyHeader(table, columnHeaders)).toEqual([]);
    await expect(findDrawnOverStickyHeader(table, firstRow)).toEqual([]);

    // sideways, so the column headers between the pinned ones pass under them
    const body = table.querySelector<HTMLElement>('.reqore-table-body');
    body.scrollLeft = 300;
    fireEvent.scroll(body);
    await expect(columnHeaders.scrollLeft).toBe(body.scrollLeft);
    await expect(body.scrollLeft).toBeGreaterThan(0);
    await expect(findSeeThroughPinnedHeaders(table)).toEqual([]);
    await expect(findCoveredPinnedHeaders(table)).toEqual([]);
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
    // a div, not a p: a cell's content may be a block (a paragraph of its own), which a p cannot hold
    <ReqoreP as='div' style={{ width: props.width, flexGrow: props.grow }} block={false}>
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

/* A table's toolbar in a narrow box (qorus#646): on a phone, a table in a card is narrower than the screen,
   and its search field and actions reached past the card - the search field kept its width and the
   toolbar did not wrap. */

/** The width of a card on a 390px phone screen, inside its page's gutters: what the IDE's tables sit in. */
const NARROW_TABLE_WIDTH = 265;

/* A narrow table's row actions (qorus#646): three icon buttons took a third of a phone's table from the
   columns that say which row is which. Narrow, they are one menu button per row that names them. */

/** The actions cells of the rows on screen. */
const actionCells = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>('.reqore-table-row [data-reqore-table-column-id="actions"]')
  );

/** Each row's actions menu button. */
const rowActionsMenus = (root: HTMLElement) =>
  rowActionsMenuButtons(root).filter((button) => button.closest('.reqore-table-row'));

/** One menu button per row, and the actions column no wider than it, so the content has the row. */
const expectRowActionsFolded = async (root: HTMLElement, buttonWidth: number = SIZE_TO_PX.normal) =>
  waitFor(() => {
    const cells = actionCells(root);
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.querySelectorAll('.reqore-button')).toHaveLength(1);
      expect(cell.querySelectorAll('.reqore-row-actions-menu-button')).toHaveLength(1);
      expect(cell.getBoundingClientRect().width).toBeLessThanOrEqual(buttonWidth + 1);
    }
  });

/** The open menu names each action in words, with its icon. */
const expectRowActionsMenu = async () => expectRowActionsMenuItems(['Add', 'Edit', 'Delete']);

export const FilterableInANarrowBox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a searchable table in a 265px box, as a table sits in a card on a phone. The title comes first, its words whole; the search is a button with its icon until it is used, and it and the more button stay inside the box. Each row's three actions are one menu button in a column no wider than it; clicked, it opens a menu naming Add, Edit and Delete with their icons, and Edit runs and closes it without opening the row.",
      },
    },
  },
  args: {
    filterable: true,
    label: 'Services',
    height: 400,
    onRowClick: fn(),
  },
  render: (args) => (
    <div className='narrow-table-box' style={{ width: NARROW_TABLE_WIDTH }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    clearRowActionSpies();
    const box = canvasElement.querySelector('.narrow-table-box') as HTMLElement;
    // narrow, the search is its button until it is used
    await waitFor(() => expect(box.querySelector('.reqore-table-search-toggle')).toBeTruthy());
    expect(box.querySelector('.reqore-panel-title input')).toBeNull();
    // the toolbar: the table's own header scrolls sideways with its columns
    await expectControlsInside(box, box.querySelector('.reqore-panel-title') as HTMLElement);
    // the title first: its words whole, the search field at what is left
    await expectWordsWhole(box.querySelector('.reqore-panel-title-label-box') as HTMLElement);
    // the row's actions: one menu button, which names them and runs the one picked
    await expectRowActionsFolded(box);
    const [first] = rowActionsMenus(box);
    await userEvent.click(first);
    await expectRowActionsMenu();
    await userEvent.click(openRowActionsMenuItems()[1]);
    await waitFor(() => expect(onEditClick).toHaveBeenCalledTimes(1));
    await expectRowActionsMenuClosed();
    expect(onAddClick).not.toHaveBeenCalled();
    expect(onDeleteClick).not.toHaveBeenCalled();
    expect(args.onRowClick).not.toHaveBeenCalled();
    await userEvent.unhover(first);
  },
};

/* A narrow table's search (qorus#646): a button with its icon until it is used, so the title keeps the
   toolbar. Opened, the field takes the toolbar's line; empty, Escape or leaving it closes it again. */

const onFiftyRows = fn();

/** The IDE's list card: a title with its count, a page-size control, the search and the more button. */
const WorkflowsCard = () => (
  <div className='workflows-card' style={{ width: 320, maxWidth: '100%' }}>
    <ReqoreTable
      // its count is the table's own badge
      label='Workflows'
      filterable
      height={300}
      columns={defaultColumns}
      data={tableData.data}
      actions={[{ label: '50 rows', icon: 'ListCheck', onClick: onFiftyRows }]}
    />
  </div>
);

const searchToggle = (root: HTMLElement) =>
  root.querySelector('.reqore-table-search-toggle') as HTMLElement | null;
const openSearch = (root: HTMLElement) =>
  root.querySelector('.reqore-panel-title input') as HTMLInputElement | null;

/** Folded: the search is its button, and the title is whole, not squeezed. */
const expectSearchFolded = async (root: HTMLElement) => {
  await waitFor(() => {
    expect(searchToggle(root)).toBeTruthy();
    expect(openSearch(root)).toBeNull();
  });
  const title = root.querySelector('.reqore-panel-title-label-box') as HTMLElement;
  await expectWordsWhole(title);
  expect(title.textContent).toContain('Workflows');
  for (const label of Array.from(title.querySelectorAll<HTMLElement>('*'))) {
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
  }
  await expectControlsInside(root, root.querySelector('.reqore-panel-title') as HTMLElement);
};

/** Open: the field has the focus and the toolbar's line. */
const expectSearchOpen = async (root: HTMLElement) => {
  await waitFor(() => {
    const input = openSearch(root);
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
    const card = root.getBoundingClientRect();
    expect(input!.getBoundingClientRect().width).toBeGreaterThan(card.width * 0.5);
  });
  await expectControlsInside(root, root.querySelector('.reqore-panel-title') as HTMLElement);
};

export const SearchFoldsInANarrowCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a 320px card holding "Workflows" with its row count, a "50 rows" control, the search and the more button. The search is a button with its icon, so "Workflows" stays whole. Clicked, the search field opens across the toolbar with the focus in it; text typed in it keeps it open, and once emptied, Escape closes it and gives the button the focus back.',
      },
    },
  },
  render: () => <WorkflowsCard />,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.workflows-card') as HTMLElement;
    await expectSearchFolded(card);
    await userEvent.click(searchToggle(card)!);
    await expectSearchOpen(card);
    await userEvent.keyboard('ord');
    await userEvent.keyboard('{Escape}');
    // a search that holds text stays open
    expect(openSearch(card)).toBeTruthy();
    await userEvent.clear(openSearch(card)!);
    await userEvent.keyboard('{Escape}');
    await expectSearchFolded(card);
    await waitFor(() => expect(document.activeElement).toBe(searchToggle(card)));
  },
};

export const SearchFoldedFromTheKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same 320px card, used from the keyboard: Tab reaches the search button, Enter opens the field with the focus in it, Escape closes it while it is empty with the focus back on the button, and Space opens it again.',
      },
    },
  },
  render: () => <WorkflowsCard />,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.workflows-card') as HTMLElement;
    await expectSearchFolded(card);
    searchToggle(card)!.focus();
    await userEvent.keyboard('{Enter}');
    await expectSearchOpen(card);
    await userEvent.keyboard('{Escape}');
    await expectSearchFolded(card);
    await waitFor(() => expect(document.activeElement).toBe(searchToggle(card)));
    await userEvent.keyboard(' ');
    await expectSearchOpen(card);
  },
};

export const SearchFoldedOnATouchScreen: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders the card on a phone (390 px) with a finger: "Workflows" whole beside the search button. A tap on the button opens the search field across the toolbar; a tap on the rows while it is empty closes it, and the title is back.',
      },
    },
  },
  render: () => <WorkflowsCard />,
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.workflows-card') as HTMLElement;
    await withTouchScreen(async (touch) => {
      await expectSearchFolded(card);
      await touch.tap(searchToggle(card)!);
      await expectSearchOpen(card);
      await touch.tap(card.querySelector('.reqore-table-body') ?? card.querySelector('.reqore-table-row')!);
      await expectSearchFolded(card);
    });
  },
};

export const FilterableOnAPhone: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "Renders a searchable table in a card on a phone (390 px, a 16px gutter each side): its title, the search button and the other buttons share the toolbar's one line inside the card - the title is there to read - and none reaches past the screen. Each row's actions are one menu button, so the columns keep the card's width.",
      },
    },
  },
  args: {
    filterable: true,
    label: 'Services',
    height: 400,
  },
  render: (args) => (
    <div style={{ padding: '0 16px', maxWidth: 390, boxSizing: 'border-box' }}>
      <ReqorePanel label='Running services' padded>
        <ReqoreTable {...args} />
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // in a card on a phone the search is its button until it is used
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-table .reqore-table-search-toggle')).toBeTruthy()
    );
    await withViewport(390, 844, async (narrowed) => {
      const table = canvasElement.querySelector('.reqore-table') as HTMLElement;
      await expectControlsInside(table, table.querySelector('.reqore-panel-title') as HTMLElement);
      // the title keeps room to be read, its words whole: the search field gives up its width first
      await waitFor(() =>
        expect(
          (table.querySelector('.reqore-panel-title-label-box') as HTMLElement).getBoundingClientRect()
            .width
        ).toBeGreaterThanOrEqual(40)
      );
      await expectWordsWhole(table.querySelector('.reqore-panel-title-label-box') as HTMLElement);
      await expectRowActionsFolded(table);
      if (narrowed) {
        await waitFor(() =>
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
        );
      }
    });
  },
};

export const TitleWordWiderThanItsSpace: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a searchable table in a 320px box whose title is one word wider than the space left beside its search button and more button: only then is the word broken, and it stays inside the title's box, as the controls stay inside the panel.",
      },
    },
  },
  args: {
    filterable: true,
    label: 'Supercalifragilisticexpialidocious',
    height: 400,
  },
  render: (args) => (
    <div className='narrow-table-box' style={{ width: 320 }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.narrow-table-box') as HTMLElement;
    // narrow, the search is its button until it is used
    await waitFor(() => expect(box.querySelector('.reqore-table-search-toggle')).toBeTruthy());
    await expectControlsInside(box, box.querySelector('.reqore-panel-title') as HTMLElement);
    const label = box.querySelector('.reqore-panel-title-label-box') as HTMLElement;
    // broken, because it does not fit whole: not cut off at the box's edge
    await waitFor(() =>
      expect(wordsBrokenAcrossLines(label)).toEqual(['Supercalifragilisticexpialidocious'])
    );
    const heading = label.querySelector('.reqore-heading') as HTMLElement;
    expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth + 1);
  },
};

export const RowActionsInlineWhenWide: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a table in a 720px box: wide enough, so each row's Add, Edit and Delete are icon buttons side by side, as they always were, each named by its tooltip for a screen reader; there is no menu button.",
      },
    },
  },
  args: {
    label: 'Services',
    height: 400,
  },
  render: (args) => (
    <div className='wide-table-box' style={{ width: 720 }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.wide-table-box') as HTMLElement;
    await waitFor(() => {
      const cells = actionCells(box);
      expect(cells.length).toBeGreaterThan(0);
      for (const cell of cells) {
        expect(
          Array.from(cell.querySelectorAll('.reqore-button')).map((button) =>
            button.getAttribute('aria-label')
          )
        ).toEqual(['Add', 'Edit', 'Delete']);
      }
    });
    expect(box.querySelector('.reqore-row-actions-menu')).toBeNull();
  },
};

export const RowActionsMenuOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a table in a 265px box with the first row's actions menu open: Add, Edit and Delete, each with its icon and its colour.",
      },
    },
  },
  args: {
    label: 'Services',
    height: 400,
  },
  render: (args) => (
    <div className='narrow-table-box' style={{ width: NARROW_TABLE_WIDTH }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.narrow-table-box') as HTMLElement;
    await expectRowActionsFolded(box);
    const [first] = rowActionsMenus(box);
    await userEvent.click(first);
    await expectRowActionsMenu();
    await userEvent.unhover(first);
  },
};

/* A wide table draws a cell action's label in its button, as it did before the narrow menu existed
   (qorus#646 had it as the button's tooltip only, at any width: a labelled action was a blank
   button). */

const LABELLED_ACTIONS_COLUMNS: IReqoreTableColumn[] = [
  { dataId: 'name', header: { label: 'Name' }, width: 200, grow: 2 },
  {
    dataId: 'actions',
    header: { label: 'Actions' },
    width: 220,
    cell: {
      padded: 'none',
      actions: () => [
        { icon: 'EditLine', label: 'Open', onClick: onEditClick },
        { icon: 'DeleteBinLine', intent: 'danger', tooltip: 'Delete', onClick: onDeleteClick },
      ],
    },
  },
];

export const RowActionLabelsWhenWide: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table in a 720px box whose rows each offer Open, a labelled action, and Delete, an icon-only one. Wide, Open shows its word beside its icon, inside its button, and Delete its icon alone, named by its tooltip for a screen reader; there is no menu button.',
      },
    },
  },
  args: {
    label: 'Services',
    columns: LABELLED_ACTIONS_COLUMNS,
    data: [{ name: 'Orders' }, { name: 'Invoices' }, { name: 'Shipments' }],
    height: 300,
  },
  render: (args) => (
    <div className='wide-table-box' style={{ width: 720 }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.wide-table-box') as HTMLElement;
    const cells = await waitFor(() => {
      const found = actionCells(box);
      expect(found).toHaveLength(3);
      return found;
    });
    for (const cell of cells) {
      const [open, remove] = Array.from(cell.querySelectorAll<HTMLElement>('.reqore-button'));
      // the label is drawn, in sight, inside its button
      const text = open.querySelector<HTMLElement>(
        '.reqore-button-text-content:not([aria-hidden])'
      ) as HTMLElement;
      expect(text).toHaveTextContent('Open');
      expect(text).toBeVisible();
      const textBox = text.getBoundingClientRect();
      const buttonBox = open.getBoundingClientRect();
      expect(textBox.width).toBeGreaterThan(0);
      expect(textBox.left).toBeGreaterThanOrEqual(buttonBox.left - 0.5);
      expect(textBox.right).toBeLessThanOrEqual(buttonBox.right + 0.5);
      expect(open).not.toHaveAttribute('aria-label');
      // an icon-only action draws no text and is named by its tooltip
      expect(remove.textContent).toBe('');
      expect(remove).toHaveAttribute('aria-label', 'Delete');
    }
    expect(box.querySelector('.reqore-row-actions-menu')).toBeNull();
  },
};

/* A narrow table's one-action column (qorus#646): where a table is a phone's width or narrower, its actions
   column folds. A row with one action keeps it as a button there; one with no icon says its `shortLabel`,
   or its label where it has none, and the column is as wide as those words take in their button - folded
   to the menu button's square, "Test" was cut to "T…". */

const onTestConnectionClick = fn();

/**
 * A table of connections whose rows each have one action with no icon, in an actions column 200px wide; the
 * names take what is left, at least 100px, so a folded column fits beside them in a card on a phone.
 */
const oneActionColumns = (action: TReqoreTableCellAction): IReqoreTableColumn[] => [
  { dataId: 'name', header: { label: 'Name' }, width: 100, grow: 2 },
  {
    dataId: 'actions',
    header: { label: 'Actions' },
    width: 200,
    cell: { padded: 'none', actions: () => [{ ...action, onClick: onTestConnectionClick }] },
  },
];

const ONE_ACTION_TABLE_DATA = [{ name: 'orders-db' }, { name: 'billing-db' }, { name: 'audit-db' }];

/** The widths the stories draw the table at: wide, then the widest and the narrowest where it folds. */
const ONE_ACTION_TABLE_WIDTHS = [720, 480, NARROW_TABLE_WIDTH];

const OneActionTables = (args: IReqoreTableProps) => (
  <ReqoreControlGroup vertical gapSize='big'>
    {ONE_ACTION_TABLE_WIDTHS.map((width) => (
      <div key={width} className={`table-box-${width}`} style={{ width }}>
        <ReqoreTable {...args} label={`${args.label} · ${width}px`} />
      </div>
    ))}
  </ReqoreControlGroup>
);

/**
 * Wide, each row's action says its label. Folded (480px and narrower), it says `folded`: whole, in sight
 * inside its button, not cut to an ellipsis, in a column no wider than those words and the button's
 * padding - narrower than it was. Its label is its accessible name and its tooltip, and a click runs it.
 */
const expectFoldedActionsSay = async (
  canvasElement: HTMLElement,
  label: string,
  folded: string
) => {
  onTestConnectionClick.mockClear();
  const buttonsIn = (width: number) =>
    actionCells(requiredElement(`.table-box-${width}`, `the ${width}px box`, canvasElement)).map(
      (cell) => requiredElement('.reqore-button', "the cell's action", cell)
    );
  await waitFor(() => {
    for (const width of ONE_ACTION_TABLE_WIDTHS) {
      expect(buttonsIn(width)).toHaveLength(ONE_ACTION_TABLE_DATA.length);
    }
  });

  // wide: the label, in the column's own width
  const [wideButton] = buttonsIn(720);
  for (const button of buttonsIn(720)) {
    expect(buttonSays(button)).toBe(label);
  }
  const wideWidth = wideButton.getBoundingClientRect().width;

  for (const width of [480, NARROW_TABLE_WIDTH]) {
    const tableBox = requiredElement(
      `.table-box-${width}`,
      `the ${width}px box`,
      canvasElement
    ).getBoundingClientRect();
    for (const button of buttonsIn(width)) {
      await waitFor(() => expect(buttonSays(button)).toBe(folded));
      const text = button.querySelector<HTMLElement>(
        '.reqore-button-text-content:not([aria-hidden])'
      ) as HTMLElement;
      expect(text).toBeVisible();
      const textBox = text.getBoundingClientRect();
      const buttonBox = button.getBoundingClientRect();
      expect(textBox.width).toBeGreaterThan(0);
      expect(textBox.left).toBeGreaterThanOrEqual(buttonBox.left - 0.5);
      expect(textBox.right).toBeLessThanOrEqual(buttonBox.right + 0.5);
      // whole: not cut short to an ellipsis
      expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
      // as wide as the words and the button's padding (and its 1px spacers, and 2px of rounding)
      const style = getComputedStyle(button);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      expect(buttonBox.width).toBeLessThanOrEqual(textBox.width + padding + 4);
      // the column folded: narrower than it was, and in sight inside the table
      expect(buttonBox.width).toBeLessThan(wideWidth);
      expect(buttonBox.right).toBeLessThanOrEqual(tableBox.right + 0.5);
      expect(button).toHaveAccessibleName(label);
    }
  }

  const [first] = buttonsIn(NARROW_TABLE_WIDTH);
  if (folded !== label) {
    // its tooltip is the label it does not say
    await userEvent.hover(first);
    await waitFor(() =>
      expect(document.querySelector('.reqore-popover-content')).toHaveTextContent(label)
    );
  }
  // and it runs
  await userEvent.click(first);
  await waitFor(() => expect(onTestConnectionClick).toHaveBeenCalledTimes(1));
  await userEvent.unhover(first);
  first.blur();
};

export const FoldedColumnSaysTheShortLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: `Renders a table of connections whose rows each have one action, Test the connection, with no icon and a short label, Test - in a 720px box, a 480px one (a phone's width, the widest where the actions column folds) and a ${NARROW_TABLE_WIDTH}px one (a card on a phone). In the 720px box the action says Test the connection. In the 480px and ${NARROW_TABLE_WIDTH}px boxes the column folds to the width of Test in its button, narrower than it was but not cut to an ellipsis; Test the connection is its accessible name and its tooltip.`,
      },
    },
  },
  args: {
    label: 'Connections',
    columns: oneActionColumns({ label: 'Test the connection', shortLabel: 'Test' }),
    data: ONE_ACTION_TABLE_DATA,
    height: 200,
  },
  render: (args) => <OneActionTables {...args} />,
  play: async ({ canvasElement }) =>
    expectFoldedActionsSay(canvasElement, 'Test the connection', 'Test'),
};

export const FoldedColumnSaysTheFullLabelWithoutAShortLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: `Renders the same table with an action that has no icon and no short label, Test the connection, in a 720px, a 480px and a ${NARROW_TABLE_WIDTH}px box. Folded, at 480px and ${NARROW_TABLE_WIDTH}px, it still says Test the connection, whole and beside the names: the column is as wide as the label in its button, a little narrower than it was, rather than the menu button's square that cut it to "T…". As it says its label, it needs no tooltip.`,
      },
    },
  },
  args: {
    label: 'Connections',
    columns: oneActionColumns({ label: 'Test the connection' }),
    data: ONE_ACTION_TABLE_DATA,
    height: 200,
  },
  render: (args) => <OneActionTables {...args} />,
  play: async ({ canvasElement }) =>
    expectFoldedActionsSay(canvasElement, 'Test the connection', 'Test the connection'),
};

/* A wide toolbar beside a long one-line description (qorus#646): the narrow bar's rule - the title
   first, the actions from what it leaves - applied at every width took the description's one-line
   width as the title's claim, and squeezed the search to its least instead of wrapping the
   description. */

const LONG_DESCRIPTION =
  'Every workflow this instance runs, with the order it was started in, ' +
  'its current status and the service that owns it';

export const WideToolbarBesideALongDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a filterable table in a 900px box whose title has a long one-line description. The search field keeps its width beside it and the description wraps under the title, as on a wide bar it always did; nothing in the toolbar reaches past the panel.',
      },
    },
  },
  args: {
    label: 'Workflows',
    description: LONG_DESCRIPTION,
    filterable: true,
    columns: LABELLED_ACTIONS_COLUMNS,
    data: [{ name: 'Orders' }, { name: 'Invoices' }, { name: 'Shipments' }],
    height: 300,
  },
  render: (args) => (
    <div className='wide-table-box' style={{ width: 900 }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector('.wide-table-box') as HTMLElement;
    const bar = box.querySelector('.reqore-panel-title') as HTMLElement;
    const search = await waitFor(() => {
      const input = openSearch(box);
      expect(input).toBeTruthy();
      return input?.closest('.reqore-control-wrapper') as HTMLElement;
    });
    await waitFor(() => expect(search.getBoundingClientRect().width).toBeGreaterThan(150));
    expect(searchToggle(box)).toBeNull();
    const description = bar.querySelector('.reqore-panel-title-description') as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(description);
    const lines = new Set(Array.from(range.getClientRects()).map(({ top }) => Math.round(top)));
    expect(lines.size).toBeGreaterThan(1);
    await expectControlsInside(box, bar);
  },
};

export const RowActionsMenuFromTheKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a table in a 265px box, its rows' actions folded into one menu button each. From the keyboard, Tab goes from one row's button to the next and Enter opens the menu; the arrow keys move the focus through the menu's items to Delete, a menu item a screen reader reads, and Enter runs it and closes the menu with the focus back on the button; Space opens it again and Escape puts it away, the focus on the button again. The row itself is never opened.",
      },
    },
  },
  args: {
    label: 'Services',
    height: 400,
    onRowClick: fn(),
  },
  render: (args) => (
    <div className='narrow-table-box' style={{ width: NARROW_TABLE_WIDTH }}>
      <ReqoreTable {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    clearRowActionSpies();
    const box = canvasElement.querySelector('.narrow-table-box') as HTMLElement;
    await expectRowActionsFolded(box);
    const [first, second] = rowActionsMenus(box);
    expect(second).toHaveAttribute('aria-label', 'Actions');

    first.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(second);

    await userEvent.keyboard('{Enter}');
    await expectRowActionsMenu();
    await waitFor(() => expect(second).toHaveAttribute('aria-expanded', 'true'));
    // the button controls the open menu, and the arrow keys take the focus to its items
    const menu = document.getElementById(second.getAttribute('aria-controls') as string);
    expect(menu).toHaveAttribute('role', 'menu');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(document.activeElement?.textContent).toContain('Delete'));
    expect(document.activeElement).toHaveAttribute('role', 'menuitem');
    expect(menu?.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(onDeleteClick).toHaveBeenCalledTimes(1));
    await expectRowActionsMenuClosed();
    expect(document.activeElement).toBe(second);

    await userEvent.keyboard(' ');
    await expectRowActionsMenu();
    await userEvent.keyboard('{Escape}');
    await expectRowActionsMenuClosed();
    await waitFor(() => expect(second).toHaveAttribute('aria-expanded', 'false'));
    expect(document.activeElement).toBe(second);

    expect(onAddClick).not.toHaveBeenCalled();
    expect(onEditClick).not.toHaveBeenCalled();
    expect(args.onRowClick).not.toHaveBeenCalled();
  },
};

export const RowActionsMenuOnATouchScreen: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "Renders a table in a card on a phone (390 px). Each row's actions are one menu button; on a touch screen it is a finger's size (44px each way, the rows as tall), a tap opens the menu - its rows a finger's height too - and a tap on Delete runs it and closes the menu without opening the row. Nothing reaches past the screen.",
      },
    },
  },
  args: {
    label: 'Services',
    height: 400,
    onRowClick: fn(),
  },
  render: (args) => (
    <div style={{ padding: '0 16px', maxWidth: 390, boxSizing: 'border-box' }}>
      <ReqorePanel label='Running services' padded>
        <ReqoreTable {...args} />
      </ReqorePanel>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    clearRowActionSpies();
    await withTouchScreen(async (touch) => {
      const table = canvasElement.querySelector('.reqore-table') as HTMLElement;
      // a finger's button: only a real touch screen makes the pointer coarse
      await expectRowActionsFolded(table, touch.real ? TOUCH_TARGET_PX : SIZE_TO_PX.normal);
      if (touch.real) {
        await waitFor(() => {
          for (const button of rowActionsMenus(table)) {
            const box = button.getBoundingClientRect();
            expect(box.width).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
            expect(box.height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }

      await touch.tap(rowActionsMenus(table)[0]);
      await expectRowActionsMenu();
      if (touch.real) {
        await waitFor(() => {
          for (const item of openRowActionsMenuItems()) {
            expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }
      await touch.tap(openRowActionsMenuItems()[2]);
      await waitFor(() => expect(onDeleteClick).toHaveBeenCalledTimes(1));
      await expectRowActionsMenuClosed();
      expect(onAddClick).not.toHaveBeenCalled();
      expect(onEditClick).not.toHaveBeenCalled();
      expect(args.onRowClick).not.toHaveBeenCalled();

      if (touch.narrowed) {
        await waitFor(() =>
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
        );
      }
    });
  },
};

export const ThemedPanelSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a table with a pinned first column on the default and on the themed surface: with `theme.panel` set the rows and the pinned cells sit on the panel surface, their lines are the hairline, and the header cells take the themed button surface.',
      },
    },
  },
  render: () => (
    <ThemedSurfaceComparison>
      <ReqoreTable
        label='Business areas'
        columns={[
          { dataId: 'area', header: { label: 'Area' }, pin: 'left', width: 200 },
          { dataId: 'events', header: { label: 'Events' }, width: 120 },
          { dataId: 'success', header: { label: 'Success' }, width: 120 },
        ]}
        data={[
          { area: 'Order Management', events: 4820, success: '96.9%' },
          { area: 'Payment Processing', events: 1812, success: '91.3%' },
          { area: 'Inventory Management', events: 1190, success: '99.2%' },
        ]}
      />
    </ThemedSurfaceComparison>
  ),
};
