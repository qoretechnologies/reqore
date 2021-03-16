import React from "react";
import styled, { css } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import { changeLightness, getReadableColor } from "../../helpers/colors";

export interface IReqoreLayoutWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  withSidebar?: boolean;
}

const StyledReqoreLayoutWrapper = styled.div<{
  withSidebar: boolean;
  theme: IReqoreTheme;
}>`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 14px;

  * {
    font-family: "Nunito Sans", -apple-system, ".SFNSText-Regular",
      "San Francisco", BlinkMacSystemFont, "Segoe UI", "Helvetica Neue",
      Helvetica, Arial, sans-serif;
    box-sizing: border-box;
  }

  a {
    text-decoration: none;
  }

  ${({ withSidebar, theme }) => css`
    flex-flow: ${withSidebar ? "row" : "column"};
    background-color: ${changeLightness(theme.main, 0.02)};
    color: ${getReadableColor(theme, undefined, undefined, true)};
  `}
`;

const ReqoreLayoutWrapper = ({
  withSidebar,
  children,
  className,
  ...rest
}: IReqoreLayoutWrapperProps) => (
  <ReqoreThemeProvider>
    <StyledReqoreLayoutWrapper
      {...rest}
      className={`${className || ""} reqore-layout-wrapper`}
      withSidebar={withSidebar}
    >
      {children}
    </StyledReqoreLayoutWrapper>
  </ReqoreThemeProvider>
);

export default ReqoreLayoutWrapper;
