/* @flow */
import { size as count, isArray } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMeasure, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreP,
  ReqorePaginationContainer,
  ReqorePanel,
  useReqoreProperty,
  useReqoreTheme,
} from '../..';
import { TReqorePaginationType, getPagingObjectFromType } from '../../constants/paging';
import { RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreIntent, IReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreButtonProps, TReqoreBadge } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreExportModalProps, ReqoreExportModal } from '../ExportModal';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import { TReqoreKeyValueTableExportMapper } from '../KeyValueTable';
import { IReqorePanelAction, IReqorePanelProps, IReqorePanelSubAction } from '../Panel';
import ReqoreTableBody from './body';
import ReqoreTableHeader, { IReqoreCustomHeaderCellComponent } from './header';
import { IReqoreTableHeaderCellProps } from './headerCell';
import {
  fixSort,
  flipSortDirection,
  getColumnsCount,
  getExportActions,
  getOnlyShownColumns,
  getZoomActions,
  hasGroupedColumns,
  hasHiddenColumns,
  prepareColumns,
  removeInternalData,
  sizeToZoom,
  sortTableData,
  zoomToSize,
} from './helpers';
import { IReqoreTableRowOptions } from './row';

export type TReqoreTableColumnContent =
  | ((data: IReqoreTableRowData) => any)
  | 'time-ago'
  | `time-ago:${TReqoreIntent}`
  | 'tag'
  | `tag:${TReqoreIntent}`
  | `tag:#${string}`
  | 'title'
  | `title:${TReqoreIntent}`
  | 'text'
  | `text:${TReqoreIntent}`
  | 'number'
  | `number:${TReqoreIntent}`
  | 'boolean'
  | `icon:${IReqoreIconName}`
  | string
  | number;

export interface IReqoreTableColumn extends IReqoreIntent {
  dataId: string;
  show?: boolean;
  enabled?: boolean;
  grow?: 0 | 1 | 2 | 3 | 4;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizedWidth?: number;
  align?: 'center' | 'left' | 'right';
  pin?: 'left' | 'right';

  resizable?: boolean;
  sortable?: boolean;
  hideable?: boolean;
  pinnable?: boolean;

  // Users can hide a column if the table size reaches a certain width
  hideBelowWidth?: number;

  filterable?: boolean;
  filterPlaceholder?: string;
  filter?: string | number;

  header?: {
    columns?: IReqoreTableColumn[];
    component?: React.FC<IReqoreTableHeaderCellProps>;
    // Content is the same as react children
    content?: React.ReactNode;
    actions?: IReqoreDropdownItem[];
  } & Omit<IReqoreButtonProps, 'maxWidth' | 'content'>;

  cell?: {
    onClick?: (cellValue: any) => void;
    tooltip?: (cellValue: any) => string | IReqoreTooltip;
    content?: TReqoreTableColumnContent;
    actions?: (
      data: IReqoreTableRowData
    ) => Omit<IReqoreButtonProps, 'children' | 'label' | 'rightIcon'>[];
    intent?: TReqoreIntent;
    padded?: 'both' | 'horizontal' | 'vertical' | 'none';
    /**
     * When true, this column's cells wrap their content instead of truncating with ellipsis.
     * Works best with the table-level `wrap` prop (which implies `virtualized={false}`).
     */
    wrap?: boolean;
    /**
     * Maximum height in pixels for this column's cells. When content exceeds this height the cell
     * clips and an inset-shadow overlay with a "Show more" button appears; clicking it expands
     * the cell (and the row) to fit the full content. Overrides the table-level `maxCellHeight`
     * and any row-level `_maxHeight`.
     */
    maxHeight?: number;
  };
}

export interface IReqoreTableRowData {
  [key: string]: any;
  _selectId?: string | number;
  /**
   * The row's position in the data as supplied, stamped by the table before it
   * filters or sorts. Read-only; setting it yourself overrides the stamp.
   */
  _reqoreIndex?: number;
  /**
   * Identity for row EXPANSION, when `renderExpandedRow` is in use.
   *
   * Falls back to `_selectId`, then to `_reqoreIndex`. Give it a stable value
   * whenever the table can be sorted or filtered: a rendered position is not
   * identity, so an expansion keyed on one stays with the SLOT rather than
   * with the row.
   */
  _expandId?: string | number;
  _intent?: TReqoreIntent;
  _disabled?: boolean;
  /**
   * Per-row override for the cell max-height. Takes precedence over the table-level
   * `maxCellHeight` but is still overridden by a column's `cell.maxHeight`.
   */
  _maxHeight?: number;
}

export type IReqoreTableRowClick = (data: IReqoreTableRowData) => void;
export type IReqoreTableData = IReqoreTableRowData[];

export interface IReqoreTableProps extends IReqorePanelProps {
  columns: IReqoreTableColumn[];
  data?: IReqoreTableData;

  width?: number;
  height?: number;
  wrapperSize?: TSizes;

  paging?: TReqorePaginationType<IReqoreTableRowData>;

