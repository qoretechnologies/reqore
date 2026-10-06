import { omit } from 'lodash';
import { rgba } from 'polished';
import React, { forwardRef, useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  CONTROL_TEXT_FROM_SIZE,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  resolveRadius,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreAutoFocusRules, useAutoFocus } from '../../hooks/useAutoFocus';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
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
import ReqoreButton from '../Button';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import ReqoreInputClearButton from '../InputClearButton';
import { ReqoreKeyboardShortcut } from '../KeyboardShortcut';
import { ReqoreTooltipComponent } from '../TooltipComponent';

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
  /**
   * Override the size used to derive the input's border-radius. Defaults to the
   * input's size. Useful when the input's text scale should differ from its corner
   * roundness (e.g. a normal-size input with a generous pill-like radius).
   */
  radiusSize?: TSizes;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  step?: number;
  wrapperStyle?: React.CSSProperties;
  iconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  focusRules?: IReqoreAutoFocusRules;
  /**
   * Whether to render a badge-style hint for the `focusRules` keyboard shortcut.
   * Defaults to `true`, unless globally disabled via the `shortcutHints` UI option.
   */
  shortcutHint?: boolean;

  leftIconProps?: IReqoreIconProps;
  rightIconProps?: IReqoreIconProps;

  pill?: boolean;

  /**
   * With `type='password'`, adds a button at the end of the field that shows and hides the
   * password. It is a real `type='button'` (it never submits the form the field is in), takes
   * a tab stop, says what it does in its `aria-label` and points at the field with
   * `aria-controls`; `aria-pressed` tells whether the password is shown. Clicking it does not
   * take the focus from the field, and the value and the caret stay where they were.
   *
   * `true` uses English labels; pass an object to translate them.
   */
  passwordToggle?: boolean | IReqoreInputPasswordToggle;

  children?: React.ReactNode | ((props: any) => React.ReactNode);
  as?: string | React.ElementType;
}

export interface IReqoreInputPasswordToggle {
  /** `aria-label` while the password is hidden. Defaults to `'Show password'`. */
  showLabel?: string;
  /** `aria-label` while the password is shown. Defaults to `'Hide password'`. */
  hideLabel?: string;
  /** Called with `true` when the password is shown, `false` when it is hidden again. */
  onToggle?: (visible: boolean) => void;
}

export interface IReqoreInputStyle extends IReqoreInputProps {
  theme: IReqoreTheme;
  _size?: TSizes;
  clearable?: boolean;
  hasIcon?: boolean;
  hasShortcutHint?: boolean;
  hasPasswordToggle?: boolean;
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
  border-radius: ${({ minimal, rounded, _size, radiusSize, pill }) =>
    minimal || rounded === false
      ? 0
      : resolveRadius(_size, radiusSize) * (pill ? PILL_RADIUS_MODIFIER : 1)}px;

  ${InactiveIconScale}

