import React, { useState } from "react";
import styled from "styled-components";
import usePopover, { IPopoverOptions } from "../../hooks/usePopover";
import { IReqoreComponent } from "../../types/global";

export interface IReqorePopoverProps extends IReqoreComponent, IPopoverOptions {
  component: any;
  componentProps?: any;
  children?: any;
  isReqoreComponent?: boolean;
  noWrapper?: boolean;
  wrapperTag?: string;
  wrapperStyle?: React.CSSProperties;
}

export const StyledPopover = styled.span`
  overflow: hidden;
`;

const Popover = ({
  component: Component,
  componentProps,
  children,
  isReqoreComponent,
  noWrapper,
  wrapperTag = "span",
  wrapperStyle = {},
  _insidePopover,
  _popoverId,
  ...rest
}: IReqorePopoverProps) => {
  const [ref, setRef] = useState(null);

  usePopover({ targetElement: ref, ...rest });

  if (isReqoreComponent || noWrapper) {
    return (
      <Component
        {...componentProps}
        _insidePopover={_insidePopover}
        _popoverId={_popoverId}
        ref={setRef}
      >
        {children}
      </Component>
    );
  }

  return (
    // @ts-ignore
    <StyledPopover
      // @ts-ignore
      as={wrapperTag}
      className="reqore-popover-wrapper"
      ref={setRef}
      style={wrapperStyle}
    >
      <Component
        {...componentProps}
        _insidePopover={_insidePopover}
        _popoverId={_popoverId}
      >
        {children}
      </Component>
    </StyledPopover>
  );
};

export default Popover;
