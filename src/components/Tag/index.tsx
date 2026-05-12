import classNames from 'classnames';
import _size from 'lodash/size';
import { rgba, saturate, tint } from 'polished';
import React, { forwardRef, HTMLAttributes, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePopover, useReqoreTheme } from '../..';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  BADGE_RADIUS_FROM_SIZE,
  BADGE_SIZE_TO_PX,
  CONTROL_TEXT_FROM_SIZE,
  TAG_HORIZONTAL_PADDING_FROM_SIZE,
  TAG_ICON_FROM_SIZE,
  TAG_RADIUS_FROM_SIZE,
  TAG_SIZE_TO_PX,
  TAG_TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getReadableColor,
  getReadableColorFrom,
  isAchromatic,
} from '../../helpers/colors';
import { ActiveIconScale, InactiveIconScale } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreLoading,
  IWithReqoreMinimal,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import {
  IReqoreEffect,
  StyledEffect,
  StyledTextEffect,
  TReqoreColor,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreTagAction
  extends IWithReqoreTooltip,
    IReqoreDisabled,
    IReqoreIntent,
    HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  show?: boolean | 'hover';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreCustomTagProps
  extends IWithReqoreTooltip,
    IReqoreDisabled,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreEffect,
    IWithReqoreLoading,
    IWithReqoreFlat,
    IWithReqoreCustomTheme {
  fixed?: boolean | 'key' | 'label';
  align?: 'left' | 'right' | 'center';
  size?: TSizes;
  label?: string | number;
  labelKey?: string | number;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  icon?: IReqoreIconName;
  leftIconProps?: IReqoreIconProps;
  rightIcon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  leftIconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  rightIconProps?: IReqoreIconProps;
  color?: TReqoreEffectColor;
  actions?: IReqoreTagAction[];
  width?: string;
  asBadge?: boolean;
  intent?: TReqoreIntent;
  wrap?: boolean;
  rounded?: boolean;
  /**
   * Override the size used to derive the tag's border-radius. Defaults to `size`.
   */
  radiusSize?: TSizes;
  labelAlign?: 'left' | 'right' | 'center';
  labelEffect?: IReqoreEffect;
  labelKeyAlign?: 'left' | 'right' | 'center';
  labelKeyEffect?: IReqoreEffect;
  as?: string | React.ElementType;
  compact?: boolean;
}
export interface IReqoreTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'>,
    IReqoreCustomTagProps {}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
  color?: TReqoreColor;
}

export const StyledTag = styled(StyledEffect)<IReqoreTagStyle>`
  display: inline-flex;
  justify-content: center;
  flex-shrink: 0;
  align-items: stretch;
  font-family: system-ui;
  overflow: hidden;
  vertical-align: middle;
  font-size: ${({ size }) => TAG_TEXT_FROM_SIZE[size]}px;
  line-height: 1.1;

  min-width: ${({ size, asBadge }) => (asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size])}px;
  max-width: ${({ fixed }) => (fixed !== true ? '100%' : undefined)};
  flex: ${({ fluid, fixed }) => (fixed === true ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  justify-self: ${({ fixed, fluid }) =>
    fixed === true ? 'flex-start' : fluid ? 'stretch' : undefined};
  border: ${({ theme, color, flat = true }) =>
    !flat ? `1px solid ${changeLightness(color || theme.main, 0.2)}` : 0};
  border-radius: ${({ asBadge, size, radiusSize, rounded }) =>
    rounded === false
      ? undefined
      : asBadge
      ? `${BADGE_RADIUS_FROM_SIZE[radiusSize || size]}px`
      : `${TAG_RADIUS_FROM_SIZE[radiusSize || size]}px`};
  width: ${({ width }) => width || undefined};
  transition: all 0.2s ease-out;

  ${({ align }) => {
    if (align === 'left') {
      return css`
        margin-right: auto;
      `;
    }

    if (align === 'right') {
      return css`
        margin-left: auto;
      `;
    }

    if (align === 'center') {
      return css`
        margin: 0 auto;
      `;
    }
  }}

  ${InactiveIconScale};

  ${({ wrap, hasWidth }) =>
    wrap || hasWidth
      ? css`
          min-height: ${({ size, asBadge }) =>
            asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size]}px;
        `
      : css`
          height: ${({ size, asBadge }) =>
            asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size]}px;
        `}

  ${({ theme, color, labelKey, minimal }: IReqoreTagStyle) => {
    return css`
      background-color: ${minimal
        ? color
          ? rgba(color, 0.2)
          : rgba(changeLightness('#000000', 0.05), 0.3)
        : color || changeLightness(theme.main, 0.1)};
      color: ${minimal && color && color !== 'transparent' && !isAchromatic(color)
        ? saturate(1, tint(0.8, color))
        : color && color !== 'transparent'
        ? getReadableColorFrom(color)
        : getReadableColorFrom(changeLightness(theme.main, 0.1))};

      ${StyledTagKeyWrapper} {
        background-color: ${labelKey ? rgba('#000000', minimal ? 0.1 : 0.3) : undefined};
      }
    `;
  }}

  ${({ theme, color, interactive, minimal, effect }) =>
    interactive
      ? css`
          cursor: pointer;
          &:hover {
            .reqore-tag-content,
            .reqore-tag-key-content {
              ${ActiveIconScale}
            }

            ${!effect?.gradient &&
            css`
              background-color: ${minimal
                ? color
                  ? rgba(color, 0.5)
                  : rgba(changeLightness('#000000', 0.05), 0.4)
                : color || changeLightness(theme.main, 0.15)};
              color: ${minimal
                ? getReadableColor(theme, undefined, undefined, false, theme.originalMain)
                : color
                ? getReadableColorFrom(color)
                : getReadableColor(theme, undefined, undefined)};
            `}
          }
        `
      : undefined}


  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    `}

  &:not(:hover) {
    .reqore-tag-action-hidden {
      display: none;
    }
  }

  &:focus,
  &:active {
    outline: 2px solid ${({ theme, color }) => changeLightness(color || theme.main, 0.25)};
    outline-offset: -2px;
  }
