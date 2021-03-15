/* @flow */
import { isFunction } from 'lodash';
import React from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import ReqoreIcon from '../Icon';

export interface IReqoreTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  data: {
    columns: IReqoreTableColumn[];
    data?: any[];
    selectable?: boolean;
    onSelectClick?: (selectId: string) => void;
    selected?: string[];
  };
  style: React.StyleHTMLAttributes<HTMLDivElement>;
  index: number;
}

export interface IReqoreTableRowStyle {
  theme: IReqoreTheme;
}

export const StyledTableRow = styled.div<IReqoreTableRowStyle>`
  display: flex;
  height: 30px;
`;

export interface IReqoreTableCellStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  interactive?: boolean;
}

export const alignToFlex = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
};

export const StyledTableCell = styled.div<IReqoreTableCellStyle>`
  ${({ width }) =>
    css`
      width: ${!width || width < 80 ? 80 : width}px;
    `}

  ${({ grow }) =>
    grow &&
    css`
      flex-grow: ${grow};
    `}

  ${({ theme, align, interactive }: IReqoreTableCellStyle) => css`
    display: flex;
    align-items: center;
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
    flex-shrink: 0;

    height: 100%;
    padding: 0 10px;

    border-bottom: 1px solid ${changeLightness(theme.main, 0.05)};

    ${interactive &&
    css`
      cursor: pointer;
      transition: background-color 0.1s linear;

      &:hover {
        color: ${getReadableColor(theme, undefined, undefined)};
        background-color: ${changeLightness(theme.main, 0.025)};
      }
    `};

    p.reqore-table-text {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0;
      padding: 0;
    }
  `}
`;

const ReqoreTableRow = ({
  data: { data, columns, selectable, onSelectClick, selected },
  style,
  index,
}: IReqoreTableRowProps) => {
  const renderCells = (columns: IReqoreTableColumn[], data: any[]) =>
    columns.map(({ width, grow, dataId, content: Content, columns, align }) =>
      columns ? (
        renderCells(columns, data)
      ) : (
        <StyledTableCell
          width={width}
          grow={grow}
          key={dataId}
          align={align}
          className='reqore-table-cell'
        >
          {isFunction(Content) ? (
            <Content {...data[index]} />
          ) : (
            <p className='reqore-table-text'>{data[index][dataId]}</p>
          )}
        </StyledTableCell>
      )
    );

  const isSelected = selected.find(
    (selectId) => selectId === data[index]._selectId
  );

  return (
    <StyledTableRow style={style} className='reqore-table-row'>
      {selectable && (
        <StyledTableCell
          align='center'
          className='reqore-table-cell'
          interactive={!!data[index]._selectId}
          onClick={
            data[index]._selectId
              ? () => {
                  onSelectClick(data[index]._selectId);
                }
              : undefined
          }
        >
          <ReqoreIcon
            icon={!data[index]._selectId ? 'Forbid2Line' : isSelected ? 'CheckboxCircleLine' : 'CheckboxBlankCircleLine'}
            size='19px'
            style={{ opacity: !data[index]._selectId || !isSelected ? 0.4 : 1 }}
          />
        </StyledTableCell>
      )}
      {renderCells(columns, data)}
    </StyledTableRow>
  );
};

export default ReqoreTableRow;
