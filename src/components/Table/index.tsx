/* @flow */
import { size as count, isArray } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useMeasure, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import {
  ReqoreMessage,
  ReqorePaginationContainer,
  ReqorePanel,
  ReqoreVerticalSpacer,
  useReqoreTheme,
} from '../..';
import { TReqorePaginationType, getPagingObjectFromType } from '../../constants/paging';
import { TABLE_SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreIntent, IReqoreTooltip } from '../../types/global';
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
  getColumnsByPinType,
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
  | 'tag'
  | `tag:${TReqoreIntent}`
  | `tag:#${string}`
  | 'title'
  | `title:${TReqoreIntent}`
  | 'text'
  | `text:${TReqoreIntent}`
  | string
  | number;

export interface IReqoreTableColumn extends IReqoreIntent {
  dataId: string;
  show?: boolean;
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
    actions?: (data: IReqoreTableRowData) => IReqoreButtonProps[];
    intent?: TReqoreIntent;
    padded?: 'both' | 'horizontal' | 'vertical' | 'none';
  };
}

export interface IReqoreTableRowData {
  [key: string]: any;
  _selectId?: string | number;
  _intent?: TReqoreIntent;
  _disabled?: boolean;
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
  selected?: string[];
  selectedRowIntent?: TReqoreIntent;
  onSelectedChange?: (selected?: any[]) => void;
  onSelectClick?: (dataId: string | number) => void;
  selectToggleTooltip?: string;

  striped?: boolean;
  emptyMessage?: string;

  onRowClick?: IReqoreTableRowClick;
  headerCellComponent?: IReqoreCustomHeaderCellComponent;
  rowComponent?: IReqoreTableRowOptions['rowComponent'];
  bodyCellComponent?: IReqoreTableRowOptions['cellComponent'];

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
  by: string;
  thenBy?: string;
  direction?: 'asc' | 'desc';
}

const StyledTableWrapper = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: column;

  ${({ isPinned }) =>
    isPinned
      ? css`
          flex-shrink: 0;
          z-index: 1;
          box-shadow: 1px -1px 20px -2px rgba(0, 0, 0, 0.8);
        `
      : css`
          width: 100%;
          flex: 1;
        `};
