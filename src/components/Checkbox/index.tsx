import { rgba } from 'polished';
import React, { forwardRef, memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import {
  CONTROL_TEXT_FROM_SIZE,
  PADDING_FROM_SIZE,
  SIZE_TO_PX,
  SWITCH_SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getNthGradientColor,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';
import { getOneLessSize } from '../../helpers/utils';
import { useComponentTooltip } from '../../hooks/useComponentTooltip';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup from '../ControlGroup';
import {
  getPrimaryGradient,
  IReqoreEffect,
  ReqoreTextEffect,
  StyledEffect,
  StyledTextEffect,
} from '../Effect';
import ReqoreIcon, { StyledIconWrapper } from '../Icon';
import { ReqoreSpacer } from '../Spacer';

export interface IReqoreCheckboxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreDisabled,
    IReqoreReadOnly,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreCustomTheme {
  label?: string;
  labelDetail?: any;
  description?: string;
  descriptionEffect?: IReqoreEffect;
  labelDetailPosition?: 'left' | 'right';
  size?: TSizes;
  checked?: boolean;
  labelPosition?: 'right' | 'left';
  fluid?: boolean;
  fixed?: boolean;
  tooltip?: TReqoreTooltipProp;
  asSwitch?: boolean;
  unsetIcon?: IReqoreIconName;
  unsetIntent?: TReqoreIntent;
  uncheckedIcon?: IReqoreIconName;
  uncheckedIntent?: TReqoreIntent;
  checkedIcon?: IReqoreIconName;
  checkedIntent?: TReqoreIntent;
  image?: string;
  onText?: string | number;
  offText?: string | number;
  switchTextEffect?: IReqoreEffect;
  labelEffect?: IReqoreEffect;
  margin?: 'left' | 'right' | 'both' | 'none';
  wrapLabel?: boolean;

  onCheckClick?: () => void;
  onUncheckClick?: () => void;

  /**
   * The native control drawn by this checkbox. Every checkbox renders a real, visually hidden
   * `<input>` before its box: it is what a `<form>` posts, what the keyboard (`Space`) toggles
   * and what a screen reader announces (`role="checkbox"`, or `"switch"` with `asSwitch`). Use
   * `'radio'` for an option of a choice; `ReqoreRadioGroup` does it for its options.
   * Defaults to `'checkbox'`.
   */
  type?: 'checkbox' | 'radio';
  /** Form field name of the native input. Without one, nothing is posted. */
  name?: string;
  /** What the native input posts when checked. The browser posts `on` when it is not set. */
  value?: string;
  /**
   * The initial state of an UNCONTROLLED checkbox (one given no `checked`): the box then
   * follows the native input as it is clicked or toggled. Checkboxes only — a radio's
   * siblings do not tell it when they take the choice, so radios stay controlled.
   */
  defaultChecked?: boolean;
  /** The native input must be checked for its form to submit. */
  required?: boolean;
  /**
   * Any other attribute of the native input (`id`, `form`, `autoFocus`, `onChange`, `onFocus`,
   * …). `aria-*` attributes given to the checkbox itself are sent to the native input too.
   */
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'checked' | 'defaultChecked' | 'name' | 'value' | 'required' | 'disabled'
  >;
}

export interface IReqoreCheckboxStyle extends IReqoreCheckboxProps {
  theme: IReqoreTheme;
}

const StyledSwitchToggle = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('width'),
})`
  transition: all 0.2s ease-in-out;
  content: '';
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  height: ${({ size }) => SWITCH_SIZE_TO_PX[size] - 4}px;
  width: ${({ size, width, checked }) =>
    checked === undefined
      ? width < SWITCH_SIZE_TO_PX[size]
        ? width
        : SWITCH_SIZE_TO_PX[size] - 4
      : width || SWITCH_SIZE_TO_PX[size] - 4}px;
  top: 50%;
  transform: translateY(-50%) translateX(${({ checked }) => (checked === undefined ? '-50%' : 0)});
  ${({ checked, theme, parentEffect }) =>
    checked === undefined &&
    css`
      background-image: repeating-linear-gradient(
        45deg,
        ${rgba(
            parentEffect?.gradient
              ? changeLightness(getNthGradientColor(theme, getPrimaryGradient(parentEffect.gradient)?.colors, 1), 0.1)
              : changeLightness(theme.main, 0.1),
            1
          )}
          0px,
        ${rgba(
            parentEffect?.gradient
              ? changeLightness(getNthGradientColor(theme, getPrimaryGradient(parentEffect.gradient)?.colors, 2), 0.15)
              : changeLightness(theme.main, 0.15),
            1
          )}
          2px,
        ${rgba(
            parentEffect?.gradient
              ? changeLightness(getNthGradientColor(theme, getPrimaryGradient(parentEffect.gradient)?.colors, 2), 0.15)
              : changeLightness(theme.main, 0.15),
            1
          )}
          4px,
        ${rgba(
            parentEffect?.gradient
              ? changeLightness(getNthGradientColor(theme, getPrimaryGradient(parentEffect.gradient)?.colors, 1), 0.1)
              : changeLightness(theme.main, 0.1),
            1
          )}
          6px
      );
    `}
  left: ${({ checked, size, width }) =>
    !checked
      ? checked === undefined
        ? '50%'
        : '1px'
      : `calc(100% - ${width || SWITCH_SIZE_TO_PX[size] - 4}px - 1px)`};
  border-radius: 50px;
  opacity: ${({ checked }) => (checked === undefined ? 0.2 : 1)};
  background-color: ${({ theme, checked, transparent, parentEffect }) =>
    transparent
      ? 'transparent'
      : !checked
      ? parentEffect?.gradient
        ? changeLightness(getNthGradientColor(theme, parentEffect?.gradient?.colors, 1), 0.2)
        : changeLightness(theme.main, 0.2)
      : parentEffect?.gradient
      ? changeLightness(getNthGradientColor(theme, parentEffect?.gradient?.colors, 2), 0.2)
      : changeLightness(theme.main, 0.25)};
`;

