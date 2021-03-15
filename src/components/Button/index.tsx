import { Placement } from '@popperjs/core';
import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { SIZE_TO_PX, TEXT_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: IReqoreIconName;
  size?: 'small' | 'normal' | 'big';
  minimal?: boolean;
  disabled?: boolean;
  tooltip?: string | number;
  tooltipPlacement?: Placement;
}

export interface IReqoreButtonStyle {
  theme: IReqoreTheme;
  size?: 'small' | 'normal' | 'big';
  minimal?: boolean;
}

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 500;
  border: ${({ theme, minimal }) => !minimal ? `1px solid ${changeLightness(theme.main, 0.2)}` : 0};
  padding: 0 8px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size]}px;

  border-radius: 3px;

  background-color: ${({ minimal, theme }) => {
    if (minimal) {
      return 'transparent';
    }

    return changeLightness(theme.main, 0.1);
  }};

  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};

  &:not(:disabled) {
    cursor: pointer;
    transition: all 0.15s linear;

    &:hover {
      background-color: ${({ minimal, theme }) =>
        minimal ? changeLightness(theme.main, 0.09) : undefined};
      color: ${({ theme }) =>
        getReadableColor(theme, undefined, undefined)};
      border-color: ${({ minimal, theme }) =>
        minimal ? undefined : changeLightness(theme.main, 0.3)};
    }

    &:active {
      transform: scale(0.9);
    }
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus,
  &:active {
    outline: none;
  }
`

const ReqoreButton = forwardRef(({ icon, size = 'normal', minimal, children, tooltip, tooltipPlacement, className, ...rest }: IReqoreButtonProps, ref) => {
  const innerRef = useRef(null);
  const combinedRef = useCombinedRefs(innerRef, ref);

  usePopover(combinedRef.current, tooltip, undefined, tooltipPlacement, !!tooltip);

  return (
    <StyledButton
      {...rest}
      className={`${className || ''} reqore-control reqore-button`}
      size={size}
      minimal={minimal}
      ref={combinedRef}
    >
      {icon && (
        <ReqoreIcon icon={icon} margin={children ? 'right' : undefined} size={`${TEXT_FROM_SIZE[size]}px`} />
      )}
      {children}
    </StyledButton>
  );
})

export default ReqoreButton;