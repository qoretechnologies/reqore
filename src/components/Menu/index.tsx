import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent } from '../../types/global';

export interface IReqoreMenuProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  accent?: string;
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || '160px'};
  padding: 5px;
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;

  background-color: ${({ theme }) => theme.main};

  ${({ theme, position }) =>
    position &&
    css`
    border-${
      position === 'left' ? 'right' : 'left'
    }: 1px solid ${changeLightness(theme.main, 0.05)};
    padding-${position === 'left' ? 'right' : 'left'}: 10px;
  `}
`;

const ReqoreMenu: React.FC<IReqoreMenuProps> = forwardRef(
  (
    { children, position, _insidePopover, _popoverId, accent, ...rest },
    ref: any
  ) => {
    const theme = useReqoreTheme('main', {
      main: accent,
    });

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledReqoreMenu {...rest} position={position} ref={ref}>
          {React.Children.map(children, (child) =>
            child
              ? // @ts-ignore
                React.cloneElement(child, {
                  _insidePopover,
                  _popoverId,
                })
              : null
          )}
        </StyledReqoreMenu>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenu;
