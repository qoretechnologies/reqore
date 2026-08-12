/* @flow */
import { get, isFunction, isString } from 'lodash';
import React, { ReactElement, memo, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  IReqoreTableColumn,
  IReqoreTableData,
  IReqoreTableRowClick,
  IReqoreTableRowData,
} from '.';
import { ReqoreButton, ReqoreControlGroup, ReqoreIcon } from '../..';
import { SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { omitStyleProps } from '../../helpers/styled';
import { IReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreHexColor } from '../Effect';
import { ReqoreH4 } from '../Header';
import { ReqoreP } from '../Paragraph';
import ReqoreTag from '../Tag';
import { TimeAgo } from '../TimeAgo';
import { IReqoreButtonProps } from '../Button';
import { IReqoreCustomTableBodyCell, ReqoreTableBodyCell } from './cell';
import {
  calculatePinOffsets,
  getColumnRenderedWidth,
  getReorderedLeaves,
  getTotalColumnsWidth,
  IColumnPinInfo,
} from './helpers';

/**
 * Per-row escape hatch handed to the RowComponent as extra HTML attributes.
 * Consumers use this to stamp a row-level `className`, `style`, or
 * `data-*` attribute keyed on the row's data — e.g. to mark a
 * soft-deleted row so a downstream stylesheet can strike-through all of
 * its cells without reaching for `:has()` on `.reqore-table-*` classes.
 *
 * The returned object is spread onto the row div AFTER Reqore's own
 * `style` / `className` / `interactive` etc., so callers can add data
 * attributes freely but should merge (not replace) the built-in
 * className / style when they want to preserve Reqore's baseline
 * (e.g. `className: \`${reqoreClass} qorus-tombstone\``).
 */
export type IReqoreTableRowPropsMapper = (
  row: IReqoreTableRowData,
  index: number
) => Partial<React.HTMLAttributes<HTMLDivElement>> | undefined;

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
  wrap?: boolean;
  maxCellHeight?: number;
  expandHeightButtonProps?: Partial<IReqoreButtonProps>;
  cellComponent?: IReqoreCustomTableBodyCell;
  rowComponent?: IReqoreCustomTableRow;
  setHoveredRow?: (index: number) => void;
  tableWidth: number;
  getRowProps?: IReqoreTableRowPropsMapper;
}
export interface IReqoreCustomTableRowProps extends IReqoreTableRowOptions {
  style?: React.CSSProperties;
  children?: ReactElement;
}
export interface IReqoreCustomTableRow extends React.FC<IReqoreCustomTableRowProps> {}
export interface IReqoreTableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  data: IReqoreTableRowOptions;
  index: number;
  isHovered?: boolean;
  style?: React.CSSProperties;
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
  size?: TSizes;
  wrap?: boolean;
  minWidth?: number;
}

export const StyledTableRow = styled.div.withConfig({
  // `wrap` drives the row's flex-wrap rule; it is not a DOM attribute.
  shouldForwardProp: omitStyleProps('wrap'),
})<IReqoreTableRowStyle>`
  ${({ size, wrap, minWidth }) => css`
    display: flex;
    ${wrap
      ? css`
          min-height: ${SIZE_TO_PX[size]}px;
        `
      : css`
          height: ${SIZE_TO_PX[size]}px;
        `}
    ${minWidth
      ? css`
          min-width: ${minWidth}px;
        `
      : ''}
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
  wrap?: boolean;
  pin?: 'left' | 'right';
  pinOffset?: number;
  pinEdge?: boolean;
  maxHeight?: number;
}

