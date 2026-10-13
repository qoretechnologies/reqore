import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { expectTypeOf } from 'vitest';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqorePanelAction } from '../src/components/Panel';
import { IReqoreTableColumn } from '../src/components/Table';

/*
 * A table cell takes a panel's actions as its own (qorus#646): qorus-ide hands the same action lists to a
 * panel and to a table column. A panel action's label is `string | number`; a7790c8f typed a cell
 * action's label `string`, which rejected them - five TS2322s in qorus-ide, from a patch release. This
 * file is type-checked by `yarn build:test`, so the assignments below are a test as well.
 */
const panelActions = (_data: unknown): IReqorePanelAction[] => [
  { label: 'Edit', icon: 'EditLine' },
  { label: 7, icon: 'NumbersLine' },
];

test('a column takes panel actions, whose labels are strings or numbers, as its cell actions', () => {
  const column: IReqoreTableColumn = { dataId: 'x', cell: { actions: panelActions } };

  expectTypeOf(panelActions).toMatchTypeOf<
    NonNullable<NonNullable<IReqoreTableColumn['cell']>['actions']>
  >();
  // and the column hands them on as they are
  expect(column.cell?.actions?.({}).map(({ label }) => label)).toEqual(['Edit', 7]);
});

test('a cell action labelled with a number is named by it, as text', () => {
  vi.useFakeTimers();
  try {
    act(() => {
      render(
        <ReqoreUIProvider>
          <ReqoreLayoutContent>
            <ReqoreTable
              columns={[
                { dataId: 'id', header: { label: 'ID' }, width: 80 },
                { dataId: 'actions', header: { label: 'Actions' }, width: 200, cell: { actions: panelActions } },
              ]}
              data={[{ id: 1 }]}
              fill
            />
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      );
    });

    const names = Array.from(document.querySelectorAll('.reqore-table-cell button')).map((button) =>
      button.getAttribute('aria-label')
    );
    expect(names).toEqual(['Edit', '7']);
  } finally {
    vi.useRealTimers();
  }
});
