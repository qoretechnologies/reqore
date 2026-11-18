// Copyright 2026 Qore Technologies, s.r.o.
import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import {
  ReqoreCollection,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTable,
  ReqoreUIProvider,
} from '../src';
import { NO_ITEMS_MESSAGE, SEARCH_EMPTY_MESSAGE } from '../src/constants/emptyState';

const renderInProvider = (element: ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{element}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const ITEMS = [{ label: 'Orders' }, { label: 'Invoices' }];
const COLUMNS = [{ dataId: 'name', header: { label: 'Name' } }];
const ROWS = [{ name: 'Orders' }, { name: 'Invoices' }];

// An empty list never asks the reader to change a search they never made (board 24).
describe('an empty collection', () => {
  test('with nothing searched says there is nothing yet', () => {
    renderInProvider(<ReqoreCollection label='Variables' items={[]} filterable />);

    expect(screen.getByText(NO_ITEMS_MESSAGE)).toBeTruthy();
    expect(screen.queryByText(SEARCH_EMPTY_MESSAGE)).toBeNull();
  });

  test('emptied by a search asks for another search', () => {
    renderInProvider(<ReqoreCollection items={ITEMS} filterable defaultQuery='zzz' />);

    expect(screen.getByText(SEARCH_EMPTY_MESSAGE)).toBeTruthy();
  });

  test("says the caller's own message with nothing searched, or its own for no items", () => {
    const { unmount } = renderInProvider(
      <ReqoreCollection items={[]} filterable emptyMessage='No variables' />
    );

    expect(screen.getByText('No variables')).toBeTruthy();
    unmount();
    renderInProvider(
      <ReqoreCollection
        items={[]}
        filterable
        emptyMessage='No variables match'
        noItemsMessage='No variables yet'
      />
    );
    expect(screen.getByText('No variables yet')).toBeTruthy();
  });
});

describe('an empty table', () => {
  test('with nothing searched or filtered says there is nothing yet', () => {
    renderInProvider(<ReqoreTable columns={COLUMNS} data={[]} />);

    expect(screen.getByText(NO_ITEMS_MESSAGE)).toBeTruthy();
    expect(screen.queryByText(SEARCH_EMPTY_MESSAGE)).toBeNull();
  });

  test('emptied by a search asks for another search', () => {
    renderInProvider(<ReqoreTable columns={COLUMNS} data={ROWS} filterable filter='zzz' />);

    expect(screen.getByText(SEARCH_EMPTY_MESSAGE)).toBeTruthy();
  });

  test('emptied by a column filter asks for another search', () => {
    renderInProvider(
      <ReqoreTable columns={[{ ...COLUMNS[0], filter: 'zzz' }]} data={ROWS} />
    );

    expect(screen.getByText(SEARCH_EMPTY_MESSAGE)).toBeTruthy();
  });
});
