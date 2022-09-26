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

  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(8);
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

  expect(document.querySelectorAll('.reqore-table-column-group').length).toBe(1);
  expect(document.querySelectorAll('.reqore-table-header-cell').length).toBe(7);
});

test('Renders <Table /> with custom content', () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        content: ({ id }) => <span>ID {id}</span>,
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

  const firstRow = document.querySelector('.reqore-table-row');
  const idCell = firstRow.querySelector('.reqore-table-cell');

  expect(idCell.textContent).toBe('ID 1');
});

test('Renders <Table /> with predefined content', () => {
  const data = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        content: 'tag:info',
      },
      {
        header: 'Name',
        dataId: 'name',
        grow: 3,
        columns: [
          {
            dataId: 'firstName',
            header: 'First Name',
            width: 150,
            grow: 2,
            content: 'tag:#000000',
          },
          {
            dataId: 'lastName',
            header: 'Last Name',
            width: 150,
            grow: 1,
            content: 'title:success',
          },
        ],
      },
      { dataId: 'address', header: 'Address', width: 300, grow: 2, content: 'text:warning' },
      {
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: 'Ocuppation', width: 200 },
      { dataId: 'group', header: 'Group', width: 150 },
      { dataId: 'date', header: 'Date', content: 'time-ago' },
    ] as IReqoreTableColumn[],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');

  const idCell = firstRow.querySelectorAll('.reqore-table-cell')[0];
  const firstNameCell = firstRow.querySelectorAll('.reqore-table-cell')[1];
  const lastNameCell = firstRow.querySelectorAll('.reqore-table-cell')[2];
  const addressCell = firstRow.querySelectorAll('.reqore-table-cell')[3];
  const dateCell = firstRow.querySelectorAll('.reqore-table-cell')[7];

  expect(idCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(firstNameCell.querySelector('.reqore-tag')).toBeTruthy();
  expect(lastNameCell.querySelector('h4')).toBeTruthy();
  expect(addressCell.querySelector('p.reqore-paragraph-warning')).toBeTruthy();
  expect(dateCell.textContent).toBe('just now');
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
      { dataId: 'lastName', header: 'Last Name', width: 150, sortable: true },
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

  expect(idCell.textContent).toBe('1000');

  const lastNameHeaderCell = document.querySelectorAll('.reqore-table-header-cell')[2];

  fireEvent.click(lastNameHeaderCell);
  expect(fn).toHaveBeenCalledWith({ by: 'lastName', direction: 'desc' });

  const lastNameCell = firstRow.querySelectorAll('.reqore-table-cell')[2];

  expect(lastNameCell.textContent).toBe('Zold');

  fireEvent.click(document.querySelectorAll('.reqore-table-header-cell')[2]);

  expect(fn).toHaveBeenLastCalledWith({ by: 'lastName', direction: 'asc' });
  expect(lastNameCell.textContent).toBe('Abbess');
  expect(idCell.textContent).toBe('543');
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
  const firstCheckCell = firstRow.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell);

  expect(fn).toHaveBeenCalledWith([1]);

  const secondRow = document.querySelectorAll('.reqore-table-row')[1];
  const secondCheckCell = secondRow.querySelector('.reqore-table-cell');

  fireEvent.click(secondCheckCell);

  expect(fn).toHaveBeenLastCalledWith([1, 2]);
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

  fireEvent.click(thirdCheckCell);

  const fourthRow = document.querySelectorAll('.reqore-table-row')[3];
  const fourthCheckCell = fourthRow.querySelector('.reqore-table-cell');

  fireEvent.click(fourthCheckCell);

  expect(fn).toHaveBeenCalledTimes(1);
});

test('Rows on <Table /> are all selected/deselected when clicking on header', () => {
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

  const header = document.querySelector('.reqore-table-header-wrapper');
  const firstHeaderCell = header.querySelector('.reqore-table-header-cell');

  fireEvent.click(firstHeaderCell);

  const selectableData: number[] = tableData.data
    .filter((datum) => datum._selectId ?? false)
    .map((datum) => datum._selectId);

  expect(fn).toHaveBeenCalledWith(selectableData);

  fireEvent.click(firstHeaderCell);

  expect(fn).toHaveBeenLastCalledWith([]);

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell);
  fireEvent.click(firstHeaderCell);

  expect(fn).toHaveBeenLastCalledWith(selectableData);
});

test('Cells on <Table /> are interactive', () => {
  const fn = jest.fn();
  const data = {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        sortable: true,
        tooltip: 'Custom ID tooltip nice',
        onCellClick: ({ id }) => {
          fn(id);
        },
      },
      {
        header: 'Name',
        dataId: 'name',
        grow: 3,
        columns: [
          {
            icon: 'SlideshowLine',
            dataId: 'firstName',
            header: 'First Name',
            width: 150,
            grow: 2,
          },
          {
            icon: 'SlideshowLine',
            dataId: 'lastName',
            header: 'Last Name',
            width: 150,
            grow: 1,
            sortable: true,
          },
        ],
      },
      {
        dataId: 'address',
        header: 'Address',
        width: 300,
        grow: 2,
        onClick: () => alert('clicked address'),
      },
      {
        icon: 'User4Line',
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
        sortable: true,
      },
      {
        header: 'Data',
        dataId: 'data',
        columns: [
          { dataId: 'occupation', header: 'Ocuppation', width: 200 },
          { dataId: 'group', header: 'Group', width: 150 },
        ],
      },
    ] as IReqoreTableColumn[],
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable {...data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstRow = document.querySelector('.reqore-table-row');
  const firstCheckCell = firstRow.querySelector('.reqore-table-cell');

  fireEvent.click(firstCheckCell);

  expect(fn).toHaveBeenCalledWith(1);
});
