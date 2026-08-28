import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn, IReqoreTableProps } from '../src/components/Table';
import tableData from '../src/mock/tableData';

/** `n` rows of the mock fixture, cycled so the ids stay unique. */
const makeRows = (n: number) =>
  Array.from({ length: n }, (_, index) => ({
    ...(tableData.data as any[])[index % (tableData.data as any[]).length],
    id: index + 1,
    _selectId: index + 1,
  }));

beforeAll(() => {
  vi.useFakeTimers();
  vi.setConfig({ testTimeout: 30000 });
});

test('Renders basic <Table /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...tableData} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-column-group-header').length).toBe(2);
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(10);
  // 8 rows fit the default body height; the rest are overscan. This asserted 10
  // when the body ran on react-window's default overscan of 2 — i.e. it pinned
  // the behaviour that made a fast scroll go blank. The default is now a
  // viewport of rows in each direction, floored at 8, so a table parked at the
  // top renders 8 visible + 8 below.
  expect(document.querySelectorAll('.reqore-table-row').length).toBe(16);
});

test('Renders <Table /> with grouped columns properly', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: {
          label: 'ID',
        },
        width: 50,
        align: 'center',
      },
      {
        header: {
          label: 'Name',
          columns: [
            { dataId: 'firstName', header: { label: 'First Name' }, width: 150, grow: 2 },
            { dataId: 'lastName', header: { label: 'Last Name' }, width: 150, grow: 1 },
          ],
        },
        dataId: 'name',
        grow: 3,
      },
      { dataId: 'address', header: { label: 'Address' }, width: 300, grow: 2 },
      {
        dataId: 'age',
        header: { label: 'Really long age header' },
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
      { dataId: 'group', header: { label: 'Group' }, width: 150 },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-column-group').length).toBe(1);
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);
});

test('Renders <Table /> with custom content', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID' },
        width: 50,
        align: 'center',
        cell: {
          content: ({ id }) => <span>ID {id}</span>,
        },
      },
      {
        header: {
          label: 'Name',
          columns: [
            { dataId: 'firstName', header: { label: 'First Name' }, width: 150, grow: 2 },
            { dataId: 'lastName', header: { label: 'Last Name' }, width: 150, grow: 1 },
          ],
        },
        dataId: 'name',
        grow: 3,
      },
      { dataId: 'address', header: { label: 'Address' }, width: 300, grow: 2 },
      {
        dataId: 'age',
        header: { label: 'Really long age header' },
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
      { dataId: 'group', header: { label: 'Group' }, width: 150 },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const idCell = firstRow!.querySelector('.reqore-table-cell');

  expect(idCell!.textContent).toBe('ID 1');
});