  sort?: IReqoreTableSort;
  onSortChange?: (sort?: IReqoreTableSort) => void;

  filterable?: boolean;
  filterProps?: (data: IReqoreTableData) => IReqoreInputProps;
  filter?: string | number;
  onFilterChange?: (query: string | number) => void;

  exportable?: boolean;

  zoomable?: boolean;
  defaultZoom?: number;

  selectable?: boolean;
  selected?: (string | number)[];
  selectedRowIntent?: TReqoreIntent;
  onSelectedChange?: (selected?: any[]) => void;
  onSelectClick?: (dataId: string | number) => void;
  selectToggleTooltip?: string;
  /**
   * Tooltip on the header select-all/none affordance. Defaults to
   * `'Toggle selection on all data'`.
   */
  selectToggleAllTooltip?: string;

  /**
   * Renders the detail panel for an expanded row.
   *
   * Setting it turns the table's rows into expandable ones: an expander column
   * is prepended and each row can open a panel of arbitrary content beneath
   * itself. Return a falsy value for a row that has nothing to show and that
   * row gets no expander.
   *
   * The panel's height is MEASURED, not declared — content can be any height
   * and can change after it opens. `estimatedExpandedRowHeight` is only what a
   * virtualised list assumes for the frame before the first measurement lands.
   */
  renderExpandedRow?: (row: IReqoreTableRowData) => React.ReactNode;
  /** Rows expanded on first render, when expansion is uncontrolled. */
  defaultExpanded?: (string | number)[];
  /** Expanded rows. Pass with `onExpandedChange` to control expansion. */
  expanded?: (string | number)[];
  onExpandedChange?: (expanded: (string | number)[]) => void;
  /** Opening a row closes any other. Off by default. */
  expandSingle?: boolean;
  /** Tooltip on a collapsed row's expander. Defaults to `'Show details'`. */
  expandRowTooltip?: string;
  /** Tooltip on an expanded row's expander. Defaults to `'Hide details'`. */
  collapseRowTooltip?: string;
  /**
   * Height a virtualised list assumes for a panel it has not measured yet.
   * Only affects the first frame after a row opens. Defaults to 200.
   */
  estimatedExpandedRowHeight?: number;

  striped?: boolean;
  emptyMessage?: string;
  showHelp?: boolean;
  showColumnsOptions?: boolean;

  /**
   * Divider label at the top of the "show / hide columns" dropdown.
   * Defaults to `'Show / hide columns'`.
   */
  columnsToggleLabel?: string;
  /**
   * Placeholder rendered on the global filter input. Accepts either a plain
   * string or a builder `(matchedRows) => string`. Defaults to
   * `` (n) => `Search in ${n} items...` ``.
   */
  filterPlaceholder?: string | ((matchedRows: number) => string);
  /** Tooltip on the "scroll to top" action. Defaults to `'Scroll to top'`. */
  scrollToTopTooltip?: string;
  /** Label of the "Reset all" more-menu action. Defaults to `'Reset all'`. */
  resetAllLabel?: string;
  /** Label of the "Help" more-menu action. Defaults to `'Help'`. */
  helpLabel?: string;
  /** Label of the help modal opened by the "Help" action. Defaults to `'Table help'`. */
  helpModalLabel?: string;
  /**
   * Custom body for the help modal opened by the "Help" action. Defaults to
   * the built-in three-bullet English help copy.
   */
  helpContent?: React.ReactNode;

  /**
   * Label of the per-column "Sort ascending" dropdown item. Shown when the
   * column is currently sorted descending. Defaults to `'Sort ascending'`.
   */
  sortAscendingLabel?: string;
  /**
   * Label of the per-column "Sort descending" dropdown item. Shown when the
   * column is currently sorted ascending. Defaults to `'Sort descending'`.
   */
  sortDescendingLabel?: string;
  /** Label of the per-column "Pin left" dropdown item. Defaults to `'Pin left'`. */
  pinLeftLabel?: string;
  /** Label of the per-column "Pin right" dropdown item. Defaults to `'Pin Right'`. */
  pinRightLabel?: string;
  /** Label of the per-column "Hide column" dropdown item. Defaults to `'Hide column'`. */
  hideColumnLabel?: string;
  /** Label of the per-column "Reset size" dropdown item. Defaults to `'Reset size'`. */
  resetSizeLabel?: string;
  /**
   * Divider label before user-supplied header actions in the per-column dropdown.
   * Defaults to `'Other'`.
   */
  otherActionsLabel?: string;
  /**
   * Fallback placeholder for the per-column filter input inside the header
   * dropdown, used when a column doesn't set `filterPlaceholder` of its own.
   * Defaults to `'Filter by this column...'`.
   */
  columnFilterPlaceholder?: string;

  /**
   * When `false`, the table renders every row in the DOM instead of virtualizing via react-window.
   * Required when using `wrap` or per-column `cell.wrap` so rows can grow to their tallest cell.
   * Defaults to `true` (virtualized) unless `wrap` is set, in which case it defaults to `false`.
   */
  virtualized?: boolean;

