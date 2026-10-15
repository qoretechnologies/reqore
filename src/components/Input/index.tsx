import { omit } from 'lodash';
import { rgba } from 'polished';
import React, {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { css } from 'styled-components';
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
import {
  changeLightness,
  getDrawnColor,
  getReadableAlpha,
  getReadableColor,
  getReadableFadedColor,
  getReadableIconLook,
  getThemeSurface,
  READABLE_ICON_CONTRAST,
  TReqoreSurface,
} from '../../helpers/colors';
import { useReqoreSurface } from '../../context/SurfaceContext';
import { splitIconColor } from '../../helpers/iconProps';
import styled, { omitStyleProps } from '../../helpers/styled';
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
import { StyledEffect, TReqoreEffectColor, TReqoreHexColor } from '../Effect';
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
  /** What the input is drawn on (`useReqoreSurface`): the theme's surface when not known. */
  $surface?: TReqoreSurface;
  /** Its colors, worked out once by the component (`getInputLook`); else from the rest. */
  $look?: IReqoreInputLook;
  _size?: TSizes;
  clearable?: boolean;
  hasIcon?: boolean;
  hasShortcutHint?: boolean;
  hasPasswordToggle?: boolean;
}

// `width` is the field's CSS width; on a `div` it is not an attribute.
/**
 * What an input (or a text area) is drawn on and in: its background as drawn over the theme it sits on (a 10% wash
 * of the theme's main, or nothing when minimal or transparent; focused, 15%), and the text that reads there.
 */
export const getInputColors = (
  theme: IReqoreTheme,
  minimal?: boolean,
  transparent?: boolean,
  focused: boolean = false,
  surface?: TReqoreSurface
): { background: TReqoreHexColor; text: TReqoreHexColor } => {
  const under = getThemeSurface(theme, surface);
  const background =
    minimal || transparent
      ? getDrawnColor(under)
      : getDrawnColor(rgba(theme.main, focused ? 0.15 : 0.1), under);

  return { background, text: getReadableColor(theme, undefined, undefined, true, background) };
};

/** A placeholder, fainter than a value (30%, 50% focused) but never too faint to read. */
export const getInputPlaceholderColor = (
  theme: IReqoreTheme,
  minimal?: boolean,
  transparent?: boolean,
  focused: boolean = false,
  surface?: TReqoreSurface
): string => {
  const { background, text } = getInputColors(theme, minimal, transparent, focused, surface);

  return getReadableFadedColor(text, background, focused ? 0.5 : 0.3);
};

/** The clear button's opacity when shown: 50%, or as much more as it needs to stand out by 3:1. */
export const getInputClearButtonOpacity = (
  theme: IReqoreTheme,
  minimal?: boolean,
  transparent?: boolean,
  surface?: TReqoreSurface
): number => {
  const resting = getInputColors(theme, minimal, transparent, false, surface);
  const focused = getInputColors(theme, minimal, transparent, true, surface);

  return Math.max(
    getReadableAlpha(resting.text, resting.background, 0.5, READABLE_ICON_CONTRAST),
    getReadableAlpha(focused.text, focused.background, 0.5, READABLE_ICON_CONTRAST)
  );
};

/** Everything an input (or a text area) is drawn in, worked out at once (see `getInputLook`). */
export interface IReqoreInputLook {
  /** Its background as drawn, at rest. */
  background: TReqoreHexColor;
  /** Its text, and the icons and the clear button beside it. */
  text: TReqoreHexColor;
  /** The placeholder, at rest and focused (`getInputPlaceholderColor`). */
  placeholder: string;
  focusedPlaceholder: string;
  /** The clear button's opacity when shown (`getInputClearButtonOpacity`). */
  clearOpacity: number;
}

/**
 * An input's colors - its text, its placeholder at rest and focused, its clear button's
 * opacity - from the two states it is drawn in, at once: a component works them out on what
 * decides them (`useMemo`) and hands its styles plain values. Asked for one by one, a
 * controlled input worked them out seven times on every keystroke.
 */
export const getInputLook = (
  theme: IReqoreTheme,
  minimal?: boolean,
  transparent?: boolean,
  surface?: TReqoreSurface
): IReqoreInputLook => {
  const resting = getInputColors(theme, minimal, transparent, false, surface);
  const focused = getInputColors(theme, minimal, transparent, true, surface);

  return {
    background: resting.background,
    text: resting.text,
    placeholder: getReadableFadedColor(resting.text, resting.background, 0.3),
    focusedPlaceholder: getReadableFadedColor(focused.text, focused.background, 0.5),
    clearOpacity: Math.max(
      getReadableAlpha(resting.text, resting.background, 0.5, READABLE_ICON_CONTRAST),
      getReadableAlpha(focused.text, focused.background, 0.5, READABLE_ICON_CONTRAST)
    ),
  };
};

