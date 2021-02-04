import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness } from '../../helpers/colors';

export interface IReqoreMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
}

export interface IReqoreMenuStyle {
  theme: IReqoreTheme;
  position?: 'left' | 'right';
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: 160px;
  background-color: transparent;

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
  ({ children, position, ...rest }, ref: any) => (
    <ReqoreThemeProvider>
      <StyledReqoreMenu {...rest} position={position} ref={ref}>
        {children}
      </StyledReqoreMenu>
    </ReqoreThemeProvider>
  )
);

export default ReqoreMenu;
