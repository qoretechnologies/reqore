import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn, IReqoreTableSort } from '../src/components/Table';
import tableData from '../src/mock/tableData';

test('Renders basic <Table /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...tableData} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(7);
  expect(document.querySelectorAll('.reqore-table-row').length).toBe(10);
});

test('Renders <Table /> with grouped columns properly', () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
      },
      {
        header: 'Name',
        dataId: 'name',
        grow: 3,
        columns: [
          { dataId: 'firstName', header: 'First Name', width: 150, grow: 2 },
          { dataId: 'lastName', header: 'Last Name', width: 150, grow: 1 },
        ],
      },
      { dataId: 'address', header: 'Address', width: 300, grow: 2 },
      {
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: 'Ocuppation', width: 200 },
      { dataId: 'group', header: 'Group', width: 150 },
    ] as IReqoreTableColumn[],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-table-column-group').length).toBe(
    1
  );
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(7);
});

test('Sorting on <Table /> works properly', () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'firstName', header: 'First Name', width: 150 },
      { dataId: 'lastName', header: 'Last Name', width: 150 },
      { dataId: 'address', header: 'Address', width: 300, grow: 2 },
      {
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'occupation', header: 'Ocuppation', width: 200 },
      { dataId: 'group', header: 'Group', width: 150 },
    ] as IReqoreTableColumn[],
    sort: {
      by: 'id',
      direction: 'desc',
    } as IReqoreTableSort,
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
  const idCell = firstRow.querySelector('.reqore-table-cell');

  expect(idCell.textContent).toBe('99');

  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[4]);

  const ageCell = firstRow.querySelectorAll('.reqore-table-cell')[4];

  expect(fn).toHaveBeenCalledWith({ by: 'age', direction: 'desc' });
  expect(ageCell.textContent).toBe('99');

  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[4]);

  expect(fn).toHaveBeenLastCalledWith({ by: 'age', direction: 'asc' });
  expect(ageCell.textContent).toBe('0');
  expect(idCell.textContent).toBe('99');
});
