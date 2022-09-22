import { rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import {
  ActiveIconScale,
  DisabledElement,
  InactiveIconScale,
  ReadOnlyElement,
  ScaleIconOnHover,
} from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    IReqoreDisabled,
    IReqoreIntent,
    IReqoreReadOnly {
  icon?: IReqoreIconName;
  size?: TSizes;
  minimal?: boolean;
  tooltip?: TReqoreTooltipProp;
  fluid?: boolean;
  fixed?: boolean;
  active?: boolean;
  flat?: boolean;
  rightIcon?: IReqoreIconName;
  customTheme?: IReqoreCustomTheme;
  wrap?: boolean;
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

export const StyledAnimatedTextWrapper = styled.span`
  overflow: hidden;
  position: relative;
  padding: 4px 0;
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
  text-align: left;
  align-items: center;
  margin: 0;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  border: ${({ theme, minimal, color, flat }) =>
    !minimal && !flat ? `1px solid ${changeLightness(getButtonMainColor(theme, color), 0.05)}` : 0};
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  min-height: ${({ size }) => SIZE_TO_PX[size]}px;

  ${({ wrap }) =>
    wrap &&
    css`
      max-height: ${({ size }) => SIZE_TO_PX[size]}px;
    `}

  min-width: ${({ size }) => SIZE_TO_PX[size]}px;

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 auto' : '0 0 auto')};

  border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px;

  background-color: ${({ minimal, color }) => {
    if (minimal) {
      if (color) {
        return rgba(color, 0.3);
      }
      return 'transparent';
    }

    return color;
  }};

  color: ${({ theme, color, minimal }) =>
    color
      ? minimal
        ? getReadableColor(theme, undefined, undefined, true)
        : getReadableColorFrom(color, true)
      : getReadableColor(theme, undefined, undefined, true)};

  ${InactiveIconScale}

  ${({ readOnly }) =>
    !readOnly
      ? css`
          &:not(:disabled) {
            ${ScaleIconOnHover}

            cursor: pointer;
            transition: all 0.2s ease-out;

            &:active {
              transform: scale(0.95);
            }

            &:hover,
            &:focus {
              background-color: ${({ theme, color }: IReqoreButtonStyle) =>
                changeLightness(getButtonMainColor(theme, color), 0.05)};
              color: ${({ theme, color }) =>
                getReadableColor({ main: getButtonMainColor(theme, color) }, undefined, undefined)};
              border-color: ${({ minimal, theme, color }) =>
                minimal ? undefined : changeLightness(getButtonMainColor(theme, color), 0.1)};

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
        `
      : css`
          ${ReadOnlyElement};
        `}

  ${({ active, minimal, theme, color }: IReqoreButtonStyle) =>
    active &&
    css`
      background-color: ${changeLightness(getButtonMainColor(theme, color), 0.16)};
      color: ${getReadableColor({ main: getButtonMainColor(theme, color) }, undefined, undefined)};
      border-color: ${minimal
        ? undefined
        : changeLightness(getButtonMainColor(theme, color), 0.075)};

      ${ActiveIconScale}
    `}

  &:disabled {
    ${DisabledElement};
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
      className,
      fluid,
      fixed,
      intent,
      active,
      flat,
      rightIcon,
      customTheme,
      wrap = true,
      readOnly,
      ...rest
    }: IReqoreButtonProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme: IReqoreTheme = useReqoreTheme('main', customTheme, intent);

    /* A custom hook that is used to add a tooltip to the button. */
    useTooltip(targetRef.current, tooltip);

    // If color or intent was specified, set the color
    const customColor = theme.main;

    return (
      <StyledButton
        {...rest}
        theme={theme}
        ref={targetRef}
        fluid={fluid}
        fixed={fixed}
        minimal={minimal}
        size={size}
        color={customColor}
        flat={flat}
        active={active}
        readOnly={readOnly}
        className={`${className || ''} reqore-control reqore-button`}
      >
        {icon && (
          <ReqoreIcon
            icon={icon}
            margin={children || rightIcon ? 'right' : undefined}
            size={`${TEXT_FROM_SIZE[size]}px`}
          />
        )}
        {children && (
          <StyledAnimatedTextWrapper>
            <StyledActiveContent wrap={wrap}>{children}</StyledActiveContent>
            <StyledInActiveContent wrap={wrap}>{children}</StyledInActiveContent>
            <StyledInvisibleContent wrap={wrap}>{children}</StyledInvisibleContent>
          </StyledAnimatedTextWrapper>
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
