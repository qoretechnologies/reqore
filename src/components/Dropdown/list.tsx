import { size } from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { TReqorePaginationType } from '../../constants/paging';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { IReqoreComponent } from '../../types/global';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMenu from '../Menu';
import ReqoreMenuDivider from '../Menu/divider';
import ReqoreMenuItem, { IReqoreMenuItemProps } from '../Menu/item';
import { ReqoreVerticalSpacer } from '../Spacer';

export type TDropdownItemOnClick = (item: IReqoreDropdownItem) => void;
export interface IReqoreDropdownItem
  extends Omit<IReqoreMenuItemProps, 'onClick' | 'rightIcon' | 'onRightIconClick'> {
  value?: any;
  onClick?: TDropdownItemOnClick;
  divider?: boolean;
  dividerAlign?: 'left' | 'center' | 'right';
  line?: boolean;
}

export type TReqoreDropdownItem = IReqoreDropdownItem;
export type TReqoreDropdownItems = TReqoreDropdownItem[];

export interface IReqoreDropdownListProps extends IReqoreComponent {
  items?: TReqoreDropdownItems;
  multiSelect?: boolean;
  listStyle?: React.CSSProperties;
  width?: string;
  height?: string;

  filterable?: boolean;
  onFilterChange?: (query: string) => void;
  filter?: string | number;
  filterPlaceholder?: string;

  onItemSelect?: TDropdownItemOnClick;
  inputProps?: IReqoreInputProps;
  scrollToSelected?: boolean;
  paging?: TReqorePaginationType<TReqoreDropdownItem>;
}

const ReqoreDropdownList = memo(
  ({
    items,
    multiSelect,
    listStyle,
    _popoverId,
    filterable,
    width,
    height,
    onItemSelect,
    inputProps,
    scrollToSelected,
    paging,
    onFilterChange,
    filterPlaceholder,
    filter,
  }: IReqoreDropdownListProps) => {
    const [_items, setItems] = useState<TReqoreDropdownItems>(items);
    const [query, setQuery] = useState<string | number>(onFilterChange ? '' : filter || '');
    const [menuRef, setMenuRef] = useState<HTMLDivElement>(undefined);

    useEffect(() => {
      setItems(items);
    }, [items]);

    const filteredItems: TReqoreDropdownItems = useMemo(() => {
      if (!filterable || query === '') {
        return _items;
      }

      return _items.filter((item) => {
        if (item.divider) {
          return false;
        }

        const text: string | undefined = item.label || item.value || item.children;

        if (!text) {
          return false;
        }

        return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1;
      });
    }, [items, query, _items]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onFilterChange) {
        onFilterChange(event.target.value);
      } else {
        setQuery(event.target.value);
      }
    };

    const handleItemClick = (item: IReqoreDropdownItem): void => {
      if (item.onClick) {
        item.onClick(item);
      }

      if (onItemSelect) {
        onItemSelect(item);
      }
    };

    return (
      <>
        {filterable && (
          <>
            <ReqoreInput
              value={onFilterChange ? filter : query}
              icon='SearchLine'
              onChange={handleQueryChange}
              placeholder={filterPlaceholder || `Search ${size(_items)} items...`}
              onClearClick={() => (onFilterChange ? onFilterChange('') : setQuery(''))}
              {...inputProps}
            />
            <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />
          </>
        )}
        <ReqorePaginationContainer type={paging} items={filteredItems} scrollContainer={menuRef}>
          {(finalItems, Controls, { includeBottomControls }) => (
            <ReqoreMenu
              _insidePopover={!multiSelect}
              _popoverId={_popoverId}
              style={listStyle}
              width={width}
              maxHeight={height || '300px'}
              padded={false}
              ref={setMenuRef}
            >
              {finalItems.map(
                ({ onClick, dividerAlign, divider, ...item }: IReqoreDropdownItem, index: number) =>
                  divider ? (
                    <ReqoreMenuDivider key={index} {...item} align={dividerAlign} />
                  ) : (
                    <ReqoreMenuItem
                      key={index}
                      {...item}
                      label={item.label || item.value}
                      onClick={() => handleItemClick({ ...item, onClick })}
                      rightIcon={item.selected ? 'CheckLine' : undefined}
                      scrollIntoView={scrollToSelected && item.selected && !multiSelect}
                    />
                  )
              )}
              {!includeBottomControls && Controls}
            </ReqoreMenu>
          )}
        </ReqorePaginationContainer>
      </>
    );
  }
);

export default ReqoreDropdownList;
