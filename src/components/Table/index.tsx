/* @flow */
import { size as count, isArray } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useMeasure, useUpdateEffect } from 'react-use';
import { ReqorePanel } from '../..';
import { TABLE_SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreIntent } from '../../types/global';
import { IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import { IReqorePanelAction, IReqorePanelProps } from '../Panel';
import ReqoreTableBody from './body';
import ReqoreTableHeader from './header';
import {
  fixSort,
  flipSortDirection,
  getZoomActions,
  sizeToZoom,
  sortTableData,
  updateColumnData,
  zoomToSize,
} from './helpers';

export type TReqoreTableColumnContent =
  | React.FC<{ [key: string]: any; _selectId?: string | number }>
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
  header?: string | JSX.Element;
  grow?: 1 | 2 | 3 | 4;
  width?: number;
  resizedWidth?: number;

  content?: TReqoreTableColumnContent;

  props?: IReqoreButtonProps;
  align?: 'center' | 'left' | 'right';
  columns?: IReqoreTableColumn[];

  resizable?: boolean;
  sortable?: boolean;
  iconSize?: string;

  cellTooltip?: (data: { [key: string]: any; _selectId?: string | number }) => string | JSX.Element;
  onCellClick?: (data: { [key: string]: any; _selectId?: string | number }) => void;
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
  filterable?: boolean;

  zoomable?: boolean;
  defaultZoom?: number;

  striped?: boolean;
  selectable?: boolean;

  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  filterProps?: (data: IReqoreTableData) => IReqoreInputProps;

  selected?: string[];
  selectedRowIntent?: TReqoreIntent;
  onSortChange?: (sort?: IReqoreTableSort) => void;
  onSelectedChange?: (selected?: any[]) => void;
  selectToggleTooltip?: string;
  onRowClick?: IReqoreTableRowClick;
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
  defaultQuery,
  actions = [],
  onQueryChange,
  filterProps,
  ...rest
}: IReqoreTableProps) => {
  const [leftScroll, setLeftScroll] = useState<number>(0);
  const [_data, setData] = useState<IReqoreTableData>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort>(fixSort(sort));
  const [_selected, setSelected] = useState<(string | number)[]>([]);
  const [_selectedQuant, setSelectedQuant] = useState<'all' | 'none' | 'some'>('none');
  const [internalColumns, setColumns] = useState<IReqoreTableColumn[]>(columns);
  const [zoom, setZoom] = useState<number>(sizeToZoom[size]);

  const [wrapperRef, sizes] = useMeasure();

  const { query, preQuery, setQuery, setPreQuery } = useQueryWithDelay(
    defaultQuery,
    300,
    onQueryChange
  );

  const transformedData = useMemo(() => {
    const filteredData = _data.filter((datum) =>
      JSON.stringify(datum).toLowerCase().includes(query.toLowerCase())
    );

    return _sort ? sortTableData(filteredData, _sort) : filteredData;
  }, [_data, _sort, query]);

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

  const handleSetColumnWidth = useCallback(
    (id: string, width: string) => {
      setColumns(updateColumnData(internalColumns, id, 'resizedWidth', parseInt(width)));
    },
    [internalColumns]
  );

  const handlePreQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setPreQuery(event.target.value);
  };

  const tableActions = useMemo<IReqorePanelAction[]>(() => {
    const finalActions: IReqorePanelAction[] = [...actions];

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

    return finalActions;
  }, [preQuery, transformedData, actions, filterable, filterProps]);

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
        columns={internalColumns}
        leftScroll={leftScroll}
        onSortChange={handleSortChange}
        sortData={_sort}
        selectable={selectable}
        selectedQuant={_selectedQuant}
        onToggleSelectClick={handleToggleSelectClick}
        hasVerticalScroll={count(transformedData) * TABLE_SIZE_TO_PX[size] > height}
        selectToggleTooltip={selectToggleTooltip}
        setColumnWidth={handleSetColumnWidth}
      />
      <ReqoreTableBody
        data={transformedData}
        columns={internalColumns}
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
      />
    </ReqorePanel>
  );
};

export default ReqoreTable;