const StyledSwitch = styled(StyledEffect)<IReqoreCheckboxStyle>`
  transition: all 0.2s ease-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  height: ${({ size }) => SWITCH_SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SWITCH_SIZE_TO_PX[size] * 1.8}px;

  border: 1px solid ${({ theme, checked }) => changeLightness(theme.main, checked ? 0.35 : 0.2)};
  border-radius: 50px;

  background-color: ${({ theme }) => rgba(changeLightness(theme.main, 0.3), 0.1)};

  ${StyledIconWrapper} {
    z-index: 1;
  }

  &:focus,
  &:active {
    outline: 2px solid ${({ theme }) => changeLightness(theme.main, 0.25)};
    outline-offset: -2px;
  }
`;

const StyledSwitchTextWrapper = styled(StyledTextEffect)`
  margin: 0 ${({ size, hasMargin }) => (hasMargin ? PADDING_FROM_SIZE[size] : 0)}px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  height: 100%;
  min-width: ${({ size }) => SWITCH_SIZE_TO_PX[size] - 4}px;
`;

const StyledOnSwitchText = styled(StyledSwitchTextWrapper)<IReqoreCheckboxStyle>`
  color: ${({ theme, checked, parentHasGradient }) =>
    !parentHasGradient &&
    getReadableColorFrom(checked ? changeLightness(theme.main, 0.25) : theme.originalMain)};
`;

const StyledOffSwitchText = styled(StyledSwitchTextWrapper)<IReqoreCheckboxStyle>`
  color: ${({ theme, checked, parentHasGradient }) =>
    !parentHasGradient &&
    getReadableColorFrom(checked ? theme.originalMain : changeLightness(theme.main, 0.2))};
`;

