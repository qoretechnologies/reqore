import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeDarkness, changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent, IWithReqoreMinimal, IWithReqoreTransparent } from '../../types/global';

export interface IReqoreMenuProps
  extends IReqoreComponent,
    IWithReqoreMinimal,
    IWithReqoreTransparent,
    React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  wrapText?: boolean;
  flat?: boolean;
  rounded?: boolean;
  padded?: boolean;
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || undefined};
  min-width: ${({ width }) => (width ? undefined : '160px')};
  padding: ${({ padded = true }) => (padded ? '5px' : undefined)};
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;

  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border-radius: ${({ rounded }) => (rounded ? `${RADIUS_FROM_SIZE['normal']}px` : `0`)};

  ${({ theme, position }) =>
    position &&
    css`
    border-${position === 'left' ? 'right' : 'left'}: 1px solid ${changeLightness(
      theme.main,
      0.05
    )};
    padding-${position === 'left' ? 'right' : 'left'}: 10px;
  `}

  > *:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const ReqoreMenu = forwardRef<HTMLDivElement, IReqoreMenuProps>(
  (
    {
      children,
      position,
      _insidePopover,
      _popoverId,
      customTheme,
      intent,
      wrapText,
      flat = true,
      minimal,
      ...rest
    }: IReqoreMenuProps,
    ref
  ) => {
    const theme = useReqoreTheme('main', customTheme, intent);

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledReqoreMenu
          {...rest}
          position={position}
          ref={ref}
          theme={theme}
          className={`${rest.className || ''} reqore-menu`}
        >
          {React.Children.map(children, (child) => {
            return child
              ? // @ts-ignore
                React.cloneElement(child, {
                  _insidePopover,
                  _popoverId,
                  customTheme: child.props?.customTheme || theme,
                  wrap: 'wrap' in (child.props || {}) ? child.props.wrap : wrapText,
                  flat: 'flat' in (child.props || {}) ? child.props.flat : flat,
                  minimal: 'minimal' in (child.props || {}) ? child.props.minimal : minimal,
                })
              : null;
          })}
        </StyledReqoreMenu>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenu;
