import { IReqoreTableColumn } from '../../src/components/Table';
import {
  calculatePinOffsets,
  flattenColumns,
  foldActionsColumns,
  getActionsMenuColumnIds,
  isActionsMenuWidth,
  getColumnsCount,
  getOnlyShownColumns,
  hasHiddenColumns,
  updateColumnData,
} from '../../src/components/Table/helpers';
import { testColumns } from '../../src/mock/tableData';
import { SIZE_TO_PX, TOUCH_TARGET_PX } from '../../src/constants/sizes';

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

/*
 * A narrow table folds a row's actions into one menu button (qorus#646): which columns fold, at what
 * width, and how wide a folded column is.
 */

const actionsColumn = (extra: Partial<IReqoreTableColumn> = {}): IReqoreTableColumn => ({
  dataId: 'actions',
  width: 120,
  cell: { actions: () => [{ icon: 'EditLine', label: 'Edit' }, { icon: 'DeleteBinLine', label: 'Delete' }] },
  ...extra,
});

test('A column with actions folds at or below Reqore\'s phone width of the table', () => {
  const column = actionsColumn();

  expect(isActionsMenuWidth(column, 480)).toBe(true);
  expect(isActionsMenuWidth(column, 265)).toBe(true);
  expect(isActionsMenuWidth(column, 481)).toBe(false);
  // not measured yet: the wide layout, rather than a guess
  expect(isActionsMenuWidth(column, undefined)).toBe(false);
  expect(isActionsMenuWidth(column, 0)).toBe(false);
  // a column without actions never folds
  expect(isActionsMenuWidth({ dataId: 'name' }, 265)).toBe(false);
});

test('A column folds at its own actionsMenuBelowWidth, and never with 0', () => {
  const at700 = actionsColumn({ cell: { ...actionsColumn().cell, actionsMenuBelowWidth: 700 } });
  const never = actionsColumn({ cell: { ...actionsColumn().cell, actionsMenuBelowWidth: 0 } });

  expect(isActionsMenuWidth(at700, 650)).toBe(true);
  expect(isActionsMenuWidth(at700, 701)).toBe(false);
  expect(isActionsMenuWidth(never, 100)).toBe(false);
});

test('The folded columns are named once, grouped columns included', () => {
  const columns: IReqoreTableColumn[] = [
    { dataId: 'name' },
    { dataId: 'group', header: { columns: [actionsColumn({ dataId: 'nested' })] } },
    actionsColumn(),
  ];

  expect(getActionsMenuColumnIds(columns, 300)).toEqual(['nested', 'actions']);
  expect(getActionsMenuColumnIds(columns, 900)).toEqual([]);
});

test('A column whose id holds a space folds by its whole id, and no other with it', () => {
  // `row actions` folds; `row` and `actions` are columns of their own and have no actions to fold.
  const columns: IReqoreTableColumn[] = [
    { dataId: 'row', width: 120 },
    { dataId: 'actions', width: 120 },
    actionsColumn({ dataId: 'row actions' }),
  ];

  const ids = getActionsMenuColumnIds(columns, 300);
  expect(ids).toEqual(['row actions']);

  const [row, actions, rowActions] = foldActionsColumns(columns, ids, 'normal', false);
  expect(row).toBe(columns[0]);
  expect(actions).toBe(columns[1]);
  expect(rowActions.width).toBe(SIZE_TO_PX.normal);
  expect(rowActions.resizable).toBe(false);
});

test('A folded column is the menu button\'s width, a finger\'s on touch, and not resizable', () => {
  const columns: IReqoreTableColumn[] = [{ dataId: 'name', width: 200 }, actionsColumn({ resizable: true, grow: 2, minWidth: 100 })];

  // unchanged where nothing folds
  expect(foldActionsColumns(columns, [], 'normal', false)).toBe(columns);

  const [name, folded] = foldActionsColumns(columns, ['actions'], 'normal', false);
  expect(name).toBe(columns[0]);
  expect(folded.width).toBe(SIZE_TO_PX.normal);
  expect(folded.resizable).toBe(false);
  expect(folded.grow).toBeUndefined();
  expect(folded.minWidth).toBeUndefined();

  const [, onTouch] = foldActionsColumns(columns, ['actions'], 'normal', true);
  expect(onTouch.width).toBe(Math.max(SIZE_TO_PX.normal, TOUCH_TARGET_PX));
  // never wider than the column was
  const [narrowColumn] = foldActionsColumns(
    [actionsColumn({ width: 20 })],
    ['actions'],
    'big',
    true
  );
  expect(narrowColumn.width).toBe(20);
});
