import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import usePopover from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: IReqoreIconName;
  size?: 'small' | 'normal' | 'big';
  minimal?: boolean;
  disabled?: boolean;
  tooltip?: string | number;
}

export interface IReqoreButtonStyle {
  theme: IReqoreTheme;
  size?: 'small' | 'normal' | 'big';
  minimal?: boolean;
}

const sizeToPx = {
  small: 20,
  normal: 30,
  big: 40,
}

const textFromSize = {
  small: 13,
  normal: 15,
  big: 17,
}

export const StyledButton = styled.button<IReqoreButtonStyle>`
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 500;
  border: ${({ theme, minimal }) => !minimal ? `1px solid ${changeLightness(theme.main, 0.2)}` : 0};
  padding: 0 8px;
  font-size: ${({ size }) => textFromSize[size]}px;

  height: ${({ size }) => sizeToPx[size]}px;
  min-width: ${({ size }) => sizeToPx[size]}px;

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

function useCombinedRefs(...refs) {
  const targetRef = React.useRef()

  React.useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return

      if (typeof ref === 'function') {
        ref(targetRef.current)
      } else {
        ref.current = targetRef.current
      }
    })
  }, [refs])

  return targetRef
}

const ReqoreButton = forwardRef(({ icon, size = 'normal', minimal, children, tooltip, className, ...rest }: IReqoreButtonProps, ref) => {
  const innerRef = useRef(null);
  const combinedRef = useCombinedRefs(innerRef, ref);

  usePopover(combinedRef.current, tooltip, undefined, undefined, !!tooltip);

  return (
  <StyledButton
    {...rest}
    className={`${className || ''} reqore-button`}
    size={size}
    minimal={minimal}
    ref={combinedRef}
  >
    {icon && (
      <ReqoreIcon icon={icon} margin={children ? 'right' : undefined} size={`${textFromSize[size]}px`} />
    )}
    {children}
  </StyledButton>
);
})

export default ReqoreButton;