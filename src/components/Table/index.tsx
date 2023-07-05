/* @flow */
import { size as count, isArray } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useMeasure, useUpdateEffect } from 'react-use';
import { ReqoreMessage, ReqorePanel, ReqoreVerticalSpacer } from '../..';
import { TABLE_SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreIntent, IReqoreTooltip } from '../../types/global';
import { IReqoreButtonProps, TReqoreBadge } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import { IReqorePanelAction, IReqorePanelProps, IReqorePanelSubAction } from '../Panel';
import ReqoreTableBody from './body';
import ReqoreTableHeader, { IReqoreCustomHeaderCellComponent } from './header';
import { IReqoreTableHeaderCellProps } from './headerCell';
import {
  fixSort,
  flipSortDirection,
  getColumnsCount,
  getOnlyShownColumns,
  getZoomActions,
  hasHiddenColumns,
  prepareColumns,
  sizeToZoom,
  sortTableData,
  zoomToSize,
} from './helpers';
import { IReqoreTableRowOptions } from './row';

export type TReqoreTableColumnContent =
  | React.FC<{ [key: string]: any; _selectId?: string | number; _size: TSizes; _dataId: string }>
  | 'time-ago'
  | 'tag'
  | `tag:${TReqoreIntent}`
  | `tag:#${string}`
  | 'title'
  | `title:${TReqoreIntent}`
  | 'text'
  | `text:${TReqoreIntent}`;

export interface IReqoreTableColumn extends IReqoreIntent {
  dataId: string;
  show?: boolean;
  grow?: 1 | 2 | 3 | 4;
  width?: number;
  resizedWidth?: number;
  align?: 'center' | 'left' | 'right';

  resizable?: boolean;
  sortable?: boolean;
  hideable?: boolean;

  filterable?: boolean;
  filterPlaceholder?: string;
  filter?: string | number;

  header?: {
    columns?: IReqoreTableColumn[];
    component?: React.FC<IReqoreTableHeaderCellProps>;
    actions?: IReqoreDropdownItem[];
  } & IReqoreButtonProps;