test('Renders <Table /> with predefined content', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID' },
        width: 50,
        align: 'center',
        cell: {
          content: 'tag:info',
        },
      },
      {
        header: {
          label: 'Name',
          columns: [
            {
              dataId: 'firstName',
              header: { label: 'First Name' },
              width: 150,
              grow: 2,
              cell: {
                content: 'tag:#000000',
              },
            },
            {
              dataId: 'lastName',
              header: { label: 'Last Name' },
              width: 150,
              grow: 1,
              cell: {
                content: 'title:success',
              },
            },
          ],
        },
        dataId: 'name',
        grow: 3,
      },
      {
        dataId: 'address',
        header: { label: 'Address' },
        width: 300,
        grow: 2,
        cell: { content: 'text:warning' },
      },
      {
        dataId: 'age',
        header: { label: 'Really long age header' },
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
      { dataId: 'group', header: { label: 'Group' }, width: 150 },
      { dataId: 'date', header: { label: 'Date' }, cell: { content: 'time-ago' } },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');

  const idCell = firstRow!.querySelectorAll('.reqore-table-cell')[0];
  const firstNameCell = firstRow!.querySelectorAll('.reqore-table-cell')[1];
  const lastNameCell = firstRow!.querySelectorAll('.reqore-table-cell')[2];
  const addressCell = firstRow!.querySelectorAll('.reqore-table-cell')[3];

  expect(idCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(firstNameCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(lastNameCell.querySelector('h4')).toBeTruthy();
  expect(addressCell.querySelector('p.reqore-paragraph')).toBeTruthy();
});

test('Sorting on <Table /> works properly', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID' },
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'firstName', header: { label: 'First Name' }, width: 150 },
      { dataId: 'lastName', header: { label: 'Last Name' }, width: 150, sortable: true },
      { dataId: 'address', header: { label: 'Address' }, width: 300, grow: 2 },
      {
        dataId: 'age',
        header: { label: 'Really long age header' },
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
      { dataId: 'group', header: { label: 'Group' }, width: 150 },
    ],
    sort: {
      by: 'id',
      direction: 'desc',
    },
  };

  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSortChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const idCell = firstRow!.querySelector('.reqore-table-cell');

  expect(idCell!.textContent).toBe('1000');

  const lastNameHeaderCell = document.querySelectorAll('.reqore-table-header-cell')[2];

  fireEvent.click(lastNameHeaderCell);

  vi.advanceTimersByTime(1);

  const sortButton = document.querySelectorAll('.reqore-menu-item')[0];

  fireEvent.click(sortButton);

  expect(fn).toHaveBeenCalledWith({ by: 'lastName', direction: 'desc' });

  const lastNameCell = firstRow!.querySelectorAll('.reqore-table-cell')[2];

  expect(lastNameCell.textContent).toBe('Zold');

  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[2]);

  vi.advanceTimersByTime(1);

  const sortButtonAfter = document.querySelectorAll('.reqore-menu-item')[0];

  fireEvent.click(sortButtonAfter);

  expect(fn).toHaveBeenLastCalledWith({ by: 'lastName', direction: 'asc' });
  expect(lastNameCell.textContent).toBe('Abbess');
  expect(idCell!.textContent).toBe('543');
});

test('Rows on <Table /> can be selected', () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow!.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell!);

  expect(fn).toHaveBeenCalledWith([1]);

  const secondRow = document.querySelectorAll('.reqore-table-row')[1];
  const secondCheckCell = secondRow.querySelector('.reqore-table-cell');

  fireEvent.click(secondCheckCell!);

  expect(fn).toHaveBeenLastCalledWith([1, 2]);
});

test('Controlled <Table /> selection follows props without echoing stale values', () => {
  const data = {
    ...tableData,
    selectable: true,
  };
  const fn = vi.fn();
  const renderTable = (selected: (string | number)[]) => (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} selected={selected} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const { rerender } = render(renderTable([1]));

  fn.mockClear();
  rerender(renderTable([]));

  expect(fn).not.toHaveBeenCalled();

  const secondRow = document.querySelectorAll('.reqore-table-row')[1];
  const secondCheckCell = secondRow.querySelector('.reqore-table-cell');

  fireEvent.click(secondCheckCell!);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith([2]);
});

test('Rows on <Table /> can be selected, does not keep internal state', () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectClick={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow!.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell!);

  expect(fn).toHaveBeenCalledWith(1);

  const secondRow = document.querySelectorAll('.reqore-table-row')[1];
  const secondCheckCell = secondRow.querySelector('.reqore-table-cell');

  fireEvent.click(secondCheckCell!);

  expect(fn).toHaveBeenLastCalledWith(2);
});

test('Rows on <Table /> cannot be selected if _selectId is missing', () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const thirdRow = document.querySelectorAll('.reqore-table-row')[2];
  const thirdCheckCell = thirdRow.querySelector('.reqore-table-cell');

  fireEvent.click(thirdCheckCell!);

  const fourthRow = document.querySelectorAll('.reqore-table-row')[3];
  const fourthCheckCell = fourthRow.querySelector('.reqore-table-cell');

  fireEvent.click(fourthCheckCell!);

  expect(fn).toHaveBeenCalledTimes(1);
});

test('Non-virtualized <Table /> renders every row in the DOM', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    virtualized: false,
    height: 200,
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-row').length).toBe(tableData.data.length);
});

