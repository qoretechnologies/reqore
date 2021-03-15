import React, { forwardRef, useContext } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import PopoverContext from '../../context/PopoverContext';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreComponent } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

// @ts-ignore
export interface IReqoreMenuItemProps
  extends IReqoreComponent,
    React.HTMLAttributes<HTMLElement> {
  children?: any;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  as?: JSX.Element | React.ElementType | never;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (itemId: string, event: React.MouseEvent<HTMLElement>) => void;
  onRightIconClick?: (
    itemId: string,
    event: React.MouseEvent<HTMLElement>
  ) => void;
}

const StyledElementContent = styled.div<{
  theme: IReqoreTheme;
  hasRightIcon?: boolean;
}>`
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 3px;

  ${({ hasRightIcon }) =>
    hasRightIcon &&
    css`
      margin-right: 33px;
    `}
`;

export interface IReqoreMenuItemStyle {
  theme: IReqoreTheme;
  selected: boolean;
  disabled: boolean;
}

const StyledElement = styled.div<IReqoreMenuItemStyle>`
  min-height: 35px;
  color: ${({ theme, selected }) =>
    getReadableColor(theme, undefined, undefined, !selected)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  position: relative;
  width: 100%;
  z-index: 0;
  cursor: pointer;
  transition: background-color 0.05s linear;
  border-radius: 4px;
  background-color: ${({ theme, selected }) =>
    selected ? changeLightness(theme.main, 0.07) : 'transparent'};
  overflow: hidden;

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
              getReadableColor(theme, undefined, undefined)};
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

export interface IReqoreMenuItemRightIconStyle {
  theme: IReqoreTheme;
  interactive?: boolean;
}

const StyledRightIcon = styled.div<IReqoreMenuItemRightIconStyle>`
  ${({ theme, interactive }) => css`
    position: absolute;
    right: 0px;
    height: 100%;
    width: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    z-index: 1;
    transition: background-color 0.1s linear;

    ${interactive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${changeLightness(theme.main, 0.09)};
      }
    `}
  `}
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
      onRightIconClick,
      disabled,
      id,
      _insidePopover,
      _popoverId,
      ...rest
    },
    ref: any
  ) => {
    const { removePopover } = useContext(PopoverContext);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.persist();
      event.stopPropagation();

      onClick && onClick(id, event);

      if (_insidePopover) {
        removePopover(_popoverId);
      }
    };

    const handleRightIconClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.persist();
      event.stopPropagation();

      if (onRightIconClick) {
        onRightIconClick(id, event);

        if (_insidePopover) {
          removePopover(_popoverId);
        }
      }
    };

    return (
      <ReqoreThemeProvider>
        <StyledElement
          //@ts-ignore
          as={as}
          {...rest}
          className='reqore-menu-item'
          onClick={handleClick}
          selected={selected}
          ref={ref}
          disabled={disabled}
        >
          <StyledElementContent hasRightIcon={!!rightIcon}>
            {icon && <ReqoreIcon icon={icon} size='13px' margin='right' />}
            {children}
          </StyledElementContent>
          {rightIcon && (
            <StyledRightIcon
              className='reqore-menu-item-right-icon'
              interactive={!!onRightIconClick}
              onClick={handleRightIconClick}
            >
              <ReqoreIcon icon={rightIcon} size='13px' />
            </StyledRightIcon>
          )}
        </StyledElement>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenuItem;
