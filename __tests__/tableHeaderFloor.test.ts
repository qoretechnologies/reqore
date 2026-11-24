import { IReqoreTableColumn } from '../src/components/Table';
import {
  getColumnHeaderWidth,
  getColumnRenderedWidth,
  prepareColumns,
} from '../src/components/Table/helpers';

/*
 * A table never measured a column's header: a column declared narrower than its header cut it ("Slowest …" on a
 * 2,560px desktop). Each column now has a floor of its header as drawn, set as its `minWidth` by `prepareColumns`,
 * so `getColumnRenderedWidth` - which a host fits its tables with - reports it too. jsdom has no canvas, so the
 * words are estimated here; a browser measures them (`Collections/Table › A Narrow Column Keeps Its Header`).
 */
const NARROW: IReqoreTableColumn = { dataId: 'slowest', width: 40, header: { label: 'Slowest 5%' } };

describe('a column header is never cut', () => {
  it("floors a narrow column at its header's width", () => {
    const [column] = prepareColumns([NARROW], {});

    expect(column.minWidth).toBe(getColumnHeaderWidth(NARROW));
    expect(getColumnRenderedWidth(column)).toBeGreaterThan(40);
    expect(getColumnRenderedWidth(column)).toBe(column.minWidth);
  });

  it('keeps a wider declared width', () => {
    const [column] = prepareColumns([{ ...NARROW, width: 400 }], {});

    expect(getColumnRenderedWidth(column)).toBe(400);
  });

  it('keeps a larger minWidth of its own', () => {
    const [column] = prepareColumns([{ ...NARROW, minWidth: 300 }], {});

    expect(column.minWidth).toBe(300);
  });

  it('raises a cap below the header to it', () => {
    const [column] = prepareColumns([{ ...NARROW, maxWidth: 30 }], {});

    expect(column.maxWidth).toBe(column.minWidth);
    expect(getColumnRenderedWidth(column)).toBe(column.minWidth);
  });

  it('measures what the header draws: an icon and a sort arrow take room too', () => {
    const plain = getColumnHeaderWidth(NARROW);
    const withIcon = getColumnHeaderWidth({ ...NARROW, header: { ...NARROW.header, icon: 'TimeLine' } });
    const sortable = { ...NARROW, sortable: true };

    expect(withIcon).toBeGreaterThan(plain);
    expect(getColumnHeaderWidth(sortable, 'normal', { sortIndicator: 'arrow' })).toBeGreaterThan(plain);
    expect(getColumnHeaderWidth(sortable, 'normal', { sortIndicator: 'wash' })).toBe(plain);
  });

  it("follows the table's header type: words not in capitals take less room", () => {
    expect(getColumnHeaderWidth(NARROW, 'normal', { headerEffect: { uppercase: false } })).toBeLessThanOrEqual(
      getColumnHeaderWidth(NARROW)
    );
  });

  it('leaves a header that is not words as it was', () => {
    const element = { dataId: 'custom', width: 40, header: { content: 'drawn by the host' } };
    const [column] = prepareColumns([element as IReqoreTableColumn], {});

    expect(getColumnHeaderWidth(element as IReqoreTableColumn)).toBe(0);
    expect(column.minWidth).toBeUndefined();
  });
});
