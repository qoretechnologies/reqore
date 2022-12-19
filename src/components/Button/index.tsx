import React, { forwardRef, memo, useContext } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import ReqoreContext from '../../context/ReqoreContext';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
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
  IWithReqoreEffect,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreTextEffect, StyledEffect, StyledTextEffect } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreSpacer } from '../Spacer';
import ReqoreTag, { IReqoreTagProps } from '../Tag';

export interface IReqoreButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    IReqoreDisabled,
    IReqoreIntent,
    IReqoreReadOnly,
    IWithReqoreEffect {
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
  badge?: string | number | IReqoreTagProps;
  description?: string | number;
  maxWidth?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface IReqoreButtonStyle extends Omit<IReqoreButtonProps, 'intent'> {
  theme: IReqoreTheme;
  animate?: boolean;
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
  text-align: left;
`;

export const StyledActiveContent = styled.span`
  position: absolute;
  transform: translateY(-150%);
  opacity: 0;
  transition: all 0.2s ease-out;
  filter: blur(10px);

  ${({ wrap }) =>
    !wrap &&
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
    !wrap &&
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
    !wrap &&
    css`
      white-space: nowrap;
    `}
`;

export const StyledButton = styled(StyledEffect)<IReqoreButtonStyle>`
  display: flex;
  flex-flow: column;
  justify-content: center;
  margin: 0;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  border: ${({ theme, color, flat }) =>
    !flat ? `1px solid ${changeLightness(getButtonMainColor(theme, color), 0.05)}` : 0};
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  min-height: ${({ size }) => SIZE_TO_PX[size]}px;

  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  max-width: ${({ maxWidth }) => maxWidth || undefined};

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 auto' : '0 0 auto')};

  border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px;

  background-color: ${({ minimal, color }) => {
    if (minimal) {
      return 'transparent';
    }

    return color;
  }};

  color: ${({ theme, color, minimal }) =>
    color
      ? minimal
        ? getReadableColor(theme, undefined, undefined, true, theme.originalMain)
        : getReadableColorFrom(color, true)
      : getReadableColor(theme, undefined, undefined, true)};

  ${InactiveIconScale}

  ${({ readOnly, animate }) =>
    !readOnly
      ? css`
          &:not(:disabled) {
            ${ScaleIconOnHover}

            cursor: pointer;
            transition: all 0.2s ease-out;

            &:active {
              transform: translateY(2px);
            }

            &:hover,
            &:focus {
              background-color: ${({ theme, color }: IReqoreButtonStyle) =>
                changeLightness(getButtonMainColor(theme, color), 0.05)};
              color: ${({ theme, color }) =>
                getReadableColor({ main: getButtonMainColor(theme, color) }, undefined, undefined)};
              border-color: ${({ minimal, theme, color }) =>
                minimal ? undefined : changeLightness(getButtonMainColor(theme, color), 0.1)};
              box-shadow: ${({ theme, color, effect }) => {
                return `0 0 0 2px ${
                  effect?.gradient
                    ? Object.values(effect.gradient.colors)[0]
                    : changeLightness(getButtonMainColor(theme, color), 0.1)
                }`;
              }};

              ${animate &&
              css`
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
              `}
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

  ${StyledTextEffect} {
    padding-bottom: ${({ size }) => PADDING_FROM_SIZE[getOneLessSize(size)]}px;
  }
`;

export const StyledButtonContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  flex: 1;
  flex-shrink: 0;
  min-height: ${({ size }) => SIZE_TO_PX[size]}px;
  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size }) => SIZE_TO_PX[size]}px;
        `
      : null}
`;

const ReqoreButton = memo(
  forwardRef(
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
        wrap,
        readOnly,
        badge,
        description,
        maxWidth,
        textAlign = 'left',
        ...rest
      }: IReqoreButtonProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const { animations } = useContext(ReqoreContext);
      const theme: IReqoreTheme = useReqoreTheme('main', customTheme, intent);

      /* A custom hook that is used to add a tooltip to the button. */
      useTooltip(targetRef.current, tooltip);

      // If color or intent was specified, set the color
      const customColor = theme.main;
      const _flat = minimal ? flat : flat !== false;
      const color = customColor
        ? minimal
          ? getReadableColor(theme, undefined, undefined, true, theme.originalMain)
          : getReadableColorFrom(customColor, true)
        : getReadableColor(theme, undefined, undefined, true);

      const renderBadge = () => (
        <>
          <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
          <ReqoreTag
            size={getOneLessSize(size)}
            badge
            color={`${color}70`}
            {...(typeof badge === 'string' || typeof badge === 'number' ? { label: badge } : badge)}
          />
        </>
      );

      return (
        <StyledButton
          {...rest}
          as='button'
          theme={theme}
          ref={targetRef}
          fluid={fluid}
          fixed={fixed}
          maxWidth={maxWidth}
          minimal={minimal}
          size={size}
          color={customColor}
          animate={animations.buttons}
          flat={_flat}
          active={active}
          readOnly={readOnly}
          wrap={wrap}
          description={description}
          className={`${className || ''} reqore-control reqore-button`}
        >
          <StyledButtonContent size={size} wrap={wrap} description={description}>
            {icon && (
              <>
                <ReqoreIcon icon={icon} size={`${TEXT_FROM_SIZE[size]}px`} />
                {children || badge || rightIcon ? (
                  <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
                ) : null}
              </>
            )}
            {children && (
              <StyledAnimatedTextWrapper textAlign={textAlign}>
                <StyledActiveContent wrap={wrap}>{children}</StyledActiveContent>
                <StyledInActiveContent wrap={wrap}>{children}</StyledInActiveContent>
                <StyledInvisibleContent wrap={wrap}>{children}</StyledInvisibleContent>
                {badge && wrap ? renderBadge() : null}
              </StyledAnimatedTextWrapper>
            )}
            {badge && !wrap ? renderBadge() : null}
            {rightIcon && (
              <>
                {children || badge ? <ReqoreSpacer width={PADDING_FROM_SIZE[size]} /> : null}
                <ReqoreIcon
                  icon={rightIcon}
                  size={`${TEXT_FROM_SIZE[size]}px`}
                  style={{ marginLeft: 'auto' }}
                />
              </>
            )}
          </StyledButtonContent>

          {description && (
            <ReqoreTextEffect
              effect={{
                textSize: getOneLessSize(size),
                weight: 'light',
                color: `${color}90`,
                textAlign,
              }}
            >
              {description}
            </ReqoreTextEffect>
          )}
        </StyledButton>
      );
    }
  )
);

export default ReqoreButton;
