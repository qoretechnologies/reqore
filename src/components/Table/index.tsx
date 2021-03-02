/* @flow */
import { size } from 'lodash';
import React, { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreIconName } from '../../types/icons';
import ReqoreTableBody from './body';
import ReqoreTableHeader from './header';
import { fixSort, flipSortDirection, sortTableData } from './helpers';
import { StyledTableCell, StyledTableRow } from './row';

export interface IReqoreTableColumn {
  dataId: string;
  header?: string | number | JSX.Element;
  grow?: 1 | 2 | 3 | 4;
  width?: number;
  content?: React.FC<{ data: any }>;
  props?: React.HTMLAttributes<HTMLDivElement>;
  align?: 'center' | 'left' | 'right';
  columns?: IReqoreTableColumn[];
  sortable?: boolean;
  icon?: IReqoreIconName;
  iconSize?: string;
}

export type IReqoreTableData = { [key: string]: any; _selectId?: string }[];

export interface IReqoreTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns: IReqoreTableColumn[];
  data?: IReqoreTableData;
  className?: string;
  width?: number;
  height?: number;
  sort?: IReqoreTableSort;
  striped?: boolean;
  selectable?: boolean;
  onSortChange?: (sort?: IReqoreTableSort) => void;
  onSelectedChange?: (selected?: any[]) => void;
}

export interface IReqoreTableStyle {
  theme: IReqoreTheme;
  width?: number;
  striped?: boolean;
  selectable?: boolean;
}

export interface IReqoreTableSort {
  by?: string;
  direction?: 'asc' | 'desc';
}

const StyledTableWrapper = styled.div<IReqoreTableStyle>`
  ${({ theme, width, striped }: IReqoreTableStyle) => css`
    width: ${width ? `${width}px` : '100%'};

    position: relative;
    clear: both;
    overflow: hidden;

    display: flex;
    flex-flow: column;

    color: ${getReadableColor(theme.main, undefined, undefined, true)};

    ${striped &&
    css`
      ${StyledTableRow}:nth-child(odd) {
        ${StyledTableCell} {
          background-color: ${changeLightness(theme.main, 0.025)};
        }
      }
    `}
  `}
`;

const ReqoreTable = ({
  children,
  className,
  height,
  width,
  columns,
  data,
  sort,
  onSortChange,
  selectable,
  onSelectedChange,
  ...rest
}: IReqoreTableProps) => {
  const [leftScroll, setLeftScroll] = useState<number>(0);
  const [_data] = useState<IReqoreTableData>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort>(fixSort(sort));
  const [_selected, setSelected] = useState<string[]>([]);
  const [_selectedQuant, setSelectedQuant] = useState<'all' | 'none' | 'some'>(
    'none'
  );

  useUpdateEffect(() => {
    if (onSortChange) {
      onSortChange(_sort);
    }
  }, [_sort]);

  useUpdateEffect(() => {
    if (onSelectedChange) {
      onSelectedChange(_selected);
    }

    const selectableData: IReqoreTableData = _data.filter(
      (datum) => datum._selectId ?? false
    );

    if (size(_selected)) {
      if (size(_selected) === size(selectableData)) {
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
        currentSort.by === by
          ? flipSortDirection(currentSort.direction)
          : currentSort.direction;

      return newSort;
    });
  };

  const handleSelectClick = (selectId: string) => {
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
        const selectableData: string[] = _data
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

  return (
    <ReqoreThemeProvider>
      <StyledTableWrapper
        {...rest}
        width={width}
        className={`${className || ''} reqore-table`}
      >
        <ReqoreTableHeader
          columns={columns}
          leftScroll={leftScroll}
          onSortChange={handleSortChange}
          sortData={_sort}
          selectable={selectable}
          selectedQuant={_selectedQuant}
          onToggleSelectClick={handleToggleSelectClick}
        />
        <ReqoreTableBody
          data={_sort ? sortTableData(_data, _sort) : _data}
          columns={columns}
          setLeftScroll={setLeftScroll}
          height={height}
          selectable={selectable}
          onSelectClick={handleSelectClick}
          selected={_selected}
        />
      </StyledTableWrapper>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTable;
