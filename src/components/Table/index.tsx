/* @flow */
import { IconName } from '@blueprintjs/core';
import React, { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import ReqoreTableBody from './body';
import ReqoreTableHeader from './header';
import { fixSort, flipSortDirection, sortTableData } from './helpers';
import { StyledTableCell, StyledTableRow } from './row';

export interface IReqoreTableColumn {
  dataId: string;
  header: string | number | JSX.Element;
  grow?: 1 | 2 | 3 | 4;
  width?: number;
  content?: React.FC<{ data: any }>;
  props?: React.HTMLAttributes<HTMLDivElement>;
  align?: 'center' | 'left' | 'right';
  columns?: IReqoreTableColumn[];
  sortable?: boolean;
  icon?: IconName;
}

export interface IReqoreTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns: IReqoreTableColumn[];
  data?: any[];
  className?: string;
  width?: number;
  height?: number;
  sort?: IReqoreTableSort;
  striped?: boolean;
  onSortChange?: (sort?: IReqoreTableSort) => void;
}

export interface IReqoreTableStyle {
  theme: IReqoreTheme;
  width?: number;
  striped?: boolean;
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
  ...rest
}: IReqoreTableProps) => {
  const [leftScroll, setLeftScroll] = useState<number>(0);
  const [_data] = useState<any[]>(data || []);
  const [_sort, setSort] = useState<IReqoreTableSort>(fixSort(sort));

  useUpdateEffect(() => {
    if (onSortChange) {
      onSortChange(_sort);
    }
  }, [_sort]);

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
        />
        <ReqoreTableBody
          data={_sort ? sortTableData(_data, _sort) : _data}
          columns={columns}
          setLeftScroll={setLeftScroll}
          height={height}
        />
      </StyledTableWrapper>
    </ReqoreThemeProvider>
  );
};

export default ReqoreTable;
