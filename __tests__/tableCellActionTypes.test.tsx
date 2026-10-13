import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { expectTypeOf } from 'vitest';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreButtonProps } from '../src/components/Button';
import { IReqoreEntityRowAction } from '../src/components/EntityRow';
import { IReqorePanelAction } from '../src/components/Panel';
import { IReqoreSeverityRowAction } from '../src/components/SeverityRow';
import { IReqoreTableColumn } from '../src/components/Table';

/*
 * A table cell takes the actions a page gives a panel, a button group or a row as its own
 * (qorus#646): qorus-ide hands the same action lists to a panel and to a table column. Before
 * a7790c8f a cell action's type had no `label`, so any of them was accepted; a7790c8f typed it
 * `string`, then `string | number`, which rejected a button's (any content) - TS2322s in qorus-ide,
 * from a patch release. This file is type-checked by `yarn build:test`, so the assignments below
 * are a test as well.
 */
const panelActions = (): IReqorePanelAction[] => [
  { label: 'Edit', icon: 'EditLine' },
  { label: 7, icon: 'NumbersLine' },
];
const buttonActions = (): IReqoreButtonProps[] => [
  { label: <b>Open</b>, icon: 'EditLine' },
];
const entityRowActions = (): IReqoreEntityRowAction[] => [{ label: 'Run' }];
const severityRowActions = (): IReqoreSeverityRowAction[] => [{ label: 'Dismiss' }];

type TCellActions = NonNullable<NonNullable<IReqoreTableColumn['cell']>['actions']>;

test('a column takes panel actions, whose labels are strings or numbers, as its cell actions', () => {
  const column: IReqoreTableColumn = { dataId: 'x', cell: { actions: panelActions } };

  expectTypeOf(panelActions).toMatchTypeOf<TCellActions>();
  // and the column hands them on as they are
  expect(column.cell?.actions?.({}).map(({ label }) => label)).toEqual(['Edit', 7]);
});

test('a column takes button and row actions, labelled with any content, as cell actions', () => {
  const columns: IReqoreTableColumn[] = [
    { dataId: 'button', cell: { actions: buttonActions } },
    { dataId: 'entity', cell: { actions: entityRowActions } },
    { dataId: 'severity', cell: { actions: severityRowActions } },
  ];

  expectTypeOf(buttonActions).toMatchTypeOf<TCellActions>();
  expectTypeOf(entityRowActions).toMatchTypeOf<TCellActions>();
  expectTypeOf(severityRowActions).toMatchTypeOf<TCellActions>();
  expect(columns.map((column) => column.cell?.actions?.({}).length)).toEqual([1, 1, 1]);
});

const renderWideTable = (actions: TCellActions) =>
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            columns={[
              { dataId: 'id', header: { label: 'ID' }, width: 80 },
              { dataId: 'actions', header: { label: 'Actions' }, width: 200, cell: { actions } },
            ]}
            data={[{ id: 1 }]}
            fill
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

const cellButtons = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.reqore-table-cell button'));

test('a wide table draws a cell action\'s label in its button, a number as text', () => {
  vi.useFakeTimers();
  try {
    renderWideTable(panelActions);

    const [edit, seven] = cellButtons();
    expect(edit.textContent).toContain('Edit');
    expect(seven.textContent).toContain('7');
    // a label in sight names the button: no aria-label over it
    expect(edit.getAttribute('aria-label')).toBeNull();
    expect(seven.getAttribute('aria-label')).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});

test('a wide table draws a labelled action\'s text, and names an icon-only one by tooltip', () => {
  vi.useFakeTimers();
  try {
    renderWideTable(() => [
      { icon: 'EditLine', label: 'Open', tooltip: 'Open the row' },
      { icon: 'DeleteBinLine', tooltip: 'Delete' },
    ]);

    const [open, remove] = cellButtons();
    expect(open.textContent).toContain('Open');
    expect(open.getAttribute('aria-label')).toBeNull();
    expect(remove.textContent).toBe('');
    expect(remove.getAttribute('aria-label')).toBe('Delete');
  } finally {
    vi.useRealTimers();
  }
});