`;

const StyledTagKeyWrapper = styled.span<{ size: TSizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: ${({ hasKey, fixed }) => (hasKey ? (fixed === 'key' ? '0 0 auto' : 1) : undefined)};
  flex-shrink: 0;
  min-height: 100%;
  padding-left: ${({ size, hasIcon }) => hasIcon && `${TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px`};
  padding-right: ${({ size, padOnRight }) =>
    padOnRight && `${TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px`};
`;

const StyledTagContentWrapper = styled.span<{ size: TSizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: ${({ fixed }) => (fixed === 'label' ? '0 0 auto' : 1)};
  flex-shrink: 0;
  min-height: 100%;
`;

const StyledTagContent = styled(StyledTextEffect)<{ size: TSizes }>`
  padding: 4px ${({ size }) => TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px;
  min-height: 100%;
  display: flex;
  align-items: center;
  flex: 1;

  ${({ labelAlign }) => css`
    justify-content: ${labelAlign === 'left'
      ? 'flex-start'
      : labelAlign === 'right'
      ? 'flex-end'
      : 'center'};
  `}

  ${({ wrap, hasWidth }) =>
    !wrap && !hasWidth
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `
      : css`
          word-break: break-word;
        `}
`;

const StyledTagContentKey = styled(StyledTagContent)`
  flex: 1;

  ${({ wrap, hasWidth }) =>
    !wrap && !hasWidth
      ? undefined
      : css`
          word-break: break-word;
        `}
`;

const StyledButtonWrapper = styled.span<IReqoreTagStyle>`
  flex-shrink: 0;
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;
  width: ${({ size }) => BADGE_SIZE_TO_PX[size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;

  ${({ color, effect }) => css`
    .reqore-icon {
      transform: scale(0.85);
    }
    &:hover {
      cursor: pointer;
      background-color: ${color && !effect?.gradient
        ? changeLightness(color, 0.09)
        : rgba('#000000', 0.2)};

      .reqore-icon {
        transform: scale(1);
      }
    }
  `}
`;

const ReqoreTag = forwardRef<HTMLSpanElement, IReqoreTagProps>(
  (
    {
      tooltip,
      label,
      labelKey,
      icon,
      rightIcon,
      className,
      onClick,
      size = 'normal',
      onRemoveClick,
      actions,
      asBadge,
      intent,
      color,
      minimal,
      customTheme,
        inheritCustomTheme,
      wrap = false,
      width,
      leftIconColor,
      rightIconColor,
      iconColor,
      labelKeyAlign = 'left',
      labelAlign,
      labelEffect,
      labelKeyEffect,
      leftIconProps,
      rightIconProps,
      loading,
      loadingIconType,
      compact,
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const theme: IReqoreTheme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);

    // If color or intent was specified, set the color
    const getCustomColor = useCallback(
      (itemIntent?: TReqoreIntent): TReqoreHexColor => {
        const customColor: TReqoreHexColor = itemIntent
          ? theme.intents[itemIntent]
          : getColorFromMaybeString(theme, color);

        if (customColor?.length === 9) {
          return customColor;
        }

        return customColor;
      },
      [theme, color]
    );

    const leftIcon: IReqoreIconName = loading
      ? `Loader${loadingIconType || ''}Line`
      : icon || leftIconProps?.icon;

    const hasLeftIcon = !!leftIcon || !!leftIconProps?.image;
    const hasRightIcon = !!rightIcon || !!rightIconProps?.image;

    const effect = useMemo(
      () => ({
        ...rest.effect,
        gradient: intent ? undefined : rest.effect?.gradient,
        interactive: !!onClick && !rest.disabled,
      }),
      [intent, !!onClick, rest.disabled, JSON.stringify(rest.effect)]
    );

    return (
      <ReqoreTooltipComponent
        {...rest}
        Component={StyledTag}
        tooltip={tooltip}
        theme={theme}
        effect={effect}
        width={width}
        labelKey={labelKey}
        color={getCustomColor(intent)}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={ref}
        asBadge={asBadge}
        minimal={minimal}
        removable={!!onRemoveClick}
        interactive={!!onClick && !rest.disabled}
        tabIndex={onClick && !rest.disabled ? 0 : undefined}
        wrap={wrap}
        hasWidth={!!width}
      >
        {labelKey || hasLeftIcon ? (
          <StyledTagKeyWrapper
            size={size}
            className='reqore-tag-key-content'
            onClick={rest.disabled ? undefined : onClick}
            wrap={wrap}
            hasWidth={!!width}
            hasKey={!!labelKey}
            hasIcon={hasLeftIcon}
            padOnRight={!label && !labelKey && !hasRightIcon}
            fixed={rest.fixed}
          >
            {leftIcon || leftIconProps?.image ? (
              <ReqoreIcon
                size={`${TAG_ICON_FROM_SIZE[size]}px`}
                color={leftIconColor || iconColor}
                compact={compact}
                effect={{
                  opacity: CONTROL_ICON_OPACITY,
                }}
                {...leftIconProps}
                animation={loading ? 'spin' : leftIconProps?.animation}
                icon={leftIcon}
              />
            ) : null}
            {labelKey && (
              <StyledTagContentKey
                wrap={wrap}
                hasWidth={!!width}
                size={size}
                labelAlign={labelKeyAlign}
                compact={compact}
                effect={
                  {
                    weight: 'bold',
                    ...labelKeyEffect,
                  } as IReqoreEffect
                }
              >
                {labelKey}
              </StyledTagContentKey>
            )}
          </StyledTagKeyWrapper>
        ) : null}
        {label || label === 0 || hasRightIcon ? (
          <StyledTagContentWrapper
            size={size}
            className='reqore-tag-content'
            onClick={rest.disabled ? undefined : onClick}
            wrap={wrap}
            hasWidth={!!width}
            hasKey={!!labelKey}
            fixed={rest.fixed}
          >
            {label || label === 0 ? (
              <StyledTagContent
                size={size}
                wrap={wrap}
                hasWidth={!!width}
                labelAlign={labelAlign || (labelKey ? 'left' : 'center')}
                compact={compact}
                effect={
                  {
                    weight: 'bold',
                    ...labelEffect,
                  } as IReqoreEffect
                }
              >
                {label}
              </StyledTagContent>
            ) : null}
            {hasRightIcon ? (
              <ReqoreIcon
                icon={rightIcon}
                size={`${TAG_ICON_FROM_SIZE[size]}px`}
                margin={label || (!icon && !labelKey) ? 'right' : 'both'}
                color={rightIconColor || iconColor}
                compact={compact}
                effect={{
                  opacity: CONTROL_ICON_OPACITY,
                }}
                {...rightIconProps}
              />
            ) : null}
          </StyledTagContentWrapper>
        ) : null}
        {_size(actions)
          ? actions
              .filter((action) => action.show !== false)
              .map(({ intent, onClick, icon, tooltip, ...action }, index) => (
                <React.Fragment key={index}>
                  <ReqorePopover
                    component={StyledButtonWrapper}
                    componentProps={{
                      size,
                      color: getCustomColor(intent),
                      className: classNames(
                        'reqore-tag-action',
                        action.show === 'hover' ? 'reqore-tag-action-hidden' : ''
                      ),
                      onClick: onClick,
                      effect: rest.effect,
                      ...action,
                    }}
                    {...(tooltip
                      ? typeof tooltip === 'string'
                        ? { tooltip: tooltip }
                        : tooltip
                      : {})}
                    isReqoreComponent
                  >
                    <ReqoreIcon
                      icon={icon}
                      size={`${TAG_ICON_FROM_SIZE[size]}px`}
                      effect={{
                        opacity: CONTROL_ICON_OPACITY,
                      }}
                    />
                  </ReqorePopover>
                </React.Fragment>
              ))
          : null}
        {onRemoveClick && !rest.disabled ? (
          <ReqorePopover
            component={StyledButtonWrapper}
            componentProps={{
              size,
              color: getCustomColor(intent),
              className: 'reqore-tag-remove',
              onClick: onRemoveClick,
              effect: rest.effect,
            }}
            isReqoreComponent
            content='Remove'
          >
            <ReqoreIcon icon='CloseLine' size={size} />
          </ReqorePopover>
        ) : null}
      </ReqoreTooltipComponent>
    );
  }
);

export default ReqoreTag;