  cell?: {
    onClick?: (cellValue: any) => void;
    tooltip?: (cellValue: any) => string | IReqoreTooltip;
    content?: TReqoreTableColumnContent;
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

  sort?: IReqoreTableSort;
  onSortChange?: (sort?: IReqoreTableSort) => void;

  filterable?: boolean;
  filterProps?: (data: IReqoreTableData) => IReqoreInputProps;
  filter?: string;
  onFilterChange?: (query: string) => void;

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
  by?: string;
  thenBy?: string;
  direction?: 'asc' | 'desc';
}

const ReqoreTable = ({
  className,
  height = 300,
  width,
  columns,
  data = [],
  sort,
  onSortChange,
  selectable,
  selected,
  onSelectedChange,
  selectToggleTooltip,
  customTheme,
  onRowClick,
  striped,
  selectedRowIntent,
  size = 'normal',
  wrapperSize = 'normal',
  intent,
  fill,
  filterable,
  zoomable,
  filter,
  actions = [],
  onFilterChange,
  filterProps,
  emptyMessage = 'No data in this table, try changing your search query or filters',
  headerCellComponent,
  rowComponent,
  bodyCellComponent,
  onSelectClick,
  ...rest
}: IReqoreTableProps) => {
  const [leftScroll, setLeftScroll] = useState<number>(0);
  const [_data, setData] = useState<IReqoreTableData>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort>(fixSort(sort));
  const [_selected, setSelected] = useState<(string | number)[]>([]);
  const [_selectedQuant, setSelectedQuant] = useState<'all' | 'none' | 'some'>('none');
  const [columnModifiers, setColumnModifiers] = useState<{
    [key: string]: { [dataId: string]: any };
  }>({});
  const [_internalColumns, setColumns] = useState<IReqoreTableColumn[]>(columns);
  const [zoom, setZoom] = useState<number>(sizeToZoom[size]);

  const [wrapperRef, sizes] = useMeasure();
  const { query, preQuery, setQuery, setPreQuery } = useQueryWithDelay(filter, 300, onFilterChange);

  const finalColumns = useMemo(
    () => prepareColumns(_internalColumns, columnModifiers, size),
    [_internalColumns, columnModifiers]
  );

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
      JSON.stringify(datum).toLowerCase().includes(query.toLowerCase())
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
    if (selectable) {
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

  const handleSortChange = (by?: string) => {
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
    const _columnsList: IReqorePanelSubAction[] = [
      {
        divider: true,
        label: 'Show / hide columns',
      },
    ];

    const addColumn = (column: IReqoreTableColumn) => {
      _columnsList.push({
        label: typeof column.header.label === 'string' ? column.header.label : column.dataId,
        selected: column.show !== false,
        onClick: () =>
          handleColumnsUpdate(column.dataId, 'show', column.show !== false ? false : true),
        intent: column.show !== false ? 'info' : undefined,
      });
    };

    finalColumns.forEach((column) => {
      if (column.header?.columns) {
        column.header?.columns.forEach((subColumn) => {
          addColumn(subColumn);
        });
      } else {
        addColumn(column);
      }
    });

    return _columnsList;
  }, [finalColumns]);

  const tableActions = useMemo<IReqorePanelAction[]>(() => {
    const finalActions: IReqorePanelAction[] = [...actions];

    finalActions.push({
      label: 'Columns',
      icon: 'LayoutColumnLine',
      className: 'reqore-table-columns-options',
      badge: getColumnsCount(getOnlyShownColumns(finalColumns)),
      intent: hasHiddenColumns(finalColumns) ? 'info' : undefined,
      multiSelect: true,
      actions: columnsList,
    });

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

    if (zoomable) {
      finalActions.push({
        fluid: false,
        group: getZoomActions('reqore-table', zoom, setZoom),
      });
    }

    if (count(columnModifiers) || zoomable || filterable) {
      finalActions.push({
        icon: 'MoreLine',
        className: 'reqore-table-more',
        actions: [
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
  ]);

  const badge = useMemo(() => {
    const badgeList: TReqoreBadge[] = rest.label ? [count(transformedData)] : undefined;

    if (rest.badge) {
      if (isArray(rest.badge)) {
        badgeList.push(...rest.badge);
      } else {
        badgeList.push(rest.badge);
      }
    }

    return badgeList;
  }, [transformedData, rest.badge]);

  return (
    <ReqorePanel
      transparent
      flat
      padded={false}
      contentStyle={{ display: 'flex', flexFlow: 'column', overflow: 'hidden' }}
      {...rest}
      size={wrapperSize}
      actions={tableActions}
      fill={fill}
      className={`${className || ''} reqore-table`}
      style={{ width, ...(rest.style || {}) }}
      getContentRef={wrapperRef}
      badge={badge}
    >
      <ReqoreTableHeader
        size={zoomToSize[zoom]}
        columns={finalColumns}
        leftScroll={leftScroll}
        onSortChange={handleSortChange}
        sortData={_sort}
        selectable={selectable}
        selectedQuant={_selectedQuant}
        onToggleSelectClick={handleToggleSelectClick}
        hasVerticalScroll={count(transformedData) * TABLE_SIZE_TO_PX[size] > height}
        selectToggleTooltip={selectToggleTooltip}
        onColumnsUpdate={handleColumnsUpdate}
        onFilterChange={(dataId: string, value: any) => {
          handleColumnsUpdate(dataId, 'filter', value);
        }}
        component={headerCellComponent}
      />
      {count(transformedData) === 0 ? (
        <>
          <ReqoreVerticalSpacer height={10} />
          <ReqoreMessage flat size={size} icon='Search2Line'>
            {emptyMessage}
          </ReqoreMessage>
        </>
      ) : (
        <ReqoreTableBody
          data={transformedData}
          columns={finalColumns}
          setLeftScroll={setLeftScroll}
          height={fill ? sizes.height : height}
          selectable={selectable}
          onSelectClick={handleSelectClick}
          onRowClick={onRowClick}
          selected={_selected}
          selectedRowIntent={selectedRowIntent}
          size={zoomToSize[zoom]}
          striped={striped}
          flat={rest.flat}
          rowComponent={rowComponent}
          cellComponent={bodyCellComponent}
        />
      )}
    </ReqorePanel>
  );
};

export default ReqoreTable;
