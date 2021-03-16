import React, { forwardRef } from "react";
import styled, { css } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import { changeLightness, getMainColor } from "../../helpers/colors";

export interface IReqoreNavbarItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  interactive?: boolean;
  type?: "header" | "footer";
}

export interface IReqoreNavbarItemStyle extends IReqoreNavbarItemProps {
  theme?: IReqoreTheme;
}

const StyledNavbarItem = styled.div<IReqoreNavbarItemStyle>`
  height: 100%;
  min-width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  color: inherit;
  background-color: inherit;

  ${({ interactive, theme, type }: IReqoreNavbarItemStyle) =>
    interactive &&
    css`
      transition: background-color 0.1s linear;
      cursor: pointer;
      &:hover {
        background-color: ${theme[type]?.hoverColor ||
        changeLightness(getMainColor(theme, type), 0.05)};
      }
    `}
`;

const ReqoreNavbarItem = forwardRef(
  (
    { interactive, children, type, ...rest }: IReqoreNavbarItemProps,
    ref: any
  ) => (
    <ReqoreThemeProvider>
      <StyledNavbarItem
        {...rest}
        className={`${rest.className || ""} reqore-navbar-item`}
        interactive={interactive}
        type={type}
        ref={ref}
      >
        {children}
      </StyledNavbarItem>
    </ReqoreThemeProvider>
  )
);

export default ReqoreNavbarItem;