/** An input's look: the component's, or worked out from its style props where it has none. */
const lookOf = ({ $look, theme, minimal, transparent, $surface }: IReqoreInputStyle) =>
  $look ?? getInputLook(theme, minimal, transparent, $surface);

export const StyledInputWrapper = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('width'),
})<IReqoreInputStyle>`
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

  /* The icons beside the text (and the clear button) are drawn in its colour, not in
     whatever the page around the input is written in. */
  color: ${(props) => lookOf(props).text};

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

const StyledIconWrapper = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('offset'),
})<IReqoreInputStyle & { offset?: number }>`
  position: absolute;
  height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  width: ${({ _size }) => SIZE_TO_PX[_size]}px;
  right: ${({ position, offset = 0 }) => (position === 'right' ? `${offset}px` : undefined)};
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledShortcutWrapper = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('offset'),
})<{ _size: TSizes; offset: number }>`
  position: absolute;
  height: 100%;
  top: 0;
  right: ${({ offset }) => offset}px;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

/* The input's styling flags must stop here (`StyledEffect` already stops `theme`, `effect` and
   the rest of its own). A DOM `input` drops most of them on its own, but not `fill` (an SVG
   attribute), and a component given as `as` — the DatePicker's react-aria `DateInput` —
   receives every prop and writes them onto its own element. */
export const StyledInput = styled(StyledEffect).withConfig({
  shouldForwardProp: omitStyleProps(
    '_size',
    'clearable',
    'fill',
    'fixed',
    'flat',
    'fluid',
    'hasIcon',
    'hasPasswordToggle',
    'hasRightIcon',
    'hasShortcutHint',
    'minimal',
    'pill',
    'rounded',
    'spaceBetween',
    'stack',
    'tooltip',
    'transparent'
  ),
})<IReqoreInputStyle>`
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
  /* The page's font (or the theme's), not the browser's form-control font. */
  font-family: inherit;
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
  color: ${(props) => lookOf(props).text};

  transition: all 0.2s ease-out;

  &:active,
  &:focus {
    outline: none;
    background-color: ${({ theme, minimal, transparent }: IReqoreInputStyle) =>
      minimal || transparent ? 'transparent' : rgba(theme.main, 0.15)};
  }

  &::placeholder {
    transition: all 0.2s ease-out;
    color: ${(props) => lookOf(props).placeholder};
  }

  &:focus {
    &::placeholder {
      color: ${(props) => lookOf(props).focusedPlaceholder};
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

    /* Its colors, once for as long as what decides them holds - its styles take them as they
       are: a controlled input renders on every keystroke. The icons stand out from the input's
       background, as its text does. */
    const surface = useReqoreSurface();
    const transparent = rest.transparent;
    const look = useMemo(
      () => getInputLook(theme, minimal, transparent, surface),
      [theme, minimal, transparent, surface]
    );
    // an icon's own color: in its props (which win, as they are spread over the rest), else the input's
    const [leftIconPropsColor, leftIconRest] = splitIconColor(leftIconProps);
    const [rightIconPropsColor, rightIconRest] = splitIconColor(rightIconProps);
    const leftIconOwn = leftIconPropsColor || iconColor;
    const rightIconOwn = rightIconPropsColor || rightIconColor;
    const leftIconLook = useMemo(
      () =>
        getReadableIconLook(
          theme,
          [look.background],
          look.text,
          CONTROL_ICON_OPACITY,
          leftIconOwn
        ),
      [theme, look, leftIconOwn]
    );
    const rightIconLook = useMemo(
      () =>
        getReadableIconLook(
          theme,
          [look.background],
          look.text,
          CONTROL_ICON_OPACITY,
          rightIconOwn
        ),
      [theme, look, rightIconOwn]
    );
    // one object for as long as the opacity holds: an icon is a memo component
    const leftIconEffect = useMemo(
      () => ({ opacity: leftIconLook.opacity }),
      [leftIconLook.opacity]
    );
    const rightIconEffect = useMemo(
      () => ({ opacity: rightIconLook.opacity }),
      [rightIconLook.opacity]
    );

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
        $surface={surface}
        $look={look}
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
              color={leftIconLook.color ?? leftIconOwn}
              effect={leftIconEffect}
              {...leftIconRest}
              icon={leftIcon}
              animation={loading ? 'spin' : leftIconProps?.animation}
            />
          </StyledIconWrapper>
        )}
        <StyledInput
          as='input'
          {...omit(rest, ['children'])}
          $surface={surface}
          $look={look}
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
          shownOpacity={look.clearOpacity}
          size={size}
          show={rest?.value && rest.value !== '' ? true : false}
        />
        {hasRightIcon && (
          <StyledIconWrapper _size={size} position='right' offset={passwordToggleWidth}>
            <ReqoreIcon
              size={size}
              icon={rightIcon}
              color={rightIconLook.color ?? rightIconOwn}
              effect={rightIconEffect}
              {...rightIconRest}
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
