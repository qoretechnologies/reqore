import React, { memo, useCallback } from 'react';
import { ReqoreMenuItem } from '../..';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { selectItemLabel } from '../../helpers/selectItem';
import { IReqoreDropdownItem } from './list';

export interface IReqoreDropdownItemProps extends IReqoreDropdownItem {
  onItemClick: (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>) => void;
  scrollIntoView?: boolean;
  keyboardFocused?: boolean;
}

export const ReqoreDropdownItem = memo(
  ({ onItemClick, scrollIntoView, keyboardFocused, ...item }: IReqoreDropdownItemProps) => {
    const handleItemClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        onItemClick(item, event);
      },
      [onItemClick, item]
    );
    // The dropdown's own data stays with the item it hands back on select. The
    // menu item passes props it does not know on to its DOM button, which wrote
    // a structured `value` as "[object Object]".
    const { value: _value, metadata: _metadata, items: _items, ...menuItem } = item;

    return (
      <ReqoreMenuItem
        {...menuItem}
        // An unlabelled row shows its own value, the same way the chip for it
        // does — one rule, in `selectItemLabel`, so the list and the selection
        // made from it cannot disagree.
        label={selectItemLabel(item)}
        onClick={handleItemClick}
        rightIcon={item.selected ? 'CheckLine' : item.rightIcon}
        scrollIntoView={scrollIntoView || keyboardFocused}
        selected={keyboardFocused ? true : item.selected}
      />
    );
  }
);

export const ReqoreDropdownDivider = (props: IReqoreMenuDividerProps) => (
  <ReqoreMenuDivider {...props} />
);
