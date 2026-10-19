// A panel's sticky header is drawn above everything in its body, and a pinned column's header cell hides the header
// cells that scroll under it (qorus#646). Scrolled, a table's pinned columns - sticky at the header's own z-index,
// and later in the document - were drawn over its sticky header, and a pinned column's header cell painted nothing,
// so the headers passing under it showed through. How the layers are drawn is checked in a browser by the stories
// "Layout/Panel · Sticky Header Above Its Body" and "Collections/Table · Sticky Header Above Pinned Columns"; this
// checks what they are drawn with.
import { render } from '@testing-library/react';
import { ReqoreLayoutContent, ReqorePanel, ReqoreTable, ReqoreUIProvider } from '../src';
import { IReqoreTableColumn } from '../src/components/Table';
import { DEFAULT_THEME } from '../src/constants/theme';

const markedColumn = (
  dataId: string,
  width: number,
  pin?: 'left' | 'right'
): IReqoreTableColumn => ({
  dataId,
  width,
  pin,
  header: { content: <span data-probe={dataId} /> },
});

const pinnedColumns: IReqoreTableColumn[] = [
  markedColumn('id', 60, 'left'),
  markedColumn('firstName', 150),
  markedColumn('lastName', 150),
  markedColumn('address', 300, 'right'),
];

const data = [
  { id: 1, firstName: 'Ada', lastName: 'Lovelace', address: 'London' },
  { id: 2, firstName: 'Alan', lastName: 'Turing', address: 'Manchester' },
];

const renderTable = (columns: IReqoreTableColumn[]) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreTable columns={columns} data={data} label='Orders' stickyHeader />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** Each column's header cell, by its column: the cells of the header row, in the order they are drawn. */
const headerCells = (container: HTMLElement): Record<string, HTMLElement> => {
  const row = container.querySelector('.reqore-table-header-wrapper')?.firstElementChild;

  expect(row, 'the header row').toBeTruthy();

  return Object.fromEntries(
    Array.from(row!.children).map((cell) => [
      cell.querySelector('[data-probe]')!.getAttribute('data-probe'),
      cell as HTMLElement,
    ])
  );
};

/** `#rrggbb` as the browser writes it back. */
const rgbOf = (hex: string): string =>
  `rgb(${[1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(', ')})`;

describe('A panel with a sticky header', () => {
  test('draws its body in a stacking context of its own, under the header', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Sticky' stickyHeader>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    const header = container.querySelector<HTMLElement>('.reqore-panel-title')!;
    const body = container.querySelector<HTMLElement>('.reqore-panel-content')!;

    expect(getComputedStyle(header).position).toBe('sticky');
    expect(getComputedStyle(header).zIndex).toBe('2');
    expect(getComputedStyle(body).isolation).toBe('isolate');
  });

  test('and a panel without one leaves its body as it was', () => {
    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Not sticky'>Body</ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    const body = container.querySelector<HTMLElement>('.reqore-panel-content')!;

    expect(getComputedStyle(body).isolation).not.toBe('isolate');
  });

  test("a table's body is drawn under its sticky header", () => {
    const { container } = renderTable(pinnedColumns);

    const table = container.querySelector<HTMLElement>('.reqore-table')!;
    const body = table.querySelector<HTMLElement>('.reqore-panel-content')!;

    expect(body.contains(table.querySelector('.reqore-table-header-wrapper'))).toBe(true);
    expect(getComputedStyle(body).isolation).toBe('isolate');
  });
});

describe("A pinned column's header cell", () => {
  test("paints the theme's main color, opaque as a pinned body cell is, above the cells that scroll under it", () => {
    const { container } = renderTable(pinnedColumns);
    const cells = headerCells(container);

    for (const pinned of [cells.id, cells.address]) {
      expect(pinned.style.position).toBe('sticky');
      expect(pinned.style.zIndex).toBe('2');
      expect(pinned.style.backgroundColor).toBe(rgbOf(DEFAULT_THEME.main));
    }
    // the cells between them paint nothing of their own: what the header row is drawn on shows
    for (const unpinned of [cells.firstName, cells.lastName]) {
      expect(unpinned.style.position).not.toBe('sticky');
      expect(unpinned.style.backgroundColor).toBe('');
    }
  });

  test('is the only header cell that paints: a table with no pinned column paints none', () => {
    const { container } = renderTable(pinnedColumns.map(({ pin: _pin, ...column }) => column));

    for (const cell of Object.values(headerCells(container))) {
      expect(cell.style.position).not.toBe('sticky');
      expect(cell.style.backgroundColor).toBe('');
    }
  });
});
