import React, { memo, useEffect, useMemo, useState } from 'react';
import { IReqoreComponent } from '../../types/global';
import ReqoreInput from '../Input';
import ReqoreMenu from '../Menu';
import ReqoreMenuItem, { IReqoreMenuItemProps } from '../Menu/item';

export type TDropdownItemOnClick = (item: IReqoreDropdownItem) => void;
export interface IReqoreDropdownItem extends Omit<IReqoreMenuItemProps, 'onClick'> {
  value: any;
  label?: string;
  onClick?: TDropdownItemOnClick;
}

export interface IReqoreDropdownListProps extends IReqoreComponent {
  items?: IReqoreDropdownItem[];
  multiSelect?: boolean;
  listStyle?: React.CSSProperties;
  width?: string;
  height?: string;
  filterable?: boolean;
  onItemSelect?: TDropdownItemOnClick;
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
  }: IReqoreDropdownListProps) => {
    const [_items, setItems] = useState<IReqoreDropdownItem[]>(items);
    const [query, setQuery] = useState<string>('');

    useEffect(() => {
      setItems(items);
    }, [items]);

    const filteredItems: IReqoreDropdownItem[] = useMemo(() => {
      if (!filterable || query === '') {
        return _items;
      }

      return _items.filter((item) => {
        const text = item.label || item.value || item.children;

        if (!text) {
          return false;
        }

        return text.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
      });
    }, [items, query, _items]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
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
      <ReqoreMenu
        _insidePopover={!multiSelect}
        _popoverId={_popoverId}
        style={listStyle}
        width={width}
        maxHeight={height || '300px'}
      >
        {filterable && (
          <>
            <ReqoreInput
              value={query}
              onChange={handleQueryChange}
              placeholder='Filter'
              onClearClick={() => setQuery('')}
            />
          </>
        )}
        {filteredItems.map((item: IReqoreDropdownItem, index: number) => (
          <ReqoreMenuItem
            key={index}
            {...item}
            label={item.label || item.value}
            onClick={() => handleItemClick(item)}
            rightIcon={item.selected ? 'CheckLine' : undefined}
          />
        ))}
      </ReqoreMenu>
    );
  }
);

export default ReqoreDropdownList;
