import { darken } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getMainColor, getReadableColor } from '../../helpers/colors';

export interface IReqoreNavbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  position?: 'top' | 'bottom';
  type?: 'header' | 'footer';
}

export interface IReqoreNavbarStyle extends IReqoreNavbarProps {
  theme: IReqoreTheme;
}

const StyledNavbar = styled.div<IReqoreNavbarStyle>`
  ${({ theme, type }: IReqoreNavbarStyle) => css`
    height: 50px;
    width: 100%;
    color: ${
      theme[type]?.color ||
      getReadableColor(
        theme[type]?.background || theme[type]?.main || theme.main,
        undefined,
        undefined,
        true
      )
    };
    background-color: ${
      theme[type]?.background || theme[type]?.main || theme.main
    };
    border-${type === 'header' ? 'bottom' : 'top'}: 1px solid ${
    theme[type]?.border || darken(0.1, getMainColor(theme, type))
  };
  `}
`;

const ReqoreNavbar = forwardRef(
  (
    { position = 'top', children, type, ...rest }: IReqoreNavbarProps,
    ref: any
  ) => (
    <ReqoreThemeProvider>
      <StyledNavbar
        {...rest}
        className={`${rest.className || ''} reqore-navbar-${type}`}
        position={position}
        type={type}
        ref={ref}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { type })
        )}
      </StyledNavbar>
    </ReqoreThemeProvider>
  )
);

export const ReqoreHeader = forwardRef(
  (props: IReqoreNavbarProps, ref: any) => (
    <ReqoreNavbar {...props} type='header' ref={ref} />
  )
);

export const ReqoreFooter = forwardRef(
  (props: IReqoreNavbarProps, ref: any) => (
    <ReqoreNavbar {...props} type='footer' ref={ref} />
  )
);
