/* @flow */
import { isFunction, isString } from 'lodash';
import React, { ReactElement } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableData, IReqoreTableRowClick } from '.';
import { ReqoreButton, ReqoreControlGroup } from '../..';
import { SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { IReqoreTooltip } from '../../types/global';
import { TReqoreHexColor } from '../Effect';
import { ReqoreH4 } from '../Header';
import { ReqoreP } from '../Paragraph';
import ReqoreTag from '../Tag';
import { TimeAgo } from '../TimeAgo';
import { IReqoreCustomTableBodyCell, ReqoreTableBodyCell } from './cell';
import { getOnlyShownColumns } from './helpers';

export interface IReqoreTableRowOptions {
  columns: IReqoreTableColumn[];
  data: IReqoreTableData;
  selectable?: boolean;
  onSelectClick: (selectId: string | number) => void;
  selected: (string | number)[];
  onRowClick?: IReqoreTableRowClick;
  striped?: boolean;
  selectedRowIntent?: TReqoreIntent;
  size?: TSizes;
  flat?: boolean;
  cellComponent?: IReqoreCustomTableBodyCell;
  rowComponent?: IReqoreCustomTableRow;
  setHoveredRow?: (index: number) => void;
  hoveredRow?: number;
}
export interface IReqoreCustomTableRowProps extends IReqoreTableRowOptions {
  style?: React.CSSProperties;
  children?: ReactElement;
}
export interface IReqoreCustomTableRow extends React.FC<IReqoreCustomTableRowProps> {}
export interface IReqoreTableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  data: IReqoreTableRowOptions;
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
  theme?: IReqoreTheme;
  grow: 1 | 2 | 3 | 4;
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
  padded?: IReqoreTableColumn['cell']['padded'];
}

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
    selectedRowIntent,
    flat,
    cellComponent,
    rowComponent,
    setHoveredRow,
    hoveredRow,
  },
  style,
  index,
}: IReqoreTableRowProps) => {
  const isSelected =
    data[index]._selectId &&
    selected.find((selectId) => selectId.toString() === data[index]._selectId.toString());

  const CellComponent = cellComponent || ReqoreTableBodyCell;
  const RowComponent = rowComponent || StyledTableRow;

  const renderContent = (
    cell: IReqoreTableColumn['cell'],
    data: any,
    dataId: string,
    align?: 'center' | 'left' | 'right'
  ): ReactElement<any, any> => {
    if (cell?.actions) {
      return (
        <ReqoreControlGroup size={size} stack fill fluid style={{ height: '100%' }} rounded={false}>
          {cell.actions(data).map((action, index) => (
            <ReqoreButton
              key={index}
              rounded={false}
              iconsAlign={align === 'center' ? 'center' : 'sides'}
              textAlign={align}
              {...action}
              onClick={(e) => {
                e.stopPropagation();

                action.onClick?.(e);
              }}
            />
          ))}
        </ReqoreControlGroup>
      );
    }

    let content = cell?.content;

    if (isFunction(content)) {
      // Check what type does the content function return
      if (React.isValidElement(content(data))) {
        const Content = content;
        // If it's a react element, return it
        return <Content {...data} _size={size} _dataId={dataId} />;
      }

      // If it's a function, call it and return the result
      content = content(data) as any;
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
    getOnlyShownColumns(columns).map(
      ({ width, minWidth, maxWidth, resizedWidth, grow, dataId, cell, header, align, intent }) => {
        if (header?.columns) {
          return renderCells(header.columns, data);
        }

        // Build the tooltip
        const tooltip: IReqoreTooltip = cell?.tooltip
          ? typeof cell?.tooltip(data[index][dataId]) !== 'object'
            ? {
                content: cell.tooltip(data[index][dataId]) as string,
              }
            : (cell.tooltip(data[index][dataId]) as IReqoreTooltip)
          : {};

        return (
          <CellComponent
            key={dataId}
            {...({
              width: resizedWidth || width,
              minWidth,
              maxWidth,
              grow,
              align,
              size,
              striped,
              tooltip,
              padded: cell?.padded,
              disabled: data[index]._disabled,
              selected: !!isSelected,
              selectedIntent: selectedRowIntent,
              flat,
              even: index % 2 === 0 ? true : false,
              intent: cell?.intent || data[index]._intent || intent,
              hovered: hoveredRow === index,
              interactive: !!cell?.onClick || !!onRowClick,
              interactiveCell: !!cell?.onClick,
              onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                if (cell?.onClick) {
                  e.stopPropagation();
                  cell.onClick(data[index]);
                } else if (onRowClick) {
                  e.stopPropagation();
                  onRowClick(data[index]);
                } else if (selectable && data[index]._selectId) {
                  // Otherwise select the row if selectable
                  onSelectClick(data[index]._selectId!);
                }
              },
              className: 'reqore-table-cell',
            } as IReqoreTableCellStyle)}
          >
            {renderContent(cell, data[index], dataId, align)}
          </CellComponent>
        );
      }
    );

  return (
    <RowComponent
      style={style}
      className='reqore-table-row'
      interactive={!!onRowClick && !data[index]._disabled}
      onMouseEnter={() => {
        // Set hovered is this row is interactive
        if (onRowClick || (selectable && data[index]._selectId && !data[index]._disabled)) {
          setHoveredRow(index);
        }
      }}
      onMouseLeave={() => {
        setHoveredRow(undefined);
      }}
    >
      {renderCells(columns, data)}
    </RowComponent>
  );
};

export default ReqoreTableRow;
