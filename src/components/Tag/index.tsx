import _size from 'lodash/size';
import { rgba } from 'polished';
import React, { forwardRef, HTMLAttributes, useState } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePopover, useReqoreTheme } from '../..';
import {
  BADGE_SIZE_TO_PX,
  CONTROL_TEXT_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { ActiveIconScale, InactiveIconScale } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFluid,
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

export interface IReqoreTagAction
  extends IWithReqoreTooltip,
    IReqoreDisabled,
    IReqoreIntent,
    HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  show?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    IWithReqoreTooltip,
    IReqoreDisabled,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreEffect,
    IWithReqoreCustomTheme {
  fixed?: boolean | 'key' | 'label';
  align?: 'left' | 'right' | 'center';
  size?: TSizes;
  label?: string | number;
  labelKey?: string | number;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
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
  labelEffect?: IReqoreEffect;
  labelKeyEffect?: IReqoreEffect;
}

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
  font-weight: 600;
  overflow: hidden;
  vertical-align: middle;
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;

  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  max-width: ${({ fixed }) => (fixed !== true ? '100%' : undefined)};
  flex: ${({ fluid, fixed }) => (fixed === true ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  align-self: ${({ fixed, fluid }) =>
    fixed === true ? 'flex-start' : fluid ? 'stretch' : undefined};
  border-radius: ${({ asBadge, size }) => (asBadge ? 18 : RADIUS_FROM_SIZE[size])}px;
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
            asBadge ? BADGE_SIZE_TO_PX[size] : SIZE_TO_PX[size]}px;
        `
      : css`
          height: ${({ size, asBadge }) => (asBadge ? BADGE_SIZE_TO_PX[size] : SIZE_TO_PX[size])}px;
        `}

  ${({ theme, color, labelKey, minimal }: IReqoreTagStyle) => {
    return css`
      background-color: ${color || changeLightness(theme.main, 0.1)};
      color: ${minimal
        ? getReadableColor(theme, undefined, undefined, true)
        : color && color !== 'transparent'
        ? getReadableColorFrom(color)
        : getReadableColorFrom(changeLightness(theme.main, 0.1))};

      ${StyledTagKeyWrapper} {
        background-color: ${labelKey ? rgba('#000000', 0.2) : undefined};
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
              background-color: ${changeLightness(color || theme.main, color ? 0.05 : 0.15)};
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
`;

const StyledTagKeyWrapper = styled.span<{ size: TSizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: ${({ hasKey, fixed }) => (hasKey ? (fixed === 'key' ? '0 0 auto' : 1) : undefined)};
  flex-shrink: 0;
  min-height: 100%;
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
  padding: 4px ${({ size }) => PADDING_FROM_SIZE[size]}px;
  min-height: 100%;
  display: flex;
  align-items: center;
  flex: 1;

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
  width: ${({ size }) => SIZE_TO_PX[size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;

  ${({ color, effect }) =>
    css`
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
      wrap = false,
      width,
      leftIconColor,
      rightIconColor,
      iconColor,
      labelEffect,
      labelKeyEffect,
      leftIconProps,
      rightIconProps,
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme: IReqoreTheme = useReqoreTheme('main', customTheme);
    const [itemRef, setItemRef] = useState<HTMLDivElement>(undefined);

    useTooltip(itemRef, tooltip);

    // If color or intent was specified, set the color
    const getCustomColor = (itemIntent?: TReqoreIntent): TReqoreHexColor => {
      let customColor: TReqoreHexColor = itemIntent
        ? theme.intents[itemIntent]
        : getColorFromMaybeString(theme, color);

      if (customColor?.length === 9) {
        return customColor;
      }

      customColor = minimal ? `${customColor || '#000000'}40` : customColor;

      return customColor;
    };

    return (
      <StyledTag
        {...rest}
        theme={theme}
        effect={{
          ...rest.effect,
          gradient: intent ? undefined : rest.effect?.gradient,
          interactive: !!onClick && !rest.disabled,
        }}
        width={width}
        labelKey={labelKey}
        color={getCustomColor(intent)}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={(ref) => {
          targetRef.current = ref;
          setItemRef(ref);
        }}
        asBadge={asBadge}
        minimal={minimal}
        removable={!!onRemoveClick}
        interactive={!!onClick && !rest.disabled}
        wrap={wrap}
        hasWidth={!!width}
      >
        {icon || labelKey ? (
          <StyledTagKeyWrapper
            size={size}
            className='reqore-tag-key-content'
            onClick={rest.disabled ? undefined : onClick}
            wrap={wrap}
            hasWidth={!!width}
            hasKey={!!labelKey}
            fixed={rest.fixed}
          >
            {icon && (
              <ReqoreIcon
                icon={icon}
                size={size}
                margin={label || labelKey ? 'left' : 'both'}
                color={leftIconColor || iconColor}
                {...leftIconProps}
              />
            )}
            {labelKey && (
              <StyledTagContentKey
                wrap={wrap}
                hasWidth={!!width}
                size={size}
                effect={
                  {
                    weight: 'thick',
                    ...labelKeyEffect,
                  } as IReqoreEffect
                }
              >
                {labelKey}
              </StyledTagContentKey>
            )}
          </StyledTagKeyWrapper>
        ) : null}
        {label || label === 0 || rightIcon ? (
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
                effect={{
                  ...labelEffect,
                }}
              >
                {label}
              </StyledTagContent>
            ) : null}
            {rightIcon && (
              <ReqoreIcon
                icon={rightIcon}
                size={size}
                margin={label || (icon && !labelKey) ? 'right' : 'both'}
                color={rightIconColor || iconColor}
                {...rightIconProps}
              />
            )}
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
                      className: 'reqore-tag-action',
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
                    <ReqoreIcon icon={icon} size={size} />
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
      </StyledTag>
    );
  }
);

export default ReqoreTag;
