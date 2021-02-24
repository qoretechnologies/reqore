/* @flow */
import { isFunction } from 'lodash';
import React from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn } from '.';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness } from '../../helpers/colors';

export interface IReqoreTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  data: {
    columns: IReqoreTableColumn[];
    data?: any[];
  };
  style: React.StyleHTMLAttributes<HTMLDivElement>;
  index: number;
}

export interface IReqoreTableRowStyle {
  theme: IReqoreTheme;
  active?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
}

export const StyledTableRow = styled.div<IReqoreTableRowStyle>`
  ${({ theme, active, hover, striped }: IReqoreTableRowStyle) => css`
    display: flex;
    height: 30px;

    ${
      striped &&
      css`
        &:nth-child(even) {
          background-color: ${changeLightness(theme.main, 0.04)};
        }
      `
    }
    ${
      active &&
      css`
        background-color: ${changeLightness(theme.main, 0.055)};
      `
    }
    ${
      hover &&
      css`
        cursor: pointer;
        &:hover {
          background-color: ${changeLightness(theme.main, 0.02)};
        }
      `
    }
  `}
`;

export interface IReqoreTableCellStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
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

  ${({ theme, align }: IReqoreTableCellStyle) => css`
    display: flex;
    align-items: center;
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
    flex-shrink: 0;

    height: 100%;
    padding: 0 10px;

    border-bottom: 1px solid ${changeLightness(theme.main, 0.05)};

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
  data: { data, columns },
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
            <Content data={data[index][dataId]} />
          ) : (
            <p className='reqore-table-text'>{data[index][dataId]}</p>
          )}
        </StyledTableCell>
      )
    );

  return (
    <StyledTableRow style={style} className='reqore-table-row'>
      {renderCells(columns, data)}
    </StyledTableRow>
  );
};

export default ReqoreTableRow;
