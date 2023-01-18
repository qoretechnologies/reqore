import _size from 'lodash/size';
import { rgba } from 'polished';
import React, { forwardRef, useContext } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import {
  BADGE_SIZE_TO_PX,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ThemeContext from '../../context/ThemeContext';
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
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect, TReqoreEffectColor, TReqoreHexColor } from '../Effect';
import ReqoreIcon from '../Icon';

export interface IReqoreTagAction extends IWithReqoreTooltip, IReqoreDisabled, IReqoreIntent {
  icon: IReqoreIconName;
  show?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    IWithReqoreTooltip,
    IReqoreDisabled,
    IWithReqoreEffect,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreFixed {
  size?: TSizes;
  label?: string | number;
  labelKey?: string | number;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  leftIconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  color?: TReqoreEffectColor;
  actions?: IReqoreTagAction[];
  width?: string;
  asBadge?: boolean;
  intent?: TReqoreIntent;
  wrap?: boolean;
}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
  color?: TReqoreHexColor;
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
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  max-width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  align-self: ${({ fixed }) => (fixed ? 'flex-start' : undefined)};
  border-radius: ${({ asBadge, size }) => (asBadge ? 18 : RADIUS_FROM_SIZE[size])}px;
  width: ${({ width }) => width || undefined};
  transition: all 0.2s ease-out;

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

  ${({ theme, color, labelKey, minimal }: IReqoreTagStyle) =>
    css`
      background-color: ${color || changeLightness(theme.main, 0.1)};
      color: ${minimal
        ? getReadableColor(theme, undefined, undefined, true, theme.originalMain)
        : color
        ? getReadableColorFrom(color)
        : getReadableColor(theme, undefined, undefined)};

      ${StyledTagKeyWrapper} {
        background-color: ${labelKey ? rgba('#000000', 0.2) : undefined};
      }
    `}

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
  flex: ${({ hasKey }) => (hasKey ? 1 : undefined)};
  flex-shrink: 0;
  min-height: 100%;
`;

const StyledTagContentWrapper = styled.span<{ size: TSizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  flex-shrink: 0;
  min-height: 100%;
`;

const StyledTagContent = styled.span<{ size: TSizes }>`
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
  font-weight: 800;
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
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
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
      wrap = false,
      width,
      leftIconColor,
      rightIconColor,
      iconColor,
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

    useTooltip(targetRef.current, tooltip);

    // If color or intent was specified, set the color
    const getCustomColor = (itemIntent?: TReqoreIntent): TReqoreHexColor => {
      let customColor: TReqoreHexColor = itemIntent
        ? theme.intents[itemIntent]
        : getColorFromMaybeString(theme, color);

      customColor = minimal ? `${customColor || '#000000'}40` : customColor;

      return customColor;
    };

    return (
      <StyledTag
        {...rest}
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
        ref={targetRef}
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
          >
            {icon && (
              <ReqoreIcon
                icon={icon}
                size={size}
                margin={label ? 'left' : 'both'}
                color={leftIconColor || iconColor}
              />
            )}
            {labelKey && (
              <StyledTagContentKey wrap={wrap} hasWidth={!!width} size={size}>
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
          >
            {label || label === 0 ? (
              <StyledTagContent size={size} wrap={wrap} hasWidth={!!width}>
                {label}
              </StyledTagContent>
            ) : null}
            {rightIcon && (
              <ReqoreIcon
                icon={rightIcon}
                size={size}
                margin={label || icon ? 'right' : 'both'}
                color={rightIconColor || iconColor}
              />
            )}
          </StyledTagContentWrapper>
        ) : null}
        {_size(actions)
          ? actions
              .filter((action) => action.show !== false)
              .map((action, index) => (
                <React.Fragment key={index}>
                  <ReqorePopover
                    component={StyledButtonWrapper}
                    componentProps={{
                      size,
                      color: getCustomColor(action.intent),
                      className: 'reqore-tag-action',
                      onClick: action.onClick,
                      effect: rest.effect,
                    }}
                    {...(action.tooltip
                      ? typeof action.tooltip === 'string'
                        ? { tooltip: action.tooltip }
                        : action.tooltip
                      : {})}
                    isReqoreComponent
                  >
                    <ReqoreIcon icon={action.icon} size={size} />
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
