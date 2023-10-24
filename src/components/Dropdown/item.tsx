import { size } from 'lodash';
import { memo, useCallback } from 'react';
import { ReqoreMenuItem } from '../..';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreDropdownItem } from './list';

export interface IReqoreDropdownItemProps extends IReqoreDropdownItem {
  onItemClick: (item: IReqoreDropdownItem) => void;
  scrollIntoView?: boolean;
}

export const ReqoreDropdownItem = memo(
  ({ onItemClick, scrollIntoView, ...rest }: IReqoreDropdownItemProps) => {
    const handleItemClick = useCallback(() => {
      onItemClick(rest);
    }, [onItemClick, rest]);

    return (
      <ReqoreMenuItem
        {...rest}
        _insidePopover={size(rest.items) ? false : rest._insidePopover}
        label={rest.label || rest.value}
        onClick={handleItemClick}
        rightIcon={rest.selected ? 'CheckLine' : rest.rightIcon}
        scrollIntoView={scrollIntoView}
      />
    );
  }
);

export const ReqoreDropdownDivider = (props: IReqoreMenuDividerProps) => (
  <ReqoreMenuDivider {...props} />
);
