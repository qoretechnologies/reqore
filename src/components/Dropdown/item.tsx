import React, { memo, useCallback } from 'react';
import { ReqoreMenuItem } from '../..';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreDropdownItem } from './list';

export interface IReqoreDropdownItemProps extends IReqoreDropdownItem {
  onItemClick: (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>) => void;
  scrollIntoView?: boolean;
  keyboardFocused?: boolean;
}

export const ReqoreDropdownItem = memo(
  ({ onItemClick, scrollIntoView, keyboardFocused, ...rest }: IReqoreDropdownItemProps) => {
    const handleItemClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        onItemClick(rest, event);
      },
      [onItemClick, rest]
    );

    return (
      <ReqoreMenuItem
        {...rest}
        label={rest.label || rest.value}
        onClick={handleItemClick}
        rightIcon={rest.selected ? 'CheckLine' : rest.rightIcon}
        scrollIntoView={scrollIntoView || keyboardFocused}
        selected={keyboardFocused ? true : rest.selected}
      />
    );
  }
);

export const ReqoreDropdownDivider = (props: IReqoreMenuDividerProps) => (
  <ReqoreMenuDivider {...props} />
);
