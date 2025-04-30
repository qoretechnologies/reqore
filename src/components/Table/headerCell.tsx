import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreControlGroup, ReqoreDropdown } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { IReqoreButtonProps } from '../Button';
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
    border-left: 1px dashed ${({ theme }) => rgba(getReadableColor(theme), 0.5)};
  }
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

    return (
      <Resizable
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
              style={{}}
              showCaret={false}
              textAlign={align}
              readOnlyOnEmpty
              rightIcon={
                sortable && sortData.by === dataId
                  ? (`Arrow${sortData.direction === 'desc' ? 'Down' : 'Up'}Fill` as
                      | 'ArrowDownFill'
                      | 'ArrowUpFill')
                  : filter
                  ? 'FilterLine'
                  : rest.rightIcon
              }
              rightIconProps={{
                size: 'tiny',
                intent: filter ? 'info' : undefined,
              }}
              inputProps={{ intent: filter ? 'info' : undefined }}
              onClick={onClick}
              {...rest}
            />
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
              intent={filter ? 'info' : rest.intent}
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
      </Resizable>
    );
  }
);
