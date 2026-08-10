import count from 'lodash/size';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreIcon } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect } from '../Effect';
import { getColumnRenderedWidth } from './helpers';
import { TColumnsUpdater } from './header';

export interface IReqoreTableHeaderCellProps
  extends Omit<IReqoreTableColumn, 'cell'>,
    Pick<IReqoreTableColumn['header'], 'content' | 'actions'>,
    Omit<IReqoreButtonProps, 'maxWidth' | 'content'> {
  onSortChange?: (sort: string) => void;
  sortData?: IReqoreTableSort;
  onColumnsUpdate?: TColumnsUpdater;
  onFilterChange?: (dataId: string, filter: string) => void;
  pinOffset?: number;
  pinEdge?: boolean;
  hasColumns?: boolean;
  /**
   * Set by the parent `ReqoreTable` when its own `minimal` prop is enabled, so
   * the resizer between columns can render as a hover-only, half-opacity line
   * rather than the standard always-visible dashed border. Not part of the
   * public column config — the table threads it through internally.
   */
  parentMinimal?: boolean;
  /** See `IReqoreTableProps.sortAscendingLabel`. */
  sortAscendingLabel?: string;
  /** See `IReqoreTableProps.sortDescendingLabel`. */
  sortDescendingLabel?: string;
  /** See `IReqoreTableProps.pinLeftLabel`. */
  pinLeftLabel?: string;
  /** See `IReqoreTableProps.pinRightLabel`. */
  pinRightLabel?: string;
  /** See `IReqoreTableProps.hideColumnLabel`. */
  hideColumnLabel?: string;
  /** See `IReqoreTableProps.resetSizeLabel`. */
  resetSizeLabel?: string;
  /** See `IReqoreTableProps.otherActionsLabel`. */
  otherActionsLabel?: string;
  /** See `IReqoreTableProps.columnFilterPlaceholder`. */
  columnFilterPlaceholder?: string;
}

export interface IReqoreTableHeaderStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  interactive?: boolean;
}

export const StyledTableHeaderResize = styled.div<{ $minimal?: boolean }>`
  height: 100%;
  /* Hover reveal is driven by the parent StyledHeaderResizable (its hover state
     toggles opacity to 0.5). The handle is only 1px wide, so an inline hover
     selector here would rarely fire. */
  transition: opacity 0.15s ease-out;
  opacity: ${({ $minimal }) => ($minimal ? 0 : 1)};

  &:before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 0.5px;
    height: 100%;
    border-left: 1px dashed
      ${({ theme, $minimal }) => rgba(getReadableColor(theme), $minimal ? 0.5 : 0.4)};
  }
`;

export const StyledSortIcon = styled(ReqoreIcon)`
  position: absolute;
`;

const StyledHeaderResizable = styled(Resizable)<{
  $pin?: 'left' | 'right';
  $pinEdge?: boolean;
  $minimal?: boolean;
}>`
  box-sizing: border-box;
  flex-shrink: 0;

  * {
    box-sizing: border-box;
  }

  ${({ $minimal }) =>
    $minimal &&
    css`
      &:hover .reqore-table-header-resize {
        opacity: 0.5;
      }
    `}

  ${({ $pin, $pinEdge }) =>
    $pin &&
    $pinEdge &&
    css`
      /* Bounded-height pseudo-shadow (matches body pinned cells). Override the inline
         overflow:hidden so the 12px projection isn't clipped on this cell. */
      overflow: visible !important;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        width: 12px;
        pointer-events: none;
        ${$pin === 'left' ? 'right: -12px;' : 'left: -12px;'}
        background: linear-gradient(
          to ${$pin === 'left' ? 'right' : 'left'},
          rgba(0, 0, 0, 0.35),
          rgba(0, 0, 0, 0)
        );
        z-index: 1;
      }
    `}
`;