// The row also receives what a `ReqoreControlGroup` hands every child (`fill`, `stack`, …);
// `fill` is the one a `div` would otherwise keep, being an SVG attribute.
const StyledCheckbox = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('fill'),
})<IReqoreCheckboxStyle>`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  transition: all 0.2s ease-out;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;

  max-width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1 auto' : '0 0 auto')};

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}

  ${({ readOnly }) =>
    readOnly &&
    css`
      ${ReadOnlyElement};
    `}

  color: ${({ theme, checked }) =>
    getReadableColor(theme, undefined, undefined, !checked, theme.originalMain)};

  &:hover {
    color: ${({ theme }) =>
      getReadableColor(theme, undefined, undefined, false, theme.originalMain)};

    > ${StyledSwitch} {
      border-color: ${({ theme, checked }) => changeLightness(theme.main, checked ? 0.4 : 0.35)};
    }
  }

  /* The native control: present for forms, keyboards and screen readers, invisible and
     out of the pointer's way. It sits right before the box, so its focus ring can be
     drawn ON the box. */
  > .reqore-checkbox-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    opacity: 0;
    overflow: hidden;
    clip-path: inset(50%);
    pointer-events: none;
  }

  /* Outside the box and in the text colour: a ring in a shade of the surface is lost
     around a box this small. */
  > .reqore-checkbox-input:focus-visible + .reqore-checkbox-box {
    outline: 2px solid
      ${({ theme }) =>
        rgba(getReadableColor(theme, undefined, undefined, true, theme.originalMain), 0.7)};
    outline-offset: 2px;
    border-radius: ${({ asSwitch }) => (asSwitch ? '50px' : '50%')};
  }

  .reqore-checkbox-label {
    cursor: inherit;
  }
`;