  /**
   * How many rows to render beyond the visible band, above and below, while
   * virtualized.
   *
   * Defaults to **one viewport's worth of rows** (minimum 8), which is what it
   * takes for the table not to go blank during a fast scroll. react-window
   * updates its window from a `setState` in a passive scroll handler, so React
   * commits the new rows *after* the browser has already painted the scrolled
   * container. Whatever the overscan does not cover, the user sees as empty
   * space that fills in a frame later. react-window's own default of 2 rows is
   * ~66px of cover; a single trackpad flick moves several hundred.
   *
   * Raise it if your rows are cheap and you scroll fast; lower it (or pass a
   * small number) if each row is expensive to render and you would rather trade
   * the occasional blank strip for a smaller DOM.
   */
  overscanRowCount?: number;

  /**
   * When `true`, every cell allows natural text flow (no ellipsis truncation) and rows grow to fit
   * the tallest cell. Individual columns can override with `cell.wrap`. Setting this implicitly
   * disables virtualization unless `virtualized` is explicitly set.
   */
  wrap?: boolean;

  /**
   * Default max-height in pixels for every body cell. When content exceeds this height the cell
   * clips and an overlay with a "Show more" button appears; clicking it expands that cell (and
   * the row) to fit the full content. Expansion is one-way — once expanded the cell stays open.
   * Override per-row with `_maxHeight` on the row data or per-column with `cell.maxHeight`. No
   * limit by default.
   */
  maxCellHeight?: number;

  /**
   * Props forwarded to the "Show more" button rendered by the max-height overlay. Use this to
   * customize the button's label, icon, intent, `customTheme`, etc.
   */
  expandHeightButtonProps?: Partial<IReqoreButtonProps>;

  /**
   * Uniform pixel height for every body row. Overrides the size-derived default
   * (e.g. `small` ⇒ 32px). Useful when a column renders multi-line content but
   * you want to keep `virtualized` + `fill` working — set a value tall enough to
   * fit your tallest cell and every row will render at that height.
   *
   * Mutually exclusive with table-level `wrap` / column-level `cell.wrap`, which
   * disable virtualization and let rows grow to fit content individually.
   */
  rowHeight?: number;

  onRowClick?: IReqoreTableRowClick;

  /**
   * Called whenever the body's scroll position crosses the top: `true` once the
   * user scrolls down from the top, `false` again when they return to it. Lets a
   * host collapse surrounding chrome (page header, KPI tiles) while scrolling and
   * restore it at the top. The table already tracks this internally for its
   * "scroll to top" button; this just surfaces the same signal.
   */
  onScrollChange?: (isScrolled: boolean) => void;
  headerCellComponent?: IReqoreCustomHeaderCellComponent;
  rowComponent?: IReqoreTableRowOptions['rowComponent'];
  bodyCellComponent?: IReqoreTableRowOptions['cellComponent'];
  /**
   * Per-row attribute mapper. Called for each rendered body row with its
   * data + row index; return `className` / `style` / `data-*` / event
   * handlers to spread onto the row `<div>`. Reqore's own baseline
   * `className: 'reqore-table-row'` and its react-window absolute-position
   * `style` are merged in — anything else you return replaces or extends
   * them. Use this instead of `.reqore-table-row:has(...)` selectors when
   * a consumer needs to key row appearance off a data condition.
   */
  getRowProps?: IReqoreTableRowOptions['getRowProps'];

  exportMapper?:
    | TReqoreKeyValueTableExportMapper
    | ((data: unknown[]) => IReqoreExportModalProps['data']);
}

export interface IReqoreTableStyle {
  theme: IReqoreTheme;
  width?: number;
  fill?: number;
  striped?: boolean;
  selectable?: boolean;
  rounded?: boolean;
  flat?: boolean;
}

export interface IReqoreTableSort {
  by: string | ((v: any) => any) | ((v1: any, v2: any) => number);
  thenBy?: string | ((v: any) => any) | ((v1: any, v2: any) => number);
  direction?: 'asc' | 'desc';
}

const StyledTableWrapper = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
  flex: 1;
  overflow: hidden;

  ${({ rounded, size = 'normal' }) => css`
    border-radius: ${rounded === false ? 0 : RADIUS_FROM_SIZE[size]}px;
  `}

  > .reqore-table-header-wrapper:first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    overflow: hidden;
  }
