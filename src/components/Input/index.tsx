import { Placement } from '@popperjs/core';
import { darken, rgba } from 'polished';
import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';

export interface IReqoreInputProps extends React.HTMLAttributes<HTMLInputElement> {
  autoFocus?: boolean;
  disabled?: boolean;
  tooltip?: string | number;
  tooltipPlacement?: Placement;
  width?: number;
  size?: TSizes;
}

export interface IReqoreInputStyle extends IReqoreInputProps {
  theme: IReqoreTheme;
  _size?: TSizes
}

export const StyledInput = styled.input<IReqoreInputStyle>`
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ width }) => width ? `${width}px` : 'auto'};
  font-size: 14px;
  margin: 0;
  padding: 0 7px;

  background-color: ${({ theme }: IReqoreInputStyle) => darken(0.01, theme.main)};
  color: ${({ theme }: IReqoreInputStyle) => getReadableColor(theme)};

  border: 1px solid ${({ theme }) => rgba(getReadableColor(theme), 0.2)};
  border-radius: 3px;
  transition: all 0.2s linear;

  &:active,
  &:focus,
  &:hover {
    outline: none;
    border: 1px solid ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }

  &::placeholder {
    transition: all 0.2s linear;
    color: ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }

  &:focus {
    &::placeholder {
      color: ${({ theme }) => rgba(getReadableColor(theme), 0.5)};
    }
  }

  &:disabled {
    pointer-events: none;
    border: 1px solid ${({ theme }) => rgba(getReadableColor(theme), 0.1)};
  }
`

const ReqoreInput = forwardRef(({ tooltip, tooltipPlacement, width, size = 'normal', className, ...rest }: IReqoreInputProps, ref) => {
  const innerRef = useRef(null);
  const combinedRef = useCombinedRefs(innerRef, ref);

  usePopover(combinedRef.current, tooltip, 'hover', tooltipPlacement, !!tooltip);
  
  return (
    <StyledInput {...rest} className={`${className || ''} reqore-control reqore-input`} width={width} _size={size} ref={combinedRef} />
  )
});

export default ReqoreInput;