const ReqoreTableRow = memo(
  ({
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
      wrap,
      maxCellHeight,
      expandHeightButtonProps,
      cellComponent,
      rowComponent,
      tableWidth,
      getRowProps,
    },

    style,
    index,
  }: IReqoreTableRowProps) => {
    const isSelected =
      data[index]._selectId &&
      selected.find((selectId) => selectId.toString() === data[index]._selectId.toString());

    const CellComponent = cellComponent || ReqoreTableBodyCell;
    const RowComponent = rowComponent || StyledTableRow;

    const pinOffsets = useMemo(() => calculatePinOffsets(columns), [columns]);
    const totalColumnsWidth = useMemo(() => getTotalColumnsWidth(columns), [columns]);
    const rowWrap = useMemo(() => {
      if (wrap) {
        return true;
      }
      return columns.some(function check(column): boolean {
        if (column.header?.columns) {
          return column.header.columns.some(check);
        }
        return column.cell?.wrap === true;
      });
    }, [columns, wrap]);

    const renderContent = useCallback(
      (
        cell: IReqoreTableColumn['cell'],
        data: any,
        dataId: string,
        align?: 'center' | 'left' | 'right'
      ): ReactElement<any, any> => {
        if (cell?.actions) {
          return (
            <ReqoreControlGroup
              size={size}
              stack
              fill
              fluid
              style={{ height: '100%' }}
              rounded={false}
            >
              {cell.actions(data).map((action, index) => (
                <ReqoreButton
                  key={index}
                  rounded={false}
                  iconsAlign={align === 'center' ? 'center' : 'sides'}
                  textAlign={align}
                  flat
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
            return <Content {...data} _size={size} _dataId={dataId} isSelected={isSelected} />;
          }

          // If it's a function, call it and return the result
          content = content(data) as any;
        }

        const datum = get(data, dataId);

        if (isString(content)) {
          // Separate the content string by colon
          const [type, intentOrColorOrIconName] = content.split(':');
          // Check if the intent starts with hash for tags
          const intent: TReqoreIntent = intentOrColorOrIconName?.startsWith('#')
            ? undefined
            : (intentOrColorOrIconName as TReqoreIntent);
          const color: TReqoreHexColor =
            intentOrColorOrIconName?.startsWith('#') && type === 'tag'
              ? (intentOrColorOrIconName as TReqoreHexColor)
              : undefined;
          // Render content based on the type
          switch (type) {
            case 'time-ago':
              return (
                <ReqoreP className='reqore-table-text' intent={intent as TReqoreIntent} size={size}>
                  <TimeAgo time={datum} />
                </ReqoreP>
              );
            case 'tag':
              return (
                <ReqoreTag
                  label={datum}
                  size={size}
                  intent={intent as TReqoreIntent}
                  color={color}
                />
              );
            case 'title':
              return <ReqoreH4 intent={intent as TReqoreIntent}>{datum}</ReqoreH4>;
            case 'text':
              return (
                <ReqoreP className='reqore-table-text' intent={intent as TReqoreIntent} size={size}>
                  {datum}
                </ReqoreP>
              );
            case 'number':
              return (
                <ReqoreP
                  className='reqore-table-text'
                  intent={intent as TReqoreIntent}
                  size={size}
                  effect={{ italic: true }}
                >
                  {datum}
                </ReqoreP>
              );
            case 'boolean':
              return datum ? (
                <ReqoreIcon icon='CheckLine' size={size} intent='success' />
              ) : (
                <ReqoreIcon icon='CloseLine' size={size} intent='danger' />
              );
            case 'icon':
              return <ReqoreIcon size={size} icon={intentOrColorOrIconName as IReqoreIconName} />;
            default:
              return (
                <ReqoreP className='reqore-table-text' size={size}>
                  {content}
                </ReqoreP>
              );
          }
        }

        return <ReqoreP className='reqore-table-text'>{datum}</ReqoreP>;
      },
      []
    );

    const reorderedLeaves = useMemo(
      () => getReorderedLeaves(columns, tableWidth),
      [columns, tableWidth]
    );

    const renderCells = useCallback(
      () =>
        reorderedLeaves.map(
          (column) => {
            const { minWidth, maxWidth, grow, dataId, cell, align, intent } = column;
            const datum = get(data[index], dataId);

            // Build the tooltip
            const tooltip: IReqoreTooltip = cell?.tooltip
              ? typeof cell?.tooltip(datum) !== 'object'
                ? {
                    content: cell.tooltip(datum) as string,
                  }
                : (cell.tooltip(datum) as IReqoreTooltip)
              : {};

            const pinInfo: IColumnPinInfo | undefined = pinOffsets[dataId];
            const cellWrap = cell?.wrap ?? wrap;
            const cellMaxHeight =
              cell?.maxHeight ?? data[index]._maxHeight ?? maxCellHeight;

            return (
              <CellComponent
                key={dataId}
                {...({
                  width: getColumnRenderedWidth(column),
                  minWidth,
                  maxWidth,
                  grow,
                  align,
                  size,
                  striped,
                  tooltip,
                  padded: cell?.padded ?? (cell?.actions ? 'none' : undefined),
                  disabled: data[index]._disabled,
                  selected: !!isSelected,
                  selectedIntent: selectedRowIntent,
                  flat,
                  wrap: cellWrap,
                  maxHeight: cellMaxHeight,
                  expandHeightButtonProps,
                  pin: pinInfo?.pin,
                  pinOffset: pinInfo?.offset,
                  pinEdge: pinInfo?.isEdge,
                  even: index % 2 === 0 ? true : false,
                  intent: cell?.intent || data[index]._intent || intent,
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
                  'data-reqore-table-column-id': dataId,
                } as IReqoreTableCellStyle)}
              >
                {renderContent(cell, data[index], dataId, align)}
              </CellComponent>
            );
          }
        ),
      [
        reorderedLeaves,
        data,
        index,
        isSelected,
        onRowClick,
        selectable,
        pinOffsets,
        wrap,
        maxCellHeight,
        expandHeightButtonProps,
        size,
        striped,
        selectedRowIntent,
        flat,
        CellComponent,
        onSelectClick,
        renderContent,
      ]
    );

    // Consumer-supplied per-row attributes. Merge className / style so
    // Reqore's baseline "reqore-table-row" class + the react-window
    // absolute-position style survive; anything else the consumer returns
    // is spread as-is (data-*, aria-*, event handlers, etc.).
    const consumerRowProps = getRowProps?.(data[index], index);
    const mergedClassName = consumerRowProps?.className
      ? `reqore-table-row ${consumerRowProps.className}`
      : 'reqore-table-row';
    const mergedStyle = consumerRowProps?.style ? { ...style, ...consumerRowProps.style } : style;
    const { className: _c, style: _s, ...consumerAttrs } = consumerRowProps ?? {};

    return (
      <RowComponent
        {...consumerAttrs}
        style={mergedStyle}
        className={mergedClassName}
        interactive={!!onRowClick && !data[index]._disabled}
        size={size}
        wrap={rowWrap}
        minWidth={totalColumnsWidth}
      >
        {renderCells()}
      </RowComponent>
    );
  }
);

export default ReqoreTableRow;
