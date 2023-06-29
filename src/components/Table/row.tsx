/* @flow */
import { isFunction, isString } from 'lodash';
import { lighten, rgba } from 'polished';
import React, { ReactElement, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  IReqoreTableColumn,
  IReqoreTableData,
  IReqoreTableRowClick,
  TReqoreTableColumnContent,
} from '.';
import { ReqorePopover } from '../..';
import { SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import { alignToFlexAlign } from '../../helpers/utils';
import { TReqoreColor, TReqoreHexColor } from '../Effect';
import { ReqoreH4 } from '../Header';
import ReqoreIcon from '../Icon';
import { ReqoreP } from '../Paragraph';
import ReqoreTag from '../Tag';
import { TimeAgo } from '../TimeAgo';

export interface IReqoreTableRowOptions {
  columns: IReqoreTableColumn[];
  data?: IReqoreTableData;
  selectable?: boolean;
  onSelectClick?: (selectId: string | number) => void;
  selected?: (string | number)[];
  onRowClick?: IReqoreTableRowClick;
  striped?: boolean;
  selectedRowIntent?: TReqoreIntent;
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
  intent?: TReqoreIntent;
  selected?: boolean;
  selectedIntent?: TReqoreIntent;
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
  intent?: TReqoreIntent;
  interactive?: boolean;
  interactiveCell?: boolean;
  size?: TSizes;
  flat?: boolean;
  disabled?: boolean;
  selected?: boolean;
  hovered?: boolean;
  selectedIntent?: TReqoreIntent;
  even?: boolean;
  striped?: boolean;
}

export const StyledTableCell = styled.div<IReqoreTableCellStyle>`
  ${({ width, grow }) =>
    css`
      width: ${!width || width < 120 ? 120 : width}px;
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
    const getBackgroundColor = (): TReqoreColor => {
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
        opacity += 0.08;
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
      justify-content: ${align ? alignToFlexAlign(align) : 'flex-start'};
      flex-shrink: 0;
      border-bottom: ${!flat ? '1px solid ' : undefined};

      height: 100%;
      padding: 0 10px;
      font-size: ${TEXT_FROM_SIZE[size]}px;
      background-color: ${backgroundColor === 'transparent'
        ? 'transparent'
        : rgba(getBackgroundColor(), 0.8)};
      color: ${getReadableColorFrom(
        backgroundColor === 'transparent' ? theme.main : backgroundColor,
        !hovered
      )};
      border-color: ${changeLightness(
        backgroundColor === 'transparent' ? theme.main : backgroundColor,
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

  const renderContent = (
    content: TReqoreTableColumnContent,
    data: any,
    dataId: string
  ): ReactElement<any, any> => {
    if (isFunction(content)) {
      const Content = content;

      return <Content {...data} />;
    }

    if (isString(content)) {
      // Separate the content string by colon
      let [type, intentOrColor] = content.split(':');
      // Check if the intent starts with hash for tags
      let intent: TReqoreIntent = intentOrColor?.startsWith('#')
        ? undefined
        : (intentOrColor as TReqoreIntent);
      let color: TReqoreHexColor =
        intentOrColor?.startsWith('#') && type === 'tag'
          ? (intentOrColor as TReqoreHexColor)
          : undefined;
      // Render content based on the type
      switch (type) {
        case 'time-ago':
          return <TimeAgo time={data[dataId]} />;
        case 'tag':
          return (
            <ReqoreTag
              label={data[dataId]}
              size={size}
              intent={intent as TReqoreIntent}
              color={color}
            />
          );
        case 'title':
          return <ReqoreH4 intent={intent as TReqoreIntent}>{data[dataId]}</ReqoreH4>;
        case 'text':
          return (
            <ReqoreP className='reqore-table-text' intent={intent as TReqoreIntent}>
              {data[dataId]}
            </ReqoreP>
          );
        default:
          return <ReqoreP className='reqore-table-text'>{data[dataId]}</ReqoreP>;
      }
    }

    return <ReqoreP className='reqore-table-text'>{data[dataId]}</ReqoreP>;
  };

  const renderCells = (columns: IReqoreTableColumn[], data: IReqoreTableData) =>
    columns.map(
      ({
        width,
        resizedWidth,
        grow,
        dataId,
        content,
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
                width: resizedWidth || width,
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
                    onCellClick(data[index]);
                  } else if (onRowClick) {
                    e.stopPropagation();
                    onRowClick(data[index]);
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
            {renderContent(content, data[index], dataId)}
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
            size={size}
            style={{ opacity: !data[index]._selectId || !isSelected ? 0.4 : 1 }}
          />
        </StyledTableCell>
      )}
      {renderCells(columns, data)}
    </StyledTableRow>
  );
};

export default ReqoreTableRow;
