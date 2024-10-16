import { omit } from 'lodash';
import { rgba } from 'polished';
import React, { forwardRef, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  CONTROL_TEXT_FROM_SIZE,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreAutoFocusRules, useAutoFocus } from '../../hooks/useAutoFocus';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { ActiveIconScale, DisabledElement, InactiveIconScale, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreLoading,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreInputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size' | 'children'>,
    IReqoreDisabled,
    IReqoreReadOnly,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreLoading,
    IWithReqoreTooltip {
  autoFocus?: boolean;
  placeholder?: string;
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
  transparent?: boolean;
  rounded?: boolean;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  step?: number;
  wrapperStyle?: React.CSSProperties;
  iconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  focusRules?: IReqoreAutoFocusRules;

  leftIconProps?: IReqoreIconProps;
  rightIconProps?: IReqoreIconProps;

  pill?: boolean;

  children?: React.ReactNode | ((props: any) => React.ReactNode);
  as?: string | React.ElementType;
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
  font-size: ${({ _size }) => CONTROL_TEXT_FROM_SIZE[_size]}px;
  position: relative;
  overflow: hidden;
  border-radius: ${({ minimal, rounded, _size, pill }) =>
    minimal || rounded === false
      ? 0
      : RADIUS_FROM_SIZE[_size] * (pill ? PILL_RADIUS_MODIFIER : 1)}px;

  ${InactiveIconScale}

  &:focus-within {
    .reqore-clear-input-button {
      display: flex;
    }

    ${ActiveIconScale}
  }
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
  font-size: ${({ _size }) => CONTROL_TEXT_FROM_SIZE[_size]}px;
  transition: all 0.2s ease-out;
  border-radius: ${({ minimal, rounded, _size, pill }) =>
    minimal || rounded === false
      ? 0
      : RADIUS_FROM_SIZE[_size] * (pill ? PILL_RADIUS_MODIFIER : 1)}px;
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

  background-color: ${({ theme, minimal, transparent }: IReqoreInputStyle) =>
    minimal || transparent ? 'transparent' : rgba(theme.main, 0.1)};
  color: ${({ theme }: IReqoreInputStyle) =>
    getReadableColor(theme, undefined, undefined, true, theme.originalMain)};

  transition: all 0.2s ease-out;

  &:active,
  &:focus {
    background-color: ${({ theme, minimal, transparent }: IReqoreInputStyle) =>
      minimal || transparent ? 'transparent' : rgba(theme.main, 0.15)};
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
      leftIconProps = {},
      rightIconProps = {},
      pill,
      loading,
      loadingIconType,
      ...rest
    }: IReqoreInputProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const [inputRef, setInputRef] = useState<HTMLInputElement>(null);
    const theme = useReqoreTheme('main', customTheme, intent);

    useTooltip(inputRef, tooltip);
    useAutoFocus(inputRef, readOnly || rest.disabled ? undefined : focusRules, rest.onChange);

    const hasLeftIcon = icon || leftIconProps?.image;
    const hasRightIcon = rightIcon || rightIconProps?.image;
    const leftIcon: IReqoreIconName = loading
      ? `Loader${loadingIconType || ''}Line`
      : icon || leftIconProps?.icon;

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
        readOnly={readOnly || loading}
        disabled={rest.disabled}
        style={wrapperStyle}
        pill={pill}
      >
        {hasLeftIcon && (
          <StyledIconWrapper _size={size}>
            <ReqoreIcon
              size={size}
              color={iconColor}
              {...leftIconProps}
              icon={leftIcon}
              animation={loading ? 'spin' : leftIconProps?.animation}
            />
          </StyledIconWrapper>
        )}
        <StyledInput
          as='input'
          {...omit(rest, ['children'])}
          effect={{
            interactive: !rest?.disabled && !readOnly,
            ...rest?.effect,
          }}
          onChange={!readOnly && !rest?.disabled ? rest?.onChange : undefined}
          ref={(ref) => setInputRef(ref)}
          theme={theme}
          _size={size}
          minimal={minimal}
          flat={flat}
          rounded={rounded}
          hasIcon={!!icon}
          hasRightIcon={!!rightIcon}
          clearable={
            !rest?.disabled &&
            !readOnly &&
            !!(onClearClick && (rest.as || rest.children || rest?.onChange))
          }
          className={`${className || ''} reqore-control reqore-input`}
          readOnly={readOnly || loading}
          pill={pill}
        >
          {rest?.children}
        </StyledInput>
        <ReqoreInputClearButton
          enabled={
            !readOnly &&
            !rest?.disabled &&
            !!(onClearClick && (rest.as || rest.children || rest?.onChange))
          }
          onClick={onClearClick}
          hasRightIcon={!!rightIcon}
          size={size}
          show={rest?.value && rest.value !== '' ? true : false}
        />
        {hasRightIcon && (
          <StyledIconWrapper _size={size} position='right'>
            <ReqoreIcon size={size} icon={rightIcon} color={rightIconColor} {...rightIconProps} />
          </StyledIconWrapper>
        )}
      </StyledInputWrapper>
    );
  }
);

export default ReqoreInput;
