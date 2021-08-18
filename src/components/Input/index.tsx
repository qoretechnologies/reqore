import { Placement } from '@popperjs/core';
import { darken, rgba } from 'polished';
import React, { forwardRef, useRef } from 'react';
import styled from 'styled-components';
import { SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import usePopover from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreInputProps extends React.HTMLAttributes<HTMLInputElement> {
  autoFocus?: boolean;
  disabled?: boolean;
  tooltip?: string;
  tooltipPlacement?: Placement;
  width?: number;
  size?: TSizes;
  minimal?: boolean;
  fluid?: boolean;
  fixed?: boolean;
  value?: string | number;
  onClearClick?: () => void;
  maxLength?: number;
  icon?: IReqoreIconName;
}

export interface IReqoreInputStyle extends IReqoreInputProps {
  theme: IReqoreTheme;
  _size?: TSizes;
  clearable?: boolean;
  hasIcon?: boolean;
}

export const StyledInputWrapper = styled.div<IReqoreInputStyle>`
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ width }) => (width ? `${width}px` : 'auto')};
  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1' : '0 0 auto')};
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  position: relative;
  overflow: hidden;
`;

const StyledIconWrapper = styled.div<IReqoreInputStyle>`
  position: absolute;
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ _size }) => SIZE_TO_PX[_size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledInput = styled.input<IReqoreInputStyle>`
  height: 100%;
  width: 100%;
  flex: 1;
  margin: 0;
  padding: 0 7px;
  padding-right: ${({ clearable, _size }) => (clearable ? SIZE_TO_PX[_size] : 7)}px;
  padding-left: ${({ hasIcon, _size }) => (hasIcon ? SIZE_TO_PX[_size] : 7)}px;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;

  background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
    minimal ? 'transparent' : darken(0.01, theme.main)};
  color: ${({ theme }: IReqoreInputStyle) => getReadableColor(theme)};

  border: ${({ minimal, theme }) =>
    !minimal ? `1px solid ${rgba(getReadableColor(theme), 0.2)}` : 0};
  border-bottom: ${({ minimal, theme }) =>
    minimal ? `0.5px solid ${rgba(getReadableColor(theme), 0.2)}` : undefined};

  border-radius: ${({ minimal }) => (minimal ? 0 : 3)}px;
  transition: all 0.2s linear;

  &:active,
  &:focus,
  &:hover {
    outline: none;
    border-color: ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
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
    opacity: 0.3;
  }
`;

const ReqoreInput = forwardRef(
  (
    {
      tooltip,
      tooltipPlacement,
      width,
      size = 'normal',
      fluid,
      fixed,
      className,
      onClearClick,
      icon,
      ...rest
    }: IReqoreInputProps,
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = useCombinedRefs(innerRef, ref);

    usePopover({
      targetElement: combinedRef.current,
      content: tooltip,
      handler: 'hover',
      placement: tooltipPlacement,
      show: !!tooltip,
    });

    return (
      <StyledInputWrapper
        className='reqore-control-wrapper'
        fluid={fluid}
        fixed={fixed}
        width={width}
        _size={size}
        ref={combinedRef}
      >
        {icon && (
          <StyledIconWrapper _size={size}>
            <ReqoreIcon size={`${TEXT_FROM_SIZE[size]}px`} icon={icon} />
          </StyledIconWrapper>
        )}
        <StyledInput
          {...rest}
          _size={size}
          hasIcon={!!icon}
          clearable={!rest?.disabled && !!(onClearClick && rest?.onChange)}
          className={`${className || ''} reqore-control reqore-input`}
        />
        <ReqoreInputClearButton
          enabled={!rest?.disabled && !!(onClearClick && rest?.onChange)}
          onClick={onClearClick}
          size={size}
          show={rest?.value && rest.value !== ''}
        />
      </StyledInputWrapper>
    );
  }
);

export default ReqoreInput;
