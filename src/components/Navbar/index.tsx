import { darken } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreNavbarTheme, IReqoreTheme } from '../../constants/theme';
import { getMainColor, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';

export interface IReqoreNavbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  position?: 'top' | 'bottom';
  type?: 'header' | 'footer';
  customTheme?: IReqoreNavbarTheme;
}

export interface IReqoreNavbarStyle extends IReqoreNavbarProps {
  theme: IReqoreTheme;
}

export const StyledNavbar = styled.div<IReqoreNavbarStyle>`
  ${({ theme, type }: IReqoreNavbarStyle) => css`
    height: 50px;
    width: 100%;
    padding: 0 10px;
    color: ${
      theme[type]?.color ||
      getReadableColor(
        theme,
        undefined,
        undefined,
        true,
        theme[type]?.background || theme[type]?.main || theme.main
      )
    };
    background-color: ${
      theme[type]?.background || theme[type]?.main || theme.main
    };
    box-shadow: rgba(31, 26, 34, 0.05) 0px ${
      type === 'header' ? '2px' : '-2px'
    } 6px;
    border-${type === 'header' ? 'bottom' : 'top'}: 1px solid ${
    theme[type]?.border || darken(0.05, getMainColor(theme, type))
  };
  `}
`;

const ReqoreNavbar = forwardRef(
  (
    {
      position = 'top',
      children,
      type,
      customTheme,
      ...rest
    }: IReqoreNavbarProps,
    ref: any
  ) => {
    const theme = useReqoreTheme(type, customTheme);

    return (
      <StyledNavbar
        {...rest}
        className={`${rest.className || ''} reqore-navbar-${type}`}
        position={position}
        type={type}
        ref={ref}
        theme={theme}
      >
        {React.Children.map(children, (child) =>
          child
            ? React.cloneElement(child, {
                type,
                theme,
                componentProps: { theme },
              })
            : null
        )}
      </StyledNavbar>
    );
  }
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
