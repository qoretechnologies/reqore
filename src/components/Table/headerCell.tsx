import count from 'lodash/size';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreIcon } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
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
}

export interface IReqoreTableHeaderStyle {
  width?: number;
  grow?: number;
  theme: IReqoreTheme;
  align?: 'center' | 'left' | 'right';
  interactive?: boolean;
}

export const StyledTableHeaderResize = styled.div`
  &:before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    width: 0.5px;
    height: 100%;
    border-left: 1px dashed ${({ theme }) => rgba(getReadableColor(theme), 0.4)};
  }
`;

export const StyledSortIcon = styled(ReqoreIcon)`
  position: absolute;
`;

const StyledHeaderResizable = styled(Resizable)<{
  $pin?: 'left' | 'right';
  $pinEdge?: boolean;
}>`
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
    ...rest
  }: IReqoreTableHeaderCellProps) => {
    const items = useMemo(() => {
      let _items: IReqoreDropdownItem[] = [];

      if (resizable || hideable || pinnable || sortable) {
        if (sortable) {
          _items.push({
            label: `Sort ${sortData?.direction === 'desc' ? 'ascending' : 'descending'}`,
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
            label: 'Pin left',
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
            label: 'Pin Right',
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
            label: 'Hide column',
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
            label: 'Reset size',
            icon: 'HistoryLine',
            disabled: !resizedWidth || width === resizedWidth,
            onClick: () => {
              onColumnsUpdate?.(dataId, 'resizedWidth', width);
            },
          });
        }
      }

      if (actions) {
        _items = [..._items, { divider: true, label: 'Other' }, ...actions];
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
    ]);

    const pinStyle: React.CSSProperties = pin
      ? {
          position: 'sticky',
          [pin === 'left' ? 'left' : 'right']: pinOffset || 0,
          zIndex: 2,
        }
      : {};

    return (
      <StyledHeaderResizable
        {...({ $pin: pin, $pinEdge: pinEdge } as any)}
        minWidth={minWidth || width}
        maxWidth={maxWidth}
        onResize={(_event, _direction, _component) => {
          onColumnsUpdate?.(dataId, 'resizedWidth', parseInt(_component.style.width));
        }}
        handleComponent={{
          right: <StyledTableHeaderResize />,
        }}
        style={{
          overflow: 'hidden',
          flexGrow: grow,
          ...pinStyle,
        }}
        size={{
          width: resizedWidth || width,
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
                  filterPlaceholder={filterPlaceholder || 'Filter by this column...'}
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
              filterPlaceholder={filterPlaceholder || 'Filter by this column...'}
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
