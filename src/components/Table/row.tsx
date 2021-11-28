/* @flow */
import { isFunction } from 'lodash';
import { lighten, rgba } from 'polished';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableData, IReqoreTableRowClick } from '.';
import { ReqorePopover } from '../..';
import { SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import ReqoreIcon from '../Icon';

export interface IReqoreTableRowOptions {
  columns: IReqoreTableColumn[];
  data?: IReqoreTableData;
  selectable?: boolean;
  onSelectClick?: (selectId: string) => void;
  selected?: string[];
  onRowClick?: IReqoreTableRowClick;
  striped?: boolean;
  selectedRowIntent?: IReqoreIntent;
  size?: TSizes;
  flat?: boolean;
}

export interface IReqoreTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  data: IReqoreTableRowOptions;
  style: React.StyleHTMLAttributes<HTMLDivElement>;
  index: number;
}

export interface IReqoreTableRowStyle {
  theme: IReqoreTheme;
  interactive?: boolean;
  intent?: IReqoreIntent;
  selected?: boolean;
  selectedIntent?: IReqoreIntent;
  flat?: boolean;
  disabled?: boolean;
  hovered?: boolean;
}

export const StyledTableRow = styled.div<IReqoreTableRowStyle>`
  ${({ size }) => css`
    display: flex;
    height: ${SIZE_TO_PX[size]}px;
  `}
`;

export interface IReqoreTableCellStyle {
  width?: number;
  grow?: number;
  theme?: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  intent?: IReqoreIntent;
  interactive?: boolean;
  interactiveCell?: boolean;
  size?: TSizes;
  flat?: boolean;
  disabled?: boolean;
  selected?: boolean;
  hovered?: boolean;
  selectedIntent?: IReqoreIntent;
  even?: boolean;
  striped?: boolean;
}

export const alignToFlex = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
};

export const StyledTableCell = styled.div<IReqoreTableCellStyle>`
  ${({ width, grow }) =>
    css`
      width: ${!width || width < 80 ? 80 : width}px;
      flex-grow: ${grow || (width ? undefined : 1)};
    `}

  ${({
    theme,
    align,
    interactive,
    interactiveCell,
    intent,
    size,
    flat,
    striped,
    even,
    selected,
    selectedIntent,
    disabled,
    hovered,
  }: IReqoreTableCellStyle) => {
    const getBackgroundColor = () => {
      let color = theme.main;
      let opacity = 0;
      // Is there any intent
      if (intent || (selected && selectedIntent)) {
        color = theme.intents[intent || selectedIntent];
        opacity += 0.02;
      }
      // Is the table striped and this row odd
      if (striped && !even) {
        opacity += 0.05;
      }
      // Is this row selected
      if (selected) {
        opacity += 0.02;
      }
      // Is this row hovered
      if (hovered) {
        opacity += 0.05;
      }

      // Set the color as transparent if opacity is 0
      if (opacity === 0) {
        return 'transparent';
      }

      return changeLightness(color, opacity);
    };

    const backgroundColor = getBackgroundColor();

    return css`
      display: flex;
      align-items: center;
      justify-content: ${align ? alignToFlex[align] : 'flex-start'};
      flex-shrink: 0;
      border-bottom: ${!flat ? '1px solid ' : undefined};

      height: 100%;
      padding: 0 10px;
      font-size: ${TEXT_FROM_SIZE[size]}px;
      background-color: ${backgroundColor === 'transparent'
        ? 'transparent'
        : rgba(getBackgroundColor(), 0.8)};
      color: ${getReadableColorFrom(
        backgroundColor === 'transparent' ? theme.main : getBackgroundColor(),
        !hovered
      )};
      border-color: ${changeLightness(
        backgroundColor === 'transparent' ? theme.main : getBackgroundColor(),
        0.1
      )};
      transition: background-color 0.2s ease-out;
      opacity: ${disabled ? 0.2 : 1};
      pointer-events: ${disabled ? 'none' : undefined};
      cursor: ${interactive || interactiveCell ? 'pointer' : 'default'};

      ${interactiveCell &&
      css`
        &:hover {
          background-color: ${lighten(0.2, getBackgroundColor())};
        }
      `}

      p.reqore-table-text {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin: 0;
        padding: 0;
      }
    `;
  }}
`;

const ReqoreTableRow = ({
  data: {
    data,
    columns,
    selectable,
    onSelectClick,
    selected,
    onRowClick,
    striped,
    size,
    selectedRowIntent = 'info',
    flat,
  },
  style,
  index,
}: IReqoreTableRowProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isSelected = selected.find((selectId) => selectId === data[index]._selectId);
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
                size,
                striped,
                disabled: data[index]._disabled,
                selected: !!isSelected,
                selectedIntent: selectedRowIntent,
                flat,
                even: index % 2 === 0 ? true : false,
                intent: intent || data[index]._intent,
                hovered: isHovered,
                interactive: !!onCellClick || !!onRowClick,
                interactiveCell: !!onCellClick,
                onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                  if (onCellClick) {
                    e.stopPropagation();
                    onCellClick?.(data[index]);
                  } else if (onRowClick) {
                    e.stopPropagation();
                    onRowClick?.(data[index]);
                  } else if (selectable && data[index]._selectId) {
                    // Otherwise select the row if selectable
                    onSelectClick(data[index]._selectId);
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

  return (
    <StyledTableRow
      style={style}
      className='reqore-table-row'
      interactive={!!onRowClick}
      onMouseEnter={() => {
        // Set hovered is this row is interactive
        if (onRowClick || (selectable && data[index]._selectId && !data[index]._disabled)) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {selectable && (
        <StyledTableCell
          align='center'
          width={60}
          className='reqore-table-cell'
          {...{
            size,
            striped,
            disabled: data[index]._disabled,
            selected: !!isSelected,
            selectedIntent: selectedRowIntent,
            flat,
            even: index % 2 === 0 ? true : false,
            intent: data[index]._intent,
            hovered: isHovered,
            interactiveCell: data[index]._selectId,
          }}
          onClick={
            data[index]._selectId
              ? (e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
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
            size={`${TEXT_FROM_SIZE[size]}px`}
            style={{ opacity: !data[index]._selectId || !isSelected ? 0.4 : 1 }}
          />
        </StyledTableCell>
      )}
      {renderCells(columns, data)}
    </StyledTableRow>
  );
};

export default ReqoreTableRow;
