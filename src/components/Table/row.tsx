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
import { useEffect, useRef } from 'react';
import { IReqoreCustomTableBodyCell, ReqoreTableBodyCell } from './cell';
import {
  calculatePinOffsets,
  getColumnRenderedWidth,
  getReorderedLeaves,
  getRowExpandId,
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
  /** See `IReqoreTableProps.renderExpandedRow`. */
  renderExpandedRow?: (row: IReqoreTableRowData) => React.ReactNode;
  /** Expansion ids currently open. */
  expanded?: (string | number)[];
  /** Reports an open panel's measured height so a virtualised list can size it. */
  onExpandedHeight?: (index: number, height: number) => void;
  /** Toggles a row open or closed. */
  onExpandClick?: (expandId: string | number) => void;
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

/**
 * Wraps a row and its detail panel into ONE virtualised item.
 *
 * react-window positions items absolutely and gives each one a height, so an
 * expanded row cannot be a sibling of its panel — the two have to occupy the
 * same item box or the panel would be laid over the row beneath it.
 */
const StyledTableRowGroup = styled.div`
  display: flex;
  flex-flow: column;
  overflow: hidden;
`;

/**
 * The open panel. Owns no styling of its own beyond containing the content.
 *
 * `flex: 0 0 auto` is load-bearing. The group is a fixed-height flex column —
 * react-window decides that height from the panel's own measurement — so a
 * panel left to flex SHRINKS to whatever room the current item size leaves it,
 * and then reports that shrunken height as its own. The measurement feeds the
 * box that constrains the measurement: content ends up clipped at the bottom by
 * however far the header's real height differs from the assumed row height, and
 * every observation shaves a little more off. Refusing to shrink makes the
 * panel's height its CONTENT's height, always, which is the only number worth
 * reporting.
 */
const StyledExpandedRow = styled.div`
  flex: 0 0 auto;
  min-width: 0;
  overflow: hidden;
`;

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
      renderExpandedRow,
      expanded,
      onExpandedHeight,
      onExpandClick,
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

    /* What this row can do about expansion.
       `renderExpandedRow` returning nothing means "this row has nothing more to
       show" — it gets no panel, no expander, and its click falls through to
       whatever the table would otherwise have done with it. */
    /* A disabled row does not expand — see the expander column in `index.tsx`.
       Enforced here as well as there so the two cannot drift: the column decides
       whether to draw the control, this decides whether the row responds and
       whether a panel renders at all, including one a controlled `expanded`
       still names. */
    const expandedContent = data[index]?._disabled ? undefined : renderExpandedRow?.(data[index]);
    const canExpand = !!expandedContent;
    const expandId = getRowExpandId(data[index], index);
    const isExpanded = canExpand && !!expanded?.some((id) => id.toString() === expandId);

    /* Measure the open panel and report it upward. A virtualised list has to be
       told how tall each item is, and a panel's height is not knowable in
       advance: it depends on content that can itself change while open. The
       observer is what turns "I do not know" into "it is 312px now". */
    const panelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const element = panelRef.current;
      if (!element || !isExpanded || !onExpandedHeight) return undefined;

      /* A non-positive measurement is not an answer — it is the panel not laid
         out yet (or a test DOM that does not lay out at all). Reporting it would
         replace the estimate with zero and collapse the row to its header. */
      const report = () => {
        const panelHeight = element.getBoundingClientRect().height;
        if (panelHeight > 0) onExpandedHeight(index, panelHeight);
      };
      report();

      if (typeof ResizeObserver === 'undefined') return undefined;
      const observer = new ResizeObserver(report);
      observer.observe(element);
      return () => observer.disconnect();
    }, [isExpanded, onExpandedHeight, index, expandedContent]);

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
                    } else if (canExpand) {
                      /* The whole row is the expander. A caret alone is a small
                         target for the commonest thing to want from a row that
                         has more to say, and the row already reads as one
                         object. A row with nothing to expand falls through to
                         whatever the table would otherwise do with the click. */
                      e.stopPropagation();
                      onExpandClick?.(expandId);
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
        canExpand,
        expandId,
        onExpandClick,
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

    const row = (
      <RowComponent
        {...consumerAttrs}
        style={renderExpandedRow ? undefined : mergedStyle}
        className={mergedClassName}
        interactive={(!!onRowClick || canExpand) && !data[index]._disabled}
        size={size}
        wrap={rowWrap}
        minWidth={totalColumnsWidth}
      >
        {renderCells()}
      </RowComponent>
    );

    /* Not expandable at all — the row IS the item, exactly as before. Keeping
       this path byte-for-byte is what makes the feature free for every table
       that does not use it. */
    if (!renderExpandedRow) {
      return row;
    }

    /* react-window positions items absolutely and gives each one a height, so
       an expanded row cannot be a SIBLING of its panel — the two have to share
       one item box or the panel would be drawn over the row beneath it. */
    return (
      <StyledTableRowGroup style={mergedStyle} className='reqore-table-row-group'>
        {row}
        {isExpanded ? (
          <StyledExpandedRow
            ref={panelRef}
            className='reqore-table-row-expanded'
            style={{ minWidth: totalColumnsWidth }}
          >
            {expandedContent}
          </StyledExpandedRow>
        ) : null}
      </StyledTableRowGroup>
    );
  }
);

export default ReqoreTableRow;
