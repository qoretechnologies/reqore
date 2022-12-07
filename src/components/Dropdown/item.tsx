import { ReqoreMenuDivider, ReqoreMenuItem } from '../..';
import { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreDropdownItem } from './list';

export interface IReqoreDropdownItemProps extends Omit<IReqoreDropdownItem, 'value' | 'onClick'> {}

export const ReqoreDropdownItem = ({ children, ...rest }: IReqoreDropdownItemProps) => (
  <ReqoreMenuItem {...rest} rightIcon={rest.selected ? 'CheckLine' : undefined}>
    {children}
  </ReqoreMenuItem>
);

export interface IReqoreDropdownDividerProps extends IReqoreMenuDividerProps {}

export const ReqoreDropdownDivider = (props: IReqoreDropdownDividerProps) => (
  <ReqoreMenuDivider {...props} />
);
