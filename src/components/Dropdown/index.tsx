import { size } from "lodash";
import React from "react";
import { ReqorePopover } from "../..";
import { IPopoverOptions } from "../../hooks/usePopover";
import ReqoreButton, { IReqoreButtonProps } from "../Button";
import ReqoreDropdownList from "./list";

export interface IReqoreDropdownProps extends IPopoverOptions {
  children?: any;
  multiSelect?: boolean;
  buttonStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  component?: any;
  componentProps?: { [key: string]: any };
  label?: any;
}

const ReqoreDropdown = ({
  children,
  component,
  componentProps = {},
  label,
  multiSelect,
  buttonStyle,
  listStyle,
  handler,
  placement,
  ...rest
}: IReqoreDropdownProps) => {
  return (
    <ReqorePopover
      {...rest}
      component={component || ReqoreButton}
      componentProps={
        {
          icon: "ArrowDownSFill",
          style: buttonStyle,
          disabled: !size(children),
          ...componentProps,
        } as IReqoreButtonProps
      }
      noWrapper
      placement={placement || "bottom"}
      handler={handler || "click"}
      content={
        <ReqoreDropdownList
          multiSelect={multiSelect}
          listStyle={listStyle}
          width={rest.useTargetWidth ? "100%" : undefined}
        >
          {children}
        </ReqoreDropdownList>
      }
      noArrow
    >
      {label}
    </ReqorePopover>
  );
};

export default ReqoreDropdown;
