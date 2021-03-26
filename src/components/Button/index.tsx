import { Placement } from '@popperjs/core';
import { darken, lighten, rgba } from 'polished';
import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import {
  PADDING_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import {
  changeLightness,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: IReqoreIconName;
  size?: TSizes;
  minimal?: boolean;
  disabled?: boolean;
  tooltip?: string;
  tooltipPlacement?: Placement;
  fluid?: boolean;
  fixed?: boolean;
  intent?: IReqoreIntent;
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

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 500;
  border: ${({ theme, minimal, intent }) =>
    !minimal
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

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1' : undefined)};

  border-radius: 3px;

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
    transition: all 0.1s linear;

    &:hover {
      background-color: ${({ minimal, theme, intent }) =>
        intent
          ? lighten(0.0625, theme.intents[intent])
          : minimal
          ? changeLightness(getButtonMainColor(theme, intent), 0.09)
          : changeLightness(getButtonMainColor(theme, intent), 0.2)};
      color: ${({ theme, intent }) =>
        intent
          ? getReadableColorFrom(theme.intents[intent])
          : getReadableColor(theme, undefined, undefined)};
      border-color: ${({ minimal, theme, intent }) =>
        minimal
          ? undefined
          : intent
          ? darken(0.25, theme.intents[intent])
          : changeLightness(getButtonMainColor(theme, intent), 0.4)};
    }

    &:active {
      transform: scale(0.95);
    }
  }

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
      minimal
        ? undefined
        : changeLightness(getButtonMainColor(theme, intent), 0.4)};
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
        {children}
      </StyledButton>
    );
  }
);

export default ReqoreButton;
