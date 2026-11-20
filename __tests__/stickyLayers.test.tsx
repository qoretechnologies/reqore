// A panel's sticky header is drawn above everything in its body, and a pinned column's header cell hides the header
// cells that scroll under it. Scrolled, a table's pinned columns - sticky at the header's own z-index,
// and later in the document - were drawn over its sticky header, and a pinned column's header cell painted nothing,
// so the headers passing under it showed through. How the layers are drawn is checked in a browser by the stories
// "Layout/Panel · Sticky Header Above Its Body" and "Collections/Table · Sticky Header Above Pinned Columns"; this
// checks what they are drawn with.
import { render, waitFor } from '@testing-library/react';
import { ReqoreLayoutContent, ReqorePanel, ReqoreTable, ReqoreUIProvider } from '../src';
import { STICKY_HEADER_TALL_SCREENS } from '../src/components/Panel';
import { IReqoreTableColumn } from '../src/components/Table';
import { DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';
import { getOpaqueColor, getPanelBackgroundColor } from '../src/helpers/colors';
import { requiredAttribute, requiredElement } from '../src/stories/utils/required';

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

const renderTable = (columns: IReqoreTableColumn[], theme?: Partial<IReqoreTheme>) =>
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreTable columns={columns} data={data} label='Orders' stickyHeader />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** Each column's header cell, by its column: the cells of the header row, in the order they are drawn. */
const headerCells = (container: HTMLElement): Record<string, HTMLElement> => {
  const row = requiredElement(
    '.reqore-table-header-wrapper',
    'the header',
    container
  ).firstElementChild;

  if (!row) {
    throw new Error('the header row is missing');
  }

  return Object.fromEntries(
    Array.from(row.children)
      .filter((cell): cell is HTMLElement => cell instanceof HTMLElement)
      .map((cell) => [
        requiredAttribute(
          requiredElement('[data-probe]', "a header cell's probe", cell),
          'data-probe'
        ),
        cell,
      ])
  );
};

/** A card's custom theme draws its main color translucent, so what is behind the card shows through it. */
const TRANSLUCENT_MAIN = '#1f0a1f55';

/** The surface a pinned cell paints under a theme (the panel's, as the table sits in one), drawn opaque. */
const opaqueSurface = (theme: IReqoreTheme): string => getOpaqueColor(getPanelBackgroundColor(theme));
const TRANSLUCENT_THEME = { ...DEFAULT_THEME, main: TRANSLUCENT_MAIN } as IReqoreTheme;

/** Each body cell of a column, in every row. */
const bodyCells = (container: HTMLElement, dataId: string): HTMLElement[] => {
  const cells = Array.from(
    container.querySelectorAll<HTMLElement>(
      `.reqore-table-cell[data-reqore-table-column-id="${dataId}"]`
    )
  );

  if (cells.length !== data.length) {
    throw new Error(`expected ${data.length} body cells for ${dataId}, found ${cells.length}`);
  }

  return cells;
};

/** `#rrggbb` as the browser writes it back. */
const rgbOf = (hex: string): string =>
  `rgb(${[1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)).join(', ')})`;

/** Every element measures `height` tall: jsdom lays nothing out, so a panel is 0px unless told. */
const measureEverythingAs = (height: number) =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: height,
    width: 0,
    height,
    toJSON: () => ({}),
  } as DOMRect);

