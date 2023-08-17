import { omit } from 'lodash';
import { rgba } from 'polished';
import React, { forwardRef, useState } from 'react';
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
import { IReqoreAutoFocusRules, useAutoFocus } from '../../hooks/useAutoFocus';
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
  IWithReqoreTooltip,
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
    IWithReqoreEffect,
    IWithReqoreTooltip {
  autoFocus?: boolean;

  width?: number;
  size?: TSizes;
  minimal?: boolean;
  fluid?: boolean;
  fixed?: boolean;
  value?: string | number;
  onClearClick?: () => void;
  maxLength?: number;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  flat?: boolean;
  rounded?: boolean;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  wrapperStyle?: React.CSSProperties;
  iconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  focusRules?: IReqoreAutoFocusRules;
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
  align-self: ${({ fixed, fluid }) => (fixed ? 'flex-start' : fluid ? 'stretch' : undefined)};
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  position: relative;
  overflow: hidden;
  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || rounded === false ? 0 : RADIUS_FROM_SIZE[_size]}px;
`;

const StyledIconWrapper = styled.div<IReqoreInputStyle>`
  position: absolute;
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ _size }) => SIZE_TO_PX[_size]}px;
  right: ${({ position }) => (position === 'right' ? 0 : undefined)};
  top: 0;
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
  padding-right: ${({ clearable, hasRightIcon, _size }) => {
    let padding = 7;

    if (clearable || hasRightIcon) {
      padding = 0;
      padding += clearable ? SIZE_TO_PX[_size] : 0;
      padding += hasRightIcon ? SIZE_TO_PX[_size] : 0;
    }

    return padding;
  }}px;

  padding-left: ${({ hasIcon, _size }) => (hasIcon ? SIZE_TO_PX[_size] : 7)}px;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  transition: all 0.2s ease-out;
  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || rounded === false ? 0 : RADIUS_FROM_SIZE[_size]}px;
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
            border-color: ${({ theme }) => changeLightness(theme.main, 0.35)};
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
      rightIcon,
      iconColor,
      rightIconColor,
      flat,
      rounded,
      minimal,
      readOnly,
      customTheme,
      intent,
      wrapperStyle,
      focusRules,
      ...rest
    }: IReqoreInputProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const [inputRef, setInputRef] = useState<HTMLInputElement>(null);
    const theme = useReqoreTheme('main', customTheme, intent);

    useTooltip(inputRef, tooltip);
    useAutoFocus(inputRef, readOnly || rest.disabled ? undefined : focusRules, rest.onChange);

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
          {...omit(rest, ['children'])}
          effect={{
            interactive: !rest?.disabled && !readOnly,
            ...rest?.effect,
          }}
          onChange={!readOnly && !rest?.disabled ? rest?.onChange : undefined}
          as='input'
          ref={(ref) => setInputRef(ref)}
          theme={theme}
          _size={size}
          minimal={minimal}
          flat={flat}
          rounded={rounded}
          hasIcon={!!icon}
          hasRightIcon={!!rightIcon}
          clearable={!rest?.disabled && !readOnly && !!(onClearClick && rest?.onChange)}
          className={`${className || ''} reqore-control reqore-input`}
          readOnly={readOnly}
        />
        <ReqoreInputClearButton
          enabled={!readOnly && !rest?.disabled && !!(onClearClick && rest?.onChange)}
          onClick={onClearClick}
          hasRightIcon={!!rightIcon}
          size={size}
          show={rest?.value && rest.value !== '' ? true : false}
        />
        {rightIcon && (
          <StyledIconWrapper _size={size} position='right'>
            <ReqoreIcon size={size} icon={rightIcon} color={rightIconColor} />
          </StyledIconWrapper>
        )}
      </StyledInputWrapper>
    );
  }
);

export default ReqoreInput;
