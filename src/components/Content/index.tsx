import React, { forwardRef } from "react";
import styled, { css } from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";
import { getReadableColor } from "../../helpers/colors";

export interface IReqoreContentWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
}

export interface IReqoreContentStyle {
  theme: IReqoreTheme;
}

const StyledReqoreContent = styled.div<IReqoreContentStyle>`
  ${({ theme }: IReqoreContentStyle) => css`
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    color: ${getReadableColor(theme, undefined, undefined, true)};
    overflow: auto;
    align-items: flex-start;
    flex-flow: column;
  `}
`;

const ReqoreContent = forwardRef(
  ({ children, className, ...rest }: IReqoreContentWrapperProps, ref: any) => (
    <ReqoreThemeProvider>
      <StyledReqoreContent
        {...rest}
        ref={ref}
        className={`${className || ""} reqore-content`}
      >
        {children}
      </StyledReqoreContent>
    </ReqoreThemeProvider>
  )
);

export default ReqoreContent;
