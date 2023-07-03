/* @flow */
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { useMemo } from 'react';
import styled from 'styled-components';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ReqoreButton, ReqoreControlGroup, ReqoreDropdown } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { TColumnsUpdater } from './header';

export interface IReqoreTableHeaderCellProps
  extends Omit<IReqoreTableColumn, 'cell'>,
    IReqoreButtonProps {
  onSortChange?: (sort: string) => void;
  sortData: IReqoreTableSort;
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
    width: 1px;
    height: 70%;
    border-left: 1px dashed ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }
`;

export const ReqoreTableHeaderCell = ({
  width,
  resizedWidth,
  grow,
  align,
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
  filter,
  onFilterChange,
  ...rest
}: IReqoreTableHeaderCellProps) => {
  const items = useMemo(() => {
    const _items: IReqoreDropdownItem[] = [];

    if (resizable || hideable) {
      _items.push({
        divider: true,
        label: 'Options',
      });

      if (resizable) {
        _items.push({
          label: 'Reset size',
          icon: 'HistoryLine',
          disabled: !resizedWidth || width === resizedWidth,
          onClick: () => {
            onColumnsUpdate?.(dataId, 'resizedWidth', width);
          },
        });
      }

      if (hideable) {
        _items.push({
          label: 'Hide column',
          icon: 'EyeCloseLine',
          onClick: () => {
            onColumnsUpdate?.(dataId, 'show', false);
          },
        });
      }
    }

    return _items;
  }, [resizable, hideable, width, resizedWidth, onColumnsUpdate, dataId]);

  return (
    <Resizable
      minWidth={!width || width < 120 ? 120 : width}
      onResize={(_event, _direction, _component) => {
        onColumnsUpdate(dataId, 'resizedWidth', parseInt(_component.style.width));
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
        <ReqoreButton
          {...rest}
          readOnly={!sortable && !onClick}
          className={`${className || ''} reqore-table-header-cell`}
          rounded={false}
          textAlign={align}
          rightIcon={
            sortable && sortData.by === dataId
              ? (`Arrow${sortData.direction === 'desc' ? 'Down' : 'Up'}Fill` as
                  | 'ArrowDownFill'
                  | 'ArrowUpFill')
              : undefined
          }
          onClick={(e) => {
            if (sortable) {
              onSortChange(dataId);
            }

            onClick?.(e);
          }}
        />
        {filterable || hideable || resizable ? (
          <ReqoreDropdown<IReqoreButtonProps>
            icon='MoreLine'
            className="reqore-table-header-cell-options"
            fixed
            rounded={false}
            intent={filter ? 'info' : undefined}
            filterable={filterable}
            filterPlaceholder={filterPlaceholder || 'Filter by this column...'}
            filter={filter}
            onFilterChange={(value) => {
              onFilterChange(dataId, value);
            }}
            items={items}
          />
        ) : null}
      </ReqoreControlGroup>
    </Resizable>
  );
};
