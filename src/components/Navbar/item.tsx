import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getMainColor } from '../../helpers/colors';

export interface IReqoreNavbarItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  interactive?: boolean;
  type?: 'header' | 'footer';
  disabled?: boolean;
  active?: boolean;
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
  background-color: ${({ theme, active, type }) =>
    active &&
    (theme[type]?.hoverColor ||
      changeLightness(getMainColor(theme, type), 0.05))};

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

  opacity: ${({ disabled }) => disabled && 0.3};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    `}
`;

const ReqoreNavbarItem = forwardRef(
  (
    {
      interactive,
      children,
      type,
      disabled,
      active,
      ...rest
    }: IReqoreNavbarItemProps,
    ref: any
  ) => (
    <ReqoreThemeProvider>
      <StyledNavbarItem
        {...rest}
        className={`${rest.className || ''} reqore-navbar-item`}
        interactive={interactive || !!rest.onClick}
        disabled={disabled}
        active={active}
        type={type}
        ref={ref}
      >
        {children}
      </StyledNavbarItem>
    </ReqoreThemeProvider>
  )
);

export default ReqoreNavbarItem;
