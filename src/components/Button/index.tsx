import React, { forwardRef, memo, useCallback, useContext } from 'react';
import styled, { css } from 'styled-components';
import {
  ICON_FROM_SIZE,
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
  IWithReqoreSize,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreTextEffect, StyledEffect, StyledTextEffect } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreSpacer } from '../Spacer';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';

export type TReqoreBadge = string | number | IReqoreTagProps;

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
  badge?: TReqoreBadge | TReqoreBadge[];
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
  text-align: left;
`;

export const StyledActiveContent = styled.span`
  position: absolute;
  transform: translateY(-150%);
  opacity: 0;
  transition: all 0.2s ease-out;
  filter: blur(10px);

  ${({ wrap }) =>
    !wrap
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        `
      : css`
          word-break: break-word;
        `}
`;

export const StyledInActiveContent = styled.span`
  position: absolute;
  transform: translateY(0);
  transition: all 0.2s ease-out;

  ${({ wrap }) =>
    !wrap
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        `
      : css`
          word-break: break-word;
        `}
`;

export const StyledInvisibleContent = styled.span`
  visibility: hidden;
  position: relative;
  overflow: hidden;

  ${({ wrap }) =>
    !wrap
      ? css`
          white-space: nowrap;
        `
      : css`
          word-break: break-word;
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

  min-height: ${({ size, flat }) => (flat ? SIZE_TO_PX[size] : SIZE_TO_PX[size] - 2)}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  max-width: ${({ maxWidth }) => maxWidth || undefined};

  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};

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

  ${({ readOnly, animate, active }) =>
    !readOnly && !active
      ? css`
          &:not(:disabled) {
            ${ScaleIconOnHover}

            cursor: pointer;
            transition: all 0.2s ease-out;

            &:active {
              transform: translateY(2px);
            }

            &:hover,
            &:active,
            &:focus {
              background-color: ${({ theme, color, minimal }: IReqoreButtonStyle) =>
                minimal ? `#00000030` : changeLightness(getButtonMainColor(theme, color), 0.05)};
              color: ${({ theme, color, minimal }) =>
                getReadableColor(
                  { main: minimal ? '#00000030' : getButtonMainColor(theme, color) },
                  undefined,
                  undefined
                )};
              border-color: ${({ flat, theme, color }) =>
                flat ? undefined : changeLightness(getButtonMainColor(theme, color), 0.1)};

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
      : readOnly
      ? css`
          ${ReadOnlyElement};
        `
      : undefined}

  ${({ active, flat, theme, color }: IReqoreButtonStyle) =>
    active &&
    css`
      cursor: pointer;
      background-color: ${changeLightness(getButtonMainColor(theme, color), 0.1)};
      color: ${getReadableColor({ main: getButtonMainColor(theme, color) }, undefined, undefined)};
      border-color: ${flat ? undefined : changeLightness(getButtonMainColor(theme, color), 0.175)};

      &:hover,
      &:active,
      &:focus {
        border-color: ${flat
          ? undefined
          : changeLightness(getButtonMainColor(theme, color), 0.275)};
      }

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
  min-width: ${({ size }) => ICON_FROM_SIZE[size]}px;
  flex: 1;
  flex-shrink: 0;
  padding: 4px 0;
  min-height: ${({ size, flat }) => (flat ? SIZE_TO_PX[size] : SIZE_TO_PX[size] - 2)}px;
  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size }) => SIZE_TO_PX[size]}px;
        `
      : null}
`;

export interface IReqoreButtonBadgeProps extends IWithReqoreSize {
  color?: string;
  content?: TReqoreBadge | TReqoreBadge[];
}

export const ButtonBadge = memo((props: IReqoreButtonBadgeProps) => {
  const renderTag = useCallback(
    ({ size, color, content, key }: IReqoreButtonBadgeProps & { key: number }) => (
      <ReqoreTag
        key={key}
        size={getOneLessSize(size)}
        badge
        color={color ? `${color}70` : undefined}
        {...(typeof content === 'string' || typeof content === 'number'
          ? { label: content }
          : content)}
      />
    ),
    [props]
  );

  // If the content is a list
  if (Array.isArray(props.content)) {
    return (
      <>
        <ReqoreSpacer width={PADDING_FROM_SIZE[props.size]} />
        <ReqoreTagGroup hasBottomMargin={false}>
          {props.content.map((badge, index) => renderTag({ ...props, content: badge, key: index }))}
        </ReqoreTagGroup>
      </>
    );
  }

  return (
    <>
      <ReqoreSpacer width={PADDING_FROM_SIZE[props.size]} />
      {renderTag({ ...props, key: 0 })}
    </>
  );
});

const ReqoreButton = memo(
  forwardRef<HTMLButtonElement, IReqoreButtonProps>(
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
        effect,
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
      const customColor = intent ? theme.main : changeLightness(theme.main, 0.07);
      const _flat = minimal ? flat : flat !== false;
      const color = customColor
        ? minimal
          ? getReadableColor(theme, undefined, undefined, true, theme.originalMain)
          : getReadableColorFrom(customColor, true)
        : getReadableColor(theme, undefined, undefined, true);

      return (
        <StyledButton
          {...rest}
          effect={{
            interactive: !readOnly && !rest.disabled,
            ...effect,
          }}
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
          <StyledButtonContent size={size} wrap={wrap} description={description} flat={_flat}>
            {icon && (
              <>
                <ReqoreIcon icon={icon} size={size} />
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
                {badge && wrap ? <ButtonBadge content={badge} size={size} color={color} /> : null}
              </StyledAnimatedTextWrapper>
            )}
            {badge && !wrap ? <ButtonBadge content={badge} size={size} color={color} /> : null}
            {rightIcon && (
              <>
                {children || badge ? <ReqoreSpacer width={PADDING_FROM_SIZE[size]} /> : null}
                <ReqoreIcon icon={rightIcon} size={size} style={{ marginLeft: 'auto' }} />
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
