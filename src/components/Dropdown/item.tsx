import { ReqoreMenuDivider, ReqoreMenuItem } from '../..';
import { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreMenuItemProps } from '../Menu/item';

export interface IReqoreDropdownItemProps extends IReqoreMenuItemProps {}

export const ReqoreDropdownItem = ({
  children,
  ...rest
}: IReqoreDropdownItemProps) => (
  <ReqoreMenuItem {...rest} rightIcon={rest.selected ? 'CheckLine' : undefined}>
    {children}
  </ReqoreMenuItem>
);

export interface IReqoreDropdownDividerProps extends IReqoreMenuDividerProps {}

export const ReqoreDropdownDivider = (props: IReqoreDropdownDividerProps) => (
  <ReqoreMenuDivider {...props} />
);