  &:focus-within {
    .reqore-clear-input-button {
      display: flex;
    }

    outline: 2px solid ${({ theme }) => changeLightness(theme.main, 0.25)};
    outline-offset: -2px;

    ${ActiveIconScale}
  }
`;

const StyledIconWrapper = styled.div<IReqoreInputStyle & { offset?: number }>`
  position: absolute;
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ _size }) => SIZE_TO_PX[_size]}px;
  right: ${({ position, offset = 0 }) => (position === 'right' ? `${offset}px` : undefined)};
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledShortcutWrapper = styled.div<{ _size: TSizes; offset: number }>`
  position: absolute;
  height: 100%;
  top: 0;
  right: ${({ offset }) => offset}px;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

export const StyledInput = styled(StyledEffect)<IReqoreInputStyle>`
  height: 100%;
  width: 100%;
  flex: 1;
  margin: 0;
  padding: ${({ _size }) => PADDING_FROM_SIZE[_size] / 2}px 7px;
  padding-right: ${({ clearable, hasRightIcon, hasShortcutHint, hasPasswordToggle, _size }) => {
    let padding = 7;

    if (clearable || hasRightIcon || hasPasswordToggle) {
      padding = 0;
      padding += clearable ? SIZE_TO_PX[_size] : 0;
      padding += hasRightIcon ? SIZE_TO_PX[_size] : 0;
      padding += hasPasswordToggle ? SIZE_TO_PX[_size] : 0;
    }

    // Reserve room so typed text / placeholder doesn't slide under the hint badge.
    if (hasShortcutHint) {
      padding += SIZE_TO_PX[_size];
    }

    return padding;
  }}px;

  padding-left: ${({ hasIcon, _size }) => (hasIcon ? SIZE_TO_PX[_size] : 7)}px;
  font-size: ${({ _size }) => CONTROL_TEXT_FROM_SIZE[_size]}px;
  transition: all 0.2s ease-out;
  border-radius: inherit;

  border: ${({ minimal, theme, flat }) =>
    !minimal && !flat ? `1px solid ${changeLightness(theme.main, 0.13)}` : 0};
  border-bottom: ${({ minimal, theme, flat }) =>
    minimal && !flat ? `0.5px solid ${changeLightness(theme.main, 0.13)}` : undefined};

  ${({ disabled, readOnly }) =>
    !disabled && !readOnly
      ? css`
          &:active,
          &:focus,
          &:hover {
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
    outline: none;
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
      radiusSize,
      minimal,
      readOnly,
      customTheme,
        inheritCustomTheme,
      intent,
      wrapperStyle,
      focusRules,
      shortcutHint,
      leftIconProps = {},
      rightIconProps = {},
      pill,
      loading,
      loadingIconType,
      passwordToggle,
      ...rest
    }: IReqoreInputProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const [inputRef, setInputRef] = useState<HTMLInputElement>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const generatedId = useId();
    // The caret to put back once the field has changed type (see `togglePassword`).
    const selectionToRestore = useRef<[number, number] | null>(null);
    const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
    const shortcutHintsEnabled = useReqoreProperty('shortcutHints');

    useAutoFocus(inputRef, readOnly || rest.disabled ? undefined : focusRules, rest.onChange);

    const hasLeftIcon = icon || leftIconProps?.image;
    const hasRightIcon = rightIcon || rightIconProps?.image;
    const clearable =
      !rest?.disabled &&
      !readOnly &&
      !!(onClearClick && (rest.as || rest.children || rest?.onChange));
    const showShortcutHint =
      !!focusRules?.shortcut &&
      shortcutHint !== false &&
      shortcutHintsEnabled !== false &&
      !readOnly &&
      !rest.disabled;
    const leftIcon: IReqoreIconName = loading
      ? `Loader${loadingIconType || ''}Line`
      : icon || leftIconProps?.icon;

    const hasPasswordToggle = rest.type === 'password' && !!passwordToggle;
    const passwordToggleConfig: IReqoreInputPasswordToggle =
      typeof passwordToggle === 'object' ? passwordToggle : {};
    const inputId = rest.id ?? (hasPasswordToggle ? `reqore-input-${generatedId}` : undefined);
    const passwordToggleOnToggle = passwordToggleConfig.onToggle;

    /* Changing an input's `type` can reset its selection, so the caret is read before the
       swap and put back after it. The value is never touched: it is the same element. */
    const togglePassword = useCallback(() => {
      if (inputRef) {
        selectionToRestore.current = [inputRef.selectionStart ?? 0, inputRef.selectionEnd ?? 0];
      }

      setPasswordVisible(!passwordVisible);
      passwordToggleOnToggle?.(!passwordVisible);
    }, [inputRef, passwordVisible, passwordToggleOnToggle]);

    useLayoutEffect(() => {
      const selection = selectionToRestore.current;

      if (inputRef && selection) {
        selectionToRestore.current = null;
        inputRef.setSelectionRange(selection[0], selection[1]);
      }
    }, [passwordVisible, inputRef]);

    // A pointer press on the toggle must not pull the focus out of the field being typed in.
    const keepFocusInField = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
    }, []);

    // Room at the right edge, from the edge inwards: the toggle, the right icon, the clear button.
    const passwordToggleWidth = hasPasswordToggle ? SIZE_TO_PX[size] : 0;

    return (
      <ReqoreTooltipComponent
        Component={StyledInputWrapper}
        className='reqore-control-wrapper'
        fluid={fluid}
        fixed={fixed}
        width={width}
        flat={flat}
        theme={theme}
        rounded={rounded}
        radiusSize={radiusSize}
        minimal={minimal}
        _size={size}
        ref={targetRef}
        readOnly={readOnly || loading}
        disabled={rest.disabled}
        style={wrapperStyle}
        pill={pill}
        tooltip={rest.tooltip}
      >
        {hasLeftIcon && (
          <StyledIconWrapper _size={size}>
            <ReqoreIcon
              size={size}
              color={iconColor}
              effect={{ opacity: CONTROL_ICON_OPACITY }}
              {...leftIconProps}
              icon={leftIcon}
              animation={loading ? 'spin' : leftIconProps?.animation}
            />
          </StyledIconWrapper>
        )}
        <StyledInput
          as='input'
          {...omit(rest, ['children'])}
          id={inputId}
          type={hasPasswordToggle && passwordVisible ? 'text' : rest.type}
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
          hasShortcutHint={showShortcutHint}
          hasPasswordToggle={hasPasswordToggle}
          clearable={clearable}
          className={`${className || ''} reqore-control reqore-input`}
          readOnly={readOnly || loading}
          pill={pill}
        >
          {rest?.children}
        </StyledInput>
        <ReqoreInputClearButton
          enabled={clearable}
          onClick={onClearClick}
          hasRightIcon={!!rightIcon}
          rightOffset={passwordToggleWidth}
          size={size}
          show={rest?.value && rest.value !== '' ? true : false}
        />
        {hasRightIcon && (
          <StyledIconWrapper _size={size} position='right' offset={passwordToggleWidth}>
            <ReqoreIcon
              size={size}
              icon={rightIcon}
              color={rightIconColor}
              effect={{ opacity: CONTROL_ICON_OPACITY }}
              {...rightIconProps}
            />
          </StyledIconWrapper>
        )}
        {hasPasswordToggle && (
          <StyledIconWrapper _size={size} position='right'>
            <ReqoreButton
              type='button'
              className='reqore-input-password-toggle'
              size={size}
              icon={passwordVisible ? 'EyeOffLine' : 'EyeLine'}
              minimal
              flat
              transparent
              compact
              square
              rounded={false}
              disabled={rest.disabled}
              aria-label={
                passwordVisible
                  ? passwordToggleConfig.hideLabel ?? 'Hide password'
                  : passwordToggleConfig.showLabel ?? 'Show password'
              }
              aria-controls={inputId}
              aria-pressed={passwordVisible}
              onMouseDown={keepFocusInField}
              onClick={togglePassword}
            />
          </StyledIconWrapper>
        )}
        {showShortcutHint && (
          <StyledShortcutWrapper
            _size={size}
            offset={
              (hasRightIcon ? SIZE_TO_PX[size] : 0) +
              (clearable ? SIZE_TO_PX[size] : 0) +
              passwordToggleWidth +
              7
            }
          >
            <ReqoreKeyboardShortcut shortcut={focusRules.shortcut} size={size} compact />
          </StyledShortcutWrapper>
        )}
      </ReqoreTooltipComponent>
    );
  }
);

export default ReqoreInput;
