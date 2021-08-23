/* @flow */
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import ReqoreIcon from '../Icon';
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
    css`
      width: ${!width || width < 80 ? 80 : width}px;
    `};

  ${({ grow }) =>
    grow &&
    css`
      flex-grow: ${grow};
    `};

  ${({ align, theme }) => css`
    background-color: ${theme.main};
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
  `}

  ${({ interactive, theme }) =>
    interactive &&
    css`
      cursor: pointer;
      transition: background-color 0.1s linear;

      &:hover {
        color: ${getReadableColor(theme, undefined, undefined)};
        background-color: ${changeLightness(theme.main, 0.02)};
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
  iconSize,
  tooltip,
  ...props
}: IReqoreTableHeaderCellProps) => {
  const [ref, setRef] = useState(null);

  usePopover({ targetElement: ref, content: tooltip || header });

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
        <ReqoreIcon icon={icon} size={iconSize || '13px'} margin={header ? 'right' : undefined} />
      )}
      <StyledTableHeaderLabel>{header}</StyledTableHeaderLabel>
      {sortable && (
        <ReqoreIcon
          icon={
            `Arrow${sortData.direction === 'desc' ? 'Down' : 'Up'}Fill` as
              | 'ArrowDownFill'
              | 'ArrowUpFill'
          }
          size={iconSize || '13px'}
          margin='left'
          style={{
            opacity: sortData.by === dataId ? 1 : 0.2,
          }}
        />
      )}
    </StyledTableHeader>
  );
};

export default ReqoreTableHeaderCell;
