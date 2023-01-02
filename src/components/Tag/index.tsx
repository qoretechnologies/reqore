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
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreEffect,
  IWithReqoreMinimal,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect } from '../Effect';
import ReqoreIcon from '../Icon';

export interface IReqoreTagAction extends IWithReqoreTooltip, IReqoreDisabled, IReqoreIntent {
  icon: IReqoreIconName;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    IWithReqoreTooltip,
    IReqoreDisabled,
    IWithReqoreEffect,
    IWithReqoreMinimal {
  size?: TSizes;
  label?: string | number;
  labelKey?: string | number;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  color?: string;
  actions?: IReqoreTagAction[];
  width?: string;
  badge?: boolean;
  intent?: TReqoreIntent;
  wrap?: boolean;
}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
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
  border-radius: ${({ badge, size }) => (badge ? 18 : RADIUS_FROM_SIZE[size])}px;
  width: ${({ width }) => width || undefined};
  transition: all 0.2s ease-out;

  ${({ wrap, hasWidth }) =>
    wrap || hasWidth
      ? css`
          min-height: ${({ size, badge }) => (badge ? BADGE_SIZE_TO_PX[size] : SIZE_TO_PX[size])}px;
        `
      : css`
          height: ${({ size, badge }) => (badge ? BADGE_SIZE_TO_PX[size] : SIZE_TO_PX[size])}px;
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
    interactive && !effect?.gradient
      ? css`
          cursor: pointer;
          &:hover {
            background-color: ${changeLightness(color || theme.main, color ? 0.05 : 0.15)};
            color: ${minimal
              ? getReadableColor(theme, undefined, undefined, false, theme.originalMain)
              : color
              ? getReadableColorFrom(color)
              : getReadableColor(theme, undefined, undefined)};
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

const StyledTagRightIcon = styled(ReqoreIcon)``;

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

  ${({ color }) =>
    css`
      .reqore-icon {
        transform: scale(0.85);
      }
      &:hover {
        cursor: pointer;
        background-color: ${color ? changeLightness(color, 0.09) : rgba('#000000', 0.2)};

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
      badge,
      intent,
      color,
      minimal,
      wrap = false,
      width,
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

    useTooltip(targetRef.current, tooltip);

    // If color or intent was specified, set the color
    let customColor = intent ? theme.intents[intent] : color;
    customColor = minimal ? `${customColor || '#000000'}40` : customColor;

    return (
      <StyledTag
        {...rest}
        effect={{
          ...rest.effect,
          interactive: !!onClick && !rest.disabled,
        }}
        width={width}
        labelKey={labelKey}
        color={customColor}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={targetRef}
        badge={badge}
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
            onClick={onClick}
            wrap={wrap}
            hasWidth={!!width}
            hasKey={!!labelKey}
          >
            {icon && <ReqoreIcon icon={icon} size={size} margin={label ? 'left' : 'both'} />}
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
            onClick={onClick}
            wrap={wrap}
            hasWidth={!!width}
            hasKey={!!labelKey}
          >
            {label || label === 0 ? (
              <StyledTagContent size={size} onClick={onClick} wrap={wrap} hasWidth={!!width}>
                {label}
              </StyledTagContent>
            ) : null}
            {rightIcon && (
              <StyledTagRightIcon
                icon={rightIcon}
                size={size}
                margin={label || icon ? 'right' : 'both'}
              />
            )}
          </StyledTagContentWrapper>
        ) : null}
        {_size(actions)
          ? actions.map((action) => (
              <>
                <ReqorePopover
                  component={StyledButtonWrapper}
                  componentProps={{
                    size,
                    color: customColor,
                    className: 'reqore-tag-action',
                    onClick: action.onClick,
                  }}
                  {...(action.tooltip
                    ? typeof action.tooltip === 'string'
                      ? { tooltip: action.tooltip }
                      : action.tooltip || {}
                    : {})}
                  noWrapper
                >
                  <ReqoreIcon icon={action.icon} size={size} />
                </ReqorePopover>
              </>
            ))
          : null}
        {onRemoveClick && !rest.disabled ? (
          <ReqorePopover
            component={StyledButtonWrapper}
            componentProps={{
              size,
              color: customColor,
              className: 'reqore-tag-remove',
              onClick: onRemoveClick,
            }}
            noWrapper
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
