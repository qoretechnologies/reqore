import { fireEvent, render } from '@testing-library/react';
import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn, IReqoreTableProps } from '../src/components/Table';
import tableData from '../src/mock/tableData';

beforeAll(() => {
  jest.setTimeout(30000);
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
  expect(document.querySelectorAll('.reqore-table-row').length).toBe(10);
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
  const dateCell = firstRow!.querySelectorAll('.reqore-table-cell')[7];

  expect(idCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(firstNameCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(lastNameCell.querySelector('h4')).toBeTruthy();
  expect(addressCell.querySelector('p.reqore-paragraph')).toBeTruthy();
  expect(dateCell.textContent).toBe('just now');
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

  const fn = jest.fn();

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
  expect(fn).toHaveBeenCalledWith({ by: 'lastName', direction: 'desc' });

  const lastNameCell = firstRow!.querySelectorAll('.reqore-table-cell')[2];

  expect(lastNameCell.textContent).toBe('Zold');

  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[2]);

  expect(fn).toHaveBeenLastCalledWith({ by: 'lastName', direction: 'asc' });
  expect(lastNameCell.textContent).toBe('Abbess');
  expect(idCell!.textContent).toBe('543');
});

test('Rows on <Table /> can be selected', () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

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

test('Rows on <Table /> can be selected, does not keep internal state', () => {
  const data = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

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

  const fn = jest.fn();

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

test('Rows on <Table /> are all selected/deselected when clicking on header', () => {
  const data: IReqoreTableProps = {
    ...tableData,
    selectable: true,
  };

  const fn = jest.fn();

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
  const fn = jest.fn();
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
  jest.useFakeTimers();
  jest.setTimeout(30000);

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

  jest.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-header-hide')!);

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);

  fireEvent.click(document.querySelector('.reqore-test-action')!);

  // The column is still hidden even after columns data have changed
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);
});

test('<Table /> is reset to default', () => {
  jest.useFakeTimers();
  jest.setTimeout(30000);

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

  jest.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-header-hide')!);

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);

  fireEvent.click(document.querySelector('.reqore-table-more')!);

  jest.advanceTimersByTime(1);

  fireEvent.click(document.querySelector('.reqore-table-reset')!);

  // The column is still hidden even after columns data have changed
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(9);
});