export const ReqoreTableHeaderCell = memo(
  ({
    width,
    maxWidth,
    minWidth,
    resizedWidth,
    grow,
    align,
    pin,
    pinOffset,
    pinEdge,
    onSortChange,
    dataId,
    sortable,
    sortData,
    className,
    onClick,
    onColumnsUpdate,
    resizable = true,
    filterPlaceholder,
    filterable,
    hideable = true,
    pinnable = true,
    filter,
    content,
    size,
    onFilterChange,
    actions,
    parentMinimal,
    hasColumns,
    sortAscendingLabel = 'Sort ascending',
    sortDescendingLabel = 'Sort descending',
    pinLeftLabel = 'Pin left',
    pinRightLabel = 'Pin Right',
    hideColumnLabel = 'Hide column',
    resetSizeLabel = 'Reset size',
    otherActionsLabel = 'Other',
    columnFilterPlaceholder = 'Filter by this column...',
    ...rest
  }: IReqoreTableHeaderCellProps) => {
    const items = useMemo(() => {
      let _items: IReqoreDropdownItem[] = [];

      if (resizable || hideable || pinnable || sortable) {
        if (sortable) {
          _items.push({
            label: sortData?.direction === 'desc' ? sortAscendingLabel : sortDescendingLabel,
            icon: sortData.direction === 'desc' ? 'ArrowDownFill' : 'ArrowUpFill',
            flat: sortData?.by === dataId ? false : undefined,
            transparent: sortData?.by === dataId ? false : undefined,
            minimal: true,
            intent: sortData?.by === dataId ? 'info' : undefined,
            onClick: () => {
              onSortChange?.(dataId);
            },
          });
        }
        if (pinnable) {
          if (sortable) {
            _items.push({ divider: true, size: 'small', line: true });
          }

          _items.push({
            label: pinLeftLabel,
            icon: 'SkipBackLine',
            flat: pin === 'left' ? false : undefined,
            transparent: pin === 'left' ? false : undefined,
            minimal: true,
            intent: pin === 'left' ? 'info' : undefined,
            onClick: () => {
              onColumnsUpdate?.(dataId, 'pin', pin !== 'left' ? 'left' : undefined);
            },
          });

          _items.push({
            label: pinRightLabel,
            icon: 'SkipForwardLine',
            minimal: true,
            flat: pin === 'right' ? false : undefined,
            transparent: pin === 'right' ? false : undefined,
            intent: pin === 'right' ? 'info' : undefined,
            onClick: () => {
              onColumnsUpdate?.(dataId, 'pin', pin !== 'right' ? 'right' : undefined);
            },
          });
        }

        if (hideable) {
          if (sortable || pinnable) {
            _items.push({ divider: true, size: 'small', line: true });
          }

          _items.push({
            label: hideColumnLabel,
            transparent: false,
            minimal: true,
            icon: 'EyeCloseLine',
            className: 'reqore-table-header-hide',
            onClick: () => {
              onColumnsUpdate?.(dataId, 'show', false);
            },
          });
        }

        if (resizable) {
          _items.push({
            transparent: false,
            minimal: true,
            label: resetSizeLabel,
            icon: 'HistoryLine',
            disabled: !resizedWidth || width === resizedWidth,
            onClick: () => {
              onColumnsUpdate?.(dataId, 'resizedWidth', width);
            },
          });
        }
      }

      if (actions) {
        _items = [..._items, { divider: true, label: otherActionsLabel }, ...actions];
      }

      return _items;
    }, [
      resizable,
      hideable,
      width,
      resizedWidth,
      onColumnsUpdate,
      dataId,
      sortData,
      actions,
      pinnable,
      sortable,
      pin,
      sortAscendingLabel,
      sortDescendingLabel,
      pinLeftLabel,
      pinRightLabel,
      hideColumnLabel,
      resetSizeLabel,
      otherActionsLabel,
    ]);

    const pinStyle: React.CSSProperties = pin
      ? {
          position: 'sticky',
          [pin === 'left' ? 'left' : 'right']: pinOffset || 0,
          zIndex: 2,
        }
      : {};
    const hasExplicitSizing =
      width !== undefined ||
      resizedWidth !== undefined ||
      minWidth !== undefined ||
      maxWidth !== undefined;
    const renderedWidth = hasExplicitSizing
      ? getColumnRenderedWidth({
          width,
          maxWidth,
          minWidth,
          resizedWidth,
        } as IReqoreTableColumn)
      : undefined;

    // Header text gets a consistent "label-y" typography by default. The
    // `opacity: 0.7` is only added under `minimal` so the unbordered, washed
    // surface stays cohesive — full-opacity headers on a tinted strip already
    // read clearly. Per-column `header.effect` (carried in `rest.effect`)
    // still wins via the spread below.
    const baseHeaderEffect = useMemo<IReqoreEffect>(
      () => ({
        uppercase: true,
        weight: 'thick',
        textSize: getOneLessSize(size),
        spaced: 1,
        ...(parentMinimal ? { opacity: 0.7 } : {}),
      }),
      [size, parentMinimal]
    );

    return (
      <StyledHeaderResizable
        {...({ $pin: pin, $pinEdge: pinEdge, $minimal: parentMinimal } as any)}
        data-reqore-table-column-id={hasColumns ? undefined : dataId}
        minWidth={minWidth ?? renderedWidth}
        maxWidth={maxWidth}
        onResize={(_event, _direction, _component) => {
          onColumnsUpdate?.(dataId, 'resizedWidth', parseInt(_component.style.width));
        }}
        handleComponent={{
          right: (
            <StyledTableHeaderResize
              className='reqore-table-header-resize'
              $minimal={parentMinimal}
            />
          ),
        }}
        style={{
          overflow: 'hidden',
          flexGrow: grow,
          ...pinStyle,
        }}
        size={{
          width: renderedWidth,
          height: undefined,
        }}
        enable={{
          right: resizable,
        }}
      >
        <ReqoreControlGroup fluid stack rounded={false} fill style={{ height: '100%' }}>
          {content ? (
            content
          ) : (
            <>
              {count(items) ? (
                <ReqoreDropdown<IReqoreButtonProps>
                  className={`${
                    className || ''
                  } reqore-table-header-cell-options reqore-table-header-cell`}
                  compact
                  size={size}
                  rounded={false}
                  filterable={filterable}
                  filterPlaceholder={filterPlaceholder || columnFilterPlaceholder}
                  filter={filter}
                  onFilterChange={(value) => {
                    onFilterChange?.(dataId, value);
                  }}
                  items={items}
                  showCaret={false}
                  textAlign={align}
                  readOnlyOnEmpty
                  onBeforeOpen={(_popoverData, event) => {
                    if (event.metaKey) {
                      return false;
                    }

                    return true;
                  }}
                  inputProps={{ intent: filter ? 'info' : undefined }}
                  onClick={(e) => {
                    if (sortable && e.metaKey) {
                      onSortChange?.(dataId);
                    }

                    onClick?.(e);
                  }}
                  labelEffect={baseHeaderEffect}
                  {...rest}
                  effect={{
                    glow: filter
                      ? {
                          color: 'info',
                          opacity: 1,
                          inset: true,
                          size: 1,
                        }
                      : undefined,
                    gradient:
                      sortable && sortData.by === dataId
                        ? {
                            direction: `to ${sortData.direction === 'desc' ? 'top' : 'bottom'}`,
                            colors: {
                              0: 'main:lighten:2',
                              30: 'main:lighten:2',
                              150: 'info:darken:3',
                            },
                          }
                        : undefined,
                    ...rest.effect,
                  }}
                />
              ) : (
                <ReqoreButton
                  className={`${
                    className || ''
                  } reqore-table-header-cell-options reqore-table-header-cell`}
                  compact
                  size={size}
                  rounded={false}
                  textAlign={align}
                  onClick={(e) => {
                    if (sortable && e.metaKey) {
                      onSortChange?.(dataId);
                    }

                    onClick?.(e);
                  }}
                  {...rest}
                  effect={{ ...baseHeaderEffect, ...rest.effect }}
                />
              )}
            </>
          )}
          {content && (filterable || hideable || resizable) ? (
            <ReqoreDropdown<IReqoreButtonProps>
              icon='More2Line'
              className='reqore-table-header-cell-options'
              fixed
              compact
              buttonStyle={{
                paddingLeft: 0,
                paddingRight: 0,
                minWidth: '10px',
                borderLeft: 'none',
              }}
              size={size}
              rounded={false}
              intent={filter || sortData.by === dataId ? 'info' : rest.intent}
              filterable={filterable}
              filterPlaceholder={filterPlaceholder || columnFilterPlaceholder}
              filter={filter}
              inputProps={{ intent: filter ? 'info' : undefined }}
              onFilterChange={(value) => {
                onFilterChange?.(dataId, value);
              }}
              items={items}
            />
          ) : null}
        </ReqoreControlGroup>
      </StyledHeaderResizable>
    );
  }
);
