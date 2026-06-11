import { IReqoreTableColumn } from '../../src/components/Table';
import {
  calculatePinOffsets,
  flattenColumns,
  getColumnsCount,
  getOnlyShownColumns,
  hasHiddenColumns,
  updateColumnData,
} from '../../src/components/Table/helpers';
import { testColumns } from '../../src/mock/tableData';

test('Updates top level column width', () => {
  const columns = [...testColumns];

  expect(columns[0].width).toBe(50);

  const newColumns = updateColumnData(columns, 'id', 'resizedWidth', 100);

  expect(newColumns[0].width).toBe(50);
  expect(newColumns[0].resizedWidth).toBe(100);
});

test('Updates group level column width', () => {
  const columns = [...testColumns];

  expect(columns[1].header!.columns![0].width).toBe(150);

  const newColumns = updateColumnData(columns, 'firstName', 'resizedWidth', 250);

  expect(newColumns[1].header!.columns![0].width).toBe(150);
  expect(newColumns[1].header!.columns![0].resizedWidth).toBe(250);
});

test('Filters out hidden columns', () => {
  const columns = [...testColumns];

  expect(getColumnsCount(columns)).toBe(8);

  columns[1].header!.columns![0].show = false;
  columns[1].header!.columns![1].show = false;
  columns[3].show = false;
  columns[4].header!.columns![1].show = false;

  const newColumns = getOnlyShownColumns(columns, undefined);

  expect(getColumnsCount(newColumns)).toBe(4);
  expect(hasHiddenColumns(columns)).toBe(true);
  expect(hasHiddenColumns(newColumns)).toBe(false);
  expect(newColumns[1].dataId).toBe('address');
});

const pinTestColumns = (): IReqoreTableColumn[] => [
  { dataId: 'id', header: { label: 'ID' }, width: 50, align: 'center' as const },
  {
    dataId: 'name',
    header: {
      label: 'Name',
      columns: [
        { dataId: 'firstName', header: { label: 'First Name' }, width: 150 },
        { dataId: 'lastName', header: { label: 'Last Name' }, width: 150 },
      ],
    },
  },
  { dataId: 'address', header: { label: 'Address' }, width: 300 },
  {
    dataId: 'data',
    header: {
      label: 'Data',
      columns: [
        { dataId: 'occupation', header: { label: 'Occupation' }, width: 200 },
        { dataId: 'group', header: { label: 'Group' }, width: 150 },
      ],
    },
  },
];

test('flattenColumns walks grouped headers into leaves', () => {
  const leaves = flattenColumns(pinTestColumns());

  expect(leaves.length).toBe(6);
  expect(leaves.map((c) => c.dataId)).toEqual([
    'id',
    'firstName',
    'lastName',
    'address',
    'occupation',
    'group',
  ]);
});

test('calculatePinOffsets produces cumulative sticky offsets and marks edges', () => {
  const columns = pinTestColumns();

  columns[0].pin = 'left';
  columns[1].header.columns![1].pin = 'left';
  columns[3].header.columns![0].pin = 'right';
  columns[3].header.columns![1].pin = 'right';

  const offsets = calculatePinOffsets(columns);

  expect(offsets.id.pin).toBe('left');
  expect(offsets.id.offset).toBe(0);
  expect(offsets.id.isEdge).toBe(false);

  expect(offsets.lastName.pin).toBe('left');
  expect(offsets.lastName.offset).toBe(columns[0].width);
  expect(offsets.lastName.isEdge).toBe(true);

  expect(offsets.group.pin).toBe('right');
  expect(offsets.group.offset).toBe(0);
  expect(offsets.group.isEdge).toBe(false);

  expect(offsets.occupation.pin).toBe('right');
  expect(offsets.occupation.offset).toBe(columns[3].header.columns![1].width);
  expect(offsets.occupation.isEdge).toBe(true);
});
