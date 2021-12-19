import { Placement } from '@popperjs/core';
import { darken, rgba } from 'polished';
import React, { forwardRef, useContext, useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import ThemeContext from '../../context/ThemeContext';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: IReqoreIconName;
  size?: TSizes;
  minimal?: boolean;
  disabled?: boolean;
  tooltip?: string;
  tooltipPlacement?: Placement;
  fluid?: boolean;
  fixed?: boolean;
  intent?: IReqoreIntent;
  active?: boolean;
  flat?: boolean;
  rightIcon?: IReqoreIconName;
  color?: string;
}

export interface IReqoreButtonStyle extends Omit<IReqoreButtonProps, 'intent'> {
  theme: IReqoreTheme;
}

const getButtonMainColor = (theme: IReqoreTheme, color?: string) => {
  if (color) {
    return color;
  }

  return theme.main;
};

const StyledLabel = styled.span`
  overflow: hidden;
  position: relative;
`;

export const StyledActiveContent = styled.span`
  position: absolute;
  transform: translateY(-150%);
  opacity: 0;
  transition: all 0.2s ease-out;
  filter: blur(10px);

  ${({ wrap }) =>
    wrap &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    `}
`;

export const StyledInActiveContent = styled.span`
  position: absolute;
  transform: translateY(0);
  transition: all 0.2s ease-out;

  ${({ wrap }) =>
    wrap &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    `}
`;

export const StyledInvisibleContent = styled.span`
  visibility: hidden;
  position: relative;
  overflow: hidden;

  ${({ wrap }) =>
    wrap &&
    css`
      white-space: nowrap;
    `}
`;

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  border: ${({ theme, minimal, color, flat }) =>
    !minimal && !flat
      ? `1px solid ${
          color ? darken(0.2, color) : changeLightness(getButtonMainColor(theme, color), 0.2)
        }`
      : 0};
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 0 auto' : '0 0 auto')};

  border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px;

  background-color: ${({ minimal, theme, color }) => {
    if (minimal) {
      if (color) {
        return rgba(color, 0.3);
      }
      return 'transparent';
    }

    return color || changeLightness(theme.main, 0.1);
  }};

  color: ${({ theme, color, minimal }) =>
    color
      ? minimal
        ? getReadableColor(theme, undefined, undefined, true)
        : getReadableColorFrom(color, true)
      : getReadableColor(theme, undefined, undefined, true)};

  .reqore-icon {
    transform: scale(0.85);
  }

  &:not(:disabled) {
    cursor: pointer;
    transition: all 0.2s ease-out;

    &:active {
      transform: scale(0.95);
    }

    &:hover,
    &:focus {
      background-color: ${({ theme, color }: IReqoreButtonStyle) =>
        color
          ? changeLightness(color, 0.09)
          : changeLightness(getButtonMainColor(theme, color), 0.2)};
      color: ${({ theme, color }) =>
        color ? getReadableColorFrom(color) : getReadableColor(theme, undefined, undefined)};
      border-color: ${({ minimal, theme, color }) =>
        minimal
          ? undefined
          : color
          ? darken(0.4, color)
          : changeLightness(getButtonMainColor(theme, color), 0.4)};

      .reqore-icon {
        transform: scale(1);
      }

      ${StyledActiveContent} {
        transform: translateY(0px);
        filter: blur(0);
        opacity: 1;
      }

      ${StyledInActiveContent} {
        transform: translateY(150%);
        filter: blur(10px);
        opacity: 0;
      }
    }
  }

  ${({ active, minimal, theme, color }: IReqoreButtonStyle) =>
    active &&
    css`
      background-color: ${color
        ? changeLightness(color, 0.045)
        : changeLightness(getButtonMainColor(theme, color), 0.16)};
      color: ${color ? getReadableColorFrom(color) : getReadableColor(theme, undefined, undefined)};
      border-color: ${minimal
        ? undefined
        : color
        ? darken(0.2, color)
        : changeLightness(getButtonMainColor(theme, color), 0.34)};

      .reqore-icon {
        transform: scale(1);
      }
    `}

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus,
  &:active {
    outline: none;
  }

  &:focus {
    border-color: ${({ minimal, theme, color }) =>
      minimal ? undefined : changeLightness(getButtonMainColor(theme, color), 0.4)};
  }
`;

const ReqoreButton = forwardRef(
  (
    {
      icon,
      size = 'normal',
      minimal,
      children,
      tooltip,
      tooltipPlacement,
      className,
      fluid,
      fixed,
      intent,
      active,
      flat,
      rightIcon,
      color,
      ...rest
    }: IReqoreButtonProps,
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);
    const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

    usePopover({
      targetElement: combinedRef.current,
      content: tooltip,
      placement: tooltipPlacement,
      show: !!tooltip,
    });

    // If color or intent was specified, set the color
    const customColor = intent ? theme.intents[intent] : color;

    return (
      <StyledButton
        {...rest}
        ref={combinedRef}
        fluid={fluid}
        fixed={fixed}
        minimal={minimal}
        size={size}
        color={customColor}
        flat={flat}
        active={active}
        className={`${className || ''} reqore-control reqore-button`}
        tabIndex={1}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            margin={children || rightIcon ? 'right' : undefined}
            size={`${TEXT_FROM_SIZE[size]}px`}
          />
        )}
        {children && (
          <StyledLabel>
            <StyledActiveContent>{children}</StyledActiveContent>
            <StyledInActiveContent>{children}</StyledInActiveContent>
            <StyledInvisibleContent>{children}</StyledInvisibleContent>
          </StyledLabel>
        )}
        {rightIcon && (
          <ReqoreIcon
            icon={rightIcon}
            margin={children ? 'left' : undefined}
            size={`${TEXT_FROM_SIZE[size]}px`}
          />
        )}
      </StyledButton>
    );
  }
);

export default ReqoreButton;