`;

const StyledTablesWrapper = styled.div`
  display: flex;
  flex-flow: row;
  overflow: hidden;
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
  onSelectClick,
  paging,
  exportable,
  exportMapper,
  ...rest
}: IReqoreTableProps) => {
  const leftTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);
  const mainTableRef = useRef<HTMLDivElement>(null);
  const mainHeaderRef = useRef<HTMLDivElement>(null);

  const [hoveredRow, setHoveredRow] = useState<number>();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [_data, setData] = useState<IReqoreTableData>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort | undefined>(fixSort(sort));
  const [_selected, setSelected] = useState<(string | number)[]>(selected || []);
  const [_selectedQuant, setSelectedQuant] = useState<'all' | 'none' | 'some'>('none');
  const [columnModifiers, setColumnModifiers] = useState<{
    [dataId: string]: { [modifier: string]: any };
  }>({});
  const [_internalColumns, setColumns] = useState<IReqoreTableColumn[]>(columns);
  const [zoom, setZoom] = useState<number>(sizeToZoom[size]);
  const [showExportModal, setShowExportModal] = useState<'full' | 'current' | undefined>(undefined);
  const theme = useReqoreTheme('main', rest.customTheme, intent);

  const [wrapperRef, sizes] = useMeasure();
  const { query, preQuery, setQuery, setPreQuery } = useQueryWithDelay(
    filter.toString(),
    300,
    onFilterChange
  );

  const selectedIcon = useMemo(() => {
    switch (_selectedQuant) {
      case 'all':
        return 'CheckboxCircleLine';
      case 'some':
        return 'IndeterminateCircleLine';
      default:
        return 'CheckboxBlankCircleLine';
    }
  }, [_selectedQuant]);

  const finalColumns = useMemo(() => {
    const fullColumns = [..._internalColumns];

    if (selectable) {
      fullColumns.unshift({
        dataId: 'selectbox',
        width: 50,
        sortable: false,
        hideable: false,
        filterable: false,
        resizable: false,
        pin: 'left',
        pinnable: false,
        align: 'center',

        header: {
          icon: selectedIcon,
          tooltip: 'Toggle selection on all data',
          onClick: () => {
            handleToggleSelectClick();
          },
        },

        cell: {
          padded: 'none',
          actions: ({ _selectId }) => [
            {
              tooltip: selectToggleTooltip,
              icon: !_selectId
                ? 'Forbid2Line'
                : _selected?.find((s) => s.toString() === _selectId.toString())
                ? 'CheckboxCircleLine'
                : 'CheckboxBlankCircleLine',
              intent: !_selectId
                ? 'muted'
                : _selected?.find((s) => s.toString() === _selectId.toString())
                ? selectedRowIntent
                : undefined,
              onClick: _selectId ? () => handleSelectClick(_selectId) : undefined,
            },
          ],
        },
      });
    }

    return prepareColumns(fullColumns, columnModifiers, zoomToSize[zoom]);
  }, [
    _internalColumns,
    columnModifiers,
    zoom,
    selectable,
    _selectedQuant,
    selectedIcon,
    selectToggleTooltip,
    _selected,
    selectedRowIntent,
  ]);

  const filters: { [key: string]: string } = useMemo(() => {
    const getFilters = (columnsToTransform: IReqoreTableColumn[]) =>
      columnsToTransform.reduce((filterObject, column) => {
        if (column.header?.columns) {
          return {
            ...filterObject,
            ...getFilters(column.header.columns),
          };
        }

        if (column.filter) {
          return {
            ...filterObject,
            [column.dataId]: column.filter,
          };
        }

        return filterObject;
      }, {});

    return getFilters(finalColumns);
  }, [finalColumns]);

  const transformedData = useMemo(() => {
    // Filter by global query
    let filteredData = _data.filter((datum) =>
      JSON.stringify(datum).toLowerCase().includes(query.toString().toLowerCase())
    );

    // Filter by column filters
    filteredData = filteredData.filter((datum) => {
      return Object.keys(filters).every((filterKey) => {
        const filterValue = filters[filterKey];
        const datumValue = datum[filterKey];

        return datumValue?.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
      });
    });

    return _sort ? sortTableData(filteredData, _sort) : filteredData;
  }, [_data, _sort, query, filters]);

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

  useUpdateEffect(() => {
    if (selectable && selected) {
      setSelected(selected);
    }
  }, [selected]);

  useUpdateEffect(() => {
    if (onSelectedChange) {
      onSelectedChange(_selected);
    }

    const selectableData: IReqoreTableData = transformedData.filter(
      (datum) => datum._selectId ?? false
    );

    if (count(_selected)) {
      if (count(_selected) === count(selectableData)) {
        setSelectedQuant('all');
      } else {
        setSelectedQuant('some');
      }
    } else {
      setSelectedQuant('none');
    }
  }, [_selected]);

  const handleSortChange = (by: string) => {
    setSort((currentSort: IReqoreTableSort) => {
      const newSort: IReqoreTableSort = { ...currentSort };

      newSort.by = by;
      newSort.direction =
        currentSort.by === by ? flipSortDirection(currentSort.direction) : currentSort.direction;

      return newSort;
    });
  };

  const handleSelectClick = (selectId: string | number) => {
    if (onSelectClick) {
      onSelectClick(selectId);
      return;
    }

    setSelected((current) => {
      let newSelected = [...current];
      const isSelected = newSelected.find((selected) => selectId === selected);

      if (isSelected) {
        newSelected = newSelected.filter((selected) => selected !== selectId);
      } else {
        newSelected = [...newSelected, selectId];
      }

      return newSelected;
    });
  };

  const handleToggleSelectClick = () => {
    switch (_selectedQuant) {
      case 'none':
      case 'some': {
        const selectableData: (string | number)[] = transformedData
          .filter((datum) => datum._selectId ?? false)
          .map((datum) => datum._selectId);

        setSelected(selectableData);
        break;
      }
      default: {
        setSelected([]);
        break;
      }
    }
  };

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
    [columnModifiers]
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
      if (column.hideable === false) {
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
        label: 'Show / hide columns',
      });
    }

    return _columnsList;
  }, [finalColumns]);

  const handleScrollToTop = () => {
    mainTableRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    leftTableRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    rightTableRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setIsScrolled(false);
  };

  const tableActions = useMemo<IReqorePanelAction[]>(() => {
    const finalActions: IReqorePanelAction[] = [...actions];

    if (count(columnsList)) {
      finalActions.push({
        icon: 'LayoutColumnLine',
        className: 'reqore-table-columns-options',
        badge: getColumnsCount(getOnlyShownColumns(finalColumns)),
        intent: hasHiddenColumns(finalColumns) ? 'info' : undefined,
        multiSelect: true,
        actions: columnsList,
      });
    }

    if (filterable) {
      finalActions.push({
        as: ReqoreInput,
        props: {
          key: 'search',
          fixed: false,
          placeholder: `Search in ${count(transformedData)} items...`,
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
        tooltip: 'Scroll to top',
        className: 'reqore-table-columns-scroll-top',
        responsive: true,
        onClick: handleScrollToTop,
      });
    }

    if (count(columnModifiers) || zoomable || filterable || exportable) {
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

      finalActions.push({
        icon: 'MoreLine',
        className: 'reqore-table-more',
        actions: [
          ...moreActions,
          {
            label: 'Reset table',
            icon: 'RestartLine',
            className: 'reqore-table-reset',
            onClick: () => {
              setZoom(1);
              setPreQuery('');
              setQuery('');
              setColumnModifiers({});
            },
          },
        ],
      });
    }

    return finalActions;
  }, [
    preQuery,
    transformedData,
    actions,
    filterable,
    filterProps,
    finalColumns,
    zoomable,
    zoom,
    columnsList,
    isScrolled,
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
  }, [transformedData, rest.badge]);

  const refs = {
    left: leftTableRef,
    right: rightTableRef,
    main: mainTableRef,
    header: mainHeaderRef,
  };

  const columnsByType = useMemo(
    () => ({
      left: getColumnsByPinType(finalColumns, 'left'),
      right: getColumnsByPinType(finalColumns, 'right'),
      main: getColumnsByPinType(finalColumns, 'main'),
    }),
    [finalColumns]
  );

  const renderTable = (type: 'left' | 'main' | 'right' = 'main', items: IReqoreTableRowData[]) => {
    const tableColumns = columnsByType[type];
    const isPinned = type === 'left' || type === 'right';

    if (count(tableColumns) === 0) {
      return null;
    }

    return (
      <StyledTableWrapper isPinned={isPinned}>
        <ReqoreTableHeader
          size={zoomToSize[zoom]}
          columns={tableColumns}
          scrollable={type === 'main'}
          ref={type === 'main' ? mainHeaderRef : undefined}
          bodyRef={mainTableRef}
          onSortChange={handleSortChange}
          heightAsGroup={hasGroupedColumns(finalColumns)}
          sortData={_sort}
          hasVerticalScroll={count(items) * TABLE_SIZE_TO_PX[size] > height}
          onColumnsUpdate={handleColumnsUpdate}
          onFilterChange={(dataId: string, value: any) => {
            handleColumnsUpdate(dataId, 'filter', value);
          }}
          component={headerCellComponent}
        />
        {count(items) === 0 ? null : (
          <ReqoreTableBody
            ref={refs[type]}
            refs={refs}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            type={type}
            data={items}
            columns={tableColumns}
            height={fill ? sizes.height : height}
            selectable={selectable}
            onSelectClick={handleSelectClick}
            onRowClick={onRowClick}
            onScrollChange={(isScrolled) => setIsScrolled(isScrolled)}
            selected={_selected}
            selectedRowIntent={selectedRowIntent}
            size={zoomToSize[zoom]}
            striped={striped}
            flat={rest.flat}
            rowComponent={rowComponent}
            cellComponent={bodyCellComponent}
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
        getContentRef={wrapperRef}
        badge={badge}
      >
        <ReqoreThemeProvider theme={theme}>
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
            {(pagedData) => (
              <>
                {showExportModal && (
                  <ReqoreTableExportModal
                    data={showExportModal === 'current' ? pagedData : transformedData}
                    onClose={() => setShowExportModal(undefined)}
                    exportMapper={exportMapper}
                  />
                )}
                <StyledTablesWrapper className='reqore-table-wrapper'>
                  {renderTable('left', pagedData)}
                  {renderTable('main', pagedData)}
                  {renderTable('right', pagedData)}
                </StyledTablesWrapper>
                {count(pagedData) === 0 ? (
                  <>
                    <ReqoreVerticalSpacer height={10} />
                    <ReqoreMessage flat size={size} icon='Search2Line'>
                      {emptyMessage}
                    </ReqoreMessage>
                  </>
                ) : null}
              </>
            )}
          </ReqorePaginationContainer>
        </ReqoreThemeProvider>
      </ReqorePanel>
    </>
  );
};

export default ReqoreTable;
