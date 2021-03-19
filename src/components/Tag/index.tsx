import React, { forwardRef, useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeLightness,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';
import { IReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TSizes;
  label?: string;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  color?: string;
  tooltip?: IReqoreTooltip;
  disabled?: boolean;
}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
}

export const StyledTag = styled.span<IReqoreTagStyle>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;
  border-radius: 3px;

  ${({ theme, color }) =>
    css`
      background-color: ${color || changeLightness(theme.main, 0.1)};
      color: ${
        color
          ? getReadableColorFrom(color, true)
          : getReadableColor(theme, undefined, undefined, true)
      };
      }
    `}

  ${({ theme, color, interactive }) =>
    interactive &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${changeLightness(
          color || theme.main,
          color ? 0.05 : 0.15
        )};
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

const StyledTagContent = styled.span<{ size: TSizes }>`
  padding: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledRemoveWrapper = styled.div<IReqoreTagStyle>`
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
  height: ${({ size }) => SIZE_TO_PX[size]}px;
  width: ${({ size }) => SIZE_TO_PX[size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s linear;

  ${({ theme, color }) =>
    css`
      &:hover {
        cursor: pointer;
        background-color: ${changeLightness(
          color || theme.main,
          color ? 0.09 : 0.19
        )};
      }
    `}
`;

const ReqoreTag = forwardRef(
  (
    {
      tooltip,
      label,
      icon,
      rightIcon,
      className,
      onClick,
      size = 'normal',
      onRemoveClick,
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);

    usePopover({
      ...tooltip,
      targetElement: combinedRef.current,
      show: !!tooltip?.content,
    });

    return (
      <StyledTag
        {...rest}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={combinedRef}
        removable={!!onRemoveClick}
        interactive={!!onClick && !rest.disabled}
      >
        <StyledTagContent
          size={size}
          onClick={onClick}
          className='reqore-tag-content'
        >
          {icon && (
            <ReqoreIcon
              icon={icon}
              size={`${TEXT_FROM_SIZE[size]}px`}
              margin='right'
            />
          )}
          {label}
          {rightIcon && (
            <ReqoreIcon
              icon={rightIcon}
              size={`${TEXT_FROM_SIZE[size]}px`}
              margin='left'
            />
          )}
        </StyledTagContent>
        {onRemoveClick && !rest.disabled ? (
          <StyledRemoveWrapper
            size={size}
            color={rest.color}
            className='reqore-tag-remove'
            onClick={onRemoveClick}
          >
            <ReqoreIcon icon='CloseLine' size={`${TEXT_FROM_SIZE[size]}px`} />
          </StyledRemoveWrapper>
        ) : null}
      </StyledTag>
    );
  }
);

export default ReqoreTag;
