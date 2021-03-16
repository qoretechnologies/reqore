import React, { forwardRef } from "react";
import styled from "styled-components";
import { IReqoreTheme } from "../../constants/theme";
import ReqoreThemeProvider from "../../containers/ThemeProvider";

export interface IReqoreContentWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
}

export interface IReqoreContentStyle {
  theme: IReqoreTheme;
}

const StyledReqoreContentWrapper = styled.div<IReqoreContentStyle>`
  display: flex;
  flex-flow: column;
  flex: 1;
  padding: 15px;
  overflow: hidden;
`;

const ReqoreContentWrapper = forwardRef(
  ({ children, className, ...rest }: IReqoreContentWrapperProps, ref: any) => (
    <ReqoreThemeProvider>
      <StyledReqoreContentWrapper
        {...rest}
        ref={ref}
        className={`${className || ""} reqore-content-wrapper`}
      >
        {children}
      </StyledReqoreContentWrapper>
    </ReqoreThemeProvider>
  )
);

export default ReqoreContentWrapper;