const Checkbox = forwardRef<HTMLDivElement, IReqoreCheckboxProps>(
  (
    {
      label,
      labelDetail,
      labelDetailPosition = 'right',
      size = 'normal',
      margin = 'left',
      checked: checkedProp,
      disabled,
      className,
      labelPosition = 'right',
      tooltip,
      asSwitch,
      unsetIcon,
      unsetIntent,
      uncheckedIcon,
      checkedIcon,
      uncheckedIntent,
      checkedIntent,
      readOnly,
      labelEffect,
      switchTextEffect,
      image,
      onText,
      offText,
      description,
      descriptionEffect,
      intent,
      effect,
      customTheme,
      inheritCustomTheme,
      wrapLabel,
      onCheckClick,
      onUncheckClick,
      type = 'checkbox',
      name,
      value,
      defaultChecked,
      required,
      inputProps,
      ...rest
    }: IReqoreCheckboxProps,
    ref
  ) => {
    const isUncontrolled =
      type === 'checkbox' && checkedProp === undefined && defaultChecked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(!!defaultChecked);
    const checked = isUncontrolled ? uncontrolledChecked : checkedProp;

    const generatedId = useId();
    const inputId = inputProps?.id ?? `reqore-checkbox-${generatedId}`;
    const descriptionId = `${inputId}-description`;
    const inputRef = useRef<HTMLInputElement>(null);
    // True while a click on the drawing is being handed to the native input.
    const forwardingClick = useRef(false);

    // `aria-*` describe the control, so they go to the native input; the rest stays on the row.
    const ariaProps: React.AriaAttributes = {};
    const rowProps: React.HTMLAttributes<HTMLDivElement> = {};

    Object.keys(rest).forEach((key) => {
      if (key.startsWith('aria-') && key !== 'aria-hidden') {
        ariaProps[key] = rest[key];
      } else {
        rowProps[key] = rest[key];
      }
    });

    const { onClick } = rowProps;
    const [offRef, { width: offWidth }] = useMeasure();
    const [onRef, { width: onWidth }] = useMeasure();
    const _intent = checked
      ? checkedIntent || intent
      : checked === undefined
      ? unsetIntent || intent
      : uncheckedIntent || intent;
    const theme = useReqoreTheme('main', customTheme, _intent, undefined, inheritCustomTheme);

    const width = useMemo(() => {
      const selectedWidth = checked ? onWidth : offWidth;
      const addedWidth = checked
        ? onText || onText === 0
          ? PADDING_FROM_SIZE[size] * 2
          : 0
        : offText || offText === 0
        ? PADDING_FROM_SIZE[size] * 2
        : 0;

      return selectedWidth + addedWidth;
    }, [checked, offWidth, onWidth, size]);

    const hasText = useMemo(() => {
      return !!(onText || offText || onText === 0 || offText === 0);
    }, [onText, offText]);

    /* One activation, one click. A pointer clicks the drawing (the native input takes no
       pointer events), and that click is handed to the native input so it toggles, fires its
       change and is posted; the copy is stopped at the input, so neither this handler nor
       anything above it hears the same press twice. The keyboard and the label activate the
       native input directly, and that click bubbles here like a pointer's would. Either way
       the caller's `onClick` runs once. A read-only checkbox still calls it (the caller owns
       the change), but its native input never toggles. */
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        const fromInput = event.target === input;

        if (input && !fromInput && !disabled && !readOnly) {
          forwardingClick.current = true;
          input.click();
          forwardingClick.current = false;
        }

        // The switch's halves have their own handlers; a key press has no half to land on.
        if (fromInput && asSwitch) {
          (checked ? onUncheckClick : onCheckClick)?.();
        }

        onClick?.(event);
      },
      [onClick, disabled, readOnly, asSwitch, checked, onCheckClick, onUncheckClick]
    );

    const handleInputClick = useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        if (readOnly) {
          event.preventDefault();
        }

        if (forwardingClick.current) {
          event.stopPropagation();
        }

        inputProps?.onClick?.(event);
      },
      [readOnly, inputProps?.onClick]
    );

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        // React reports a checkbox's change from its click, even one that was cancelled
        // because the checkbox is read-only; nothing changed, so nothing is reported.
        if (readOnly) {
          return;
        }

        if (isUncontrolled) {
          setUncontrolledChecked(event.target.checked);
        }

        inputProps?.onChange?.(event);
      },
      [readOnly, isUncontrolled, inputProps?.onChange]
    );

    // The label's own activation would click the input a second time: the row already did.
    const handleLabelClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
    }, []);

    const describedBy =
      [description ? descriptionId : undefined, ariaProps['aria-describedby']]
        .filter(Boolean)
        .join(' ') || undefined;

    const nativeInput = (
      <input
        role={asSwitch && type === 'checkbox' ? 'switch' : undefined}
        aria-readonly={readOnly || undefined}
        {...ariaProps}
        {...inputProps}
        aria-describedby={describedBy}
        ref={inputRef}
        id={inputId}
        className={`${inputProps?.className || ''} reqore-checkbox-input`}
        type={type}
        name={name}
        // Only when given: a `value` key, even `undefined`, makes React write `value=""`,
        // which would replace the browser's `on`.
        {...(value !== undefined ? { value } : {})}
        required={required}
        disabled={disabled}
        checked={!!checked}
        onClick={handleInputClick}
        onChange={handleInputChange}
      />
    );

    const labelProps = {
      as: 'label' as React.ElementType,
      htmlFor: inputId,
      onClick: handleLabelClick,
    };

    const { Component, props } = useComponentTooltip(
      {
        ...rowProps,
        onClick: handleClick,
        theme,
        asSwitch,
        size,
        tooltip,
        disabled,
        checked,
        readOnly,
        className: `${className || ''} reqore-checkbox reqore-control`,
      },
      StyledCheckbox,
      ref
    );

    return (
      <Component {...props}>
        {margin === 'left' || margin === 'both' ? (
          <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
        ) : null}
        {label && labelPosition === 'left' ? (
          <>
            <ReqoreControlGroup vertical>
              <ReqoreControlGroup>
                {labelDetailPosition === 'left' && labelDetail}
                <ReqoreTextEffect
                  {...labelProps}
                  className='reqore-checkbox-label'
                  active={checked}
                  effect={{
                    ...labelEffect,
                    interactive: !disabled && !readOnly && !checked,
                    noWrap: !wrapLabel,
                  }}
                >
                  {label}
                </ReqoreTextEffect>
                {labelDetailPosition === 'right' && labelDetail}
              </ReqoreControlGroup>
              {description && (
                <ReqoreTextEffect
                  id={descriptionId}
                  className='reqore-checkbox-description'
                  effect={{
                    textSize: getOneLessSize(size),
                    weight: 'light',
                    ...descriptionEffect,
                  }}
                >
                  {description}
                </ReqoreTextEffect>
              )}
            </ReqoreControlGroup>
            <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
          </>
        ) : null}
        {nativeInput}
        {asSwitch ? (
          <StyledSwitch
            className='reqore-checkbox-box'
            aria-hidden='true'
            size={size}
            labelPosition={labelPosition}
            checked={checked}
            theme={theme}
            as='div'
            effect={
              {
                interactive: !disabled && !readOnly,
                ...effect,
              } as IReqoreEffect
            }
          >
            <>
              <StyledOffSwitchText
                onClick={onUncheckClick}
                ref={offRef}
                size={size}
                theme={theme}
                checked={checked}
                hasMargin={offText || offText === 0}
                parentHasGradient={!!effect?.gradient}
                effect={
                  {
                    uppercase: true,
                    textSize: getOneLessSize(size),
                    weight: 'bold',
                    ...switchTextEffect,
                    opacity: checked || checked === undefined ? 0.3 : 1,
                  } as IReqoreEffect
                }
              >
                {offText && (image || uncheckedIcon) ? (
                  <ReqoreIcon
                    size={size}
                    image={image}
                    icon={uncheckedIcon}
                    effect={{ grayscale: true }}
                    margin={offText ? 'right' : undefined}
                  />
                ) : null}
                {offText}
              </StyledOffSwitchText>
              <StyledOnSwitchText
                ref={onRef}
                onClick={onCheckClick}
                size={size}
                theme={theme}
                checked={checked}
                parentHasGradient={!!effect?.gradient}
                hasMargin={onText || onText === 0}
                effect={
                  {
                    uppercase: true,
                    textSize: getOneLessSize(size),
                    weight: 'thick',
                    ...switchTextEffect,
                    opacity: checked ? 1 : 0.3,
                  } as IReqoreEffect
                }
              >
                {onText && (image || checkedIcon) ? (
                  <ReqoreIcon
                    size={size}
                    image={image}
                    margin={onText ? 'right' : undefined}
                    icon={checkedIcon}
                  />
                ) : null}
                {onText}
              </StyledOnSwitchText>
            </>
            <StyledSwitchToggle
              size={size}
              checked={checked}
              width={width}
              theme={theme}
              parentEffect={effect}
              transparent={(image || checkedIcon) && !hasText}
            >
              {!onText && !offText ? (
                <ReqoreIcon
                  size={size}
                  image={image}
                  icon={checked ? checkedIcon : checked === undefined ? unsetIcon : uncheckedIcon}
                  effect={{ grayscale: !checked, opacity: checked ? 1 : 0.5 }}
                />
              ) : null}
            </StyledSwitchToggle>
          </StyledSwitch>
        ) : (
          <ReqoreIcon
            className='reqore-checkbox-box'
            aria-hidden='true'
            size={size}
            icon={
              !image
                ? checked
                  ? checkedIcon || 'CheckboxCircleFill'
                  : uncheckedIcon || 'CheckboxBlankCircleLine'
                : undefined
            }
            image={image}
            effect={{ grayscale: image ? !checked : undefined, opacity: checked ? 1 : 0.5 }}
            color={_intent ? theme.main : undefined}
          />
        )}
        {label && labelPosition === 'right' ? (
          <>
            <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
            <ReqoreControlGroup vertical gapSize={getOneLessSize(size)}>
              <ReqoreControlGroup>
                {labelDetailPosition === 'left' && labelDetail}
                <ReqoreTextEffect
                  {...labelProps}
                  className='reqore-checkbox-label'
                  active={checked}
                  effect={{
                    ...labelEffect,
                    interactive: !disabled && !readOnly && !checked,
                    noWrap: !wrapLabel,
                  }}
                >
                  {label}
                </ReqoreTextEffect>
                {labelDetailPosition === 'right' && labelDetail}
              </ReqoreControlGroup>
              {description && (
                <ReqoreTextEffect
                  id={descriptionId}
                  className='reqore-checkbox-description'
                  effect={{
                    textSize: getOneLessSize(size),
                    weight: 'light',
                    ...descriptionEffect,
                  }}
                >
                  {description}
                </ReqoreTextEffect>
              )}
            </ReqoreControlGroup>
          </>
        ) : null}
        {margin === 'right' || margin === 'both' ? (
          <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
        ) : null}
      </Component>
    );
  }
);

export default memo(Checkbox);
