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
}

export interface IReqoreMenuStyle {
  theme: IReqoreTheme;
  position?: "left" | "right";
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: 160px;
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
          React.cloneElement(child, {
            _insidePopover,
            _popoverId,
          })
        )}
      </StyledReqoreMenu>
    </ReqoreThemeProvider>
  )
);

export default ReqoreMenu;