test('Wrapped <Table /> renders rows with min-height instead of fixed height', () => {
  const longText =
    'This is a deliberately long description that should wrap onto multiple lines in a sufficiently narrow cell so that we can observe row height growing past the baseline.';

  const data: IReqoreTableProps = {
    ...tableData,
    wrap: true,
    width: 500,
    height: 400,
    columns: [
      { dataId: 'id', header: { label: 'ID' }, width: 60, align: 'center' },
      {
        dataId: 'description',
        header: { label: 'Description' },
        grow: 2,
        cell: { content: 'text' },
      },
    ],
    data: [
      { id: 1, description: longText },
      { id: 2, description: 'Short' },
      { id: 3, description: longText },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rows = document.querySelectorAll('.reqore-table-row');
  expect(rows.length).toBe(3);
  expect(document.querySelectorAll('.reqore-table-cell[wrap]').length).toBe(0);
  rows.forEach((row) => {
    const inline = (row as HTMLElement).style.minHeight;
    expect(inline === '' || inline.endsWith('px')).toBe(true);
  });
});

test('<Table /> with rowHeight override renders every virtualized row at that height', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    rowHeight: 80,
    width: 500,
    height: 400,
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rows = document.querySelectorAll('.reqore-table-row');
  expect(rows.length).toBeGreaterThan(0);
  // react-window assigns inline style.height to each virtualized row from
  // the FixedSizeList itemSize, which now reflects our `rowHeight` override.
  rows.forEach((row) => {
    expect((row as HTMLElement).style.height).toBe('80px');
  });
});

test('<Table /> without rowHeight falls back to the size-derived row height', () => {
  // size defaults to 'normal' (38px) and flat is undefined ⇒ rowHeight = 38 + 1 = 39px.
  const data: IReqoreTableProps = {
    ...tableData,
    width: 500,
    height: 400,
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rows = document.querySelectorAll('.reqore-table-row');
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach((row) => {
    expect((row as HTMLElement).style.height).toBe('39px');
  });
});

test('<Table /> rowHeight=0 is ignored (falls back to size-derived default)', () => {
  // Guard against an accidental pass-through of `rowHeight: 0` collapsing every row.
  const data: IReqoreTableProps = {
    ...tableData,
    rowHeight: 0,
    width: 500,
    height: 400,
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rows = document.querySelectorAll('.reqore-table-row');
  expect(rows.length).toBeGreaterThan(0);
  rows.forEach((row) => {
    expect((row as HTMLElement).style.height).toBe('39px');
  });
});

test('<Table /> renders a single header wrapper even with pinned columns', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      { dataId: 'id', header: { label: 'ID' }, width: 60, pin: 'left' },
      { dataId: 'firstName', header: { label: 'First Name' }, width: 150 },
      { dataId: 'lastName', header: { label: 'Last Name' }, width: 150 },
      { dataId: 'address', header: { label: 'Address' }, width: 300, pin: 'right' },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-header-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-table-wrapper').length).toBe(1);
});

test('Rows on <Table /> are all selected/deselected when clicking on header', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    selectable: true,
  };

  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} onSelectedChange={fn} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const header = document.querySelector('.reqore-table-header-wrapper');
  const firstHeaderCell = header!.querySelector('.reqore-table-header-cell');

  fireEvent.click(firstHeaderCell!);

  const selectableData = tableData.data
    .filter((datum) => datum._selectId ?? false)
    .map((datum) => datum._selectId);

  expect(fn).toHaveBeenCalledWith(selectableData);

  fireEvent.click(firstHeaderCell!);

  expect(fn).toHaveBeenLastCalledWith([]);

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow!.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell!);
  fireEvent.click(firstHeaderCell!);

  expect(fn).toHaveBeenLastCalledWith(selectableData);
});

test('Cells on <Table /> are interactive', () => {
  const fn = vi.fn();
  const data: IReqoreTableProps = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: { label: 'ID', tooltip: 'Custom ID tooltip nice' },
        width: 50,
        align: 'center',
        sortable: true,
        cell: {
          onClick: ({ id }) => {
            fn(id);
          },
        },
      },
      {
        header: {
          label: 'Name',
          columns: [
            {
              dataId: 'firstName',
              header: {
                label: 'First Name',
                icon: 'SlideshowLine',
                effect: {
                  gradient: {
                    colors: {
                      0: 'success',
                      100: 'info',
                    },
                  },
                },
              },
              width: 150,
              grow: 2,
            },
            {
              dataId: 'lastName',
              header: { label: 'Last Name', icon: 'SlideshowLine' },
              width: 150,
              grow: 1,
              sortable: true,
            },
          ],
        },
        dataId: 'name',
        grow: 3,
      },
      {
        dataId: 'address',
        header: { label: 'Address', onClick: () => alert('clicked address') },
        width: 300,
        grow: 2,
      },
      {
        dataId: 'age',
        header: { label: 'Really long age header', icon: 'User4Line' },
        width: 50,
        align: 'center',
        sortable: true,
      },
      {
        header: {
          label: 'Data',
          columns: [
            { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
            { dataId: 'group', header: { label: 'Groups' }, width: 150 },
          ],
        },
        dataId: 'data',
      },
    ],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow!.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell!);

  expect(fn).toHaveBeenCalledWith(1);
});

