import { size } from 'lodash';
import { rgba } from 'polished';
import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  CONTROL_TEXT_FROM_SIZE,
  ICON_FROM_SIZE,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { alignToFlexAlign, getOneLessSize } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreEffect } from '../../hooks/useReqoreEffect';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import {
  ActiveIconScale,
  DisabledElement,
  InactiveIconScale,
  ReadOnlyElement,
  ScaleIconOnHover,
  StyledActiveContent,
  StyledContent,
  StyledInActiveContent,
  StyledInvisibleContent,
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
import {
  IReqoreEffect,
  ReqoreTextEffect,
  StyledEffect,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreHorizontalSpacer, ReqoreSpacer } from '../Spacer';
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
  animated?: boolean;

  compact?: boolean;
  verticalPadding?: TSizes;

  rightIcon?: IReqoreIconName;
  customTheme?: IReqoreCustomTheme;
  wrap?: boolean;
  badge?: TReqoreBadge | TReqoreBadge[];

  description?: string | number;
  maxWidth?: string;
  textAlign?: 'left' | 'center' | 'right';
  iconsAlign?: 'center' | 'sides';
  iconColor?: TReqoreEffectColor;
  leftIconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  leftIconProps?: IReqoreIconProps;
  rightIconProps?: IReqoreIconProps;
  labelEffect?: IReqoreEffect;
  descriptionEffect?: IReqoreEffect;
  label?: React.HTMLAttributes<HTMLButtonElement>['children'];
  as?: string | React.ElementType;
  grow?: 0 | 1 | 2 | 3 | 4;
  shrink?: 0 | 1 | 2 | 3 | 4;
  rounded?: boolean;

  pill?: boolean;
  circle?: boolean;
}

export interface IReqoreButtonStyle extends Omit<IReqoreButtonProps, 'intent'> {
  theme: IReqoreTheme;
  animate?: boolean;
  color?: TReqoreHexColor;
}

const getButtonMainColor = (theme: IReqoreTheme, color?: TReqoreHexColor) => {
  if (color) {
    return color;
  }

  return theme.main;
};

export const StyledAnimatedTextWrapper = styled.span`
  min-width: 5px;
  overflow: hidden;
  position: relative;
  text-align: ${({ textAlign }) => textAlign};
  display: flex;
  flex-flow: column;
  align-items: ${({ textAlign }) => alignToFlexAlign(textAlign)};
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
    !flat ? `1px solid ${changeLightness(getButtonMainColor(theme, color), 0.2)}` : 0};
  padding: ${({ size, compact, verticalPadding }) =>
    `${verticalPadding ? PADDING_FROM_SIZE[verticalPadding] : 0}px ${
      compact ? PADDING_FROM_SIZE[size] / 2 : PADDING_FROM_SIZE[size]
    }px`};
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;

  min-height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  max-width: ${({ maxWidth, fluid, fixed }) => maxWidth || (fluid && !fixed ? '100%' : undefined)};

  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size, verticalPadding }) =>
            SIZE_TO_PX[size] + (verticalPadding ? PADDING_FROM_SIZE[verticalPadding] * 2 : 0)}px;
        `
      : null}

  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  flex-shrink: ${({ shrink }) => shrink};
  flex-grow: ${({ grow }) => grow};
  align-self: ${({ fixed, fluid }) => (fixed ? 'flex-start' : fluid ? 'stretch' : undefined)};

  border-radius: ${({ size, rounded, pill, circle }) =>
    rounded === false
      ? undefined
      : circle
      ? 9999
      : RADIUS_FROM_SIZE[size] * (pill ? PILL_RADIUS_MODIFIER : 1)}px;

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
              transform: scale(0.97);
            }

            &:hover,
            &:active,
            &:focus {
              background-color: ${({ theme, color, minimal }: IReqoreButtonStyle) =>
                minimal
                  ? rgba(changeLightness(getButtonMainColor(theme, color), 0.05), 0.2)
                  : changeLightness(getButtonMainColor(theme, color), 0.05)};
              color: ${({ theme, color, minimal }) =>
                getReadableColor(
                  { main: minimal ? theme.originalMain : getButtonMainColor(theme, color) },
                  undefined,
                  undefined
                )};
              border-color: ${({ flat, theme, color }) =>
                flat ? undefined : changeLightness(getButtonMainColor(theme, color), 0.35)};

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

  ${({ active, flat, theme, color }: IReqoreButtonStyle) => {
    if (active) {
      return css`
        cursor: pointer;
        background-color: ${changeLightness(getButtonMainColor(theme, color), 0.1)};
        color: ${getReadableColor(
          { main: changeLightness(getButtonMainColor(theme, color), 0.1) },
          undefined,
          undefined
        )};
        border-color: ${flat
          ? undefined
          : changeLightness(getButtonMainColor(theme, color), 0.175)};

        &:hover,
        &:active,
        &:focus {
          border-color: ${flat
            ? undefined
            : changeLightness(getButtonMainColor(theme, color), 0.275)};
        }

        ${ActiveIconScale}
      `;
    }
  }}

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

  .reqore-button-description {
    padding-bottom: ${({ size }) => PADDING_FROM_SIZE[size] / 2}px;
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
  padding: ${({ size, flat }) => PADDING_FROM_SIZE[size] / 2 - (!flat ? 1 : 0)}px 0;

  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size }) => SIZE_TO_PX[size]}px;
        `
      : null}
`;

