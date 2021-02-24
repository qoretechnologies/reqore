/* @flow */
import { Icon } from '@blueprintjs/core';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import { alignToFlex } from './row';

export interface IReqoreTableHeaderCellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreTableColumn {
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
}

export interface IReqoreTableHeaderStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  interactive?: boolean;
}

export const StyledTableHeader = styled.div<IReqoreTableHeaderStyle>`
  ${({ width }) =>
    width &&
    css`
      width: ${!width || width < 80 ? 80 : width}px;
    `};

  ${({ grow }) =>
    grow &&
    css`
      flex-grow: ${grow};
    `};

  ${({ align }) => css`
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
  `}

  ${({ interactive, theme }) =>
    interactive &&
    css`
      cursor: pointer;
      transition: background-color 0.1s linear;

      &:hover {
        color: ${getReadableColor(theme.main, undefined, undefined)};
        background-color: ${changeLightness(theme.main, 0.025)};
      }
    `};
`;

const StyledTableHeaderLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ReqoreTableHeaderCell = ({
  width,
  grow,
  align,
  header,
  onSortChange,
  dataId,
  sortable,
  sortData,
  onClick,
  className,
  icon,
  ...props
}: IReqoreTableHeaderCellProps) => {
  const [ref, setRef] = useState(null);

  usePopover(ref, header, undefined, undefined);

  return (
    <StyledTableHeader
      {...props}
      className={`${className || ''} reqore-table-header-cell`}
      ref={setRef}
      width={width}
      grow={grow}
      align={align}
      interactive={sortable || !!onClick}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (sortable) {
          onSortChange(dataId);
        }
        if (onClick) {
          onClick(event);
        }
      }}
    >
      {icon && (
        <Icon
          icon={icon}
          iconSize={12}
          style={{
            marginRight: '5px',
          }}
        />
      )}
      <StyledTableHeaderLabel>{header}</StyledTableHeaderLabel>
      {sortable && (
        <Icon
          icon={`sort-${sortData.direction}` as 'sort-asc' | 'sort-desc'}
          iconSize={12}
          style={{
            marginLeft: '5px',
            opacity: sortData.by === dataId ? 1 : 0.5,
          }}
        />
      )}
    </StyledTableHeader>
  );
};

export default ReqoreTableHeaderCell;
