import { IReqoreTableColumn } from '../../src/components/Table';
import {
  calculatePinOffsets,
  flattenColumns,
  foldActionsColumns,
  getActionsMenuColumnIds,
  getFoldedActionText,
  getFoldedActionTexts,
  TABLE_CELL_HORIZONTAL_PADDING_PX,
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

/* A folded column is as wide as what its cells draw (qorus#646): the square for a menu or an icon, a
   row's one action with no icon its words - its short label, or its label - whole in their button. */

test('A folded cell says the short label, or the label, of its one action with no icon; else nothing', () => {
  // a menu, an icon alone, no action: the square
  expect(getFoldedActionText([{ label: 'Edit' }, { label: 'Delete' }])).toBeUndefined();
  expect(
    getFoldedActionText([{ icon: 'EditLine', label: 'Edit', shortLabel: 'E' }])
  ).toBeUndefined();
  expect(getFoldedActionText([])).toBeUndefined();
  expect(getFoldedActionText(undefined)).toBeUndefined();
  // words
  expect(getFoldedActionText([{ label: 'Test the connection', shortLabel: 'Test' }])).toBe('Test');
  expect(getFoldedActionText([{ label: 'Test the connection', shortLabel: '  ' }])).toBe(
    'Test the connection'
  );
  expect(getFoldedActionText([{ label: 'Test the connection' }])).toBe('Test the connection');
  expect(getFoldedActionText([{ label: 7 }])).toBe(7);
  // nothing to say: a blank label, no label
  expect(getFoldedActionText([{ label: ' ' }])).toBeUndefined();
  expect(getFoldedActionText([{ tooltip: 'Edit' }])).toBeUndefined();
});

test("A folded column's words are its rows' distinct ones; an element is not measurable", () => {
  const element = <strong>Test</strong>;
  const columns: IReqoreTableColumn[] = [
    { dataId: 'name', width: 200 },
    {
      dataId: 'words',
      width: 200,
      cell: {
        actions: ({ name }) =>
          name === 'menu'
            ? [{ label: 'Edit' }, { label: 'Delete' }]
            : name === 'icon'
              ? [{ icon: 'EditLine', label: 'Edit' }]
              : [{ label: `Open ${name}`, shortLabel: name === 'b' ? 'Open' : undefined }],
      },
    },
    { dataId: 'element', width: 200, cell: { actions: () => [{ label: element }] } },
    { dataId: 'icons', width: 200, cell: { actions: () => [{ icon: 'EditLine', label: 'Edit' }] } },
    { dataId: 'unfolded', width: 200, cell: { actions: () => [{ label: 'Run' }] } },
  ];
  const rows = [{ name: 'a' }, { name: 'b' }, { name: 'a' }, { name: 'menu' }, { name: 'icon' }];

  const texts = getFoldedActionTexts(columns, ['words', 'element', 'icons'], rows);

  expect(texts.words.texts).toEqual(['Open a', 'Open']);
  expect(texts.words.unmeasurable).toBe(false);
  expect(texts.words.action).toEqual({ label: 'Open a', shortLabel: undefined });
  expect(texts.element).toEqual({ texts: [], action: undefined, unmeasurable: true });
  // a column of icons says no words; one that does not fold is not asked
  expect(texts.icons).toBeUndefined();
  expect(texts.unfolded).toBeUndefined();
  expect(getFoldedActionTexts(columns, [], rows)).toEqual({});
});

test("A folded column with words is as wide as they need, the square's at least, never wider than it was", () => {
  const column = actionsColumn({ width: 200 });

  // words wider than the square: their width
  expect(foldActionsColumns([column], ['actions'], 'normal', false, { actions: 47 })[0].width).toBe(
    47
  );
  // narrower: the square
  expect(foldActionsColumns([column], ['actions'], 'normal', false, { actions: 10 })[0].width).toBe(
    SIZE_TO_PX.normal
  );
  // never wider than it was
  expect(
    foldActionsColumns([column], ['actions'], 'normal', false, { actions: 260 })[0].width
  ).toBe(200);
  expect(
    foldActionsColumns([{ ...column, resizedWidth: 150 }], ['actions'], 'normal', false, {
      actions: 260,
    })[0].width
  ).toBe(150);
  // words that cannot be measured keep the column's width
  const [unmeasured] = foldActionsColumns([column], ['actions'], 'normal', false, {
    actions: Infinity,
  });
  expect(unmeasured.width).toBe(200);
  expect(unmeasured.resizable).toBe(false);
  // with no width of its own, such a column is left as it is
  const widthless = actionsColumn({ width: undefined, grow: 2 });
  expect(
    foldActionsColumns([widthless], ['actions'], 'normal', false, { actions: Infinity })[0]
  ).toBe(widthless);
  // a padded cell holds its words inside its padding
  expect(
    foldActionsColumns(
      [actionsColumn({ width: 200, cell: { ...column.cell, padded: 'horizontal' } })],
      ['actions'],
      'normal',
      false,
      { actions: 47 }
    )[0].width
  ).toBe(47 + 2 * TABLE_CELL_HORIZONTAL_PADDING_PX);
});
