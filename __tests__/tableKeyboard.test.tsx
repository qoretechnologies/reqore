// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn } from '../src/components/Table';

/**
 * A list row that opens on a click opens from the keyboard too, and the table's toolbar buttons say
 * what they are (the admin portal's keyboard pass).
 */

const columns: IReqoreTableColumn[] = [
  { dataId: 'name', header: { label: 'Name' } },
  {
    dataId: 'actions',
    header: { label: '' },
    cell: { actions: () => [{ icon: 'PlayLine', tooltip: 'Run', className: 'run-button' }] },
  },
];

const data = [
  { _selectId: 1, name: 'Order sync' },
  { _selectId: 2, name: 'Invoice import' },
];

const mount = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const rows = () => Array.from(document.querySelectorAll<HTMLElement>('.reqore-table-row'));

test('A row that opens on a click is a tab stop and opens on Enter or Space', () => {
  const onRowClick = vi.fn();

  mount(<ReqoreTable columns={columns} data={data} onRowClick={onRowClick} />);

  expect(rows().map((row) => row.getAttribute('tabindex'))).toEqual(['0', '0']);

  fireEvent.keyDown(rows()[0], { key: 'Enter' });
  fireEvent.keyDown(rows()[1], { key: ' ' });

  expect(onRowClick.mock.calls.map(([row]) => row.name)).toEqual(['Order sync', 'Invoice import']);
});

test("A key pressed in a cell's own control stays the control's", () => {
  const onRowClick = vi.fn();

  mount(<ReqoreTable columns={columns} data={data} onRowClick={onRowClick} />);
  fireEvent.keyDown(rows()[0].querySelector('button')!, { key: 'Enter' });

  expect(onRowClick).not.toHaveBeenCalled();
});

test('A row that does nothing on a click is no tab stop', () => {
  mount(<ReqoreTable columns={columns} data={data} />);

  expect(rows().map((row) => row.getAttribute('tabindex'))).toEqual([null, null]);
});

test("The toolbar's icon buttons are named", () => {
  mount(
    <ReqoreTable columns={columns} data={data} showColumnsOptions exportable label='Workflows' />
  );

  expect(document.querySelector('.reqore-table-columns-options')?.getAttribute('aria-label')).toBe(
    'Show / hide columns'
  );
  expect(document.querySelector('.reqore-table-more')?.getAttribute('aria-label')).toBe('More');
});
