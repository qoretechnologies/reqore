import _size from 'lodash/size';
import React, { forwardRef, useContext } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePopover } from '../..';
import {
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
import { IReqoreDisabled, IReqoreIntent, IWithReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreTagAction extends IWithReqoreTooltip, IReqoreDisabled, IReqoreIntent {
  icon: IReqoreIconName;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    IWithReqoreTooltip,
    IReqoreDisabled {
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
}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
}

export const StyledTag = styled.div<IReqoreTagStyle>`
  display: inline-flex;
  justify-content: center;
  flex-shrink: 0;
  align-items: center;
  font-family: system-ui;
  font-weight: 600;
  overflow: hidden;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  border-radius: ${({ badge, size }) => (badge ? 20 : RADIUS_FROM_SIZE[size])}px;
  width: ${({ width }) => width || undefined};
  transition: all 0.2s ease-out;

  ${({ theme, color, labelKey }) =>
    css`
      background-color: ${color || changeLightness(theme.main, 0.1)};
      color: ${color ? getReadableColorFrom(color) : getReadableColor(theme, undefined, undefined)};

      ${StyledTagContentWrapper} {
        background-color: ${labelKey ? changeLightness(color || theme.main, 0.05) : undefined};
      }

      ${StyledTagContent} {
        background-color: ${labelKey ? changeLightness(color || theme.main, 0.1) : undefined};
      }

      ${StyledTagContentKey} {
        background-color: ${labelKey ? changeLightness(color || theme.main, 0.05) : undefined};
      }
    `}

  ${({ theme, color, interactive }) =>
    interactive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${changeLightness(color || theme.main, color ? 0.05 : 0.15)};
        color: ${color
          ? getReadableColorFrom(color)
          : getReadableColor(theme, undefined, undefined)};
      }
    `}


  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    `}
`;

const StyledTagContentWrapper = styled.div<{ size: TSizes }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex: 1;
  overflow: hidden;
  height: 100%;
`;

const StyledTagContent = styled.span<{ size: TSizes }>`
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTagContentKey = styled(StyledTagContent)`
  font-weight: 800;
`;

const StyledButtonWrapper = styled.div<IReqoreTagStyle>`
  flex-shrink: 0;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  height: ${({ size }) => SIZE_TO_PX[size]}px;
  width: ${({ size }) => SIZE_TO_PX[size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;

  ${({ theme, color }) =>
    css`
      .reqore-icon {
        transform: scale(0.85);
      }
      &:hover {
        cursor: pointer;
        background-color: ${changeLightness(color || theme.main, color ? 0.09 : 0.19)};

        .reqore-icon {
          transform: scale(1);
        }
      }
    `}
`;

const ReqoreTag = forwardRef(
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
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme: IReqoreTheme = useContext<IReqoreTheme>(ThemeContext);

    useTooltip(targetRef.current, tooltip);

    // If color or intent was specified, set the color
    const customColor = intent ? theme.intents[intent] : color;

    return (
      <StyledTag
        {...rest}
        labelKey={labelKey}
        color={customColor}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={targetRef}
        badge={badge}
        removable={!!onRemoveClick}
        interactive={!!onClick && !rest.disabled}
      >
        <StyledTagContentWrapper size={size} className='reqore-tag-content' onClick={onClick}>
          {icon && (
            <ReqoreIcon
              icon={icon}
              size={`${TEXT_FROM_SIZE[size]}px`}
              margin={label || rightIcon ? 'left' : 'both'}
            />
          )}
          {labelKey && <StyledTagContentKey size={size}>{labelKey}</StyledTagContentKey>}
          {label && <StyledTagContent size={size}>{label}</StyledTagContent>}
          {rightIcon && (
            <ReqoreIcon
              icon={rightIcon}
              size={`${TEXT_FROM_SIZE[size]}px`}
              margin={label ? 'left' : undefined}
            />
          )}
        </StyledTagContentWrapper>
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
                  <ReqoreIcon icon={action.icon} size={`${TEXT_FROM_SIZE[size]}px`} />
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
            <ReqoreIcon icon='CloseLine' size={`${TEXT_FROM_SIZE[size]}px`} />
          </ReqorePopover>
        ) : null}
      </StyledTag>
    );
  }
);

export default ReqoreTag;