const TestingTableWithState = () => {
  const [columns, setColumns] = useState<IReqoreTableColumn[]>([
    {
      dataId: 'id',
      header: { label: 'ID', tooltip: 'Custom ID tooltip nice' },
      width: 50,
      align: 'center',
      sortable: true,
    },
    {
      header: {
        label: 'Name',
        columns: [
          {
            dataId: 'firstName',
            header: {
              label: 'First Name',
              icon: 'SlideshowLine',
              effect: {
                gradient: {
                  colors: {
                    0: 'success',
                    100: 'info',
                  },
                },
              },
            },
            width: 150,
            grow: 2,
          },
          {
            dataId: 'lastName',
            header: { label: 'Last Name', icon: 'SlideshowLine' },
            width: 150,
            grow: 1,
            sortable: true,
          },
        ],
      },
      dataId: 'name',
      grow: 3,
    },
    {
      dataId: 'address',
      header: { label: 'Address', onClick: () => alert('clicked address') },
      width: 300,
      grow: 2,
    },
    {
      dataId: 'age',
      header: { label: 'Really long age header', icon: 'User4Line' },
      width: 50,
      align: 'center',
      sortable: true,
    },
    {
      header: {
        label: 'Data',
        columns: [
          { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
          { dataId: 'group', header: { label: 'Groups' }, width: 150 },
        ],
      },
      dataId: 'data',
    },
  ]);

  return (
    <ReqoreTable
      {...tableData}
      columns={columns}
      actions={[
        {
          className: 'reqore-test-action',
          label: 'Test Action',
          onClick: () => {
            setColumns((prev) => {
              return prev.map((column) => {
                if (column.dataId === 'id') {
                  return {
                    ...column,
                    header: {
                      ...column.header,
                      label: 'New ID',
                    },
                  };
                }
                return column;
              });
            });
          },
        },
      ]}
    />
  );
};

test('Data on <Table /> headers are not reset when columns are updated', () => {
  vi.useFakeTimers();
  vi.setConfig({ testTimeout: 30000 });

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <TestingTableWithState />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(9);

  fireEvent.click(document.querySelector('.reqore-table-header-cell-options')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-header-hide')!);

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);

  fireEvent.click(document.querySelector('.reqore-test-action')!);

  // The column is still hidden even after columns data have changed
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);
});