export interface IReqoreButtonBadgeProps extends IWithReqoreSize {
  color?: TReqoreEffectColor;
  theme?: IReqoreTheme;
  content?: TReqoreBadge | TReqoreBadge[];
  wrap?: boolean;
  wrapGroup?: boolean;
  compact?: boolean;
}

export const ButtonBadge = memo(({ wrapGroup, compact, ...props }: IReqoreButtonBadgeProps) => {
  const renderTag = useCallback(
    ({ size, color, theme, content, key }: IReqoreButtonBadgeProps & { key: number }) => (
      <ReqoreTag
        key={key}
        size={getOneLessSize(size)}
        asBadge
        color={color}
        customTheme={theme}
        className='reqore-button-badge'
        labelAlign='center'
        minimal={!(content as IReqoreTagProps)?.effect?.gradient}
        {...(typeof content === 'string' || typeof content === 'number'
          ? { label: content }
          : content)}
      />
    ),
    [props]
  );

  const content = Array.isArray(props.content) ? props.content : [props.content];

  const leftBadges = content.filter(
    (badge) => typeof badge === 'string' || typeof badge === 'number' || !badge?.align
  );
  const rightBadges = content.filter(
    (badge) => typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right'
  );
  const middleBadges = content.filter(
    (badge) => typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'center'
  );

  const buildContent = (badge: TReqoreBadge) => {
    if (typeof badge === 'string' || typeof badge === 'number') {
      return { label: badge, align: undefined };
    }

    return { ...badge, align: undefined };
  };

  return (
    <>
      <ReqoreSpacer
        width={props.wrap ? undefined : PADDING_FROM_SIZE[props.size] / (compact ? 2 : 1)}
        height={!props.wrap ? undefined : PADDING_FROM_SIZE[props.size] / 2}
      />
      {size(leftBadges) ? (
        <ReqoreTagGroup wrap={wrapGroup} align='left'>
          {leftBadges.map((badge, index) =>
            renderTag({ ...props, content: buildContent(badge), key: index })
          )}
        </ReqoreTagGroup>
      ) : null}
      {size(middleBadges) ? (
        <ReqoreTagGroup wrap={wrapGroup} fluid align='center'>
          {middleBadges.map((badge, index) =>
            renderTag({ ...props, content: buildContent(badge), key: index })
          )}
        </ReqoreTagGroup>
      ) : null}
      {size(rightBadges) ? (
        <ReqoreTagGroup wrap={wrapGroup} align='right'>
          {rightBadges.map((badge, index) =>
            renderTag({ ...props, content: buildContent(badge), key: index })
          )}
        </ReqoreTagGroup>
      ) : null}
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
        labelEffect,
        descriptionEffect,
        leftIconColor,
        rightIconColor,
        iconColor,
        iconsAlign,
        leftIconProps,
        rightIconProps,
        label,
        compact,
        as,
        animated,
        ...rest
      }: IReqoreButtonProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const [buttonRef, setButtonRef] = useState<HTMLButtonElement>(undefined);
      const animations = useReqoreProperty('animations');
      const theme = useReqoreTheme('main', customTheme, intent);
      const fixedEffect = useReqoreEffect('buttons', theme, effect);

      /* A custom hook that is used to add a tooltip to the button. */
      useTooltip(buttonRef, tooltip);

      // If color or intent was specified, set the color
      const customColor = intent ? theme.main : changeLightness(theme.main, 0.07);
      const _flat = minimal ? flat : flat !== false;
      const color: TReqoreHexColor = customColor
        ? minimal
          ? getReadableColor(theme, undefined, undefined, true, theme.originalMain)
          : getReadableColorFrom(customColor, true)
        : getReadableColor(theme, undefined, undefined, true);

      const _children = useMemo(() => label || children, [label, children]);
      const hasLeftIcon = icon || leftIconProps?.image;
      const hasRightIcon = rightIcon || rightIconProps?.image;

      const hasRightAlignedBadge = useMemo(() => {
        if (Array.isArray(badge)) {
          return badge.some(
            (badge) =>
              typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right'
          );
        }

        return typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right';
      }, [badge]);

      const animate = animated === true || (animations.buttons && animated !== false);

      return (
        <StyledButton
          {...rest}
          effect={{
            interactive: !readOnly && !rest.disabled,
            ...fixedEffect,
            gradient: intent ? undefined : fixedEffect?.gradient,
          }}
          tabindex={rest.disabled ? -1 : 0}
          as={as || 'button'}
          theme={theme}
          ref={(ref) => {
            targetRef.current = ref;
            setButtonRef(ref);
          }}
          fluid={fluid}
          fixed={fixed}
          maxWidth={maxWidth}
          minimal={minimal}
          size={size}
          color={customColor}
          animate={animate}
          flat={_flat}
          active={active}
          readOnly={readOnly}
          wrap={wrap}
          description={description}
          className={`${className || ''} reqore-control reqore-button`}
          compact={compact}
        >
          <StyledButtonContent size={size} wrap={wrap} description={description} flat={_flat}>
            {hasLeftIcon ? (
              <>
                <ReqoreIcon
                  icon={icon}
                  size={size}
                  color={leftIconColor || iconColor}
                  compact={compact}
                  {...leftIconProps}
                  style={
                    textAlign !== 'left' || iconsAlign === 'center'
                      ? {
                          marginRight: iconsAlign !== 'center' || !children ? 'auto' : undefined,
                          marginLeft:
                            iconsAlign === 'center' || (textAlign === 'center' && !_children)
                              ? 'auto'
                              : undefined,
                        }
                      : undefined
                  }
                />
                {_children || hasRightIcon ? (
                  <ReqoreSpacer width={PADDING_FROM_SIZE[size] / (compact ? 2 : 1)} />
                ) : null}
              </>
            ) : _children ? (
              <ReqoreHorizontalSpacer
                width={1}
                style={textAlign !== 'left' ? { marginRight: 'auto' } : undefined}
              />
            ) : null}
            {_children && (
              <StyledAnimatedTextWrapper
                textAlign={textAlign}
                style={
                  textAlign === 'center' && iconsAlign !== 'center' ? { margin: 'auto' } : undefined
                }
              >
                {!animate && (
                  <StyledContent
                    wrap={wrap}
                    effect={labelEffect}
                    className='reqore-button-text-content'
                  >
                    {_children}
                  </StyledContent>
                )}
                {animate && (
                  <StyledActiveContent
                    wrap={wrap}
                    effect={labelEffect}
                    className='reqore-button-text-content reqore-animated'
                  >
                    {_children}
                  </StyledActiveContent>
                )}
                {animate && (
                  <StyledInActiveContent
                    wrap={wrap}
                    effect={labelEffect}
                    className='reqore-button-text-content reqore-animated'
                  >
                    {_children}
                  </StyledInActiveContent>
                )}
                {animate && (
                  <StyledInvisibleContent
                    wrap={wrap}
                    effect={labelEffect}
                    className='reqore-button-text-content reqore-animated'
                  >
                    {_children}
                  </StyledInvisibleContent>
                )}
                {(badge || badge === 0) && wrap ? (
                  <ButtonBadge content={badge} size={size} theme={theme} wrap />
                ) : null}
              </StyledAnimatedTextWrapper>
            )}
            {(badge || badge === 0) && !wrap ? (
              <ButtonBadge
                content={badge}
                size={size}
                theme={theme}
                compact={compact}
                wrapGroup={false}
                wrap={false}
              />
            ) : null}
            {!hasRightIcon ? (
              _children ? (
                <ReqoreHorizontalSpacer
                  width={1}
                  style={
                    textAlign !== 'right' && !hasRightAlignedBadge
                      ? { marginLeft: 'auto' }
                      : undefined
                  }
                />
              ) : null
            ) : (
              <>
                {_children || badge ? (
                  <ReqoreSpacer width={PADDING_FROM_SIZE[size] / (compact ? 2 : 1)} />
                ) : null}
                <ReqoreIcon
                  icon={rightIcon}
                  size={size}
                  color={rightIconColor || iconColor}
                  compact={compact}
                  {...rightIconProps}
                  style={
                    textAlign !== 'right' || iconsAlign === 'center'
                      ? {
                          marginLeft:
                            !hasRightAlignedBadge && (iconsAlign !== 'center' || !_children)
                              ? 'auto'
                              : undefined,
                          marginRight:
                            iconsAlign === 'center' || (textAlign === 'center' && !_children)
                              ? 'auto'
                              : undefined,
                        }
                      : undefined
                  }
                />
              </>
            )}
          </StyledButtonContent>

          {description && (
            <ReqoreTextEffect
              className='reqore-button-description'
              effect={{
                textSize: getOneLessSize(size),
                weight: 'light',
                color: `${color}90`,
                textAlign,
                ...descriptionEffect,
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
