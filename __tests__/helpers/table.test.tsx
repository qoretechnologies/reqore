import {
  getColumnsByPinType,
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

  const newColumns = getOnlyShownColumns(columns);

  expect(getColumnsCount(newColumns)).toBe(4);
  expect(hasHiddenColumns(columns)).toBe(true);
  expect(hasHiddenColumns(newColumns)).toBe(false);
  expect(newColumns[1].dataId).toBe('address');
});

test('Returns pinned columns', () => {
  const columns = [...testColumns];

  expect(getColumnsCount(columns)).toBe(8);

  columns[1].header!.columns![1].pin = 'left';
  columns[0].pin = 'left';
  columns[4].header!.columns![0].pin = 'right';
  columns[4].header!.columns![1].pin = 'right';

  const leftPinColumns = getColumnsByPinType(columns, 'left');
  const rightPinColumns = getColumnsByPinType(columns, 'right');
  const mainColumns = getColumnsByPinType(columns, 'main');

  expect(getColumnsCount(leftPinColumns)).toBe(2);
  expect(getColumnsCount(rightPinColumns)).toBe(2);
  expect(getColumnsCount(mainColumns)).toBe(4);
});
