import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent } from '../../types/global';
import { StyledReqoreControlGroup } from '../ControlGroup';

export interface IReqoreMenuProps extends IReqoreComponent, React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  wrapText?: boolean;
  flat?: boolean;
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || undefined};
  min-width: ${({ width }) => (width ? undefined : '160px')};
  padding: 5px;
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;

  background-color: ${({ theme }) => theme.main};

  ${({ theme, position }) =>
    position &&
    css`
    border-${position === 'left' ? 'right' : 'left'}: 1px solid ${changeLightness(
      theme.main,
      0.05
    )};
    padding-${position === 'left' ? 'right' : 'left'}: 10px;
  `}

  ${StyledReqoreControlGroup}:not(:last-child) {
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
      ...rest
    }: IReqoreMenuProps,
    ref: any
  ) => {
    const theme = useReqoreTheme('main', customTheme, intent);

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledReqoreMenu {...rest} position={position} ref={ref} theme={theme}>
          {React.Children.map(children, (child) => {
            console.log(child);
            return child
              ? // @ts-ignore
                React.cloneElement(child, {
                  _insidePopover,
                  _popoverId,
                  customTheme: child?.props.customTheme || theme,
                  wrap: wrapText,
                  flat: child?.props.flat || flat,
                })
              : null;
          })}
        </StyledReqoreMenu>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenu;
