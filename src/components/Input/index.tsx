import { rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon from '../Icon';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreInputProps
  extends React.HTMLAttributes<HTMLInputElement>,
    IReqoreDisabled,
    IReqoreReadOnly,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect {
  autoFocus?: boolean;
  tooltip?: string;
  width?: number;
  size?: TSizes;
  minimal?: boolean;
  fluid?: boolean;
  fixed?: boolean;
  value?: string | number;
  onClearClick?: () => void;
  maxLength?: number;
  icon?: IReqoreIconName;
  flat?: boolean;
  rounded?: boolean;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  wrapperStyle?: React.CSSProperties;
  iconColor?: TReqoreEffectColor;
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
  max-width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  min-width: 60px;
  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 auto' : '0 1 auto')};
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  position: relative;
  overflow: hidden;
  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || !rounded ? 0 : RADIUS_FROM_SIZE[_size]}px;
`;

const StyledIconWrapper = styled.div<IReqoreInputStyle>`
  position: absolute;
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ _size }) => SIZE_TO_PX[_size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledInput = styled(StyledEffect)<IReqoreInputStyle>`
  height: 100%;
  width: 100%;
  flex: 1;
  margin: 0;
  padding: ${({ _size }) => PADDING_FROM_SIZE[_size] / 2}px 7px;
  padding-right: ${({ clearable, _size }) => (clearable ? SIZE_TO_PX[_size] : 7)}px;
  padding-left: ${({ hasIcon, _size }) => (hasIcon ? SIZE_TO_PX[_size] : 7)}px;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  transition: all 0.2s ease-out;
  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || !rounded ? 0 : RADIUS_FROM_SIZE[_size]}px;
  border: ${({ minimal, theme, flat }) =>
    !minimal && !flat ? `1px solid ${changeLightness(theme.main, 0.2)}` : 0};
  border-bottom: ${({ minimal, theme, flat }) =>
    minimal && !flat ? `0.5px solid ${changeLightness(theme.main, 0.2)}` : undefined};

  ${({ disabled, readOnly }) =>
    !disabled && !readOnly
      ? css`
          &:active,
          &:focus,
          &:hover {
            outline: none;
            border-color: ${({ theme }) => changeLightness(theme.main, 0.25)};
          }
        `
      : undefined}

  background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
    minimal ? 'transparent' : rgba(theme.main, 0.1)};
  color: ${({ theme }: IReqoreInputStyle) =>
    getReadableColor(theme, undefined, undefined, true, theme.originalMain)};

  transition: all 0.2s ease-out;

  &:active,
  &:focus {
    background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
      minimal ? 'transparent' : rgba(theme.main, 0.15)};
  }

  &::placeholder {
    transition: all 0.2s ease-out;
    color: ${({ theme }) =>
      rgba(getReadableColor(theme, undefined, undefined, true, theme.originalMain), 0.3)};
  }

  &:focus {
    &::placeholder {
      color: ${({ theme }) =>
        rgba(getReadableColor(theme, undefined, undefined, true, theme.originalMain), 0.5)};
    }
  }

  ${({ readOnly }) => readOnly && ReadOnlyElement};

  &:disabled {
    ${DisabledElement};
  }
`;

const ReqoreInput = forwardRef<HTMLDivElement, IReqoreInputProps>(
  (
    {
      tooltip,
      width,
      size = 'normal',
      fluid,
      fixed,
      className,
      onClearClick,
      icon,
      iconColor,
      flat,
      rounded = true,
      minimal,
      children,
      readOnly,
      customTheme,
      intent,
      wrapperStyle,
      ...rest
    }: IReqoreInputProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme = useReqoreTheme('main', customTheme, intent);

    useTooltip(targetRef.current, tooltip);

    return (
      <StyledInputWrapper
        className='reqore-control-wrapper'
        fluid={fluid}
        fixed={fixed}
        width={width}
        flat={flat}
        theme={theme}
        rounded={rounded}
        minimal={minimal}
        _size={size}
        ref={targetRef}
        readOnly={readOnly}
        disabled={rest.disabled}
        style={wrapperStyle}
      >
        {icon && (
          <StyledIconWrapper _size={size}>
            <ReqoreIcon size={size} icon={icon} color={iconColor} />
          </StyledIconWrapper>
        )}
        <StyledInput
          {...rest}
          effect={{
            interactive: !rest?.disabled && !readOnly,
            ...rest?.effect,
          }}
          as='input'
          theme={theme}
          _size={size}
          minimal={minimal}
          flat={flat}
          rounded={rounded}
          hasIcon={!!icon}
          clearable={!rest?.disabled && !!(onClearClick && rest?.onChange)}
          className={`${className || ''} reqore-control reqore-input`}
          readOnly={readOnly}
        />
        <ReqoreInputClearButton
          enabled={!readOnly && !rest?.disabled && !!(onClearClick && rest?.onChange)}
          onClick={onClearClick}
          size={size}
          show={rest?.value && rest.value !== '' ? true : false}
        />
      </StyledInputWrapper>
    );
  }
);

export default ReqoreInput;
