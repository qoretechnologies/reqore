import { render } from '@testing-library/react';
import { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn } from '../src/components/Table';

/*
 * A cell keeps its DOM node while its column is rebuilt.
 *
 * A column's `content` function used to BE the element type of the cell, so a
 * consumer that rebuilt its `columns` array — an ordinary `useMemo` with an
 * unstable dependency — gave React a new type for every cell, and React
 * answers a new type by unmounting the old tree and mounting a fresh one.
 * Nothing looked wrong: the cell was re-created with the same content. But the
 * node a pointer (or a test) had just found was detached a moment later, so
 * the click landed on nothing — which cost the Qorus IDE a real bug, found
 * only by checking `isConnected` on the node that had been clicked.
 */

beforeAll(() => {
  vi.useFakeTimers();
  vi.setConfig({ testTimeout: 30000 });
});

const rows = [
  { id: 1, name: 'First' },
  { id: 2, name: 'Second' },
];

/** Columns built fresh on every render, as a consumer with unstable deps does. */
const columnsFor = (suffix: string): IReqoreTableColumn[] => [
  { dataId: 'id', header: { label: 'ID' }, width: 80 },
  {
    dataId: 'name',
    header: { label: 'Name' },
    width: 200,
    cell: {
      content: ({ name }) => <span className='cell-under-test'>{`${name}${suffix}`}</span>,
    },
  },
];

test('A cell survives its consumer rebuilding the columns array', () => {
  let rerenderWith: (suffix: string) => void;

  const Table = () => {
    const [suffix, setSuffix] = useState('');

    rerenderWith = setSuffix;

    return (
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable columns={columnsFor(suffix)} data={rows} fill />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  };

  render(<Table />);

  const cell = document.querySelector('.cell-under-test')!;

  expect(cell).toBeTruthy();
  expect(cell.textContent).toBe('First');

  act(() => {
    rerenderWith!(' (edited)');
  });

  // The same node, updated in place — not a replacement for a detached one
  expect(cell.isConnected).toBe(true);
  expect(cell.textContent).toBe('First (edited)');
});

test('A content function that returns a string still renders', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable
          columns={[
            { dataId: 'id', header: { label: 'ID' }, width: 80 },
            {
              dataId: 'name',
              header: { label: 'Name' },
              width: 200,
              // Not an element: the table reads the returned value itself
              cell: { content: ({ name }) => `${name}!` },
            },
          ]}
          data={rows}
          fill
        />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.body.textContent).toContain('First!');
});
