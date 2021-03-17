import React from "react";
import { ReqoreMenuDivider, ReqoreMenuItem } from "../..";
import { IReqoreComponent } from "../../types/global";
import ReqoreMenu from "../Menu";

export interface IReqoreDropdownListProps extends IReqoreComponent {
  children?: (typeof ReqoreMenuItem | typeof ReqoreMenuDivider)[];
  multiSelect?: boolean;
  listStyle?: React.CSSProperties;
  width?: string;
}

const ReqoreDropdownList = ({
  children,
  multiSelect,
  listStyle,
  _popoverId,
  width,
}: IReqoreDropdownListProps) => (
  <ReqoreMenu
    _insidePopover={!multiSelect}
    _popoverId={_popoverId}
    style={listStyle}
    width={width}
  >
    {children}
  </ReqoreMenu>
);

export default ReqoreDropdownList;
