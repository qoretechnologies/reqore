import React, { forwardRef, useContext, useRef } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import PopoverContext from '../../context/PopoverContext';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { IReqoreComponent, TReqoreTooltipProp } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

// @ts-ignore
export interface IReqoreMenuItemProps extends IReqoreComponent, React.HTMLAttributes<HTMLElement> {
  children?: string;
  label?: string | number;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  as?: JSX.Element | React.ElementType | never;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
  onRightIconClick?: (itemId?: string, event?: React.MouseEvent<HTMLElement>) => void;
  tooltip?: TReqoreTooltipProp;
  intent?: IReqoreIntent;
}

const StyledElementContent = styled.div<{
  theme: IReqoreTheme;
  hasRightIcon?: boolean;
}>`
  display: flex;
  align-items: center;
  flex: 1;
  margin-right: 3px;
  word-break: break-word;

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
  intent?: IReqoreIntent;
}

const StyledElement = styled.div<IReqoreMenuItemStyle>`
  min-height: 35px;
  color: ${({ theme, selected, intent }) =>
    intent
      ? getReadableColorFrom(theme.intents[intent], true)
      : getReadableColor(theme, undefined, undefined, !selected)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  position: relative;
  width: 100%;
  z-index: 0;
  cursor: pointer;
  transition: background-color 0.05s ease-out;
  border-radius: 4px;
  ${({ theme, selected, intent }: IReqoreMenuItemStyle) => {
    const bg = intent ? theme.intents[intent] : theme.main;

    return css`
      background-color: ${selected ? changeLightness(bg!, 0.07) : bg};
    `;
  }};
  overflow: hidden;

  ${({ theme, selected, disabled, intent }) =>
    !disabled
      ? css`
          ${!selected &&
          css`
            &:hover {
              background-color: ${changeLightness(
                intent ? theme.intents[intent] : theme.main,
                0.05
              )};
            }
          `}

          &:hover {
            color: ${({ theme }) =>
              intent
                ? getReadableColorFrom(theme.intents[intent])
                : getReadableColor(theme, undefined, undefined)};
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
  intent?: IReqoreIntent;
}

const StyledRightIcon = styled.div<IReqoreMenuItemRightIconStyle>`
  ${({ theme, interactive, intent }) => css`
    position: absolute;
    right: 0px;
    height: 100%;
    width: 33px;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    z-index: 1;
    transition: background-color 0.2s ease-out;

    ${interactive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${changeLightness(intent ? theme.intents[intent] : theme.main, 0.09)};
      }
    `}
  `}
`;

const ReqoreMenuItem: React.FC<IReqoreMenuItemProps> = forwardRef(
  (
    {
      children,
      label,
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
      tooltip,
      intent,
      ...rest
    },
    ref: any
  ) => {
    const { removePopover } = useContext(PopoverContext);
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      event.persist();

      onClick?.(id, event);

      if (_insidePopover && _popoverId) {
        removePopover!(_popoverId);
      }
    };

    const handleRightIconClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.persist();

      if (onRightIconClick) {
        onRightIconClick(id, event);

        if (_insidePopover && _popoverId) {
          removePopover!(_popoverId);
        }
      }
    };

    useTooltip(combinedRef.current, tooltip);

    return (
      <StyledElement
        //@ts-ignore
        as={as}
        {...rest}
        className='reqore-menu-item'
        onClick={handleClick}
        selected={selected}
        ref={combinedRef}
        disabled={disabled}
        intent={intent}
      >
        <StyledElementContent hasRightIcon={!!rightIcon}>
          {icon && <ReqoreIcon icon={icon} size='13px' margin='right' />}
          {label || children}
        </StyledElementContent>
        {rightIcon && (
          <StyledRightIcon
            className='reqore-menu-item-right-icon'
            interactive={!!onRightIconClick}
            onClick={handleRightIconClick}
            intent={intent}
          >
            <ReqoreIcon icon={rightIcon} size='13px' />
          </StyledRightIcon>
        )}
      </StyledElement>
    );
  }
);

export default ReqoreMenuItem;
