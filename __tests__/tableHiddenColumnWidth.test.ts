import { describe, expect, it } from 'vitest';
import { getTableColumnsPickerItems } from '../src';
import { calculatePinOffsets, getTotalColumnsWidth } from '../src/components/Table/helpers';

/**
 * A column `hideBelowWidth` hides is not drawn, so at that width it takes no room. It used
 * to: the row was as wide as every column, drawn or not, and on a narrow table the column
 * beside the hidden one was pushed off the edge.
 */
describe('a column hidden below a width takes no room there', () => {
  const columns = [
    { dataId: 'name', width: 160 },
    { dataId: 'kind', width: 130, hideBelowWidth: 640 },
    { dataId: 'status', width: 100 },
  ] as never[];

  it('is left out of the total at a narrower width', () => {
    expect(getTotalColumnsWidth(columns, 380)).toBe(260);
  });

  it('still counts at a width that shows it', () => {
    expect(getTotalColumnsWidth(columns, 900)).toBe(390);
  });

  it('counts every column when no width is given, as before', () => {
    expect(getTotalColumnsWidth(columns)).toBe(390);
  });

  it('takes no place among pinned columns where it is hidden', () => {
    const pinned = [
      { dataId: 'name', width: 160 },
      { dataId: 'extra', width: 80, pin: 'right', hideBelowWidth: 640 },
      { dataId: 'actions', width: 40, pin: 'right' },
    ] as never[];
    expect(calculatePinOffsets(pinned, 380)).toEqual({
      actions: { pin: 'right', offset: 0, isEdge: true },
    });
  });
});

/** The picker a page puts in its own toolbar is the table's: same entries, same toggles. */
describe('the column picker for a toolbar outside the table', () => {
  it('lists the hideable columns, selected while shown, and toggles them', () => {
    const toggled: Array<[string, boolean]> = [];
    const items = getTableColumnsPickerItems(
      [
        { dataId: 'name', header: { label: 'Name' }, hideable: false },
        { dataId: 'kind', header: { label: 'Kind' } },
        { dataId: 'format', header: { label: 'Format' }, show: false },
      ] as never[],
      (dataId, show) => toggled.push([dataId, show]),
      'Columns'
    );
    expect(items.map((item) => [item.label, !!item.selected])).toEqual([
      ['Columns', false],
      ['Kind', true],
      ['Format', false],
    ]);
    items[1].onClick?.({} as never);
    items[2].onClick?.({} as never);
    expect(toggled).toEqual([
      ['kind', false],
      ['format', true],
    ]);
  });
});
