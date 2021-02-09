import { darken } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getReadableColor } from '../../helpers/colors';

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
`;

const StyledReqoreContent = styled.div<IReqoreContentStyle>`
  ${({ theme }: IReqoreContentStyle) => css`
    display: flex;
    flex: 1;
    background-color: ${theme.main};
    border-radius: 10px;
    color: ${getReadableColor(theme.main, undefined, undefined, true)};
    padding: 10px;
    box-shadow: 0 0 4px 0px ${darken(0.3, theme.main)};
  `}
`;

const ReqoreContent = forwardRef(
  ({ children, className, ...rest }: IReqoreContentWrapperProps, ref: any) => (
    <ReqoreThemeProvider>
      <StyledReqoreContentWrapper>
        <StyledReqoreContent
          {...rest}
          ref={ref}
          className={`${className || ''} reqore-content`}
        >
          {children}
        </StyledReqoreContent>
      </StyledReqoreContentWrapper>
    </ReqoreThemeProvider>
  )
);

export default ReqoreContent;