test('<Table /> is reset to default', () => {
  vi.useFakeTimers();
  vi.setConfig({ testTimeout: 30000 });

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <TestingTableWithState />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(9);

  fireEvent.click(document.querySelector('.reqore-table-header-cell-options')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-header-hide')!);

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);

  fireEvent.click(document.querySelector('.reqore-table-more')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-reset')!);

  // The column is still hidden even after columns data have changed
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(9);
});

const selectionColumns: IReqoreTableColumn[] = [
  { dataId: 'id', header: { label: 'ID' }, width: 50 },
  { dataId: 'name', header: { label: 'Name' }, width: 150 },
];

const selectionRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Row ${index + 1}`,
    _selectId: index + 1,
  }));

test('<Table /> select-all toggle reflects the current row set, not a stale count', () => {
  // Referentially stable on purpose: the selection itself never changes, only the data does.
  // A `selectedQuant` keyed solely on the selection would never recompute here.
  const selected = [1, 2];
  const fn = vi.fn();
  const renderTable = (rows: ReturnType<typeof selectionRows>) => (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          columns={selectionColumns}
          data={rows}
          selectable
          selected={selected}
          onSelectedChange={fn}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Both selectable rows are selected -> "all".
  const { rerender } = render(renderTable(selectionRows(2)));

  // Two more selectable rows appear, selection is untouched -> must become "some".
  rerender(renderTable(selectionRows(4)));

  fn.mockClear();
  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[0]!);

  // "some" -> selecting all. A stale "all" would have cleared the selection instead.
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith([1, 2, 3, 4]);
});

test('<Table /> select-all toggle only selects rows left by an active column filter', () => {
  const fn = vi.fn();
  const renderTable = (filter?: string) => (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          columns={[
            selectionColumns[0],
            { ...selectionColumns[1], filterable: true, filter },
          ]}
          data={selectionRows(4)}
          selectable
          onSelectedChange={fn}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const { rerender } = render(renderTable());

  expect(document.querySelectorAll('.reqore-table-row').length).toBe(4);

  rerender(renderTable('Row 3'));

  expect(document.querySelectorAll('.reqore-table-row').length).toBe(1);

  fn.mockClear();
  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[0]!);

  expect(fn).toHaveBeenCalledWith([3]);
});

test('<Table /> applies a filter declared on a nested (grouped) column', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          columns={[
            {
              dataId: 'group',
              header: {
                label: 'Group',
                columns: [
                  selectionColumns[0],
                  { ...selectionColumns[1], filterable: true, filter: 'Row 2' },
                ],
              },
            },
          ]}
          data={selectionRows(4)}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-row').length).toBe(1);
});

test('getRowProps merges className, style, and data-* attributes onto every body row', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          {...tableData}
          getRowProps={(row, index) => ({
            className: index === 0 ? 'qorus-tombstone' : undefined,
            style: index === 0 ? { opacity: 0.55 } : undefined,
            'data-qorus-row-id': `row-${(row as { id: number }).id}`,
          })}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rows = document.querySelectorAll('.reqore-table-row');
  expect(rows.length).toBeGreaterThan(0);
  // Reqore's own class survives the merge — every row still carries it.
  rows.forEach((row) => expect(row.classList.contains('reqore-table-row')).toBe(true));
  // The consumer's className is spread onto the first row only.
  expect(rows[0].classList.contains('qorus-tombstone')).toBe(true);
  expect(rows[1].classList.contains('qorus-tombstone')).toBe(false);
  // The consumer's style extends (does not replace) Reqore's own row style.
  expect((rows[0] as HTMLElement).style.opacity).toBe('0.55');
  // Arbitrary data-* attributes reach the DOM so downstream CSS or tests can hook them.
  expect(rows[0].getAttribute('data-qorus-row-id')).toBeTruthy();
});

// The overscan is what stops a fast scroll from showing blank strips.
//
// react-window advances its window from a `setState` in a passive scroll
// handler, so the browser paints the scrolled container BEFORE React commits
// the rows that belong there. Whatever the overscan does not already cover is
// empty space the user sees for a frame or more. react-window's default of 2
// rows is about 66px of cover; one trackpad flick moves several hundred, so on
// a real table every moving frame was blank. The default here is one viewport
// of rows in each direction, which is more travel than a single frame can
// consume.
test('<Table /> renders a viewport of overscan rows by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          {...tableData}
          data={makeRows(200)}
          height={400}
          rowHeight={40}
          virtualized
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // 400px / 40px = 10 visible rows. The default overscan adds a viewport in
  // each direction, so a table parked at the top renders the visible band plus
  // one viewport below it — comfortably more than the 12 react-window would
  // give us on its own.
  const rendered = document.querySelectorAll('.reqore-table-row').length;
  expect(rendered).toBeGreaterThan(15);
});

test('<Table /> honours an explicit overscanRowCount', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          {...tableData}
          data={makeRows(200)}
          height={400}
          rowHeight={40}
          virtualized
          overscanRowCount={0}
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // With the overscan opted out of, only the visible band is rendered — the
  // trade a caller makes when each row is expensive and they would rather have
  // the smaller DOM.
  const rendered = document.querySelectorAll('.reqore-table-row').length;
  expect(rendered).toBeLessThanOrEqual(12);
});

describe('<Table /> expandable rows', () => {
  const columns: IReqoreTableColumn[] = [
    { dataId: 'id', header: { label: 'ID' }, width: 80 },
    { dataId: 'name', header: { label: 'Name' }, width: 200 },
  ];
  const rows = [
    { id: 1, name: 'first', _expandId: 'first' },
    { id: 2, name: 'second', _expandId: 'second' },
    { id: 3, name: 'third', _expandId: 'third' },
  ];

  /**
   * Click a row the way a person does — on one of its cells.
   *
   * The table has always put the row's click handler on its CELLS (that is how
   * `onRowClick` fires too), and cells fill the row, so "click the row" and
   * "click a cell" are the same gesture. The LAST cell, to stay clear of the
   * expander's own button in the first.
   */
  const clickRow = (index: number) => {
    const cells = document
      .querySelectorAll('.reqore-table-row')
      [index].querySelectorAll('.reqore-table-cell');
    act(() => {
      fireEvent.click(cells[cells.length - 1]);
    });
  };

  const renderTable = (props: Partial<IReqoreTableProps> = {}) =>
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={rows}
            renderExpandedRow={(row) => <div className='detail'>detail for {row.name}</div>}
            {...(props as any)}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

  test('adds an expander column and opens nothing until asked', () => {
    renderTable();

    // The expander is prepended, so the table has one column more than declared.
    expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(3);
    expect(document.querySelectorAll('.detail').length).toBe(0);
  });

  test('opens a row when its own row is clicked', () => {
    renderTable();

    clickRow(0);

    expect(document.querySelectorAll('.detail').length).toBe(1);
    expect(document.querySelector('.detail')).toHaveTextContent('detail for first');
  });

  test('keeps more than one row open, unless told not to', () => {
    renderTable();

    clickRow(0);
    clickRow(1);

    expect(document.querySelectorAll('.detail').length).toBe(2);
  });

  test('closes the previous row when expandSingle is set', () => {
    renderTable({ expandSingle: true });

    clickRow(0);
    clickRow(1);

    expect(document.querySelectorAll('.detail').length).toBe(1);
    expect(document.querySelector('.detail')).toHaveTextContent('detail for second');
  });

  test('closes an open row when it is clicked again', () => {
    renderTable();

    clickRow(0);
    expect(document.querySelectorAll('.detail').length).toBe(1);

    clickRow(0);
    expect(document.querySelectorAll('.detail').length).toBe(0);
  });

  test('honours a controlled expansion and reports every change', () => {
    const onExpandedChange = vi.fn();

    renderTable({ expanded: ['second'], onExpandedChange });

    expect(document.querySelector('.detail')).toHaveTextContent('detail for second');

    clickRow(0);

    // Controlled: the table reports the change and does NOT move on its own.
    expect(onExpandedChange).toHaveBeenCalledWith(['second', 'first']);
    expect(document.querySelector('.detail')).toHaveTextContent('detail for second');
  });

  test('gives no expander, and no toggle, to a row with nothing to show', () => {
    const onRowClick = vi.fn();

    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={rows}
            onRowClick={onRowClick}
            // Only the second row has a detail.
            renderExpandedRow={(row) => (row.name === 'second' ? <div className='detail' /> : null)}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    clickRow(0);

    // Nothing to expand, so the click falls through to what the table would
    // otherwise have done with it.
    expect(document.querySelectorAll('.detail').length).toBe(0);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  test('grows its own height to fit an open panel', () => {
    /* A table left to size itself used to compute `itemCount * rowHeight`,
       which is only true while every row is the same height. An expanded row is
       not, so the row showed as open and its detail was clipped clean off.

       jsdom lays nothing out, so the panel has to be given a height for the
       measurement path to have anything to report — without this the test
       passes whether the fix is present or not, which is how the first version
       of it fooled me. */
    const PANEL_HEIGHT = 120;
    const realRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (this.classList?.contains('reqore-table-row-expanded')) {
        return { ...realRect.call(this), height: PANEL_HEIGHT } as DOMRect;
      }
      return realRect.call(this);
    };

    try {
      const { container } = render(
        <ReqoreUIProvider>
          <ReqoreLayoutContent>
            <ReqoreTable
              columns={columns}
              data={rows}
              // No `height`: the table sizes itself, which is the broken case.
              renderExpandedRow={() => <div className='detail' />}
            />
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      );

      const bodyHeight = () =>
        parseFloat(
          (container.querySelector('.reqore-table-body') as HTMLElement).style.height || '0'
        );

      const collapsed = bodyHeight();
      expect(collapsed).toBeGreaterThan(0);

      clickRow(0);

      expect(container.querySelectorAll('.detail').length).toBe(1);
      expect(bodyHeight()).toBe(collapsed + PANEL_HEIGHT);
    } finally {
      Element.prototype.getBoundingClientRect = realRect;
    }
  });

  test('expands in the non-virtualized body too', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={rows}
            virtualized={false}
            renderExpandedRow={(row) => <div className='detail'>detail for {row.name}</div>}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    clickRow(0);

    // No measurement and no react-window here — the panel simply takes the
    // height of its content, which is the case the virtualised path emulates.
    expect(document.querySelectorAll('.detail').length).toBe(1);
  });

  test('will not expand a disabled row, however it is asked', () => {
    /* `_disabled` means the row is not interactive, and expanding is an
       interaction — offering it anyway would say the row is dead except for
       this one thing. Asserted three ways because there are three routes in:
       the expander control, a click on the row, and a controlled `expanded`
       that names it. */
    const withDisabled = [
      { id: 1, name: 'first', _expandId: 'first' },
      { id: 2, name: 'second', _expandId: 'second', _disabled: true },
    ];

    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={withDisabled}
            expanded={['second']}
            renderExpandedRow={(row) => <div className='detail'>detail for {row.name}</div>}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    // Named in `expanded`, and still no panel.
    expect(container.querySelectorAll('.detail').length).toBe(0);

    // No expander control on that row.
    const disabledRow = container.querySelectorAll('.reqore-table-row')[1];
    expect(
      disabledRow.querySelector('[data-reqore-table-column-id="expander"] button')
    ).toBeNull();

    // And clicking it opens nothing.
    clickRow(1);
    expect(container.querySelectorAll('.detail').length).toBe(0);
  });

  test('does not confuse a row identified by position with one whose id is that number', () => {
    /* The fallback identity used to be the row's index in the caller's data,
       compared in the same space as `_selectId` — so the row at index 1 and the
       row whose `_selectId` was 1 answered to the same identity, and opening
       either opened both. */
    const mixed = [
      { id: 10, name: 'by id', _selectId: 1 },
      // No `_selectId` of its own, so it is identified by its position — which
      // is 1, the same number as the row above answers to.
      { id: 11, name: 'positional' },
    ];

    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={mixed}
            renderExpandedRow={(row) => <div className='detail'>detail for {row.name}</div>}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    clickRow(0);

    expect(container.querySelectorAll('.detail').length).toBe(1);
    expect(container.querySelector('.detail')).toHaveTextContent('detail for by id');
  });

  test('opens a row that has no id of its own by its position', () => {
    // The positional identity is still addressable — it is only namespaced.
    const anonymous = [{ id: 10, name: 'first' }, { id: 11, name: 'second' }];

    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={anonymous}
            defaultExpanded={['@position:1']}
            renderExpandedRow={(row) => <div className='detail'>detail for {row.name}</div>}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(container.querySelectorAll('.detail').length).toBe(1);
    expect(container.querySelector('.detail')).toHaveTextContent('detail for second');
  });

  test('reports the panel its content needs, not the room the row happens to leave', () => {
    /* The group is a fixed-height flex column whose height comes FROM this
       measurement, so a panel that is allowed to flex shrinks to the room the
       current item size leaves it and then reports that as its height. The
       measurement would feed the box that constrains the measurement, and the
       content ends up clipped at the bottom. */
    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={columns}
            data={rows}
            renderExpandedRow={() => <div className='detail' />}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    clickRow(0);

    const panel = container.querySelector('.reqore-table-row-expanded') as HTMLElement;

    expect(getComputedStyle(panel).flexGrow).toBe('0');
    expect(getComputedStyle(panel).flexShrink).toBe('0');
    expect(getComputedStyle(panel).flexBasis).toBe('auto');
  });

  test('leaves a table without renderExpandedRow exactly as it was', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable columns={columns} data={rows} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(2);
    expect(document.querySelectorAll('.reqore-table-row-group').length).toBe(0);
  });
});
