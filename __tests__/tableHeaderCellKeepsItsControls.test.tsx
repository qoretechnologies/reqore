// A table's header cell hands the button and the menu it draws the same handlers and objects while what they are made
// of is unchanged (qorus#646, DeepScan: REACT_INEFFICIENT_PURE_COMPONENT_PROP). Both are memo components; a click
// handler and an effect made anew on every render drew them again each time the cell was - when another column was
// sorted, or the cell moved - for nothing.
//
// ReqoreButton is wrapped in a memo of the same shallow comparison that counts the times it is drawn, keyed by its
// class: drawn again means a prop it was handed changed.
import { render } from '@testing-library/react';
import { ReqoreUIProvider } from '../src';
import { ReqoreTableHeaderCell } from '../src/components/Table/headerCell';

const draws: Record<string, number> = {};

vi.mock('../src/components/Button', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/components/Button')>();
  const React = await import('react');
  const Counted = React.memo(
    React.forwardRef<HTMLButtonElement, Record<string, unknown>>((props, ref) => {
      const key = String(props.className ?? '');
      draws[key] = (draws[key] ?? 0) + 1;

      return React.createElement(actual.default, { ...props, ref } as never);
    })
  );

  return { ...actual, default: Counted };
});

/** How many times the header cell's own button (or its menu's) was drawn. */
const cellButtonDraws = () =>
  Object.entries(draws)
    .filter(([className]) => className.split(/\s+/).includes('reqore-table-header-cell'))
    .reduce((sum, [, count]) => sum + count, 0);

beforeEach(() => {
  for (const key of Object.keys(draws)) {
    delete draws[key];
  }
});

const onSortChange = vi.fn();
const onColumnsUpdate = vi.fn();
const onFilterChange = vi.fn();
const onClick = vi.fn();

type TCellProps = React.ComponentProps<typeof ReqoreTableHeaderCell>;

const cell = (props: Partial<TCellProps>) => (
  <ReqoreUIProvider>
    <ReqoreTableHeaderCell
      dataId='name'
      label='Name'
      sortData={{ by: 'id', direction: 'asc' }}
      onSortChange={onSortChange}
      onColumnsUpdate={onColumnsUpdate}
      onFilterChange={onFilterChange}
      onClick={onClick}
      {...props}
    />
  </ReqoreUIProvider>
);

describe("a table's header cell", () => {
  test('with no menu draws its button once while another column is sorted', () => {
    const plain = { sortable: false, hideable: false, pinnable: false, resizable: false };
    const { rerender } = render(cell(plain));
    const first = cellButtonDraws();

    expect(first).toBeGreaterThan(0);
    rerender(cell({ ...plain, sortData: { by: 'price', direction: 'desc' } }));
    rerender(cell({ ...plain, sortData: { by: 'id', direction: 'desc' } }));
    expect(cellButtonDraws()).toBe(first);
  });

  test('with a menu draws it once while the cell is only moved', () => {
    const { rerender } = render(cell({ sortable: true, pinOffset: 0 }));
    const first = cellButtonDraws();

    expect(first).toBeGreaterThan(0);
    rerender(cell({ sortable: true, pinOffset: 120 }));
    rerender(cell({ sortable: true, pinOffset: 240 }));
    expect(cellButtonDraws()).toBe(first);
  });

  test('draws its menu again when its own column is sorted: what it shows changed', () => {
    const { rerender } = render(cell({ sortable: true }));
    const first = cellButtonDraws();

    rerender(cell({ sortable: true, sortData: { by: 'name', direction: 'asc' } }));
    expect(cellButtonDraws()).toBeGreaterThan(first);
  });

  test('draws its button again when it is handed another click handler', () => {
    const plain = { sortable: false, hideable: false, pinnable: false, resizable: false };
    const { rerender } = render(cell(plain));
    const first = cellButtonDraws();

    rerender(cell({ ...plain, onClick: vi.fn() }));
    expect(cellButtonDraws()).toBeGreaterThan(first);
  });
});
