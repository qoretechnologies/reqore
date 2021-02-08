import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';

export interface IReqoreNavbarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'right' | 'left';
  type?: 'footer' | 'header';
  children?: any;
}

export interface IReqoreNavbarGroupStyle extends IReqoreNavbarGroupProps {
  theme: IReqoreTheme;
}

const StyledNavbarGroup = styled.div<IReqoreNavbarGroupStyle>`
  ${({ position }: IReqoreNavbarGroupStyle) => css`
    height: 100%;
    float: ${position};
    color: inherit;
    background-color: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

const ReqoreNavbarGroup = forwardRef(
  (
    { position = 'left', children, type, ...rest }: IReqoreNavbarGroupProps,
    ref: any
  ) => (
    <ReqoreThemeProvider>
      <StyledNavbarGroup
        {...rest}
        className={`${rest.className || ''} reqore-navbar-group`}
        position={position}
        ref={ref}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { type })
        )}
      </StyledNavbarGroup>
    </ReqoreThemeProvider>
  )
);

export default ReqoreNavbarGroup;
