/* @flow */
import { isFunction } from 'lodash';
import { rgba } from 'polished';
import React from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableData } from '.';
import { ReqorePopover } from '../..';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import { getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import ReqoreIcon from '../Icon';

export interface IReqoreTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  data: {
    columns: IReqoreTableColumn[];
    data?: IReqoreTableData;
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
  theme?: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  intent?: IReqoreIntent;
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

  ${({ theme, align, interactive, intent }: IReqoreTableCellStyle) => css`
    display: flex;
    align-items: center;
    justify-content: ${align ? alignToFlex[align] : 'flex-start'};
    flex-shrink: 0;

    height: 100%;
    padding: 0 10px;

    // Background color based on the intent
    ${intent &&
    css`
      color: ${getReadableColorFrom(rgba(theme.intents[intent], 0.8), true)};
      background-color: ${rgba(theme.intents[intent], 0.8)} !important;
    `};

    ${interactive &&
    css`
      cursor: pointer;
      transition: background-color 0.2s ease-out;

      &:hover {
        color: ${intent
          ? getReadableColorFrom(rgba(theme.intents[intent], 0.9))
          : getReadableColor(theme, undefined, undefined)};
        background-color: ${intent
          ? rgba(theme.intents[intent], 0.9)
          : rgba('#000000', 0.15)} !important;
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
  const renderCells = (columns: IReqoreTableColumn[], data: IReqoreTableData) =>
    columns.map(
      ({
        width,
        grow,
        dataId,
        content: Content,
        columns,
        align,
        onCellClick,
        cellTooltip,
        intent,
      }) =>
        columns ? (
          renderCells(columns, data)
        ) : (
          <ReqorePopover
            key={dataId}
            component={StyledTableCell}
            isReqoreComponent
            componentProps={
              {
                width,
                grow,
                align,
                intent: data[index]._reqoreIntent || intent,
                interactive: !!onCellClick,
                onClick: () => {
                  if (onCellClick) {
                    onCellClick(data[index]);
                  }
                },
                className: 'reqore-table-cell',
              } as IReqoreTableCellStyle
            }
            content={cellTooltip ? cellTooltip(data[index]) : undefined}
          >
            {isFunction(Content) ? (
              <Content {...data[index]} />
            ) : (
              <p className='reqore-table-text'>{data[index][dataId]}</p>
            )}
          </ReqorePopover>
        )
    );

  const isSelected = selected.find((selectId) => selectId === data[index]._selectId);

  return (
    <StyledTableRow style={style} className='reqore-table-row'>
      {selectable && (
        <StyledTableCell
          align='center'
          className='reqore-table-cell'
          interactive={!!data[index]._selectId}
          intent={data[index]._reqoreIntent}
          onClick={
            data[index]._selectId
              ? () => {
                  onSelectClick(data[index]._selectId);
                }
              : undefined
          }
        >
          <ReqoreIcon
            icon={
              !data[index]._selectId
                ? 'Forbid2Line'
                : isSelected
                ? 'CheckboxCircleLine'
                : 'CheckboxBlankCircleLine'
            }
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
