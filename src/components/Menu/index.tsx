import React, { forwardRef } from "react";
import styled, { css } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import { changeLightness } from "../../helpers/colors";
import { IReqoreComponent } from "../../types/global";

export interface IReqoreMenuProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: "left" | "right";
  width?: string;
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || "160px"};
  background-color: transparent;

  ${({ theme, position }) =>
    position &&
    css`
    border-${
      position === "left" ? "right" : "left"
    }: 1px solid ${changeLightness(theme.main, 0.05)};
    padding-${position === "left" ? "right" : "left"}: 10px;
  `}
`;

const ReqoreMenu: React.FC<IReqoreMenuProps> = forwardRef(
  ({ children, position, _insidePopover, _popoverId, ...rest }, ref: any) => (
    <ReqoreThemeProvider>
      <StyledReqoreMenu {...rest} position={position} ref={ref}>
        {React.Children.map(children, (child) =>
          child
            ? // @ts-ignore
              React.cloneElement(child, {
                _insidePopover,
                _popoverId,
              })
            : null
        )}
      </StyledReqoreMenu>
    </ReqoreThemeProvider>
  )
);

export default ReqoreMenu;