describe('A panel with a sticky header', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('pins its header, over its body in a stacking context of its own, when the panel is tall', async () => {
    // Taller than one and a half screens of the window it scrolls in.
    measureEverythingAs(window.innerHeight * STICKY_HEADER_TALL_SCREENS + 100);
    const { container } = render(
      <ReqoreUIProvider>
        <ReqorePanel label='Sticky' stickyHeader>
          Body
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    const header = requiredElement('.reqore-panel-title', "the panel's header", container);
    const body = requiredElement('.reqore-panel-content', "the panel's body", container);

    await waitFor(() => expect(getComputedStyle(header).position).toBe('sticky'));
    expect(getComputedStyle(header).zIndex).toBe('2');
    expect(header.getAttribute('data-pins-header')).toBe('true');
    expect(getComputedStyle(body).isolation).toBe('isolate');
  });

  // A short panel's pinned header was a band with nothing under it to label.
  test('lets a short panel scroll away with its header, which otherwise looks the same', async () => {
    measureEverythingAs(window.innerHeight * STICKY_HEADER_TALL_SCREENS - 100);
    const { container } = render(
      <ReqoreUIProvider>
        <ReqorePanel label='Short' stickyHeader>
          Body
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    const header = requiredElement('.reqore-panel-title', "the panel's header", container);
    const body = requiredElement('.reqore-panel-content', "the panel's body", container);

    await waitFor(() => expect(header.getAttribute('data-pins-header')).toBe('false'));
    expect(getComputedStyle(header).position).not.toBe('sticky');
    // the rest of the sticky treatment is unchanged, so the panel draws exactly as before
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

    const body = requiredElement('.reqore-panel-content', "the panel's body", container);

    expect(getComputedStyle(body).isolation).not.toBe('isolate');
  });

  test("a table's body is drawn under its sticky header", () => {
    const { container } = renderTable(pinnedColumns);

    const table = requiredElement('.reqore-table', 'the table', container);
    const body = requiredElement('.reqore-panel-content', "the table's body", table);

    expect(body.contains(table.querySelector('.reqore-table-header-wrapper'))).toBe(true);
    expect(getComputedStyle(body).isolation).toBe('isolate');
  });
});

describe("A pinned column's header cell", () => {
  // Opaque, so the cells that scroll under it never show through - and the SAME fill a pinned body
  // cell has (the surface the table sits on). It used to paint theme.main, a step darker than the
  // panel, which read as a black box over a pinned actions column (tablePinnedHeaderSurface.test).
  test('paints the surface a pinned body cell paints, opaque above the cells that scroll under it', () => {
    const { container } = renderTable(pinnedColumns);
    const cells = headerCells(container);

    for (const pinned of [cells.id, cells.address]) {
      expect(pinned.style.position).toBe('sticky');
      expect(pinned.style.zIndex).toBe('2');
      expect(pinned.style.backgroundColor).toBe(rgbOf(getPanelBackgroundColor(DEFAULT_THEME)));
    }
    // the cells between them paint nothing of their own: what the header row is drawn on shows
    for (const unpinned of [cells.firstName, cells.lastName]) {
      expect(unpinned.style.position).not.toBe('sticky');
      expect(unpinned.style.backgroundColor).toBe('');
    }
  });

  test("paints its surface opaque when the theme's main color is translucent (a card's custom theme)", () => {
    const { container } = renderTable(pinnedColumns, { main: TRANSLUCENT_MAIN });
    const cells = headerCells(container);

    for (const pinned of [cells.id, cells.address]) {
      expect(pinned.style.backgroundColor).toBe(rgbOf(opaqueSurface(TRANSLUCENT_THEME)));
      // opaque: no alpha for the cells scrolling under it to show through
      expect(pinned.style.backgroundColor).toMatch(/^rgb\(/);
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

// A pinned body cell paints its row's tint over an opaque base, so the cells scrolling under it are hidden. jsdom
// reads the base layer of the `background` shorthand back as the background color.
describe("A pinned column's body cell", () => {
  test('paints its tint over the surface the table sits on, opaque', () => {
    const { container } = renderTable(pinnedColumns);

    for (const cell of [...bodyCells(container, 'id'), ...bodyCells(container, 'address')]) {
      expect(getComputedStyle(cell).backgroundImage).toContain('linear-gradient');
      expect(getComputedStyle(cell).backgroundColor).toBe(rgbOf(opaqueSurface(DEFAULT_THEME)));
    }
  });

  test("paints an opaque base when the theme's main color is translucent (a card's custom theme)", () => {
    const { container } = renderTable(pinnedColumns, { main: TRANSLUCENT_MAIN });

    for (const cell of [...bodyCells(container, 'id'), ...bodyCells(container, 'address')]) {
      expect(getComputedStyle(cell).backgroundImage).toContain('linear-gradient');
      expect(getComputedStyle(cell).backgroundColor).toBe(rgbOf(opaqueSurface(TRANSLUCENT_THEME)));
      expect(getComputedStyle(cell).backgroundColor).toMatch(/^rgb\(/);
    }
  });

  test('and an unpinned body cell paints no opaque base of its own', () => {
    const { container } = renderTable(pinnedColumns, { main: TRANSLUCENT_MAIN });

    for (const cell of bodyCells(container, 'firstName')) {
      expect(getComputedStyle(cell).backgroundImage).not.toContain('linear-gradient');
      expect(getComputedStyle(cell).backgroundColor).not.toBe('rgb(31, 10, 31)');
    }
  });
});
