import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';

export interface IReqoreMenuItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  icon?: IconName;
  rightIcon?: IconName;
  as?: JSX.Element | React.ElementType;
  selected?: boolean;
}

const StyledElementContent = styled.div<{ theme: IReqoreTheme }>`
  display: flex;
  align-items: center;
  flex: 1;

  .bp3-icon {
    color: ${({ theme }) => changeLightness(getReadableColor(theme.main), 0.1)};
    margin-right: 7px;
  }
`;

const ReqoreMenuItem: React.FC<IReqoreMenuItemProps> = ({
  children,
  icon,
  rightIcon,
  as,
  selected,
  ...rest
}) => {
  const Element: React.ElementType = as || 'div';
  const StyledElement = styled(Element)`
    min-height: 25px;
    color: ${({ theme, selected }) =>
      getReadableColor(theme.main, undefined, undefined, !selected)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 5px;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.05s linear;
    border-radius: 4px;
    background-color: ${({ theme, selected }) =>
      selected ? changeLightness(theme.main, 0.09) : 'transparent'};

    ${({ theme, selected }) =>
      !selected &&
      css`
        &:hover {
          background-color: ${changeLightness(theme.main, 0.05)};
        }
      `}

    &:not(:first-child) {
      margin-top: 4px;
    }
  `;

  return (
    <ReqoreThemeProvider>
      <StyledElement {...rest} selected={selected}>
        <StyledElementContent>
          {icon && <Icon icon={icon} iconSize={12} />}
          {children}
        </StyledElementContent>
        {rightIcon && <Icon icon={rightIcon} />}
      </StyledElement>
    </ReqoreThemeProvider>
  );
};

export default ReqoreMenuItem;
