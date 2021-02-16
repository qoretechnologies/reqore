import { Icon, IconName } from '@blueprintjs/core';
import React, { forwardRef, useContext } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreComponent } from '../../types/global';

// @ts-ignore
export interface IReqoreMenuItemProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLElement> {
  children?: any;
  icon?: IconName;
  rightIcon?: IconName;
  as?: JSX.Element | React.ElementType | never;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (itemId: string, event: React.MouseEvent<HTMLElement>) => void;
}

const StyledElementContent = styled.div<{ theme: IReqoreTheme }>`
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 3px;

  .bp3-icon {
    color: ${({ theme }) => changeLightness(getReadableColor(theme.main), 0.1)};
    margin-right: 7px;
  }
`;

export interface IReqoreMenuItemStyle {
  theme: IReqoreTheme;
  selected: boolean;
  disabled: boolean;
}

const StyledElement = styled.div<IReqoreMenuItemStyle>`
  min-height: 35px;
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

  ${({ theme, selected, disabled }) =>
    !disabled
      ? css`
          ${!selected &&
          css`
            &:hover {
              background-color: ${changeLightness(theme.main, 0.05)};
            }
          `}

          &:hover {
            color: ${({ theme }) =>
              getReadableColor(theme.main, undefined, undefined)};
            text-decoration: none;
          }
        `
      : css`
          cursor: not-allowed;
          > * {
            opacity: 0.5;
          }
        `}

  &:not(:first-child) {
    margin-top: 4px;
  }
`;

const ReqoreMenuItem: React.FC<IReqoreMenuItemProps> = forwardRef(
  (
    {
      children,
      icon,
      rightIcon,
      as,
      selected,
      onClick,
      disabled,
      id,
      _insidePopover,
      _popoverId,
      ...rest
    },
    ref: any
  ) => {
    const { removePopover } = useContext(PopoverContext);

    return (
      <ReqoreThemeProvider>
        <StyledElement
          //@ts-ignore
          as={as}
          className='reqore-menu-item'
          {...rest}
          onClick={(event) => {
            event.persist();
            event.stopPropagation();

            onClick && onClick(id, event);

            if (_insidePopover) {
              removePopover(_popoverId);
            }
          }}
          selected={selected}
          ref={ref}
          disabled={disabled}
        >
          <StyledElementContent>
            {icon && <Icon icon={icon} iconSize={12} />}
            {children}
          </StyledElementContent>
          {rightIcon && <Icon icon={rightIcon} />}
        </StyledElement>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenuItem;
