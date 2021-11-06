import { Placement } from '@popperjs/core';
import { darken, rgba } from 'polished';
import React, { forwardRef, useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
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
}

export interface IReqoreButtonStyle extends IReqoreButtonProps {
  theme: IReqoreTheme;
}

const getButtonMainColor = (theme: IReqoreTheme, intent?: IReqoreIntent) => {
  if (intent) {
    return theme.intents[intent];
  }

  return theme.main;
};

export const StyledActiveContent = styled.span`
  position: absolute;
  transform: translateY(-150%);
  opacity: 0;
  transition: all 0.2s ease-out;
  filter: blur(10px);
`;

export const StyledInActiveContent = styled.span`
  position: absolute;
  transform: translateY(0);
  transition: all 0.2s ease-out;
`;

export const StyledInvisibleContent = styled.span`
  visibility: hidden;
  position: relative;
`;

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 400;
  position: relative;
  overflow: hidden;
  border: ${({ theme, minimal, intent, flat }) =>
    !minimal && !flat
      ? `1px solid ${
          intent
            ? darken(0.2, theme.intents[intent])
            : changeLightness(getButtonMainColor(theme, intent), 0.2)
        }`
      : 0};
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 0 auto' : '0 0 auto')};

  border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px;

  background-color: ${({ minimal, theme, intent }) => {
    if (minimal) {
      if (intent) {
        return rgba(theme.intents[intent], 0.3);
      }
      return 'transparent';
    }

    return intent ? theme.intents[intent] : changeLightness(theme.main, 0.1);
  }};

  color: ${({ theme, intent, minimal }) =>
    intent
      ? minimal
        ? getReadableColor(theme, undefined, undefined, true)
        : getReadableColorFrom(theme.intents[intent], true)
      : getReadableColor(theme, undefined, undefined, true)};

  &:not(:disabled) {
    cursor: pointer;
    transition: all 0.2s linear;

    &:active {
      transform: scale(0.95);
    }

    &:hover,
    &:focus {
      background-color: ${({ minimal, theme, intent }: IReqoreButtonStyle) =>
        intent
          ? changeLightness(theme.intents[intent], 0.09)
          : minimal
          ? changeLightness(getButtonMainColor(theme, intent), 0.15)
          : changeLightness(getButtonMainColor(theme, intent), 0.35)};
      color: ${({ theme, intent }) =>
        intent
          ? getReadableColorFrom(theme.intents[intent])
          : getReadableColor(theme, undefined, undefined)};
      border-color: ${({ minimal, theme, intent }) =>
        minimal
          ? undefined
          : intent
          ? darken(0.4, theme.intents[intent])
          : changeLightness(getButtonMainColor(theme, intent), 0.6)};

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

  ${({ active, minimal, theme, intent }: IReqoreButtonStyle) =>
    active &&
    css`
      background-color: ${intent
        ? changeLightness(theme.intents[intent], 0.025)
        : minimal
        ? changeLightness(getButtonMainColor(theme, intent), 0.07)
        : changeLightness(getButtonMainColor(theme, intent), 0.16)};
      color: ${intent
        ? getReadableColorFrom(theme.intents[intent])
        : getReadableColor(theme, undefined, undefined)};
      border-color: ${minimal
        ? undefined
        : intent
        ? darken(0.2, theme.intents[intent])
        : changeLightness(getButtonMainColor(theme, intent), 0.34)};
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
    border-color: ${({ minimal, theme, intent }) =>
      minimal ? undefined : changeLightness(getButtonMainColor(theme, intent), 0.4)};
  }

  .reqore-icon {
    transform: scale(0.85);
    transition: all 0.2s ease-out;
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
      ...rest
    }: IReqoreButtonProps,
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);

    usePopover({
      targetElement: combinedRef.current,
      content: tooltip,
      placement: tooltipPlacement,
      show: !!tooltip,
    });

    return (
      <StyledButton
        {...rest}
        ref={combinedRef}
        fluid={fluid}
        fixed={fixed}
        minimal={minimal}
        size={size}
        intent={intent}
        flat={flat}
        active={active}
        className={`${className || ''} reqore-control reqore-button`}
        tabIndex={1}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            margin={children ? 'right' : undefined}
            size={`${TEXT_FROM_SIZE[size]}px`}
          />
        )}
        <span>
          <StyledActiveContent>{children}</StyledActiveContent>
          <StyledInActiveContent>{children}</StyledInActiveContent>
          <StyledInvisibleContent>{children}</StyledInvisibleContent>
        </span>
      </StyledButton>
    );
  }
);

export default ReqoreButton;