`;

export interface IReqoreTableExportModalProps {
  data: unknown;
  onClose: () => void;
  exportMapper?: IReqoreTableProps['exportMapper'];
}

const ReqoreTableExportModal = ({ data, onClose, exportMapper }) => {
  const fixedData = useMemo(() => {
    let _fixedData = removeInternalData(data);

    if (exportMapper) {
      _fixedData = exportMapper(_fixedData);
    }

    return _fixedData;
  }, [data, exportMapper]);

  return <ReqoreExportModal data={fixedData} onClose={onClose} />;
};

const ReqoreTable = ({
  className,
  height,
  width,
  columns,
  data = [],
  sort,
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  selectToggleTooltip,
  onRowClick,
  onScrollChange,
  striped,
  selectedRowIntent = 'info',
  size = 'normal',
  wrapperSize = 'normal',
  intent,
  fill,
  filterable,
  zoomable,
  filter = '',
  actions = [],
  onFilterChange,
  filterProps,
  emptyMessage = 'No data in this table, try changing your search query or filters',
  headerCellComponent,
  rowComponent,
  bodyCellComponent,
  getRowProps,
  onSelectClick,
  paging,
  exportable,
  exportMapper,
  showHelp,
  showColumnsOptions,
  virtualized,
  wrap,
  maxCellHeight,
  expandHeightButtonProps,
  rowHeight,
  overscanRowCount,
  selectToggleAllTooltip = 'Toggle selection on all data',
  renderExpandedRow,
  defaultExpanded,
  expanded,
  onExpandedChange,
  expandSingle,
  expandRowTooltip = 'Show details',
  collapseRowTooltip = 'Hide details',
  estimatedExpandedRowHeight = 200,
  columnsToggleLabel = 'Show / hide columns',
  filterPlaceholder,
  scrollToTopTooltip = 'Scroll to top',
  resetAllLabel = 'Reset all',
  helpLabel = 'Help',
  helpModalLabel = 'Table help',
  helpContent,
  sortAscendingLabel = 'Sort ascending',
  sortDescendingLabel = 'Sort descending',
  pinLeftLabel = 'Pin left',
  pinRightLabel = 'Pin Right',
  hideColumnLabel = 'Hide column',
  resetSizeLabel = 'Reset size',
  otherActionsLabel = 'Other',
  columnFilterPlaceholder = 'Filter by this column...',
  ...rest
}: IReqoreTableProps) => {
  const mainTableRef = useRef<HTMLDivElement>(null);
  const mainHeaderRef = useRef<HTMLDivElement>(null);

  const hasColumnWrap = useMemo(() => {
    const walk = (cols: IReqoreTableColumn[]): boolean =>
      cols.some((column) => {
        if (column.header?.columns) {
          return walk(column.header.columns);
        }
        return column.cell?.wrap === true;
      });
    return walk(columns);
  }, [columns]);

  const shouldVirtualize = virtualized ?? !(wrap || hasColumnWrap);

  useEffect(() => {
    if ((wrap || hasColumnWrap) && virtualized === true) {
      // eslint-disable-next-line no-console
      console.warn(
        '[ReqoreTable] `wrap` / `cell.wrap` has no visual effect when `virtualized` is explicitly true — FixedSizeList enforces fixed row height. Drop `virtualized={true}` or disable wrapping.'
      );
    }
  }, [wrap, hasColumnWrap, virtualized]);

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  // Live height of the header (column labels + the filter row when present). When
  // the table `fill`s its container the virtualized body must leave room for this
  // header; otherwise the body is sized to the whole container and its last rows
  // overflow under the wrapper and get clipped (you can still scroll to them).
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [_data, setData] = useState<IReqoreTableData>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort | undefined>(fixSort(sort));
  const [_selected, setSelected] = useState<(string | number)[]>(selected || []);
  const [columnModifiers, setColumnModifiers] = useState<{
    [dataId: string]: { [modifier: string]: any };
  }>({});
  const [_internalColumns, setColumns] = useState<IReqoreTableColumn[]>(columns);
  const [zoom, setZoom] = useState<number>(sizeToZoom[size]);
  const [showExportModal, setShowExportModal] = useState<'full' | 'current' | undefined>(undefined);
  const theme = useReqoreTheme('main', rest.customTheme, intent);

  const addModal = useReqoreProperty('addModal');
  // Measure only the table wrapper, not the full panel content. Pagination
  // controls are siblings of this wrapper and consume their own flex space;
  // measuring the panel would include them and make a filled body overflow
  // behind the controls.
  const [wrapperRef, sizes] = useMeasure<HTMLDivElement>();

  // Track the header's height so a filled body can subtract it (see `headerHeight`).
  // A ResizeObserver keeps it correct when the filter row appears/disappears or
  // the header wraps. Only needed while `fill` is on.
  //
  // `sizes.height` is in the deps on purpose: the header ref isn't always mounted
  // on the first run (e.g. when the table is wrapped in a pagination container),
  // so re-running once the container has been measured guarantees we pick the
  // header up and set a non-zero height — otherwise the body keeps the full
  // container height and its last rows scroll out of reach under the wrapper.
  useEffect(() => {
    const element = mainHeaderRef.current;
    if (!fill || !element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const measure = () => setHeaderHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fill, sizes.height]);
  const { query, preQuery, setQuery, setPreQuery } = useQueryWithDelay(
    filter.toString(),
    300,
    onFilterChange
  );
  const normalizedQuery = useMemo(() => query.toString().toLowerCase(), [query]);

  // Column filters live in `columnModifiers` once the user edits them, and on the column
  // itself when supplied as config — `prepareColumns` merges the two, modifier winning.
  //
  // This deliberately walks `_internalColumns` rather than `finalColumns`: the selectbox
  // column `finalColumns` injects is `filterable: false` and carries no filter, so it cannot
  // contribute here, and reading `finalColumns` would make the filtered data depend on the
  // select-all icon — a cycle, since the icon is derived from the filtered data.
  const filters: { [key: string]: string } = useMemo(() => {
    const getFilters = (columnsToTransform: IReqoreTableColumn[]) =>
      columnsToTransform.reduce((filterObject, column) => {
        if (column.header?.columns) {
          return {
            ...filterObject,
            ...getFilters(column.header.columns),
          };
        }

        const filter = columnModifiers?.[column.dataId]?.filter ?? column.filter;

        if (filter) {
          return {
            ...filterObject,
            [column.dataId]: filter,
          };
        }

        return filterObject;
      }, {});

    return getFilters(_internalColumns);
  }, [_internalColumns, columnModifiers]);

  const normalizedFilters = useMemo(
    () =>
      Object.entries(filters).map(([filterKey, filterValue]) => [
        filterKey,
        filterValue.toString().toLowerCase(),
      ]),
    [filters]
  );

  const transformedData = useMemo(() => {
    const hasQuery = normalizedQuery.length > 0;

    /* Stamp each row with its position in the ORIGINAL data, before any filter
       or sort touches it. That is the last-resort expansion identity: unlike a
       rendered-row position it survives sorting and filtering, so a row that
       supplies neither `_expandId` nor `_selectId` keeps its own panel open
       rather than handing it to whoever lands in that slot next. */
    const indexedData = _data.map((datum, index) =>
      datum._reqoreIndex === undefined ? { ...datum, _reqoreIndex: index } : datum
    );

    // Filter by global query
    let filteredData = hasQuery
      ? indexedData.filter((datum) => JSON.stringify(datum).toLowerCase().includes(normalizedQuery))
      : indexedData;

    // Filter by column filters
    filteredData = filteredData.filter((datum) => {
      return normalizedFilters.every(([filterKey, filterValue]) => {
        const datumValue = datum[filterKey as string];

        return datumValue?.toString().toLowerCase().includes(filterValue);
      });
    });

    return _sort ? sortTableData(filteredData, _sort) : filteredData;
  }, [_data, _sort, normalizedFilters, normalizedQuery]);

  /**
   * Which rows are open. Uncontrolled by default (`defaultExpanded` seeds it),
   * controlled when the caller passes `expanded` — the same shape `selected`
   * uses, so a consumer does not learn a second convention for the same idea.
   */
  const [_expanded, _setExpanded] = useState<(string | number)[]>(defaultExpanded ?? []);
  const activeExpanded = expanded ?? _expanded;

  /** A row's expansion identity. See `_expandId`. */
  const getExpandId = useCallback(
    (row: IReqoreTableRowData): string | number =>
      row._expandId ?? row._selectId ?? row._reqoreIndex,
    []
  );

  const handleExpandClick = useCallback(
    (expandId: string | number) => {
      const isOpen = activeExpanded.some((id) => id.toString() === expandId.toString());
      const next = isOpen
        ? activeExpanded.filter((id) => id.toString() !== expandId.toString())
        : expandSingle
          ? [expandId]
          : [...activeExpanded, expandId];

      if (expanded === undefined) {
        _setExpanded(next);
      }

      onExpandedChange?.(next);
    },
    [activeExpanded, expandSingle, expanded, onExpandedChange]
  );

  const selectableData = useMemo(
    () => transformedData.filter((datum) => datum._selectId ?? false),
    [transformedData]
  );

  const activeSelected = selected ?? _selected;
  const selectedQuant = useMemo<'all' | 'none' | 'some'>(() => {
    if (!activeSelected.length) {
      return 'none';
    }

    return activeSelected.length === count(selectableData) ? 'all' : 'some';
  }, [activeSelected, selectableData]);
  const selectedIcon = useMemo(() => {
    switch (selectedQuant) {
      case 'all':
        return 'CheckboxCircleLine';
      case 'some':
        return 'IndeterminateCircleLine';
      default:
        return 'CheckboxBlankCircleLine';
    }
  }, [selectedQuant]);

  const updateSelected = useCallback(
    (
      next:
        | (string | number)[]
        | ((current: (string | number)[]) => (string | number)[])
    ) => {
      const nextSelected = typeof next === 'function' ? next(activeSelected) : next;

      if (selected === undefined) {
        setSelected(nextSelected);
      }
      onSelectedChange?.(nextSelected);
    },
    [activeSelected, onSelectedChange, selected]
  );

  const handleSortChange = useCallback((by: string) => {
    setSort((currentSort: IReqoreTableSort) => {
      const newSort: IReqoreTableSort = { ...currentSort };

      newSort.by = by;
      newSort.direction =
        currentSort.by === by ? flipSortDirection(currentSort.direction) : currentSort.direction;

      return newSort;
    });
  }, []);

  const handleSelectClick = useCallback(
    (selectId: string | number) => {
      if (onSelectClick) {
        onSelectClick(selectId);
        return;
      }

      updateSelected((current) => {
        let newSelected = [...current];
        const isSelected = newSelected.find((selected) => selectId === selected);

        if (isSelected) {
          newSelected = newSelected.filter((selected) => selected !== selectId);
        } else {
          newSelected = [...newSelected, selectId];
        }

        return newSelected;
      });
    },
    [onSelectClick, updateSelected]
  );

  const handleToggleSelectClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      switch (selectedQuant) {
        case 'none':
        case 'some': {
          const nextSelected: (string | number)[] = selectableData
            .filter((datum) => {
              // If the user held down the meta key, we will reverse the selection
              if (e.metaKey) {
                // Check if the datum is selected
                const isSelected = activeSelected.find(
                  (selectId) => selectId === datum._selectId
                );
                // If it is selected, we will remove it from the selected array
                if (isSelected) {
                  return false;
                }
              }

              return true;
            })
            .map((datum) => datum._selectId);

          updateSelected(nextSelected);
          break;
        }
        default: {
          updateSelected([]);
          break;
        }
      }
    },
    [activeSelected, selectableData, selectedQuant, updateSelected]
  );

  const finalColumns = useMemo(() => {
    const fullColumns = [..._internalColumns];

    if (selectable) {
      fullColumns.unshift({
        dataId: 'selectbox',
        width: 20,
        sortable: false,
        hideable: false,
        filterable: false,
        resizable: false,
        pin: 'left',
        pinnable: false,
        align: 'center',

        header: {
          icon: selectedIcon,
          tooltip: selectToggleAllTooltip,
          onClick: handleToggleSelectClick,
        },

        cell: {
          padded: 'none',
          actions: ({ _selectId }) => [
            {
              tooltip: selectToggleTooltip,
              flat: true,
              transparent: true,
              icon: !_selectId
                ? 'Forbid2Line'
                : activeSelected?.find((s) => s.toString() === _selectId.toString())
                ? 'CheckboxCircleLine'
                : 'CheckboxBlankCircleLine',
              intent: !_selectId ? 'muted' : undefined,
              onClick: _selectId ? () => handleSelectClick(_selectId) : undefined,
            },
          ],
        },
      });
    }

    /* Unshifted AFTER the select box so it ends up to its LEFT. The expander is
       about the row you are looking at; the checkbox is about a set you are
       building. The one that acts on this row alone comes first. */
    if (renderExpandedRow) {
      fullColumns.unshift({
        dataId: 'expander',
        width: 20,
        sortable: false,
        hideable: false,
        filterable: false,
        resizable: false,
        pin: 'left',
        pinnable: false,
        align: 'center',

        header: { label: '' },

        cell: {
          padded: 'none',
          actions: (row: IReqoreTableRowData) => {
            // A row with nothing to show gets no control — an expander that
            // opens an empty panel is worse than no expander.
            if (!renderExpandedRow(row)) return [];

            const expandId = getExpandId(row);
            const isOpen = activeExpanded.some((id) => id.toString() === `${expandId}`);

            return [
              {
                tooltip: isOpen ? collapseRowTooltip : expandRowTooltip,
                flat: true,
                transparent: true,
                icon: isOpen ? 'ArrowUpSLine' : 'ArrowDownSLine',
                'aria-expanded': isOpen,
                onClick: () => handleExpandClick(expandId),
              },
            ];
          },
        },
      });
    }

    return prepareColumns(fullColumns, columnModifiers, zoomToSize[zoom]);
  }, [
    _internalColumns,
    columnModifiers,
    zoom,
    selectable,
    selectedIcon,
    selectToggleTooltip,
    selectToggleAllTooltip,
    activeSelected,
    handleToggleSelectClick,
    renderExpandedRow,
    activeExpanded,
    handleExpandClick,
    getExpandId,
    expandRowTooltip,
    collapseRowTooltip,
  ]);

  useUpdateEffect(() => {
    if (onSortChange) {
      onSortChange(_sort);
    }
  }, [_sort]);

  useUpdateEffect(() => {
    setColumns(columns);
  }, [columns]);

  useUpdateEffect(() => {
    setData(data);
  }, [data]);

  const handleScrollChange = useCallback(
    (isScrolled: boolean) => {
      setIsScrolled(isScrolled);
      onScrollChange?.(isScrolled);
    },
    [onScrollChange]
  );

  const handleColumnsUpdate = useCallback(
    <T extends keyof IReqoreTableColumn>(id: string, key: T, value: IReqoreTableColumn[T]) => {
      setColumnModifiers((current) => {
        return {
          ...current,
          [id]: {
            ...current[id],
            [key]: value,
          },
        };
      });
    },
    []
  );

  const handlePreQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPreQuery(event.target.value);
  }, []);

  const columnsList = useMemo(() => {
    const _columnsList: IReqorePanelSubAction[] = [];

    const addColumn = (column: IReqoreTableColumn) => {
      _columnsList.push({
        label: typeof column.header?.label === 'string' ? column.header.label : column.dataId,
        selected: column.show !== false,
        onClick: () =>
          handleColumnsUpdate(column.dataId, 'show', column.show !== false ? false : true),
        intent: column.show !== false ? 'info' : undefined,
      });
    };

    finalColumns.forEach((column) => {
      if (column.hideable === false || column.enabled === false) {
        // If the column is not hideable or enabled, we skip it
        return;
      }

      if (column.header?.columns) {
        column.header?.columns.forEach((subColumn) => {
          addColumn(subColumn);
        });
      } else {
        addColumn(column);
      }
    });

    if (count(_columnsList)) {
      _columnsList.unshift({
        divider: true,
        label: columnsToggleLabel,
      });
    }

    return _columnsList;
  }, [finalColumns, columnsToggleLabel]);

  const handleScrollToTop = () => {
    mainTableRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setIsScrolled(false);
  };

  const tableActions = useMemo<IReqorePanelAction[]>(() => {
    const finalActions: IReqorePanelAction[] = [...actions];

    if (!count(data)) {
      return finalActions;
    }

    if (count(columnsList) && showColumnsOptions) {
      let columnsCount = getColumnsCount(getOnlyShownColumns(finalColumns, sizes.width));

      if (selectable) {
        columnsCount -= 1;
      }

      finalActions.push({
        icon: 'LayoutColumnLine',
        className: 'reqore-table-columns-options',
        badge: columnsCount,
        active: hasHiddenColumns(finalColumns) ? true : undefined,
        multiSelect: true,
        actions: columnsList,
      });
    }

    if (filterable) {
      const resolvedFilterPlaceholder =
        typeof filterPlaceholder === 'function'
          ? filterPlaceholder(count(transformedData))
          : filterPlaceholder ?? `Search in ${count(transformedData)} items...`;

      finalActions.push({
        as: ReqoreInput,
        props: {
          key: 'search',
          fixed: false,
          placeholder: resolvedFilterPlaceholder,
          onClearClick: () => {
            setQuery('');
            setPreQuery('');
          },
          onChange: handlePreQueryChange,
          value: preQuery,
          icon: 'Search2Line',
          disabled: !query && !count(transformedData),
          minimal: false,
          ...filterProps?.(transformedData),
        },
      });
    }

    if (isScrolled) {
      finalActions.push({
        icon: 'ArrowUpSFill',
        tooltip: scrollToTopTooltip,
        className: 'reqore-table-columns-scroll-top',
        responsive: true,
        onClick: handleScrollToTop,
      });
    }

    if (count(columnModifiers) || zoomable || filterable || exportable || showHelp) {
      let moreActions: IReqorePanelSubAction[] = [];

      if (exportable) {
        moreActions = [
          ...moreActions,
          ...getExportActions((type) => setShowExportModal(type)),
          { divider: true, line: true },
        ];
      }

      if (zoomable) {
        moreActions = [
          ...moreActions,
          ...getZoomActions('reqore-table', zoom, setZoom, true),
          { divider: true, line: true },
        ];
      }

      const moreActionsWrapper: IReqorePanelAction = {
        icon: 'MoreLine',
        className: 'reqore-table-more',
        actions: [],
      };

      if (count(columnModifiers) || zoomable || filterable || exportable) {
        moreActionsWrapper.actions = [
          ...moreActions,
          {
            label: resetAllLabel,
            icon: 'RestartLine',
            className: 'reqore-table-reset',
            onClick: () => {
              setColumnModifiers({});
              setZoom(sizeToZoom[size]);
              setPreQuery('');
              setQuery('');
            },
          },
        ];
      }

      if (showHelp) {
        moreActionsWrapper.actions.push({
          label: helpLabel,
          icon: 'QuestionLine',
          className: 'reqore-table-help',
          onClick: () => {
            addModal({
              label: helpModalLabel,
              icon: 'QuestionLine',
              minimal: true,
              panelSize: 'small',
              children: helpContent ?? (
                <ReqoreMessage intent='info' opaque={false} size='small'>
                  <ReqoreControlGroup vertical>
                    <ReqoreP size='small'>
                      - CMD / Control click on the column header to sort / reverse sort by that
                      column
                    </ReqoreP>
                    <ReqoreP size='small'>
                      - Click on the column header for more actions, such as filtering, sorting,
                      pinning and hiding
                    </ReqoreP>
                    <ReqoreP size='small'>
                      - Columns with right dashed border on headers can be resized
                    </ReqoreP>
                  </ReqoreControlGroup>
                </ReqoreMessage>
              ),
            });
          },
        });
      }

      finalActions.push(moreActionsWrapper);
    }

    return finalActions;
  }, [
    actions,
    addModal,
    columnModifiers,
    columnsList,
    data,
    exportable,
    filterProps,
    filterable,
    filterPlaceholder,
    handlePreQueryChange,
    handleScrollToTop,
    isScrolled,
    preQuery,
    query,
    selectable,
    showHelp,
    size,
    setPreQuery,
    setQuery,
    transformedData,
    zoom,
    zoomable,
    scrollToTopTooltip,
    resetAllLabel,
    helpLabel,
    helpModalLabel,
    helpContent,
  ]);

  const badge = useMemo(() => {
    const badgeList: TReqoreBadge[] = rest.label ? [count(transformedData)] : [];

    if (rest.badge) {
      if (isArray(rest.badge)) {
        badgeList.push(...rest.badge);
      } else {
        badgeList.push(rest.badge);
      }
    }

    return badgeList;
  }, [rest.badge, rest.label, transformedData]);

  const renderTable = (items: IReqoreTableRowData[]) => {
    if (count(finalColumns) === 0 || count(data) === 0) {
      return null;
    }

    return (
      <StyledTableWrapper
        ref={wrapperRef}
        className='reqore-table-wrapper'
        rounded={rest.rounded !== false && rest.flat !== false}
        size={rest.flat === false ? wrapperSize : zoomToSize[zoom]}
      >
        <ReqoreTableHeader
          size={zoomToSize[zoom]}
          columns={finalColumns}
          ref={mainHeaderRef}
          bodyRef={mainTableRef}
          onSortChange={handleSortChange}
          heightAsGroup={hasGroupedColumns(finalColumns)}
          sortData={_sort}
          onColumnsUpdate={handleColumnsUpdate}
          onFilterChange={(dataId: string, value: any) => {
            handleColumnsUpdate(dataId, 'filter', value);
          }}
          component={headerCellComponent}
          tableWidth={sizes.width}
          minimal={rest.minimal}
          sortAscendingLabel={sortAscendingLabel}
          sortDescendingLabel={sortDescendingLabel}
          pinLeftLabel={pinLeftLabel}
          pinRightLabel={pinRightLabel}
          hideColumnLabel={hideColumnLabel}
          resetSizeLabel={resetSizeLabel}
          otherActionsLabel={otherActionsLabel}
          columnFilterPlaceholder={columnFilterPlaceholder}
        />
        {count(items) === 0 ? null : (
          <ReqoreTableBody
            ref={mainTableRef}
            headerRef={mainHeaderRef}
            data={items}
            columns={finalColumns}
            height={fill ? Math.max(0, sizes.height - headerHeight) : height}
            selectable={selectable}
            onSelectClick={handleSelectClick}
            onRowClick={onRowClick}
            onScrollChange={handleScrollChange}
            selected={_selected}
            selectedRowIntent={selectedRowIntent}
            size={zoomToSize[zoom]}
            striped={striped}
            flat={rest.flat}
            wrap={wrap}
            maxCellHeight={maxCellHeight}
            expandHeightButtonProps={expandHeightButtonProps}
            rowHeight={rowHeight}
            overscanRowCount={overscanRowCount}
            virtualized={shouldVirtualize}
            rowComponent={rowComponent}
            cellComponent={bodyCellComponent}
            getRowProps={getRowProps}
            renderExpandedRow={renderExpandedRow}
            expanded={activeExpanded}
            onExpandClick={handleExpandClick}
            estimatedExpandedRowHeight={estimatedExpandedRowHeight}
            tableWidth={sizes.width}
          />
        )}
      </StyledTableWrapper>
    );
  };

  const pagingOptions = useMemo(
    () => (paging ? getPagingObjectFromType(paging) : undefined),
    [paging]
  );

  return (
    <>
      <ReqorePanel
        transparent
        flat
        padded={false}
        contentStyle={{ display: 'flex', flexFlow: 'column', overflow: 'hidden' }}
        responsiveActions={false}
        {...rest}
        size={wrapperSize}
        actions={tableActions}
        fill={fill}
        className={`${className || ''} reqore-table`}
        style={{ width, ...(rest.style || {}) }}
        badge={badge}
      >
        <ReqoreThemeProvider theme={theme} customTheme={rest.customTheme}>
          <ReqorePaginationContainer<IReqoreTableRowData>
            items={transformedData}
            type={
              pagingOptions
                ? {
                    ...pagingOptions,
                    onPageChange: () => {
                      if (!pagingOptions.infinite) {
                        handleScrollToTop();
                      }
                    },
                  }
                : undefined
            }
          >
            {(_pagedData, _children, { applyPaging }) => (
              <>
                {showExportModal && (
                  <ReqoreTableExportModal
                    data={
                      showExportModal === 'current' ? applyPaging(transformedData) : transformedData
                    }
                    onClose={() => setShowExportModal(undefined)}
                    exportMapper={exportMapper}
                  />
                )}
                {renderTable(applyPaging(transformedData))}
                {count(applyPaging(transformedData)) === 0
                  ? rest.children || (
                      <ReqoreMessage
                        flat
                        size={size}
                        icon='Search2Line'
                        margin={count(data) ? 'top' : 'none'}
                      >
                        {emptyMessage}
                      </ReqoreMessage>
                    )
                  : null}
              </>
            )}
          </ReqorePaginationContainer>
        </ReqoreThemeProvider>
      </ReqorePanel>
    </>
  );
};

export default ReqoreTable;
